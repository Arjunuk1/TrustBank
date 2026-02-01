package com.trustbank.trustbank_web.controller;

import com.trustbank.trustbank_web.model.BankAccount;
import com.trustbank.trustbank_web.service.BankService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class BankController {

    private final BankService service;

    public BankController(BankService service) {
        this.service = service;
    }

    // ---------------- CREATE ACCOUNT ----------------
    @PostMapping("/accounts/create")
    public BankAccount create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        int pin = Integer.parseInt(body.get("pin"));
        return service.createAccount(name, pin);
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/accounts/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        int accNo = Integer.parseInt(body.get("accountNumber"));
        int pin = Integer.parseInt(body.get("pin"));

        BankAccount acc = service.login(accNo, pin);

        if (acc == null) {
            return Map.of("message", "Login failed");
        }

        return Map.of(
                "message", "Login successful",
                "accountNumber", acc.getAccountNumber(),
                "name", acc.getName()
        );
    }

    // ---------------- DEPOSIT ----------------
    @PostMapping("/accounts/deposit")
    public Map<String, String> deposit(@RequestBody Map<String, String> body) {
        int accNo = Integer.parseInt(body.get("accountNumber"));
        double amount = Double.parseDouble(body.get("amount"));

        service.deposit(accNo, amount);
        return Map.of("message", "Deposit successful");
    }

    // ---------------- WITHDRAW ----------------
    @PostMapping("/accounts/withdraw")
    public Map<String, String> withdraw(@RequestBody Map<String, String> body) {
        int accNo = Integer.parseInt(body.get("accountNumber"));
        double amount = Double.parseDouble(body.get("amount"));

        service.withdraw(accNo, amount);
        return Map.of("message", "Withdraw successful");
    }

    // ---------------- TRANSFER ----------------
    @PostMapping("/accounts/transfer")
    public Map<String, String> transfer(@RequestBody Map<String, String> body) {
        int from = Integer.parseInt(body.get("fromAccount"));
        int to = Integer.parseInt(body.get("toAccount"));
        double amount = Double.parseDouble(body.get("amount"));

        service.transfer(from, to, amount);
        return Map.of("message", "Transfer successful");
    }

    // ---------------- TRANSACTIONS ----------------
    @GetMapping("/accounts/{accNo}/transactions")
    public List<String> transactions(@PathVariable int accNo) {
        return service.getTransactions(accNo);
    }

    // ---------------- BALANCE ----------------
    @GetMapping("/accounts/{accNo}/balance")
    public double getBalance(@PathVariable int accNo) {
        BankAccount acc = service.find(accNo);
        return acc != null ? acc.getBalance() : 0.0;
    }

    // ---------------- ADMIN ----------------
    @GetMapping("/admin/accounts")
    public List<BankAccount> allAccounts() {
        return service.getAllAccounts();
    }
}
