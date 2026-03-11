package com.trustbank.app.service;

import com.trustbank.app.exception.*;
import com.trustbank.app.model.BankAccount;
import com.trustbank.app.storage.FileStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BankService {

    private static final Logger logger = LoggerFactory.getLogger(BankService.class);

    private final FileStorage storage;
    private final List<BankAccount> accounts;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitService rateLimitService;
    private int nextAccNo = 1001;

    public BankService(FileStorage storage, PasswordEncoder passwordEncoder, RateLimitService rateLimitService) {
        this.storage = storage;
        this.passwordEncoder = passwordEncoder;
        this.rateLimitService = rateLimitService;
        this.accounts = storage.loadAccounts();

        for (BankAccount a : accounts) {
            nextAccNo = Math.max(nextAccNo, a.getAccountNumber() + 1);
        }
        logger.info("BankService initialized with {} accounts. Next account number: {}", accounts.size(), nextAccNo);
    }

    public BankAccount createAccount(String name, int pin) {
        logger.info("Creating new account for: {}", name);
        
        // Validate PIN length
        if (pin < 1000 || pin > 999999) {
            throw new IllegalArgumentException("PIN must be 4-6 digits");
        }
        
        String hashedPin = passwordEncoder.encode(String.valueOf(pin));
        BankAccount acc = new BankAccount(name, nextAccNo, hashedPin);
        accounts.add(acc);
        nextAccNo++;
        storage.saveAccounts(accounts);
        logger.info("Account created successfully: {}", acc.getAccountNumber());
        return acc;
    }

    public BankAccount login(int accNo, int pin) {
        logger.info("Login attempt for account: {}", accNo);
        
        // Check if account is rate-limited
        if (rateLimitService.isAccountLocked(accNo)) {
            logger.warn("Login failed: Account temporarily locked due to too many failed attempts - {}", accNo);
            throw new AccountBlockedException("Account temporarily locked. Try again after 15 minutes.");
        }
        
        BankAccount acc = find(accNo);
        
        if (acc == null) {
            logger.warn("Login failed: Account not found - {}", accNo);
            rateLimitService.recordLoginAttempt(accNo, false);
            throw new AccountNotFoundException(accNo);
        }
        
        if (!acc.isActive()) {
            logger.warn("Login failed: Account blocked - {}", accNo);
            throw new AccountBlockedException(accNo);
        }
        
        // Verify PIN using BCrypt
        if (!passwordEncoder.matches(String.valueOf(pin), acc.getPinHash())) {
            logger.warn("Login failed: Invalid PIN for account - {}", accNo);
            rateLimitService.recordLoginAttempt(accNo, false);
            int remaining = rateLimitService.getRemainingAttempts(accNo);
            throw new InvalidCredentialsException("Invalid PIN. " + remaining + " attempts remaining.");
        }
        
        // Successful login
        rateLimitService.recordLoginAttempt(accNo, true);
        logger.info("Login successful for account: {}", accNo);
        return acc;
    }
    
    public void changePin(int accNo, int currentPin, int newPin) {
        logger.info("Change PIN request for account: {}", accNo);
        
        BankAccount acc = find(accNo);
        if (acc == null) {
            throw new AccountNotFoundException(accNo);
        }
        
        // Verify current PIN
        if (!passwordEncoder.matches(String.valueOf(currentPin), acc.getPinHash())) {
            logger.warn("Change PIN failed: Invalid current PIN for account - {}", accNo);
            throw new InvalidCredentialsException("Current PIN is incorrect");
        }
        
        // Validate new PIN
        if (newPin < 1000 || newPin > 999999) {
            throw new IllegalArgumentException("New PIN must be 4-6 digits");
        }
        
        // Hash and update PIN
        String hashedNewPin = passwordEncoder.encode(String.valueOf(newPin));
        acc.setPinHash(hashedNewPin);
        acc.addTransaction("PIN changed successfully");
        storage.saveAccounts(accounts);
        logger.info("PIN changed successfully for account: {}", accNo);
    }

    public BankAccount find(int accNo) {
        for (BankAccount acc : accounts) {
            if (acc.getAccountNumber() == accNo) return acc;
        }
        return null;
    }
    
    private void checkDailyLimit(BankAccount acc, double amount) {
        String today = LocalDate.now().toString();
        
        // Reset daily total if it's a new day
        if (!today.equals(acc.getLastTransactionDate())) {
            acc.setDailyTransactionTotal(0);
            acc.setLastTransactionDate(today);
        }
        
        // Check if transaction would exceed daily limit
        if (acc.getDailyTransactionTotal() + amount > acc.getDailyTransactionLimit()) {
            throw new IllegalStateException(
                String.format("Daily transaction limit exceeded. Limit: Rs. %.2f, Used: Rs. %.2f, Requested: Rs. %.2f",
                    acc.getDailyTransactionLimit(), acc.getDailyTransactionTotal(), amount)
            );
        }
        
        // Update daily total
        acc.setDailyTransactionTotal(acc.getDailyTransactionTotal() + amount);
    }

    public void deposit(int accNo, double amount) {
        logger.info("Deposit request: Account={}, Amount={}", accNo, amount);
        
        BankAccount acc = find(accNo);
        if (acc == null) {
            logger.error("Deposit failed: Account not found - {}", accNo);
            throw new AccountNotFoundException(accNo);
        }
        
        if (!acc.isActive()) {
            logger.error("Deposit failed: Account blocked - {}", accNo);
            throw new AccountBlockedException(accNo);
        }
        
        if (amount <= 0) {
            logger.error("Deposit failed: Invalid amount - {}", amount);
            throw new InvalidAmountException(amount);
        }
        
        checkDailyLimit(acc, amount);
        acc.deposit(amount);
        storage.saveAccounts(accounts);
        logger.info("Deposit successful: Account={}, Amount={}, New Balance={}", accNo, amount, acc.getBalance());
    }

    public void withdraw(int accNo, double amount) {
        logger.info("Withdrawal request: Account={}, Amount={}", accNo, amount);
        
        BankAccount acc = find(accNo);
        if (acc == null) {
            logger.error("Withdrawal failed: Account not found - {}", accNo);
            throw new AccountNotFoundException(accNo);
        }
        
        if (!acc.isActive()) {
            logger.error("Withdrawal failed: Account blocked - {}", accNo);
            throw new AccountBlockedException(accNo);
        }
        
        if (amount <= 0) {
            logger.error("Withdrawal failed: Invalid amount - {}", amount);
            throw new InvalidAmountException(amount);
        }
        
        if (amount > acc.getBalance()) {
            logger.error("Withdrawal failed: Insufficient balance - Account={}, Balance={}, Requested={}", 
                         accNo, acc.getBalance(), amount);
            throw new InsufficientBalanceException(acc.getBalance(), amount);
        }
        
        checkDailyLimit(acc, amount);
        acc.withdraw(amount);
        storage.saveAccounts(accounts);
        logger.info("Withdrawal successful: Account={}, Amount={}, New Balance={}", accNo, amount, acc.getBalance());
    }

    public void transfer(int fromAcc, int toAcc, double amount) {
        logger.info("Transfer request: From={}, To={}, Amount={}", fromAcc, toAcc, amount);
        
        BankAccount sender = find(fromAcc);
        BankAccount receiver = find(toAcc);

        if (sender == null) {
            logger.error("Transfer failed: Sender account not found - {}", fromAcc);
            throw new AccountNotFoundException("Sender account not found: " + fromAcc);
        }
        
        if (receiver == null) {
            logger.error("Transfer failed: Receiver account not found - {}", toAcc);
            throw new AccountNotFoundException("Receiver account not found: " + toAcc);
        }
        
        if (!sender.isActive()) {
            logger.error("Transfer failed: Sender account blocked - {}", fromAcc);
            throw new AccountBlockedException(fromAcc);
        }
        
        if (!receiver.isActive()) {
            logger.error("Transfer failed: Receiver account blocked - {}", toAcc);
            throw new AccountBlockedException(toAcc);
        }
        
        if (amount <= 0) {
            logger.error("Transfer failed: Invalid amount - {}", amount);
            throw new InvalidAmountException(amount);
        }
        
        if (amount > sender.getBalance()) {
            logger.error("Transfer failed: Insufficient balance - Account={}, Balance={}, Requested={}", 
                         fromAcc, sender.getBalance(), amount);
            throw new InsufficientBalanceException(sender.getBalance(), amount);
        }
        
        checkDailyLimit(sender, amount);
        sender.withdraw(amount);
        receiver.deposit(amount);

        sender.addTransaction("Sent Rs. " + amount + " to " + receiver.getName());
        receiver.addTransaction("Received Rs. " + amount + " from " + sender.getName());

        storage.saveAccounts(accounts);
        logger.info("Transfer successful: From={}, To={}, Amount={}", fromAcc, toAcc, amount);
    }

    public List<String> getTransactions(int accNo) {
        logger.info("Fetching transactions for account: {}", accNo);
        BankAccount acc = find(accNo);
        if (acc == null) {
            logger.error("Transactions fetch failed: Account not found - {}", accNo);
            throw new AccountNotFoundException(accNo);
        }
        return acc.getTransactions();
    }

    public List<BankAccount> getAllAccounts() {
        logger.info("Fetching all accounts");
        return accounts;
    }
}

