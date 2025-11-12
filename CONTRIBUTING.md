# Contributing to ASCII Converter

Thank you for your interest in contributing to the ASCII Converter project!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ironsignalworks/asciiconverter.git
   cd asciiconverter
   ```

2. **Install dependencies (optional):**
   ```bash
   npm install
   ```

3. **Run a local server:**
   ```bash
   npm run dev
   # or
   npx serve .
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Code Style

- Use ES6+ features
- Follow the existing code style
- Add JSDoc comments for all functions
- Use single quotes for strings
- Add semicolons
- Use 2-space indentation

## Module Organization

- **src/main.js**: Application logic and state management
- **src/utils/dom.js**: DOM manipulation utilities
- **src/utils/image.js**: Image processing functions
- **src/utils/ascii.js**: ASCII conversion logic
- **src/utils/export.js**: Export functionality

## Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Keep modules focused on single responsibilities
   - Add error handling for new features
   - Document all public functions with JSDoc

3. **Test your changes:**
   - Run manual tests (see TESTING.md)
   - Verify syntax: `node --check src/**/*.js`
   - Check for errors in browser console

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

## Commit Message Format

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update CHANGELOG.md with your changes
3. Ensure all syntax checks pass
4. The PR will be merged once reviewed

## Bug Reports

When filing a bug report, include:
- Browser and version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Console errors

## Feature Requests

For feature requests, provide:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Any design mockups (if UI-related)

## Questions?

Open an issue with the `question` label or contact Iron Signal Works.

Thank you for contributing! ??
