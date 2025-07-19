# Enhanced GitHub Actions Workflow

This repository now includes a comprehensive CI/CD pipeline with the following features:

## Workflow Jobs

### 1. Security Scanning (`security`)
- **Trivy Vulnerability Scanner**: Scans the codebase for known vulnerabilities
- **SARIF Integration**: Uploads results to GitHub Security tab
- **Runs on**: Every push and pull request

### 2. Code Quality (`code-quality`)
- **Code Formatting**: Checks if code follows Prettier formatting rules
- **ESLint**: Runs linting checks for code quality and style
- **TypeScript Type Checking**: Ensures type safety across the codebase
- **Dependency Analysis**: Identifies unused dependencies with `depcheck`

### 3. Database Checks (`database`)
- **PostgreSQL Service**: Spins up a test database container
- **Prisma Client Generation**: Generates the Prisma client
- **Migration Testing**: Runs database migrations in test environment
- **Schema Validation**: Validates Prisma schema integrity

### 4. Testing (`test`)
- **Multi-Node Testing**: Tests against Node.js 18 and 20
- **Vitest Framework**: Fast, modern testing with coverage
- **Coverage Reporting**: Generates and uploads coverage reports to Codecov
- **Parallel Execution**: Runs tests in parallel for faster feedback

### 5. Build (`build`)
- **Multi-Node Building**: Builds against Node.js 18 and 20
- **Artifact Storage**: Stores build artifacts for later use
- **Dependency Caching**: Uses npm cache for faster builds

### 6. Docker Testing (`docker`)
- **Docker Build**: Builds the application Docker image
- **Container Testing**: Tests the built image for basic functionality
- **Health Checks**: Verifies the application starts correctly

### 7. Performance Analysis (`performance`)
- **Bundle Analysis**: Analyzes JavaScript bundle sizes
- **PR-Only**: Only runs on pull requests to avoid noise

### 8. Deploy Preview (`deploy-preview`)
- **Preview Environment**: Deploys PRs to preview environment
- **Environment URLs**: Provides preview URLs for testing
- **PR-Only**: Only runs on pull requests

### 9. Failure Notification (`notify`)
- **Failure Reporting**: Notifies when any job fails
- **Workflow Links**: Provides direct links to failed workflow runs

## New Scripts Added

The following npm scripts have been added to `package.json`:

- `format:check`: Check code formatting without modifying files
- `lint:fix`: Automatically fix ESLint issues
- `test:coverage`: Run tests with coverage reporting
- `test:ui`: Run tests with Vitest UI
- `type-check`: Run TypeScript type checking
- `prisma:validate`: Validate Prisma schema
- `ci:check`: Run all code quality checks
- `ci:test`: Run tests with coverage for CI

## Dependencies Added

### Dev Dependencies
- `depcheck`: For unused dependency detection
- `vitest`: Modern testing framework
- `@vitest/ui`: Vitest UI for interactive testing
- `@vitest/coverage-v8`: Coverage reporting
- `@testing-library/jest-dom`: DOM testing utilities
- `@testing-library/react`: React testing utilities
- `@testing-library/user-event`: User interaction testing

## Configuration Files

- `vitest.config.ts`: Vitest configuration with coverage and path aliases
- `test/setup.ts`: Test setup file for global configurations
- `test/example.test.ts`: Example test file demonstrating the setup

## Benefits

1. **Comprehensive Testing**: Multi-node testing with coverage reporting
2. **Security First**: Automated vulnerability scanning
3. **Code Quality**: Automated formatting, linting, and type checking
4. **Database Safety**: Automated migration testing and schema validation
5. **Performance Monitoring**: Bundle size analysis and performance tracking
6. **Fast Feedback**: Parallel job execution and dependency caching
7. **Preview Deployments**: Automatic preview environments for PRs
8. **Failure Handling**: Clear notification and reporting of failures

## Usage

The workflow runs automatically on:
- Push to `master`, `main`, `*.x`, or `develop` branches
- Pull requests to `master`, `main`, `*.x`, or `develop` branches
- Manual workflow dispatch (for testing)

## Local Development

To run the same checks locally:

```bash
# Install dependencies
npm install

# Run all code quality checks
npm run ci:check

# Run tests with coverage
npm run ci:test

# Run type checking
npm run type-check

# Check for unused dependencies
npx depcheck
``` 