package com.trustbank.app.exception;

public class AccountBlockedException extends RuntimeException {
    public AccountBlockedException(String message) {
        super(message);
    }

    public AccountBlockedException(int accountNumber) {
        super("Account is blocked: " + accountNumber);
    }
}
