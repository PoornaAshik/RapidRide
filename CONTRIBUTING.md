# Contributing to RapidRide

Thank you for considering contributing to RapidRide! 🚗

## How to Contribute

### 1. Fork the Repository
Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/RapidRide.git
cd RapidRide
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Test your changes thoroughly

### 5. Commit Your Changes
```bash
git add .
git commit -m "Add feature: your feature description"
```

### 6. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request
Go to the original repository and click "New Pull Request"

## Development Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URL and JWT secret
   ```

3. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```

## Code Style Guidelines

### JavaScript
- Use ES6+ features (arrow functions, async/await, destructuring)
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for functions

### Example:
```javascript
/**
 * Get driver earnings for a specific period
 * @param {string} driverId - The driver's ID
 * @param {string} period - The time period (today, week, month)
 * @returns {Promise<Object>} Earnings data
 */
export const getEarnings = async (driverId, period) => {
  // Implementation
};
```

### Git Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

**Good:**
```
Add payment gateway integration with Stripe

- Implement payment processing endpoint
- Add invoice generation
- Update user model with payment methods
- Add tests for payment flow

Closes #123
```

**Bad:**
```
fixed stuff
```

## Areas for Contribution

### High Priority
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Email/SMS notifications
- [ ] Input validation with express-validator
- [ ] Unit and integration tests
- [ ] Rate limiting and security enhancements

### Medium Priority
- [ ] Ride pooling/sharing feature
- [ ] Scheduled rides functionality
- [ ] Admin dashboard
- [ ] Push notifications
- [ ] Multi-language support

### Low Priority
- [ ] Dark mode for dashboards
- [ ] Voice commands
- [ ] In-app chat
- [ ] Advanced analytics with charts
- [ ] Mobile app (React Native)

## Testing

Before submitting a PR:
1. Test all endpoints with Postman
2. Check for console errors
3. Verify mobile responsiveness
4. Test real-time features with Socket.IO
5. Run linter (if available)

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Have fun coding! 🎉

---

**Thank you for contributing to RapidRide!**
