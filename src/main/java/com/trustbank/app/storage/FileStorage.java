package com.trustbank.app.storage;

import com.trustbank.app.model.BankAccount;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.*;

@Component
public class FileStorage {

    private static final Logger logger = LoggerFactory.getLogger(FileStorage.class);
    private final String ACC_FILE = "accounts.txt";
    private final String TRANS_FILE = "transactions.txt";

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
                String[] p = line.split(",");

                int accNo = Integer.parseInt(p[0]);
                String name = p[1];
                int pin = Integer.parseInt(p[2]);
                double bal = Double.parseDouble(p[3]);
                boolean active = Boolean.parseBoolean(p[4]);

                BankAccount acc = new BankAccount(name, accNo, pin);
                acc.setBalance(bal);
                acc.setActive(active);

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
                aw.write(acc.getAccountNumber() + "," + acc.getName() + "," +
                        acc.getPin() + "," + acc.getBalance() + "," +
                        acc.isActive() + "\n");

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
