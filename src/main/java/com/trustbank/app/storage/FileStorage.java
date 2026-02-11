package com.trustbank.app.storage;

import com.trustbank.app.model.BankAccount;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.*;

@Component
public class FileStorage {

    private final String ACC_FILE = "accounts.txt";
    private final String TRANS_FILE = "transactions.txt";

    public List<BankAccount> loadAccounts() {
        List<BankAccount> accounts = new ArrayList<>();

        try {
            File f = new File(ACC_FILE);
            if (!f.exists()) return accounts;

            BufferedReader br = new BufferedReader(new FileReader(f));
            String line;

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
            }
            br.close();

            File tf = new File(TRANS_FILE);
            if (tf.exists()) {
                BufferedReader tr = new BufferedReader(new FileReader(tf));
                while ((line = tr.readLine()) != null) {
                    String[] parts = line.split(",", 2);
                    int accNo = Integer.parseInt(parts[0]);
                    String t = parts[1];

                    for (BankAccount acc : accounts) {
                        if (acc.getAccountNumber() == accNo) {
                            acc.addTransaction(t);
                        }
                    }
                }
                tr.close();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return accounts;
    }

    public void saveAccounts(List<BankAccount> accounts) {
        try (FileWriter aw = new FileWriter(ACC_FILE);
             FileWriter tw = new FileWriter(TRANS_FILE)) {

            for (BankAccount acc : accounts) {
                aw.write(acc.getAccountNumber() + "," + acc.getName() + "," +
                        acc.getPin() + "," + acc.getBalance() + "," +
                        acc.isActive() + "\n");

                for (String t : acc.getTransactions()) {
                    tw.write(acc.getAccountNumber() + "," + t + "\n");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
