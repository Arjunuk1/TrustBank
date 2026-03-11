package com.trustbank.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ChangePinRequest {
    
    @NotNull(message = "Account number is required")
    private Integer accountNumber;
    
    @NotNull(message = "Current PIN is required")
    @Min(value = 1000, message = "PIN must be at least 4 digits")
    @Max(value = 999999, message = "PIN must be at most 6 digits")
    private Integer currentPin;
    
    @NotNull(message = "New PIN is required")
    @Min(value = 1000, message = "PIN must be at least 4 digits")
    @Max(value = 999999, message = "PIN must be at most 6 digits")
    private Integer newPin;

    public ChangePinRequest() {}

    public ChangePinRequest(Integer accountNumber, Integer currentPin, Integer newPin) {
        this.accountNumber = accountNumber;
        this.currentPin = currentPin;
        this.newPin = newPin;
    }

    public Integer getAccountNumber() { return accountNumber; }
    public void setAccountNumber(Integer accountNumber) { this.accountNumber = accountNumber; }
    
    public Integer getCurrentPin() { return currentPin; }
    public void setCurrentPin(Integer currentPin) { this.currentPin = currentPin; }
    
    public Integer getNewPin() { return newPin; }
    public void setNewPin(Integer newPin) { this.newPin = newPin; }
}
