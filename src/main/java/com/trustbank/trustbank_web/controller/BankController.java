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

    @PostMapping("/accounts/create")
    public BankAccount create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        int pin = Integer.parseInt(body.get("pin"));
        return service.createAccount(name, pin);
    }

    @PostMapping("/accounts/login")
    public Object login(@RequestBody Map<String, String> body) {
        int accNo = Integer.parseInt(body.get("accountNumber"));
        int pin = Integer.parseInt(body.get("pin"));

        BankAccount acc = service.login(accNo, pin);
        if (acc == null) return Map.of("message", "Login failed");

        return Map.of(
                "message", "Login successful",
                "accountNumber", acc.getAccountNumber(),
                "name", acc.getName()
        );
    }

    @PostMapping("/accounts/deposit")
    public Map<String, String> deposit(@RequestBody Map<String, String> body) {
        int accNo = Integer.parseInt(body.get("accountNumber"));
        double amount = Double.parseDouble(body.get("amount"));
        return Map.of("message", service.deposit(accNo, amount));
    }

    @PostMapping("/accounts/withdraw")
    public Map<String, String> withdraw(@RequestBody Map<String, String> body) {
        int accNo = Integer.parseInt(body.get("accountNumber"));
        double amount = Double.parseDouble(body.get("amount"));
        return Map.of("message", service.withdraw(accNo, amount));
    }

    @PostMapping("/accounts/transfer")
    public Map<String, String> transfer(@RequestBody Map<String, String> body) {
        int fromAcc = Integer.parseInt(body.get("fromAccount"));
        int toAcc = Integer.parseInt(body.get("toAccount"));
        double amount = Double.parseDouble(body.get("amount"));

        return Map.of("message", service.transfer(fromAcc, toAcc, amount));
    }

    @GetMapping("/accounts/{accNo}/transactions")
    public List<String> transactions(@PathVariable int accNo) {
        return service.getTransactions(accNo);
    }

    @GetMapping("/admin/accounts")
    public List<BankAccount> allAccounts() {
        return service.getAllAccounts();
    }
}
