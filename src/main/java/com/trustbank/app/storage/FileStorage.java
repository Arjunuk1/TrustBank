package com.trustbank.app.storage;

import com.trustbank.app.model.BankAccount;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.*;

@Component
public class FileStorage {

    private static final Logger logger = LoggerFactory.getLogger(FileStorage.class);
    private final String ACC_FILE = "accounts.txt";
    private final String TRANS_FILE = "transactions.txt";
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<BankAccount> loadAccounts() {
        logger.info("Loading accounts from file: {}", ACC_FILE);
        List<BankAccount> accounts = new ArrayList<>();

        try {
            File f = new File(ACC_FILE);
            if (!f.exists()) {
                logger.warn("Accounts file does not exist. Starting with empty account list.");
                return accounts;
            }

            BufferedReader br = new BufferedReader(new FileReader(f));
            String line;
            int accountCount = 0;

            while ((line = br.readLine()) != null) {
                String[] p = line.split(",", 6); // Changed to 6 to support new format

                int accNo = Integer.parseInt(p[0]);
                String name = p[1];
                String pinHash;
                double bal;
                boolean active;
                double dailyLimit = 50000.0;
                double dailyTotal = 0.0;
                String lastDate = "";
                
                // Handle both old format (int PIN) and new format (String pinHash)
                if (p.length >= 3 && p[2].startsWith("$2a$") || p[2].startsWith("$2b$") || p[2].startsWith("$2y$")) {
                    // New format with hashed PIN
                    pinHash = p[2];
                    bal = Double.parseDouble(p[3]);
                    active = Boolean.parseBoolean(p[4]);
                    
                    // Load additional fields if available
                    if (p.length >= 6) {
                        String[] extraFields = p[5].split("\\|");
                        if (extraFields.length >= 1) {
                            dailyLimit = Double.parseDouble(extraFields[0]);
                        }
                        if (extraFields.length >= 2) {
                            dailyTotal = Double.parseDouble(extraFields[1]);
                        }
                        if (extraFields.length >= 3) {
                            lastDate = extraFields[2];
                        }
                    }
                } else {
                    // Old format with plain PIN - migrate to hashed format
                    int oldPin = Integer.parseInt(p[2]);
                    pinHash = passwordEncoder.encode(String.valueOf(oldPin));
                    bal = Double.parseDouble(p[3]);
                    active = Boolean.parseBoolean(p[4]);
                    logger.info("Migrating account {} to hashed PIN format", accNo);
                }

                BankAccount acc = new BankAccount(name, accNo, pinHash);
                acc.setBalance(bal);
                acc.setActive(active);
                acc.setDailyTransactionLimit(dailyLimit);
                acc.setDailyTransactionTotal(dailyTotal);
                acc.setLastTransactionDate(lastDate);

                accounts.add(acc);
                accountCount++;
            }
            br.close();
            logger.info("Loaded {} accounts successfully", accountCount);

            File tf = new File(TRANS_FILE);
            if (tf.exists()) {
                logger.info("Loading transactions from file: {}", TRANS_FILE);
                BufferedReader tr = new BufferedReader(new FileReader(tf));
                int transactionCount = 0;
                
                while ((line = tr.readLine()) != null) {
                    String[] parts = line.split(",", 2);
                    int accNo = Integer.parseInt(parts[0]);
                    String t = parts[1];

                    for (BankAccount acc : accounts) {
                        if (acc.getAccountNumber() == accNo) {
                            acc.addTransaction(t);
                            transactionCount++;
                        }
                    }
                }
                tr.close();
                logger.info("Loaded {} transactions successfully", transactionCount);
            } else {
                logger.warn("Transactions file does not exist. No transactions loaded.");
            }

        } catch (Exception e) {
            logger.error("Error loading accounts: {}", e.getMessage(), e);
        }

        return accounts;
    }

    public void saveAccounts(List<BankAccount> accounts) {
        logger.info("Saving {} accounts to file", accounts.size());
        
        try (FileWriter aw = new FileWriter(ACC_FILE);
             FileWriter tw = new FileWriter(TRANS_FILE)) {

            int totalTransactions = 0;
            
            for (BankAccount acc : accounts) {
                // New format: accNo,name,pinHash,balance,active,dailyLimit|dailyTotal|lastDate
                String extraFields = acc.getDailyTransactionLimit() + "|" + 
                                   acc.getDailyTransactionTotal() + "|" + 
                                   acc.getLastTransactionDate();
                
                aw.write(acc.getAccountNumber() + "," + acc.getName() + "," +
                        acc.getPinHash() + "," + acc.getBalance() + "," +
                        acc.isActive() + "," + extraFields + "\n");

                for (String t : acc.getTransactions()) {
                    tw.write(acc.getAccountNumber() + "," + t + "\n");
                    totalTransactions++;
                }
            }
            
            logger.info("Successfully saved {} accounts and {} transactions", accounts.size(), totalTransactions);

        } catch (Exception e) {
            logger.error("Error saving accounts: {}", e.getMessage(), e);
        }
    }
}

