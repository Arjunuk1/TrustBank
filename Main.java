import java.util.*;
import java.io.*;

public class Main {

    static Scanner sc = new Scanner(System.in);

    static final String ACC_FILE = "accounts.txt";
    static final String TRANS_FILE = "transactions.txt";

    static ArrayList<BankAccount> accounts = new ArrayList<>();
    static int nextAccNumber = 1001;

    // ---------------- UI HELPERS ----------------
    static void header(String t) {
        System.out.println("\n===============================================");
        System.out.println("          " + t);
        System.out.println("===============================================");
    }

    static void line() {
        System.out.println("-----------------------------------------------");
    }

    // ---------------- SAFE INPUT METHODS ----------------
    static int readInt(String msg) {
        while (true) {
            try {
                System.out.print(msg);
                return Integer.parseInt(sc.nextLine().trim());
            } catch (Exception e) {
                System.out.println("❌ Please enter a valid number.");
            }
        }
    }

    static double readDouble(String msg) {
        while (true) {
            try {
                System.out.print(msg);
                return Double.parseDouble(sc.nextLine().trim());
            } catch (Exception e) {
                System.out.println("❌ Please enter a valid amount.");
            }
        }
    }

    static String readString(String msg) {
        System.out.print(msg);
        return sc.nextLine();
    }

    // ---------------- MAIN ----------------
    public static void main(String[] args) {

        loadData();
        header("WELCOME TO TRUSTBANK");

        while (true) {
            System.out.println("\n1. Create Account");
            System.out.println("2. Login");
            System.out.println("3. Admin Login");
            System.out.println("4. Exit");

            int ch = readInt("Choice: ");

            switch (ch) {
                case 1 -> createAccount();
                case 2 -> userLogin();
                case 3 -> adminLogin();
                case 4 -> {
                    saveData();
                    header("THANK YOU");
                    return;
                }
                default -> System.out.println("❌ Invalid choice");
            }
        }
    }

    // ---------------- CREATE ACCOUNT ----------------
    static void createAccount() {
        header("CREATE ACCOUNT");

        String name = readString("Name: ");
        int pin = readInt("Set 4-digit PIN: ");

        if (pin < 1000 || pin > 9999) {
            System.out.println("❌ PIN must be exactly 4 digits.");
            return;
        }

        BankAccount acc = new BankAccount(name, nextAccNumber, pin);
        accounts.add(acc);

        System.out.println("✅ Account Created. Account No: " + nextAccNumber);
        nextAccNumber++;
        saveData();
    }

    // ---------------- USER LOGIN (PHASE 3) ----------------
    static void userLogin() {
        header("USER LOGIN");

        int accNo = readInt("Account No: ");

        for (BankAccount acc : accounts) {

            if (acc.getAccountNumber() == accNo) {

                if (!acc.isActive()) {
                    System.out.println("❌ Account is blocked. Contact admin.");
                    return;
                }

                int attempts = 3;

                while (attempts > 0) {
                    int pin = readInt("Enter PIN: ");

                    if (acc.validatePin(pin)) {
                        System.out.println("🙂 Welcome back, " + acc.getName());
                        userMenu(acc);
                        return;
                    } else {
                        attempts--;
                        System.out.println("❌ Wrong PIN. Attempts left: " + attempts);
                    }
                }

                acc.blockAccount();
                saveData();
                System.out.println("🚫 Account blocked due to 3 incorrect PIN attempts.");
                return;
            }
        }

        System.out.println("❌ Account not found.");
    }

    // ---------------- USER MENU ----------------
    static void userMenu(BankAccount acc) {

        while (true) {
            header("USER DASHBOARD");
            System.out.println("Name: " + acc.getName());
            System.out.println("Balance: Rs. " + acc.getBalance());
            line();

            System.out.println("1. Deposit");
            System.out.println("2. Withdraw");
            System.out.println("3. Transfer");
            System.out.println("4. Interest Calculator");
            System.out.println("5. Loan EMI Calculator");
            System.out.println("6. Transactions (All)");
            System.out.println("7. Last 5 Transactions");
            System.out.println("8. Search Transactions");
            System.out.println("9. Account Summary");
            System.out.println("10. Change PIN");
            System.out.println("11. Export Passbook");
            System.out.println("12. Logout");

            int ch = readInt("Choice: ");

            switch (ch) {

                case 1 -> {
                    double amt = readDouble("Amount: Rs. ");
                    if (amt <= 0) {
                        System.out.println("❌ Amount must be greater than 0.");
                        break;
                    }
                    acc.deposit(amt);
                    saveData();
                    System.out.println("✅ Deposit successful.");
                }

                case 2 -> {
                    double amt = readDouble("Amount: Rs. ");
                    if (amt <= 0) {
                        System.out.println("❌ Amount must be greater than 0.");
                        break;
                    }
                    if (amt > acc.getBalance()) {
                        System.out.println("❌ Insufficient balance.");
                        break;
                    }
                    acc.withdraw(amt);
                    saveData();
                    System.out.println("✅ Withdrawal successful.");
                }

                case 3 -> transferMoney(acc);

                case 4 -> interestFeature(acc);

                case 5 -> emiCalculator();

                case 6 -> acc.printTransactions();

                case 7 -> acc.printLastFiveTransactions();

                case 8 -> {
                    String key = readString("Enter keyword to search: ");
                    acc.searchTransactions(key);
                }

                case 9 -> accountSummary(acc);

                case 10 -> changePin(acc);

                case 11 -> exportPassbook(acc);

                case 12 -> {
                    System.out.println("👋 Logged out successfully.");
                    return;
                }

                default -> System.out.println("❌ Invalid option");
            }
        }
    }

    // ---------------- TRANSFER (WITH CONFIRMATION) ----------------
    static void transferMoney(BankAccount sender) {
        header("MONEY TRANSFER");

        int rno = readInt("Receiver Acc No: ");
        double amt = readDouble("Amount: Rs. ");

        if (amt <= 0) {
            System.out.println("❌ Amount must be greater than 0.");
            return;
        }

        if (amt > sender.getBalance()) {
            System.out.println("❌ Insufficient balance.");
            return;
        }

        for (BankAccount r : accounts) {
            if (r.getAccountNumber() == rno && r.isActive()) {

                String confirm = readString("Confirm transfer of Rs. " + amt + " to " + r.getName() + " (Y/N): ");

                if (!(confirm.equalsIgnoreCase("Y"))) {
                    System.out.println("❌ Transfer cancelled.");
                    return;
                }

                sender.withdraw(amt);
                r.deposit(amt);

                sender.addTransaction("Sent Rs. " + amt + " to " + r.getName());
                r.addTransaction("Received Rs. " + amt + " from " + sender.getName());

                saveData();
                System.out.println("✅ Transfer successful.");
                return;
            }
        }

        System.out.println("❌ Receiver not found or blocked.");
    }

    // ---------------- INTEREST ----------------
    static void interestFeature(BankAccount acc) {
        header("INTEREST CALCULATOR");

        double r = readDouble("Rate (%): ");
        int y = readInt("Years: ");

        if (r <= 0 || y <= 0) {
            System.out.println("❌ Invalid rate/years.");
            return;
        }

        double interest = acc.calculateInterest(r, y);
        System.out.println("Interest Earned: Rs. " + String.format("%.2f", interest));
    }

    // ---------------- EMI ----------------
    static void emiCalculator() {
        header("LOAN EMI CALCULATOR");

        double p = readDouble("Loan Amount: ");
        double rate = readDouble("Rate (% per year): ");
        int n = readInt("Months: ");

        if (p <= 0 || rate <= 0 || n <= 0) {
            System.out.println("❌ Invalid input.");
            return;
        }

        double r = rate / (12 * 100);

        double emi = (p * r * Math.pow(1 + r, n)) /
                     (Math.pow(1 + r, n) - 1);

        System.out.println("Monthly EMI: Rs. " + String.format("%.2f", emi));
    }

    // ---------------- ACCOUNT SUMMARY ----------------
    static void accountSummary(BankAccount acc) {
        header("ACCOUNT SUMMARY");
        System.out.println("Name        : " + acc.getName());
        System.out.println("Account No  : " + acc.getAccountNumber());
        System.out.println("Balance     : Rs. " + acc.getBalance());
        System.out.println("Status      : " + (acc.isActive() ? "Active" : "Blocked"));
        line();
    }

    // ---------------- CHANGE PIN ----------------
    static void changePin(BankAccount acc) {
        header("CHANGE PIN");

        int oldPin = readInt("Enter old PIN: ");
        if (!acc.validatePin(oldPin)) {
            System.out.println("❌ Incorrect old PIN.");
            return;
        }

        int newPin = readInt("Enter new 4-digit PIN: ");
        if (newPin < 1000 || newPin > 9999) {
            System.out.println("❌ PIN must be exactly 4 digits.");
            return;
        }

        acc.setPin(newPin);
        saveData();
        System.out.println("✅ PIN changed successfully.");
    }

    // ---------------- ADMIN ----------------
    static void adminLogin() {
        header("ADMIN LOGIN");

        String u = readString("Admin User: ");
        String p = readString("Password: ");

        if (u.equals("admin") && p.equals("1234")) adminMenu();
        else System.out.println("❌ Invalid admin login");
    }

    static void adminMenu() {
        while (true) {
            header("ADMIN PANEL");
            System.out.println("1. View Accounts");
            System.out.println("2. Unblock Account");
            System.out.println("3. Delete Account");
            System.out.println("4. Total Bank Balance");
            System.out.println("5. Logout");

            int ch = readInt("Choice: ");

            switch (ch) {
                case 1 -> {
                    header("ALL ACCOUNTS");
                    for (BankAccount a : accounts) {
                        System.out.println(a.getAccountNumber() + " | " + a.getName() +
                                " | Rs. " + a.getBalance() +
                                " | " + (a.isActive() ? "Active" : "Blocked"));
                    }
                }

                case 2 -> unblockAccount();

                case 3 -> deleteAccount();

                case 4 -> {
                    double sum = 0;
                    for (BankAccount a : accounts) sum += a.getBalance();
                    System.out.println("Total Balance: Rs. " + String.format("%.2f", sum));
                }

                case 5 -> {
                    System.out.println("👋 Admin logged out.");
                    return;
                }

                default -> System.out.println("❌ Invalid option");
            }
        }
    }

    static void unblockAccount() {
        int no = readInt("Account No to unblock: ");
        for (BankAccount a : accounts) {
            if (a.getAccountNumber() == no) {
                a.unblockAccount();
                saveData();
                System.out.println("✅ Account unblocked.");
                return;
            }
        }
        System.out.println("❌ Account not found.");
    }

    static void deleteAccount() {
        int no = readInt("Account No to delete: ");

        String confirm = readString("Are you sure you want to delete this account? (Y/N): ");
        if (!confirm.equalsIgnoreCase("Y")) {
            System.out.println("❌ Deletion cancelled.");
            return;
        }

        accounts.removeIf(a -> a.getAccountNumber() == no);
        saveData();
        System.out.println("✅ Account deleted successfully.");
    }

    // ---------------- PASSBOOK ----------------
    static void exportPassbook(BankAccount acc) {
        try (FileWriter w = new FileWriter("Passbook_" + acc.getAccountNumber() + ".txt")) {

            w.write("TRUSTBANK PASSBOOK\n");
            w.write("Account: " + acc.getAccountNumber() + "\n");
            w.write("Name: " + acc.getName() + "\n\n");

            for (String t : acc.getTransactions())
                w.write(t + "\n");

            w.write("\nBalance: Rs. " + acc.getBalance());

            System.out.println("✅ Passbook exported successfully.");

        } catch (Exception e) {
            System.out.println("❌ Error exporting passbook");
        }
    }

    // ---------------- FILE STORAGE ----------------
    static void saveData() {
        try (FileWriter a = new FileWriter(ACC_FILE);
             FileWriter t = new FileWriter(TRANS_FILE)) {

            for (BankAccount acc : accounts) {
                a.write(acc.getAccountNumber() + "," + acc.getName() + "," +
                        acc.getPin() + "," + acc.getBalance() + "," +
                        acc.isActive() + "\n");

                for (String tr : acc.getTransactions())
                    t.write(acc.getAccountNumber() + "," + tr + "\n");
            }

        } catch (Exception e) {
            System.out.println("❌ Error saving data");
        }
    }

    static void loadData() {
        try {
            if (!new File(ACC_FILE).exists()) return;

            BufferedReader ar = new BufferedReader(new FileReader(ACC_FILE));
            String l;

            while ((l = ar.readLine()) != null) {
                String[] p = l.split(",");
                BankAccount acc = new BankAccount(p[1], 
                        Integer.parseInt(p[0]),
                        Integer.parseInt(p[2]));

                acc.setBalance(Double.parseDouble(p[3]));
                if (!Boolean.parseBoolean(p[4])) acc.blockAccount();

                accounts.add(acc);

                nextAccNumber = Math.max(nextAccNumber,
                        acc.getAccountNumber() + 1);
            }
            ar.close();

        } catch (Exception e) {
            System.out.println("❌ Error loading data");
        }
    }
}

 