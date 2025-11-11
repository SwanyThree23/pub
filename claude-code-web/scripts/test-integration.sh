#!/bin/bash

####################################################################
# Claude Code for Web - Integration Testing
# Runs comprehensive tests on pulled code before committing
####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
TEST_LOG=".claude-code-web/test-results.log"
TEST_FAILURES=0

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

run_test() {
    local TEST_NAME=$1
    local TEST_COMMAND=$2

    echo ""
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running:${NC} $TEST_NAME"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if eval "$TEST_COMMAND"; then
        log_success "$TEST_NAME passed"
        return 0
    else
        log_error "$TEST_NAME failed"
        TEST_FAILURES=$((TEST_FAILURES + 1))
        return 1
    fi
}

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║                                               ║
║   Claude Code for Web - Integration Tests    ║
║   Validate Before Commit                      ║
║                                               ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Create log directory
mkdir -p .claude-code-web

# Start logging
echo "Test run started at $(date)" > "$TEST_LOG"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log_warning "No package.json found - skipping npm tests"
    log_info "Running basic checks only..."
else
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi

    # Test 1: Linting
    if grep -q '"lint"' package.json; then
        run_test "Linting" "npm run lint 2>&1 | tee -a $TEST_LOG"
    else
        log_warning "No lint script found in package.json"
    fi

    # Test 2: Type Checking (TypeScript)
    if [ -f "tsconfig.json" ]; then
        if grep -q '"type-check"' package.json; then
            run_test "Type Checking" "npm run type-check 2>&1 | tee -a $TEST_LOG"
        elif command -v tsc &> /dev/null; then
            run_test "Type Checking" "tsc --noEmit 2>&1 | tee -a $TEST_LOG"
        else
            log_warning "TypeScript found but no type checking available"
        fi
    fi

    # Test 3: Unit Tests
    if grep -q '"test"' package.json; then
        run_test "Unit Tests" "npm test 2>&1 | tee -a $TEST_LOG"
    else
        log_warning "No test script found in package.json"
    fi

    # Test 4: Build
    if grep -q '"build"' package.json; then
        run_test "Build" "npm run build 2>&1 | tee -a $TEST_LOG"
    else
        log_warning "No build script found in package.json"
    fi
fi

# Test 5: Git Conflicts Check
echo ""
log_info "Checking for unresolved merge conflicts..."
if git diff --check; then
    log_success "No merge conflicts found"
else
    log_error "Merge conflicts detected!"
    TEST_FAILURES=$((TEST_FAILURES + 1))
fi

# Test 6: Sensitive Data Check
echo ""
log_info "Scanning for potential sensitive data..."
SENSITIVE_PATTERNS=(
    "password.*=.*['\"]"
    "api[_-]?key.*=.*['\"]"
    "secret.*=.*['\"]"
    "token.*=.*['\"]"
    "aws[_-]?access"
    "private[_-]?key"
)

SENSITIVE_FOUND=false
for PATTERN in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached | grep -iE "$PATTERN" > /dev/null; then
        log_warning "Potential sensitive data pattern found: $PATTERN"
        SENSITIVE_FOUND=true
    fi
done

if [ "$SENSITIVE_FOUND" = false ]; then
    log_success "No obvious sensitive data patterns found"
else
    log_warning "Please review flagged patterns manually"
fi

# Test 7: Large Files Check
echo ""
log_info "Checking for large files..."
LARGE_FILES=$(git diff --cached --name-only | while read file; do
    if [ -f "$file" ]; then
        SIZE=$(wc -c < "$file")
        if [ $SIZE -gt 1048576 ]; then  # 1MB
            echo "$file ($(numfmt --to=iec-i --suffix=B $SIZE))"
        fi
    fi
done)

if [ -z "$LARGE_FILES" ]; then
    log_success "No large files detected"
else
    log_warning "Large files detected:"
    echo "$LARGE_FILES"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Aborted by user"
        exit 1
    fi
fi

# Test 8: Code Quality Metrics (if available)
echo ""
if command -v cloc &> /dev/null; then
    log_info "Code statistics:"
    cloc $(git diff --cached --name-only --diff-filter=ACM) 2>/dev/null || true
else
    log_info "Install 'cloc' for code statistics"
fi

# Summary
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test Summary${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $TEST_FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review changes: git diff"
    echo "2. Commit changes: ./scripts/commit-batch.sh"
    echo "3. Or manually: git commit -m 'Your message'"
    echo ""
    log_success "Ready to commit! 🎉"
    exit 0
else
    echo -e "${RED}✗ $TEST_FAILURES test(s) failed${NC}"
    echo ""
    echo "Please fix the issues before committing:"
    echo "- Review test output in $TEST_LOG"
    echo "- Fix failing tests"
    echo "- Re-run this script"
    echo ""
    log_error "Tests failed - do not commit yet!"
    exit 1
fi
