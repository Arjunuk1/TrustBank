# 🏦 TrustBank - Premium Modern Banking Application

A premium, enterprise-grade banking application built with **Spring Boot** backend and modern **JavaScript** frontend featuring stunning animations and glass morphism design.

---

## ✨ Recent Upgrades & Improvements

### 🎨 **Premium Modern Design**
- **Glass Morphism UI**: Stunning translucent cards with blur effects
- **Advanced Animations**: Smooth page loads, card appearances, and micro-interactions
- **Gradient Backgrounds**: Dynamic animated background with particle effects
- **Custom Scrollbar**: Styled scrollbar matching the theme
- **Responsive Design**: Fully mobile-friendly layout

### 🎭 **Animations & Transitions**
- ✅ Page load animations with cubic-bezier easing
- ✅ Staggered card appearance with delay
- ✅ Hover effects with 3D transforms
- ✅ Button ripple effects
- ✅ Toast notifications with slide-in animation
- ✅ Transaction cards with fade-slide entrance
- ✅ Rotating icons on transaction hover
- ✅ Pulsing balance display
- ✅ Shimmer effect on topbar

### 🐛 **Bug Fixes**
- ✅ Fixed JavaScript logic error in `createAccount()` function (variables declared before validation)
- ✅ Fixed package name mismatch in Java files (`com.trustbank.trustbank_web` → `com.trustbank.app`)
- ✅ Fixed transaction count display
- ✅ Improved error handling and validation
- ✅ Fixed status indicator updates

### 💫 **UX Improvements**
- ✅ Enhanced loading states with spinners
- ✅ Better error messages and validation
- ✅ Improved toast notification system
- ✅ Enhanced balance chart with better styling
- ✅ Transaction filtering with visual feedback
- ✅ Emoji icons for better visual communication
- ✅ Real-time status indicators
- ✅ Professional typography with Inter font

---

## 🚀 Technologies Used

### Backend
- **Spring Boot 4.0.2** - Java 17
- **RESTful API** Architecture
- **File-based Storage** (accounts.txt, transactions.txt)
- **Maven** Build Tool

### Frontend
- **Vanilla JavaScript** (ES6+)
- **HTML5** & **CSS3**
- **Chart.js** for balance visualization
- **Google Fonts** (Inter)
- **CSS Animations** & Keyframes

---

## 📁 Project Structure

```
TrustBank/
├── frontend/
│   ├── index.html          # Main landing page
│   ├── login.html          # Login/Register page
│   ├── dashboard.html      # User dashboard
│   ├── style.css           # Premium styling with animations
│   └── script.js           # Frontend logic
├── src/main/java/com/trustbank/app/
│   ├── TrustbankWebApplication.java
│   ├── controller/
│   │   └── BankController.java       # REST API endpoints
│   ├── model/
│   │   └── BankAccount.java          # Account entity
│   ├── service/
│   │   └── BankService.java          # Business logic
│   └── storage/
│       └── FileStorage.java          # Data persistence
└── pom.xml                 # Maven configuration
```

---

## 🎯 Features

### 🔐 **Authentication**
- Create new bank accounts with name and PIN
- Secure login with account number and PIN
- Session management with localStorage
- Visual login status indicators

### 💰 **Banking Operations**
- **Deposit**: Add funds to your account
- **Withdraw**: Remove funds from your account
- **Transfer**: Send money to other accounts
- Real-time balance updates
- Transaction history tracking

### 📊 **Dashboard**
- Beautiful account information display
- Interactive balance chart (Chart.js)
- Transaction filtering (All/Deposit/Withdraw/Transfer)
- Real-time transaction count
- Animated transaction cards

### 🎨 **UI/UX Excellence**
- Smooth animations throughout
- Glass morphism card design
- Gradient color schemes
- Hover effects and transitions
- Toast notifications for feedback
- Loading states for all operations
- Mobile responsive design

---

## 🛠️ Setup & Installation

### Prerequisites
- **Java 17** or higher
- **Maven 3.6+**
- Modern web browser

### Backend Setup

1. **Navigate to project directory**:
```bash
cd TrustBank
```

2. **Build the project**:
```bash
./mvnw clean install
```

3. **Run the Spring Boot application**:
```bash
./mvnw spring-boot:run
```

The backend will start on **http://localhost:8081**

### Frontend Setup

1. **Open frontend files**:
```bash
cd frontend
```

2. **Open in browser**:
- Simply open `index.html` or `login.html` in your browser
- Or use a local server:
```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx http-server -p 8080
```

3. **Access the application**:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8081/api`

---

## 🎮 How to Use

### 1️⃣ **Create Account**
- Enter your full name
- Set a secure 4-6 digit PIN
- Click "Create Account"
- Note your account number

### 2️⃣ **Login**
- Enter your account number
- Enter your PIN
- Click "Login"

### 3️⃣ **Perform Banking Operations**
- **Deposit**: Enter amount and click "Deposit"
- **Withdraw**: Enter amount and click "Withdraw"
- **Transfer**: Enter receiver account number, amount, and click "Transfer"

### 4️⃣ **View Transactions**
- All transactions are displayed in the Transaction History section
- Use filter buttons to view specific transaction types
- Watch the balance chart update in real-time

---

## 🎨 Design Features

### Color Palette
- **Primary Blue**: `#3b82f6`
- **Success Green**: `#10b981`
- **Danger Red**: `#ef4444`
- **Warning Orange**: `#f59e0b`
- **Dark Background**: `#0a0e1a`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800

### Animation Timings
- **Page Load**: 0.8s cubic-bezier ease
- **Card Appear**: 0.6s staggered
- **Hover Transitions**: 0.3s
- **Toast Animations**: 0.4s

---

## 🔧 API Endpoints

### Accounts
- `POST /api/accounts/create` - Create new account
- `POST /api/accounts/login` - Login to account
- `GET /api/accounts/{accNo}/balance` - Get balance
- `GET /api/admin/accounts` - Get all accounts (admin)

### Transactions
- `POST /api/accounts/deposit` - Deposit money
- `POST /api/accounts/withdraw` - Withdraw money
- `POST /api/accounts/transfer` - Transfer money
- `GET /api/accounts/{accNo}/transactions` - Get transaction history

---

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

---

## 🎯 Performance Optimizations

- ✅ CSS animations use `transform` and `opacity` for GPU acceleration
- ✅ Debounced API calls
- ✅ Efficient DOM manipulation
- ✅ Lazy loading of Chart.js
- ✅ Optimized SVG and emoji usage
- ✅ Minified resources ready for production

---

## 🔐 Security Features

- PIN-based authentication
- Session management
- Input validation
- Error handling
- CORS enabled for API access

---

## 🚧 Future Enhancements

- [ ] Add password encryption (bcrypt)
- [ ] Implement JWT authentication
- [ ] Add database integration (PostgreSQL/MySQL)
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Account statement download (PDF)
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Transaction search and date filtering
- [ ] Account profile management

---

## 👨‍💻 Developer

**Made with ❤️ by Arjun**

---

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

---

## 🙏 Acknowledgments

- Spring Boot Framework
- Chart.js Library
- Google Fonts (Inter)
- Modern CSS techniques and best practices

---

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**⭐ If you like this project, please give it a star!**

