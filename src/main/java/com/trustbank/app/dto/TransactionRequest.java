package com.trustbank.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransactionRequest {
    
    @NotNull(message = "Account number is required")
    @Positive(message = "Account number must be positive")
    private Integer accountNumber;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    private Double amount;

    public TransactionRequest() {}

    public TransactionRequest(Integer accountNumber, Double amount) {
        this.accountNumber = accountNumber;
        this.amount = amount;
    }

    public Integer getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(Integer accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
