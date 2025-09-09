# Contributing to AI Debug Companion

Thank you for your interest in contributing to AI Debug Companion! We welcome contributions from the community to help improve this AI debugging tool.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## How to Contribute

### Reporting Bugs

Before submitting a bug report, please check if the issue has already been reported. If not, create a new issue with:

- A clear and descriptive title
- A detailed description of the problem
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Your environment information (OS, browser, etc.)

### Suggesting Enhancements

We welcome feature requests and suggestions for improvements. Please create an issue with:

- A clear and descriptive title
- A detailed explanation of the proposed feature
- The problem it solves or the benefit it provides
- Any implementation ideas you might have

### Code Contributions

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write tests if applicable
5. Ensure your code follows the project's style guidelines
6. Commit your changes with a clear commit message
7. Push to your fork
8. Submit a pull request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/gakuzi/ai-debug-companion.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For working on specific packages, navigate to the package directory and install its dependencies:
   ```bash
   cd agent-js
   npm install
   ```

## Style Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided in the repository
- Write clear, self-documenting code
- Add comments for complex logic
- Use meaningful variable and function names

### Commit Messages

- Use clear and descriptive commit messages
- Follow the conventional commit format when possible
- Write commit messages in English
- Reference issues when applicable (e.g., "Fix #123: Resolve logging issue")

### Documentation

- Update README files when making changes that affect usage
- Add JSDoc comments for public APIs
- Keep documentation up to date with code changes

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build
2. Update the README.md with details of changes to the interface, including new environment variables, exposed ports, useful file locations and container parameters
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent
4. Your pull request will be reviewed by maintainers, who may request changes
5. Once approved, your pull request will be merged

## Questions?

If you have any questions about contributing, feel free to create an issue asking for clarification or contact the maintainers directly.

Thank you for helping make AI Debug Companion better!