package com.trustbank.app.service;

import com.trustbank.app.model.BankAccount;
import com.trustbank.app.storage.FileStorage;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BankService {

    private final FileStorage storage;
    private final List<BankAccount> accounts;
    private int nextAccNo = 1001;

    public BankService(FileStorage storage) {
        this.storage = storage;
        this.accounts = storage.loadAccounts();

        for (BankAccount a : accounts) {
            nextAccNo = Math.max(nextAccNo, a.getAccountNumber() + 1);
        }
    }

    public BankAccount createAccount(String name, int pin) {
        BankAccount acc = new BankAccount(name, nextAccNo, pin);
        accounts.add(acc);
        nextAccNo++;
        storage.saveAccounts(accounts);
        return acc;
    }

    public BankAccount login(int accNo, int pin) {
        BankAccount acc = find(accNo);
        if (acc == null) return null;
        if (!acc.isActive()) return null;
        if (acc.getPin() != pin) return null;
        return acc;
    }

    public BankAccount find(int accNo) {
        for (BankAccount acc : accounts) {
            if (acc.getAccountNumber() == accNo) return acc;
        }
        return null;
    }

    public String deposit(int accNo, double amount) {
        BankAccount acc = find(accNo);
        if (acc == null) return "Account not found";
        if (!acc.isActive()) return "Account blocked";
        if (amount <= 0) return "Invalid amount";

        acc.deposit(amount);
        storage.saveAccounts(accounts);
        return "Deposit successful";
    }

    public String withdraw(int accNo, double amount) {
        BankAccount acc = find(accNo);
        if (acc == null) return "Account not found";
        if (!acc.isActive()) return "Account blocked";
        if (amount <= 0) return "Invalid amount";
        if (amount > acc.getBalance()) return "Insufficient balance";

        acc.withdraw(amount);
        storage.saveAccounts(accounts);
        return "Withdrawal successful";
    }

    public String transfer(int fromAcc, int toAcc, double amount) {
        BankAccount sender = find(fromAcc);
        BankAccount receiver = find(toAcc);

        if (sender == null || receiver == null) return "Account not found";
        if (!sender.isActive() || !receiver.isActive()) return "Account blocked";
        if (amount <= 0) return "Invalid amount";
        if (amount > sender.getBalance()) return "Insufficient balance";

        sender.withdraw(amount);
        receiver.deposit(amount);

        sender.addTransaction("Sent Rs. " + amount + " to " + receiver.getName());
        receiver.addTransaction("Received Rs. " + amount + " from " + sender.getName());

        storage.saveAccounts(accounts);
        return "Transfer successful";
    }

    public List<String> getTransactions(int accNo) {
        BankAccount acc = find(accNo);
        if (acc == null) return List.of("Account not found");
        return acc.getTransactions();
    }

    public List<BankAccount> getAllAccounts() {
        return accounts;
    }
}

