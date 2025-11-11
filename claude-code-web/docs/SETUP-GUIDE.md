# Complete Setup Guide

> **Step-by-step instructions to get your Claude Code for Web workflow running**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] **GitHub Account** (free) - [Sign up](https://github.com/join)
- [ ] **Anthropic Account** - [Sign up](https://console.anthropic.com/)
- [ ] **Claude Code Extension** for VS Code - [Install](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code)
- [ ] **Git** installed locally
- [ ] **Node.js** 18+ and npm installed
- [ ] **VS Code** (or your preferred editor)
- [ ] **Claude iOS App** (optional, for mobile workflow)

---

## 🚀 Setup Process

### Step 1: Create Your Project

If you don't have a project yet:

```bash
# Open VS Code
code .

# Use Claude Code to build initial app
# Prompt Claude: "Build [your app description with tech stack]"

# Example:
"Build a task management app with Next.js, TypeScript, and Tailwind CSS.
Include a sidebar for task lists and a main area for task details."
```

**Wait for Claude Code to build your app.**

---

### Step 2: Test Locally

```bash
# Navigate to your app directory
cd your-app-name

# Install dependencies
npm install

# Run development server
npm run dev
```

Open `http://localhost:3000` to verify your app works.

---

### Step 3: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New"** (green button)
3. Repository name: `your-app-name`
4. Choose **Public** or **Private**
5. **Do NOT** initialize with README
6. Click **"Create repository"**
7. Copy the repository URL

---

### Step 4: Upload Code to GitHub

In VS Code with Claude Code:

```
Prompt: "Can you upload this code to https://github.com/yourusername/your-app-name"
```

Approve Claude Code's actions to push the code.

**Verify on GitHub** that your code is uploaded.

---

### Step 5: Connect to Claude Code for Web

#### Desktop (Primary Method)

1. Go to [claude.ai](https://claude.ai)
2. Sign in with your Anthropic account
3. Click **"Code"** section (top navigation)
4. Click **"Connect to repository"**
5. **Sign in with GitHub** (if first time)
6. **Select your repository** from the list
7. Click **"Connect"**

✅ **You're now connected!**

#### Mobile (Optional)

1. Download **Claude** app from App Store
2. Sign in with your account
3. Tap ☰ menu → **"Code"**
4. Connect to your repository (same as desktop)

---

### Step 6: Set Up Automation Scripts

In your project root:

```bash
# Clone this workflow repository (or copy scripts)
# Navigate to your project

# Create automation directory
mkdir -p .claude-code-web

# Copy scripts (adjust paths as needed)
cp path/to/claude-code-web/scripts/* ./scripts/

# Make scripts executable
chmod +x scripts/*.sh
```

---

### Step 7: Configure Git Hooks (Optional)

```bash
# Set up pre-commit hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run tests before committing
./scripts/test-integration.sh
EOF

chmod +x .git/hooks/pre-commit
```

---

### Step 8: Launch Your First Task

In Claude Code for Web (claude.ai → Code):

**Try this simple task:**

```markdown
Add a dark mode toggle to the application.

Requirements:
- Toggle button in the header/navigation
- Save preference to localStorage
- Use existing Tailwind dark mode classes
- Smooth transition between modes

Keep UI consistent with current design.
```

**Select Model:** Haiku 4.5 (for simple features)

Click **"Generate"** and watch the agent work!

---

### Step 9: Pull Down Completed Code

When the task completes:

1. Click **"Open in CLI"** button (copies command)
2. Open terminal in your project directory
3. Paste and execute the command
4. Review the changes: `git diff`
5. Test locally: `npm run dev`

---

### Step 10: Commit and Push

Using Claude Code in VS Code:

```
Prompt: "I pulled down new code from claude for web. Please commit it to main."
```

Or using automation script:

```bash
./scripts/commit-batch.sh
```

**Verify on GitHub** that your changes are pushed.

---

## 🎯 Launch Master Workflow

Now that setup is complete, launch all 8 tasks:

### In Claude Code for Web:

Open 8 separate sessions (tabs) and paste these prompts:

#### Session 1: Feature Task
```markdown
[Copy from templates/feature-tasks-bundle.md]
Customize for your app
```

#### Session 2: Feature Task
```markdown
[Different feature]
```

#### Session 3: Feature Task
```markdown
[Different feature]
```

#### Session 4: Feature Task
```markdown
[Different feature]
```

#### Session 5: Product Management
```markdown
[Copy from templates/research-tasks-bundle.md]
Customize context
```

#### Session 6: Marketing
```markdown
[Copy from templates/research-tasks-bundle.md]
Customize for your brand
```

#### Session 7: Code Optimization
```markdown
[Copy from templates/optimization-security-tasks-bundle.md]
```

#### Session 8: Security Check
```markdown
[Copy from templates/optimization-security-tasks-bundle.md]
```

---

## 🔄 Daily Workflow

### Morning Routine (15 minutes)

```bash
# 1. Check overnight completions
# Go to claude.ai → Code

# 2. Pull all completed tasks
./scripts/pull-all-tasks.sh

# 3. Review changes
git diff

# 4. Test integration
./scripts/test-integration.sh

# 5. Commit if tests pass
./scripts/commit-batch.sh
```

### Evening Routine (10 minutes)

```bash
# 1. Queue new tasks in Claude Code for Web
# Use templates for quick prompts

# 2. Launch 6-7 tasks before bed
# - 4 features
# - 1 research
# - 1 optimization
# - 1 security

# 3. Let them run overnight
# Your app improves while you sleep! 🌙
```

---

## 📱 Mobile Setup

### Quick Mobile Setup (5 minutes)

1. **Install App:**
   - Open App Store
   - Search "Claude AI"
   - Install Anthropic Claude app

2. **Sign In:**
   - Open app
   - Sign in with Anthropic account

3. **Access Code:**
   - Tap ☰ menu
   - Select "Code"
   - Connect to repository (if needed)

4. **Test Task:**
   - Write simple prompt
   - Spin up task
   - Verify it appears on desktop

5. **Add to Home:**
   - Add Claude to dock for quick access

✅ **Ready for mobile ideation!**

---

## 🔧 Troubleshooting

### Issue: Claude Code for Web can't connect to GitHub

**Solutions:**
1. Verify GitHub account has repo access
2. Try disconnecting and reconnecting
3. Check repository exists and is accessible
4. Clear browser cache and try again

---

### Issue: "Open in CLI" command fails

**Solutions:**
1. Ensure you're in project root directory
2. Check Git is initialized: `git status`
3. Verify remote is set: `git remote -v`
4. Try manual pull:
   ```bash
   git fetch origin
   git merge origin/claude-task-branch-name
   ```

---

### Issue: Scripts won't run

**Solutions:**
1. Make scripts executable: `chmod +x scripts/*.sh`
2. Check file paths are correct
3. Verify bash is installed: `bash --version`
4. Check script permissions: `ls -la scripts/`

---

### Issue: Tasks taking too long

**Solutions:**
1. Break down into smaller tasks
2. Check prompt clarity
3. Verify model selection (Haiku vs Sonnet)
4. Simplify requirements
5. Remove ambiguity

---

### Issue: Merge conflicts when pulling

**Solutions:**
1. Review conflicts: `git status`
2. Manually resolve in VS Code
3. Use Claude Code: "Help me resolve these merge conflicts"
4. Keep features disparate to avoid overlaps

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] GitHub repository created and code uploaded
- [ ] Claude Code for Web connected to repository
- [ ] Can spin up tasks in Claude Code for Web
- [ ] "Open in CLI" copies command successfully
- [ ] Can pull code from tasks to local
- [ ] Local testing works (`npm run dev`)
- [ ] Can commit changes via Claude Code or script
- [ ] Changes appear on GitHub
- [ ] Mobile app installed and connected (optional)
- [ ] Automation scripts are executable
- [ ] Test suite runs successfully

---

## 📚 Next Steps

1. **Read Templates:**
   - Review `/templates/` directory
   - Understand 8 task types
   - Customize for your project

2. **Launch First Full Cycle:**
   - Queue 8 tasks
   - Let them run overnight
   - Review and integrate in morning

3. **Optimize Workflow:**
   - Track what works
   - Adjust task sizes
   - Refine prompts
   - Find your rhythm

4. **Go Mobile:**
   - Practice capturing ideas on phone
   - Build habit of immediate task creation
   - Leverage idle time

5. **Scale Up:**
   - Increase task count as comfortable
   - Add more agent types
   - Automate more of the workflow

---

## 🎓 Learning Resources

- **Main README:** `README.md`
- **Task Templates:** `templates/`
- **Mobile Workflow:** `mobile/MOBILE-WORKFLOW.md`
- **Automation Scripts:** `scripts/`
- **Video Tutorial:** [Link to video if available]

---

## 🆘 Getting Help

If stuck:

1. **Check Documentation:**
   - Re-read relevant sections
   - Review examples

2. **Common Issues:**
   - See Troubleshooting section above

3. **GitHub Issues:**
   - Create issue with details
   - Include error messages
   - Describe what you tried

4. **Community:**
   - Share learnings
   - Ask questions
   - Help others

---

## 🎉 Success!

If you've completed this guide:

✅ **You now have:**
- Claude Code for Web workflow running
- 8-task master workflow ready
- Automation scripts configured
- Mobile workflow capability
- 24/7 development cycle active

**Your app can now improve while you sleep!**

🚀 **Welcome to the future of solo development!**

---

*Estimated setup time: 30-45 minutes*
*Benefits: Lifetime of 10x productivity*
