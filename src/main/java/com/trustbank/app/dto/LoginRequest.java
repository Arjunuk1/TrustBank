package com.trustbank.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class LoginRequest {
    
    @NotNull(message = "Account number is required")
    @Positive(message = "Account number must be positive")
    private Integer accountNumber;
    
    @NotNull(message = "PIN is required")
    @Positive(message = "PIN must be positive")
    private Integer pin;

    public LoginRequest() {}

    public LoginRequest(Integer accountNumber, Integer pin) {
        this.accountNumber = accountNumber;
        this.pin = pin;
    }

    public Integer getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(Integer accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Integer getPin() {
        return pin;
    }

    public void setPin(Integer pin) {
        this.pin = pin;
    }
}
