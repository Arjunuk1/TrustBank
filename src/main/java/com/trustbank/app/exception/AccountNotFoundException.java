package com.trustbank.app.exception;

public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String message) {
        super(message);
    }

    public AccountNotFoundException(int accountNumber) {
        super("Account not found: " + accountNumber);
    }
}
