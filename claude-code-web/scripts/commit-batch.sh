#!/bin/bash

####################################################################
# Claude Code for Web - Batch Commit Script
# Intelligently commits integrated tasks with descriptive messages
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
COMMIT_LOG=".claude-code-web/commits.log"

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

generate_commit_message() {
    echo "Generating commit message..."

    # Get list of changed files
    CHANGED_FILES=$(git diff --cached --name-only)
    FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l)

    # Analyze changes
    COMPONENTS_CHANGED=$(echo "$CHANGED_FILES" | grep -E "components/|src/" | wc -l || echo "0")
    STYLES_CHANGED=$(echo "$CHANGED_FILES" | grep -E "\.css$|\.scss$|tailwind" | wc -l || echo "0")
    TESTS_CHANGED=$(echo "$CHANGED_FILES" | grep -E "test|spec" | wc -l || echo "0")
    DOCS_CHANGED=$(echo "$CHANGED_FILES" | grep -E "README|\.md$" | wc -l || echo "0")
    CONFIG_CHANGED=$(echo "$CHANGED_FILES" | grep -E "config|\.json$|\.yml$" | wc -l || echo "0")

    # Determine commit type
    if [ $COMPONENTS_CHANGED -gt 0 ]; then
        COMMIT_TYPE="feat"
        SCOPE="components"
    elif [ $STYLES_CHANGED -gt 0 ]; then
        COMMIT_TYPE="style"
        SCOPE="ui"
    elif [ $TESTS_CHANGED -gt 0 ]; then
        COMMIT_TYPE="test"
        SCOPE="testing"
    elif [ $DOCS_CHANGED -gt 0 ]; then
        COMMIT_TYPE="docs"
        SCOPE="documentation"
    elif [ $CONFIG_CHANGED -gt 0 ]; then
        COMMIT_TYPE="chore"
        SCOPE="config"
    else
        COMMIT_TYPE="feat"
        SCOPE="app"
    fi

    # Generate short description
    if [ $FILE_COUNT -eq 1 ]; then
        DESCRIPTION="Update $(basename $CHANGED_FILES)"
    elif [ $FILE_COUNT -le 3 ]; then
        DESCRIPTION="Update $(echo $CHANGED_FILES | tr '\n' ', ' | sed 's/,$//')"
    else
        DESCRIPTION="Integrate Claude Code for Web tasks ($FILE_COUNT files)"
    fi

    # Build commit message
    COMMIT_MSG="$COMMIT_TYPE($SCOPE): $DESCRIPTION

Integrated code from Claude Code for Web agents.

Changes:
"

    # Add file list
    echo "$CHANGED_FILES" | while read file; do
        COMMIT_MSG="$COMMIT_MSG- $file\n"
    done

    COMMIT_MSG="$COMMIT_MSG
Generated via Claude Code for Web automation"

    echo -e "$COMMIT_MSG"
}

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║                                               ║
║   Claude Code for Web - Batch Committer      ║
║   Intelligent Commit Messages                 ║
║                                               ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if in git repo
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    log_error "Not in a git repository!"
    exit 1
fi

# Check if there are changes to commit
if git diff --cached --quiet; then
    log_warning "No staged changes to commit"

    # Check if there are unstaged changes
    if ! git diff --quiet; then
        log_info "You have unstaged changes"
        read -p "Stage all changes and commit? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add -A
            log_success "All changes staged"
        else
            log_info "Aborted"
            exit 0
        fi
    else
        log_info "No changes to commit"
        exit 0
    fi
fi

# Show what will be committed
echo ""
log_info "Changes to be committed:"
echo ""
git diff --cached --stat
echo ""

# Ask for confirmation
read -p "Proceed with commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Aborted by user"
    exit 0
fi

# Ask for commit message preference
echo ""
echo "Commit message options:"
echo "1. Auto-generate intelligent message (recommended)"
echo "2. Write custom message"
echo "3. Simple message: 'Integrate Claude Code for Web tasks'"
echo ""
read -p "Choose option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        log_info "Generating intelligent commit message..."
        COMMIT_MESSAGE=$(generate_commit_message)
        ;;
    2)
        log_info "Enter your commit message (Ctrl+D when done):"
        echo ""
        COMMIT_MESSAGE=$(cat)
        ;;
    3)
        COMMIT_MESSAGE="Integrate Claude Code for Web tasks

Integrated code from multiple Claude Code for Web agent sessions.

$(git diff --cached --name-only | sed 's/^/- /')

Generated via automation script"
        ;;
    *)
        log_error "Invalid option"
        exit 1
        ;;
esac

# Show commit message
echo ""
log_info "Commit message:"
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "$COMMIT_MESSAGE"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Commit with this message? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Aborted by user"
    exit 0
fi

# Create commit
log_info "Creating commit..."
echo "$COMMIT_MESSAGE" | git commit -F -

# Log commit
echo "[$(date)] Committed: $(git log -1 --format='%h - %s')" >> "$COMMIT_LOG"

log_success "Commit created successfully!"
echo ""

# Show commit info
git log -1 --stat

echo ""
log_info "Commit hash: $(git log -1 --format='%h')"
log_info "Commit message: $(git log -1 --format='%s')"

echo ""
echo "Next steps:"
echo "1. Push to remote: git push origin $(git branch --show-current)"
echo "2. Or continue working and commit more changes"
echo ""

# Ask to push
read -p "Push to remote now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Pushing to origin/$CURRENT_BRANCH..."

    if git push -u origin "$CURRENT_BRANCH"; then
        log_success "Pushed successfully!"
        echo ""
        log_info "View on GitHub:"
        REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//')
        echo "$REPO_URL/tree/$CURRENT_BRANCH"
    else
        log_error "Push failed"
        log_warning "You may need to set up remote tracking or resolve conflicts"
        echo "Try: git push -u origin $CURRENT_BRANCH"
    fi
else
    log_info "Skipped push"
    log_warning "Remember to push later: git push origin $(git branch --show-current)"
fi

echo ""
log_success "Done! 🎉"
