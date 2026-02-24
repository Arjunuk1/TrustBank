package com.trustbank.app.exception;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String message) {
        super(message);
    }

    public InsufficientBalanceException(double balance, double amount) {
        super(String.format("Insufficient balance. Available: Rs. %.2f, Required: Rs. %.2f", balance, amount));
    }
}
