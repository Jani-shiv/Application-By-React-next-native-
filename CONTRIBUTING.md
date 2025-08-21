# Contributing to Reiki Healing Platform

First off, thank you for considering contributing to our Reiki Healing Platform! 🙏

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0 or higher
- Git
- Basic knowledge of React, Node.js, and MySQL

### First Contribution
Looking for a good first issue? Check out:
- [Good First Issues](https://github.com/Jani-shiv/Application-By-React-next-native-/labels/good%20first%20issue)
- [Help Wanted](https://github.com/Jani-shiv/Application-By-React-next-native-/labels/help%20wanted)

## 🛠️ How to Contribute

### 🐛 Reporting Bugs
1. Check if the bug already exists in [Issues](https://github.com/Jani-shiv/Application-By-React-next-native-/issues)
2. Use our [Bug Report Template](https://github.com/Jani-shiv/Application-By-React-next-native-/issues/new?template=bug_report.md)
3. Provide detailed steps to reproduce
4. Include environment information

### 💡 Suggesting Features
1. Check [existing feature requests](https://github.com/Jani-shiv/Application-By-React-next-native-/labels/enhancement)
2. Use our [Feature Request Template](https://github.com/Jani-shiv/Application-By-React-next-native-/issues/new?template=feature_request.md)
3. Describe the problem and proposed solution
4. Consider the impact on different user types

### 📝 Improving Documentation
- Fix typos and grammatical errors
- Add missing documentation
- Improve code examples
- Translate documentation

## ⚙️ Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Application-By-React-next-native-.git
   cd Application-By-React-next-native-
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../web-app && npm install
   
   # Mobile
   cd ../mobile-app && npm install
   ```

3. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your database credentials
   ```

4. **Start Development**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd web-app && npm run dev
   
   # Terminal 3: Mobile (optional)
   cd mobile-app && npm start
   ```

## 📏 Coding Standards

### Backend (Node.js)
- Use ES6+ features
- Async/await over callbacks
- Proper error handling
- Input validation
- Security best practices

### Frontend (React)
- Use TypeScript
- Functional components with hooks
- Proper prop types
- Responsive design
- Accessibility considerations

### Database
- Use prepared statements
- Proper indexing
- Normalized structure
- Backup considerations

### General
- Write meaningful commit messages
- Add comments for complex logic
- Follow existing code style
- Write tests for new features

## 📤 Submitting Changes

### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bug-fix
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm test  # Run in each directory
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a PR on GitHub

### Commit Message Format
Use conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🎯 Review Process

### What We Look For
- Code quality and style
- Test coverage
- Documentation updates
- Breaking changes
- Security implications

### Timeline
- Initial response: 1-3 days
- Review completion: 1-2 weeks
- Feedback incorporation: As needed

## 🌟 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to join our community
- Eligible for contributor badges

## 💬 Community

### Communication Channels
- [GitHub Discussions](https://github.com/Jani-shiv/Application-By-React-next-native-/discussions)
- [Issues](https://github.com/Jani-shiv/Application-By-React-next-native-/issues)
- [Pull Requests](https://github.com/Jani-shiv/Application-By-React-next-native-/pulls)

### Getting Help
- Check the [FAQ](https://github.com/Jani-shiv/Application-By-React-next-native-/discussions/categories/q-a)
- Ask in [Discussions](https://github.com/Jani-shiv/Application-By-React-next-native-/discussions)
- Contact maintainers for urgent issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Reiki Healing Platform! Together, we're building something amazing for the healing community. 🌟
