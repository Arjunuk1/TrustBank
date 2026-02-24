package com.trustbank.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CreateAccountRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "PIN is required")
    @Positive(message = "PIN must be positive")
    private Integer pin;

    public CreateAccountRequest() {}

    public CreateAccountRequest(String name, Integer pin) {
        this.name = name;
        this.pin = pin;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPin() {
        return pin;
    }

    public void setPin(Integer pin) {
        this.pin = pin;
    }
}
