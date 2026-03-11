package com.trustbank.app.controller;

import com.trustbank.app.dto.*;
import com.trustbank.app.model.BankAccount;
import com.trustbank.app.service.BankService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500"})
public class BankController {

    private static final Logger logger = LoggerFactory.getLogger(BankController.class);
    private final BankService service;

    public BankController(BankService service) {
        this.service = service;
    }

    // ---------------- CREATE ACCOUNT ----------------
    @PostMapping("/accounts/create")
    public ResponseEntity<ApiResponse<AccountResponse>> create(@Valid @RequestBody CreateAccountRequest request) {
        logger.info("API Request: Create account for name={}", request.getName());
        
        BankAccount account = service.createAccount(request.getName(), request.getPin());
        AccountResponse response = new AccountResponse(
                account.getAccountNumber(),
                account.getName(),
                account.getBalance()
        );
        
        logger.info("API Response: Account created successfully - {}", account.getAccountNumber());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/accounts/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        logger.info("API Request: Login for account={}", request.getAccountNumber());
        
        BankAccount acc = service.login(request.getAccountNumber(), request.getPin());
        LoginResponse response = new LoginResponse(
                "Login successful",
                acc.getAccountNumber(),
                acc.getName()
        );
        
        logger.info("API Response: Login successful for account={}", acc.getAccountNumber());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ---------------- DEPOSIT ----------------
    @PostMapping("/accounts/deposit")
    public ResponseEntity<ApiResponse<String>> deposit(@Valid @RequestBody TransactionRequest request) {
        logger.info("API Request: Deposit for account={}, amount={}", 
                    request.getAccountNumber(), request.getAmount());
        
        service.deposit(request.getAccountNumber(), request.getAmount());
        
        logger.info("API Response: Deposit successful");
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", null));
    }

    // ---------------- WITHDRAW ----------------
    @PostMapping("/accounts/withdraw")
    public ResponseEntity<ApiResponse<String>> withdraw(@Valid @RequestBody TransactionRequest request) {
        logger.info("API Request: Withdraw for account={}, amount={}", 
                    request.getAccountNumber(), request.getAmount());
        
        service.withdraw(request.getAccountNumber(), request.getAmount());
        
        logger.info("API Response: Withdrawal successful");
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", null));
    }

    // ---------------- TRANSFER ----------------
    @PostMapping("/accounts/transfer")
    public ResponseEntity<ApiResponse<String>> transfer(@Valid @RequestBody TransferRequest request) {
        logger.info("API Request: Transfer from={}, to={}, amount={}", 
                    request.getFromAccount(), request.getToAccount(), request.getAmount());
        
        service.transfer(request.getFromAccount(), request.getToAccount(), request.getAmount());
        
        logger.info("API Response: Transfer successful");
        return ResponseEntity.ok(ApiResponse.success("Transfer successful", null));
    }

    // ---------------- TRANSACTIONS ----------------
    @GetMapping("/accounts/{accNo}/transactions")
    public ResponseEntity<ApiResponse<List<String>>> transactions(@PathVariable int accNo) {
        logger.info("API Request: Get transactions for account={}", accNo);
        
        List<String> transactions = service.getTransactions(accNo);
        
        logger.info("API Response: Retrieved {} transactions", transactions.size());
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    // ---------------- BALANCE ----------------
    @GetMapping("/accounts/{accNo}/balance")
    public ResponseEntity<ApiResponse<Double>> getBalance(@PathVariable int accNo) {
        logger.info("API Request: Get balance for account={}", accNo);
        
        BankAccount acc = service.find(accNo);
        if (acc == null) {
            throw new com.trustbank.app.exception.AccountNotFoundException(accNo);
        }
        
        logger.info("API Response: Balance retrieved for account={}", accNo);
        return ResponseEntity.ok(ApiResponse.success(acc.getBalance()));
    }

    // ---------------- CHANGE PIN ----------------
    @PostMapping("/accounts/change-pin")
    public ResponseEntity<ApiResponse<String>> changePin(@Valid @RequestBody ChangePinRequest request) {
        logger.info("API Request: Change PIN for account={}", request.getAccountNumber());
        
        service.changePin(request.getAccountNumber(), request.getCurrentPin(), request.getNewPin());
        
        logger.info("API Response: PIN changed successfully");
        return ResponseEntity.ok(ApiResponse.success("PIN changed successfully", null));
    }

    // ---------------- ADMIN ----------------
    @GetMapping("/admin/accounts")
    public ResponseEntity<ApiResponse<List<BankAccount>>> allAccounts() {
        logger.info("API Request: Get all accounts (admin)");
        
        List<BankAccount> accounts = service.getAllAccounts();
        
        logger.info("API Response: Retrieved {} accounts", accounts.size());
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }
}
