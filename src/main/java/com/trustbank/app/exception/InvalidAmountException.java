package com.trustbank.app.exception;

public class InvalidAmountException extends RuntimeException {
    public InvalidAmountException(String message) {
        super(message);
    }

    public InvalidAmountException(double amount) {
        super("Invalid amount: Rs. " + amount + ". Amount must be greater than 0");
    }
}
