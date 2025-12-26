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

    // ---------------- MAIN ----------------
    public static void main(String[] args) {

        loadData();
        header("WELCOME TO TRUSTBANK");

        while (true) {
            System.out.println("\n1. Create Account");
            System.out.println("2. Login");
            System.out.println("3. Admin Login");
            System.out.println("4. Exit");
            System.out.print("Choice: ");

            int ch = sc.nextInt();

            switch (ch) {
                case 1 -> createAccount();
                case 2 -> userLogin();
                case 3 -> adminLogin();
                case 4 -> {
                    saveData();
                    header("THANK YOU");
                    return;
                }
                default -> System.out.println("Invalid choice");
            }
        }
    }

    // ---------------- CREATE ACCOUNT ----------------
    static void createAccount() {
        sc.nextLine();
        System.out.print("Name: ");
        String name = sc.nextLine();
        System.out.print("Set PIN: ");
        int pin = sc.nextInt();

        BankAccount acc = new BankAccount(name, nextAccNumber, pin);
        accounts.add(acc);

        System.out.println("Account Created. Account No: " + nextAccNumber);
        nextAccNumber++;
        saveData();
    }

    // ---------------- USER LOGIN ----------------
    static void userLogin() {
    System.out.print("Account No: ");
    int accNo = sc.nextInt();

    for (BankAccount acc : accounts) {

        if (acc.getAccountNumber() == accNo) {

            if (!acc.isActive()) {
                System.out.println("❌ Account is blocked. Contact admin.");
                return;
            }

            int attempts = 3;

            while (attempts > 0) {
                System.out.print("Enter PIN: ");
                int pin = sc.nextInt();

                if (acc.validatePin(pin)) {
                    System.out.println("🙂 Welcome back, " + acc.getName());
                    userMenu(acc);
                    return;
                } else {
                    attempts--;
                    System.out.println("❌ Wrong PIN. Attempts left: " + attempts);
                }
            }

            // After 3 failed attempts
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
            System.out.println("6. Transactions");
            System.out.println("7. Account Summary");
            System.out.println("8. Change PIN");        // NEW
            System.out.println("9. Export Passbook");
            System.out.println("10. Logout");


            System.out.print("Choice: ");

            int ch = sc.nextInt();

            switch (ch) {
                case 1 -> {
                    System.out.print("Amount: ");
                    double amt = sc.nextDouble();

                    if (amt <= 0) {
                    System.out.println("❌ Amount must be greater than 0.");
                    break;
                }

                acc.deposit(amt);
                saveData();

                }
                case 2 -> {
                    System.out.print("Amount: ");
                    double amt = sc.nextDouble();

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
                }
                case 3 -> transferMoney(acc);
                case 4 -> interestFeature(acc);
                case 5 -> emiCalculator();
                case 6 -> acc.printTransactions();
                case 7 -> accountSummary(acc);
                case 8 -> changePin(acc);        // NEW
                case 9 -> exportPassbook(acc);
                case 10 -> {
                        System.out.println("👋 Logged out successfully.");
                    return;
                }


                default -> System.out.println("Invalid option");
            }
        }
    }

    static void changePin(BankAccount acc) {
    System.out.print("Enter old PIN: ");
    int oldPin = sc.nextInt();

    if (!acc.validatePin(oldPin)) {
        System.out.println("❌ Incorrect old PIN.");
        return;
    }

    System.out.print("Enter new PIN: ");
    int newPin = sc.nextInt();

    if (newPin < 1000 || newPin > 9999) {
        System.out.println("❌ PIN must be 4 digits.");
        return;
    }

    acc.setPin(newPin);
    saveData();
    System.out.println("✅ PIN changed successfully.");
}


    static void transferMoney(BankAccount sender) {

    System.out.print("Receiver Acc No: ");
    int rno = sc.nextInt();

    System.out.print("Amount: ");
    double amt = sc.nextDouble();

    // ✅ PUT THE CHECK RIGHT HERE
    if (amt <= 0) {
        System.out.println("❌ Amount must be greater than 0.");
        return;
    }

    // now continue normal logic
    for (BankAccount r : accounts) {
        if (r.getAccountNumber() == rno && r.isActive()) {

            if (amt > sender.getBalance()) {
                System.out.println("❌ Insufficient balance.");
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

    System.out.println("❌ Receiver account not found or blocked.");
}


    // ---------------- INTEREST ----------------
    static void interestFeature(BankAccount acc) {
        System.out.print("Rate (%): ");
        double r = sc.nextDouble();
        System.out.print("Years: ");
        int y = sc.nextInt();

        double interest = acc.calculateInterest(r, y);
        System.out.println("Interest Earned: Rs. " + interest);
    }

    // ---------------- EMI ----------------
    static void emiCalculator() {
        System.out.print("Loan Amount: ");
        double p = sc.nextDouble();
        System.out.print("Rate (%): ");
        double r = sc.nextDouble() / (12 * 100);
        System.out.print("Months: ");
        int n = sc.nextInt();

        double emi = (p * r * Math.pow(1 + r, n)) /
                     (Math.pow(1 + r, n) - 1);

        System.out.println("Monthly EMI: Rs. " + String.format("%.2f", emi));
    }

    // ---------------- ADMIN ----------------
    static void adminLogin() {
        System.out.print("Admin User: ");
        String u = sc.next();
        System.out.print("Password: ");
        String p = sc.next();

        if (u.equals("admin") && p.equals("1234")) adminMenu();
        else System.out.println("Invalid admin login");
    }

    static void adminMenu() {
        while (true) {
            header("ADMIN PANEL");
            System.out.println("1. View Accounts");
            System.out.println("2. Unblock Account");
            System.out.println("3. Delete Account");
            System.out.println("4. Total Bank Balance");
            System.out.println("5. Logout");
            System.out.print("Choice: ");

            int ch = sc.nextInt();

            switch (ch) {
                case 1 -> accounts.forEach(a ->
                        System.out.println(a.getAccountNumber() + " | " + a.getName()));
                case 2 -> unblockAccount();
                case 3 -> deleteAccount();
                case 4 -> {
                    double sum = 0;
                    for (BankAccount a : accounts) sum += a.getBalance();
                    System.out.println("Total Balance: Rs. " + sum);
                }
                case 5 -> { return; }
            }
        }
    }

    static void unblockAccount() {
        System.out.print("Account No: ");
        int no = sc.nextInt();
        for (BankAccount a : accounts) {
            if (a.getAccountNumber() == no) {
                a.unblockAccount();
                saveData();
            }
        }
    }
    static void accountSummary(BankAccount acc) {
    header("ACCOUNT SUMMARY");
    System.out.println("Name        : " + acc.getName());
    System.out.println("Account No  : " + acc.getAccountNumber());
    System.out.println("Balance     : Rs. " + acc.getBalance());
    System.out.println("Status      : " + (acc.isActive() ? "Active" : "Blocked"));
    line();
}


    static void deleteAccount() {
    System.out.print("Account No: ");
    int no = sc.nextInt();

    System.out.print("Are you sure you want to delete this account? (Y/N): ");
    char ch = sc.next().charAt(0);

    if (ch == 'Y' || ch == 'y') {
        accounts.removeIf(a -> a.getAccountNumber() == no);
        saveData();
        System.out.println("✅ Account deleted successfully.");
    } else {
        System.out.println("❌ Deletion cancelled.");
    }
}


    // ---------------- PASSBOOK ----------------
    static void exportPassbook(BankAccount acc) {
        try (FileWriter w =
                     new FileWriter("Passbook_" + acc.getAccountNumber() + ".txt")) {

            w.write("TRUSTBANK PASSBOOK\n");
            w.write("Account: " + acc.getAccountNumber() + "\n");
            w.write("Name: " + acc.getName() + "\n\n");

            for (String t : acc.getTransactions())
                w.write(t + "\n");

            w.write("\nBalance: Rs. " + acc.getBalance());
        } catch (Exception e) {
            System.out.println("Error exporting passbook");
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
        } catch (Exception ignored) {}
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
        } catch (Exception ignored) {}
    }
}
