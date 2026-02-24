package com.trustbank.app.service;

import com.trustbank.app.exception.*;
import com.trustbank.app.model.BankAccount;
import com.trustbank.app.storage.FileStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BankService {

    private static final Logger logger = LoggerFactory.getLogger(BankService.class);

    private final FileStorage storage;
    private final List<BankAccount> accounts;
    private int nextAccNo = 1001;

    public BankService(FileStorage storage) {
        this.storage = storage;
        this.accounts = storage.loadAccounts();

        for (BankAccount a : accounts) {
            nextAccNo = Math.max(nextAccNo, a.getAccountNumber() + 1);
        }
        logger.info("BankService initialized with {} accounts. Next account number: {}", accounts.size(), nextAccNo);
    }

    public BankAccount createAccount(String name, int pin) {
        logger.info("Creating new account for: {}", name);
        BankAccount acc = new BankAccount(name, nextAccNo, pin);
        accounts.add(acc);
        nextAccNo++;
        storage.saveAccounts(accounts);
        logger.info("Account created successfully: {}", acc.getAccountNumber());
        return acc;
    }

    public BankAccount login(int accNo, int pin) {
        logger.info("Login attempt for account: {}", accNo);
        BankAccount acc = find(accNo);
        
        if (acc == null) {
            logger.warn("Login failed: Account not found - {}", accNo);
            throw new AccountNotFoundException(accNo);
        }
        
        if (!acc.isActive()) {
            logger.warn("Login failed: Account blocked - {}", accNo);
            throw new AccountBlockedException(accNo);
        }
        
        if (acc.getPin() != pin) {
            logger.warn("Login failed: Invalid PIN for account - {}", accNo);
            throw new InvalidCredentialsException();
        }
        
        logger.info("Login successful for account: {}", accNo);
        return acc;
    }

    public BankAccount find(int accNo) {
        for (BankAccount acc : accounts) {
            if (acc.getAccountNumber() == accNo) return acc;
        }
        return null;
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

