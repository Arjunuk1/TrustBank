package com.trustbank.app.model;

import java.util.ArrayList;
import java.util.List;

public class BankAccount {

    private int accountNumber;
    private String name;
    private String pinHash; // Changed from int pin to String pinHash for BCrypt
    private double balance;
    private boolean active;
    private List<String> transactions = new ArrayList<>();
    private double dailyTransactionLimit = 50000.0; // Default daily limit
    private double dailyTransactionTotal = 0.0;
    private String lastTransactionDate = "";

    public BankAccount() {}

    public BankAccount(String name, int accountNumber, String pinHash) {
        this.name = name;
        this.accountNumber = accountNumber;
        this.pinHash = pinHash;
        this.balance = 0.0;
        this.active = true;
        transactions.add("Account created successfully");
    }

    public int getAccountNumber() { return accountNumber; }
    public String getName() { return name; }
    public String getPinHash() { return pinHash; }
    public double getBalance() { return balance; }
    public boolean isActive() { return active; }
    public List<String> getTransactions() { return transactions; }
    public double getDailyTransactionLimit() { return dailyTransactionLimit; }
    public double getDailyTransactionTotal() { return dailyTransactionTotal; }
    public String getLastTransactionDate() { return lastTransactionDate; }

    public void setBalance(double balance) { this.balance = balance; }
    public void setActive(boolean active) { this.active = active; }
    public void setPinHash(String pinHash) { this.pinHash = pinHash; }
    public void setDailyTransactionLimit(double limit) { this.dailyTransactionLimit = limit; }
    public void setDailyTransactionTotal(double total) { this.dailyTransactionTotal = total; }
    public void setLastTransactionDate(String date) { this.lastTransactionDate = date; }

    public void addTransaction(String msg) {
        transactions.add(msg);
    }

    public void deposit(double amount) {
        balance += amount;
        addTransaction("Deposited Rs. " + amount);
    }

    public void withdraw(double amount) {
        balance -= amount;
        addTransaction("Withdrew Rs. " + amount);
    }
    
    // Legacy support for old int PIN (deprecated)
    @Deprecated
    public int getPin() { 
        return 0; // Return dummy value for backward compatibility
    }
    
    @Deprecated
    public void setPin(int pin) { 
        // No-op for backward compatibility
    }
}
