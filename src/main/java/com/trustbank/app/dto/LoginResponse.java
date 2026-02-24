package com.trustbank.app.dto;

public class LoginResponse {
    private String message;
    private int accountNumber;
    private String name;

    public LoginResponse() {}

    public LoginResponse(String message, int accountNumber, String name) {
        this.message = message;
        this.accountNumber = accountNumber;
        this.name = name;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(int accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
