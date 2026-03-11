# 🚀 Quick Start Guide - TrustBank Enhanced Features

## 🆕 What's New?

### Security Enhancements
- 🔐 **BCrypt PIN Hashing** - Your PINs are now encrypted
- 🛡️ **Rate Limiting** - Protection against brute force attacks (5 attempts max)
- 🌐 **Restricted CORS** - Enhanced API security
- 💰 **Daily Limits** - ₹50,000 transaction limit per day

### New Features
- 🔑 **Change PIN** - Update your security PIN anytime
- ⚙️ **Account Settings** - View your daily transaction limits and usage
- 📊 **Enhanced Dashboard** - Better security indicators

---

## 🎯 How to Use New Features

### Change Your PIN

1. **Login to your dashboard**
2. **Locate the "Change PIN" section**
3. **Fill in the form**:
   - Enter your current PIN
   - Enter your new PIN (4-6 digits)
   - Confirm your new PIN
4. **Click "Change PIN"**
5. **You'll be logged out** - Login again with your new PIN

**Validation Rules**:
- ✅ PIN must be 4-6 digits
- ✅ New PIN must be different from current PIN
- ✅ Both new PIN fields must match

---

### Monitor Transaction Limits

**In the Account Settings section, you can see**:
- **Daily Limit**: ₹50,000.00 (default)
- **Used Today**: How much you've transacted today
- **Remaining**: How much you can still transact

**Color Coding**:
- 🟢 Green: Plenty of limit remaining
- 🟡 Yellow: Getting close to limit
- 🔴 Red: Near or at limit

**What counts towards the limit?**
- Deposits
- Withdrawals
- Transfers (sent)

**Reset**: Your limit automatically resets at midnight

---

### Security Features

#### Rate Limiting
- You have **5 login attempts**
- After 5 failed attempts, account is locked for **15 minutes**
- You'll see how many attempts remain
- Successful login resets the counter

#### PIN Security
- All PINs are hashed with BCrypt
- Even admins cannot see your actual PIN
- Existing accounts automatically migrated to secure format

---

## 🎨 Dashboard Features

### Quick Actions
- **💰 Deposit** - Add money to your account
- **💸 Withdraw** - Take money out
- **🔄 Transfer** - Send money to another account
- **🔐 Change PIN** - Update your security

### Quick Amount Buttons
Click preset amounts to fill forms quickly:
- ₹100, ₹500, ₹1,000, ₹5,000

### Export Options
- **📥 Export CSV** - Download transaction history as spreadsheet
- **📄 Download PDF** - Get statement as PDF document

### Transaction Filters
- **All** - Show everything
- **💰 Deposits** - Only deposits
- **💸 Withdrawals** - Only withdrawals
- **🔄 Transfers** - Only transfers

### Search
- Type in the search box to find specific transactions
- Search by amount, type, or account number

---

## ⚡ Keyboard Shortcuts

- **`?`** - Show keyboard shortcuts help
- **`Esc`** - Close dialogs
- **`Ctrl/Cmd + R`** - Refresh transactions

---

## 🔒 Security Best Practices

### PIN Security
✅ **DO**:
- Use a unique PIN you can remember
- Change your PIN regularly
- Keep your PIN private

❌ **DON'T**:
- Share your PIN with anyone
- Use sequential numbers (1234, 0000)
- Write down your PIN

### Account Security
✅ **DO**:
- Logout when done
- Monitor your transaction history
- Check daily limit usage

❌ **DON'T**:
- Leave your session unattended
- Use public/shared computers
- Share your account details

### Session Security
- Sessions expire after **5 minutes** of inactivity
- You'll see a warning at **4 minutes**
- Any activity resets the timer
- Click "Stay Logged In" to extend session

---

## ❓ FAQ

### Q: What happens if I forget my new PIN?
**A**: Contact support. For demo purposes, you can create a new account.

### Q: Can I increase my daily limit?
**A**: Currently, the limit is fixed at ₹50,000. Future versions may allow customization.

### Q: Are my transactions safe?
**A**: Yes! This demo uses industry-standard security (BCrypt hashing, rate limiting, etc.). However, it's still a demo - don't use real financial data.

### Q: What if I exceed my daily limit?
**A**: Transactions will be rejected with a clear error message. Wait until midnight for reset.

### Q: How do I know my data is secure?
**A**: Look for the 🔒 256-bit Encrypted badge in the header. All PINs are hashed and never stored in plain text.

### Q: Can I access TrustBank from my phone?
**A**: Yes! The interface is fully responsive and works on all devices.

---

## 🆘 Troubleshooting

### Can't Login
- **Check**: Is your account number correct?
- **Check**: Is your PIN correct?
- **Check**: Are you locked out? (Wait 15 minutes if you had 5 failed attempts)

### Transaction Failed
- **Check**: Do you have sufficient balance?
- **Check**: Have you exceeded daily limit?
- **Check**: Are you logged in?
- **Check**: Is the recipient account valid? (for transfers)

### PIN Change Failed
- **Check**: Is your current PIN correct?
- **Check**: Is your new PIN 4-6 digits?
- **Check**: Do both new PIN fields match?
- **Check**: Is the new PIN different from current?

---

## 📞 Support

This is a **demo application** for educational purposes.

For technical issues:
- Check the browser console for errors
- Verify backend is running on port 8081
- Check `logs/` directory for server logs

---

**Enjoy your enhanced banking experience! 🎉**

*Last updated: March 11, 2026*
