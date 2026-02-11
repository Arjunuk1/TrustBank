package com.trustbank.app.model;

import java.util.ArrayList;
import java.util.List;

public class BankAccount {

    private int accountNumber;
    private String name;
    private int pin;
    private double balance;
    private boolean active;
    private List<String> transactions = new ArrayList<>();

    public BankAccount() {}

    public BankAccount(String name, int accountNumber, int pin) {
        this.name = name;
        this.accountNumber = accountNumber;
        this.pin = pin;
        this.balance = 0.0;
        this.active = true;
        transactions.add("Account created successfully");
    }

    public int getAccountNumber() { return accountNumber; }
    public String getName() { return name; }
    public int getPin() { return pin; }
    public double getBalance() { return balance; }
    public boolean isActive() { return active; }
    public List<String> getTransactions() { return transactions; }

    public void setBalance(double balance) { this.balance = balance; }
    public void setActive(boolean active) { this.active = active; }
    public void setPin(int pin) { this.pin = pin; }

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
}
