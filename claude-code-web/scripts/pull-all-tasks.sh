#!/bin/bash

####################################################################
# Claude Code for Web - Automated Task Puller
# Pulls completed code from all Claude Code for Web sandbox sessions
####################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT=$(git rev-parse --show-toplevel)
TASK_LOG="$REPO_ROOT/.claude-code-web/task-pulls.log"
TASK_BRANCH_PREFIX="claude-task-"

# Ensure log directory exists
mkdir -p "$REPO_ROOT/.claude-code-web"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
    echo "[$(date)] INFO: $1" >> "$TASK_LOG"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    echo "[$(date)] SUCCESS: $1" >> "$TASK_LOG"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    echo "[$(date)] WARNING: $1" >> "$TASK_LOG"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    echo "[$(date)] ERROR: $1" >> "$TASK_LOG"
}

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║                                               ║
║   Claude Code for Web - Task Puller          ║
║   Automated Code Integration                  ║
║                                               ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    log_error "Not in a git repository!"
    exit 1
fi

log_success "Repository detected: $REPO_ROOT"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    log_warning "You have uncommitted changes in your repository"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Aborted by user"
        exit 0
    fi
fi

# Fetch latest from origin
log_info "Fetching latest changes from origin..."
git fetch origin

# Find all claude task branches
log_info "Scanning for Claude Code for Web task branches..."
TASK_BRANCHES=$(git branch -r | grep "origin/claude-" | sed 's/origin\///' || true)

if [ -z "$TASK_BRANCHES" ]; then
    log_warning "No Claude Code for Web task branches found"
    echo ""
    echo "To use this script:"
    echo "1. Complete tasks in Claude Code for Web"
    echo "2. Click 'Open in CLI' for each completed task"
    echo "3. Those commands will create branches starting with 'claude-'"
    echo "4. Then run this script to pull them all"
    exit 0
fi

# Count branches
BRANCH_COUNT=$(echo "$TASK_BRANCHES" | wc -l)
log_success "Found $BRANCH_COUNT task branch(es) to pull"
echo ""

# Interactive mode: Show branches and let user select
echo "Available task branches:"
echo "$TASK_BRANCHES" | nl
echo ""

read -p "Pull all branches? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Manual selection mode"
    echo "Enter branch numbers to pull (space-separated), or 'all' for all:"
    read SELECTION

    if [ "$SELECTION" != "all" ]; then
        SELECTED_BRANCHES=""
        for NUM in $SELECTION; do
            BRANCH=$(echo "$TASK_BRANCHES" | sed -n "${NUM}p")
            SELECTED_BRANCHES="$SELECTED_BRANCHES $BRANCH"
        done
        TASK_BRANCHES="$SELECTED_BRANCHES"
    fi
fi

# Save current branch
ORIGINAL_BRANCH=$(git branch --show-current)
log_info "Current branch: $ORIGINAL_BRANCH"

# Create integration branch
INTEGRATION_BRANCH="integration-$(date +%Y%m%d-%H%M%S)"
log_info "Creating integration branch: $INTEGRATION_BRANCH"
git checkout -b "$INTEGRATION_BRANCH"

# Track pulled tasks
PULLED_TASKS=0
FAILED_TASKS=0

# Pull each task
echo ""
log_info "Pulling tasks..."
echo ""

for BRANCH in $TASK_BRANCHES; do
    BRANCH=$(echo $BRANCH | xargs) # Trim whitespace

    echo -e "${BLUE}Processing: ${PURPLE}$BRANCH${NC}"

    # Try to merge the branch
    if git merge "origin/$BRANCH" --no-edit -m "Integrate $BRANCH"; then
        log_success "✓ Merged: $BRANCH"
        PULLED_TASKS=$((PULLED_TASKS + 1))
    else
        log_error "✗ Failed to merge: $BRANCH (likely conflicts)"
        FAILED_TASKS=$((FAILED_TASKS + 1))

        # Abort the merge
        git merge --abort

        log_warning "Skipping $BRANCH - requires manual resolution"
    fi

    echo ""
done

# Summary
echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}Pull Summary${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════${NC}"
echo -e "Successfully pulled: ${GREEN}$PULLED_TASKS${NC}"
echo -e "Failed merges:       ${RED}$FAILED_TASKS${NC}"
echo -e "Integration branch:  ${PURPLE}$INTEGRATION_BRANCH${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════${NC}"
echo ""

if [ $PULLED_TASKS -eq 0 ]; then
    log_warning "No tasks were successfully pulled"
    git checkout "$ORIGINAL_BRANCH"
    git branch -D "$INTEGRATION_BRANCH"
    log_info "Cleaned up integration branch"
    exit 0
fi

# Show what changed
log_info "Changes in integration branch:"
git diff --stat "$ORIGINAL_BRANCH".."$INTEGRATION_BRANCH"

echo ""
log_success "Tasks pulled successfully into: $INTEGRATION_BRANCH"
echo ""

# Next steps
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review changes: git diff $ORIGINAL_BRANCH"
echo "2. Test the integration: npm run dev (or your dev command)"
echo "3. Run tests: ./scripts/test-integration.sh"
echo "4. If all good, merge to main:"
echo "   git checkout $ORIGINAL_BRANCH"
echo "   git merge $INTEGRATION_BRANCH"
echo "5. Or commit directly: ./scripts/commit-batch.sh"
echo ""

# Optional: Auto-switch to test
read -p "Switch to integration branch now for testing? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_success "Switched to $INTEGRATION_BRANCH"
    log_info "Run your development server to test changes"
else
    git checkout "$ORIGINAL_BRANCH"
    log_info "Staying on $ORIGINAL_BRANCH"
    echo "To review: git checkout $INTEGRATION_BRANCH"
fi

echo ""
log_success "Done! 🎉"
