# Optimization & Security Tasks (7-8)

Use **Sonnet 4.5** model for critical analysis and comprehensive reviews.

---

## Task #7: Code Optimization

### Purpose
Maintain clean, efficient, performant codebase through continuous review and improvement

### Model: Sonnet 4.5

---

### Template: Comprehensive Code Optimization Review

```markdown
You are a senior software engineer and code optimization specialist with expertise in [Your Tech Stack].

## Context

**Application Details:**
- **Name:** [Your App Name]
- **Tech Stack:**
  - Frontend: [e.g., Next.js 14, React 18, TypeScript]
  - Backend: [e.g., Node.js, Express, PostgreSQL]
  - Styling: [e.g., Tailwind CSS]
  - State Management: [e.g., Zustand, React Context]
- **Current Scale:**
  - Lines of code: [Approximate]
  - Number of components: [Approximate]
  - Number of routes/pages: [Number]
- **Performance Goals:**
  - Page load time: [Target, e.g., < 2 seconds]
  - Time to Interactive: [Target]
  - Bundle size: [Target]

**Known Issues:**
- [Issue 1: e.g., Slow initial load]
- [Issue 2: e.g., Large bundle size]
- [Issue 3: e.g., Prop drilling]

## Your Task

Conduct a comprehensive code optimization review and provide actionable recommendations.

### 1. Performance Optimization

#### Bundle Size Analysis
- Identify largest dependencies
- Find duplicate dependencies
- Suggest lazy loading opportunities
- Tree-shaking improvements
- Code splitting strategies

**For each finding, provide:**
```
**Issue:** [Description]
**Current Impact:** [File size / load time]
**Recommendation:** [Specific solution]
**Implementation:** [Code example or approach]
**Expected Improvement:** [Quantified benefit]
```

#### Runtime Performance
- Identify performance bottlenecks
- React rendering optimization opportunities
- Memoization candidates
- Event handler optimization
- Expensive calculations to optimize

#### Loading Performance
- Critical rendering path optimization
- Image optimization opportunities
- Font loading strategies
- CSS optimization
- Third-party script optimization

### 2. Code Quality Improvements

#### Code Organization
- Component structure improvements
- File/folder organization
- Module boundaries
- Import/export patterns
- Naming conventions

#### DRY Principle
- Duplicate code identification
- Refactoring opportunities
- Shared utility candidates
- Custom hooks extraction
- Component composition improvements

#### Type Safety
- TypeScript improvements
- `any` type elimination
- Better type definitions
- Generic type opportunities
- Type inference enhancements

### 3. React/Frontend Specific

#### Component Optimization
- Components that should be memoized
- `useMemo` opportunities
- `useCallback` opportunities
- Component split recommendations
- Prop optimization

#### State Management
- State placement optimization
- Context optimization
- State update patterns
- Reducer opportunities
- Server state vs. client state

#### Rendering Optimization
- Unnecessary re-renders
- Key prop issues
- List rendering optimization
- Conditional rendering patterns
- Effect dependencies review

### 4. Backend/API Optimization (if applicable)

#### Query Optimization
- Database query efficiency
- N+1 query issues
- Index recommendations
- Caching opportunities

#### API Design
- API response optimization
- GraphQL field selection
- REST endpoint consolidation
- Data fetching strategies

### 5. Developer Experience

#### Development Workflow
- Build time improvements
- Hot reload optimization
- Dev server performance
- Testing speed improvements

#### Code Maintainability
- Comment quality
- Documentation needs
- Error handling patterns
- Logging improvements

### 6. Implementation Roadmap

Prioritize recommendations:

**Quick Wins (< 1 day):**
1. [Recommendation with high impact, low effort]
2. [Recommendation]
3. [Recommendation]

**Short-term (1-3 days):**
1. [Recommendation with high impact, medium effort]
2. [Recommendation]
3. [Recommendation]

**Long-term (1+ weeks):**
1. [Recommendation with strategic value]
2. [Recommendation]
3. [Recommendation]

### 7. Code Examples

For top 5 recommendations, provide:

**Before:**
```typescript
// Current code
```

**After:**
```typescript
// Optimized code
```

**Explanation:**
[Why this is better and what it improves]

### 8. Metrics & Monitoring

Suggest:
- Performance metrics to track
- Monitoring setup
- Performance budget
- Success criteria

### 9. Best Practices Checklist

Create a checklist of best practices to follow going forward:
- [ ] [Practice 1]
- [ ] [Practice 2]
- [ ] [Practice 3]
- [ ] [Practice 4]
- [ ] [Practice 5]

## Output Format

Deliver as a comprehensive markdown document with:
- Executive summary (top 3 priorities)
- Detailed findings by category
- Code examples for major recommendations
- Prioritized implementation roadmap
- Quantified impact estimates
- Best practices guide

Be specific, technical, and actionable. Provide concrete code examples.
```

---

### Template: Focused Performance Audit

For quicker, performance-specific review:

```markdown
You are a web performance specialist.

## Context
- **App:** [Your App Name]
- **Tech Stack:** [Your stack]
- **Current Metrics:**
  - First Contentful Paint: [Time]
  - Time to Interactive: [Time]
  - Bundle Size: [Size]

## Your Task

Conduct a focused performance audit:

### 1. Web Vitals Analysis

Review and optimize for:

**Largest Contentful Paint (LCP):**
- Target: < 2.5 seconds
- Current issues
- Optimization recommendations

**First Input Delay (FID):**
- Target: < 100 milliseconds
- Current issues
- Optimization recommendations

**Cumulative Layout Shift (CLS):**
- Target: < 0.1
- Current issues
- Optimization recommendations

### 2. Load Performance

**Critical Path:**
- Identify blocking resources
- Defer non-critical resources
- Inline critical CSS
- Preload key resources

**Resource Optimization:**
- Image optimization (format, size, lazy loading)
- Font optimization (preload, font-display)
- JavaScript optimization (code splitting, tree shaking)
- CSS optimization (purging, minification)

### 3. Runtime Performance

**React Performance:**
- Component render optimization
- State update optimization
- Effect optimization
- List rendering optimization

**Browser Performance:**
- Layout thrashing prevention
- Forced synchronous layouts
- Paint optimization
- Composite layer optimization

### 4. Network Optimization

- HTTP/2 utilization
- Compression (gzip/brotli)
- CDN usage
- Caching strategies
- Service worker opportunities

### 5. Monitoring Setup

Recommend:
- Performance monitoring tools
- Real User Monitoring (RUM) setup
- Synthetic monitoring
- Performance budgets
- Alert thresholds

## Output Format

Provide:
- Performance audit summary
- Top 10 recommendations (prioritized)
- Code examples for top 3
- Expected improvements (quantified)
- Monitoring implementation guide
```

---

## Task #8: Security Check

### Purpose
Proactive vulnerability detection and security hardening

### Model: Sonnet 4.5

---

### Template: Comprehensive Security Audit

```markdown
You are a cybersecurity professional specializing in web application security.

## Context

**Application Details:**
- **Name:** [Your App Name]
- **Type:** [Web app / Mobile app / API]
- **Tech Stack:** [Your complete stack]
- **Authentication:** [Method: JWT, sessions, OAuth, etc.]
- **Data Sensitivity:** [Level: High / Medium / Low]
- **Compliance Needs:** [GDPR, HIPAA, SOC2, etc.]

**User Data Stored:**
- [Type of data 1: e.g., Email addresses]
- [Type of data 2: e.g., Personal notes]
- [Type of data 3: e.g., Payment information]

**External Integrations:**
- [Service 1: e.g., Stripe for payments]
- [Service 2: e.g., SendGrid for emails]
- [Service 3: e.g., Google OAuth]

## Your Task

Conduct a comprehensive security audit covering all critical areas:

### 1. OWASP Top 10 Vulnerabilities

Review the codebase for each OWASP Top 10 vulnerability:

#### A01: Broken Access Control
**Check for:**
- Unauthorized access to resources
- Privilege escalation opportunities
- Insecure direct object references (IDOR)
- Missing function-level access control
- Force browsing vulnerabilities

**Findings:**
[List specific code locations or patterns that need review]

**Recommendations:**
[Specific fixes with code examples]

#### A02: Cryptographic Failures
**Check for:**
- Sensitive data exposure
- Weak encryption algorithms
- Missing encryption for data at rest
- Missing encryption for data in transit
- Hardcoded secrets

**Findings:**
[Specific issues found]

**Recommendations:**
[Fixes with examples]

#### A03: Injection
**Check for:**
- SQL injection
- NoSQL injection
- Command injection
- LDAP injection
- XPath injection

**Findings:**
[Vulnerable code locations]

**Recommendations:**
[Parameterized queries, input validation, etc.]

#### A04: Insecure Design
**Check for:**
- Missing security controls
- Insufficient threat modeling
- Insecure design patterns
- Business logic flaws

**Findings & Recommendations:**
[Analysis of design-level security issues]

#### A05: Security Misconfiguration
**Check for:**
- Default configurations
- Unnecessary features enabled
- Missing security headers
- Verbose error messages
- Outdated software/libraries

**Findings:**
[Configuration issues]

**Recommendations:**
[Security hardening steps]

#### A06: Vulnerable and Outdated Components
**Check for:**
- Outdated dependencies
- Known vulnerabilities (CVEs)
- Unused dependencies
- Unmaintained packages

**Findings:**
```json
{
  "package": "package-name",
  "currentVersion": "1.0.0",
  "vulnerableTo": "CVE-2023-xxxxx",
  "severity": "High",
  "fixedIn": "1.2.0"
}
```

**Recommendations:**
[Update commands and mitigation steps]

#### A07: Identification and Authentication Failures
**Check for:**
- Weak password requirements
- Credential stuffing vulnerabilities
- Session fixation
- Missing multi-factor authentication
- Insecure password recovery

**Findings:**
[Authentication issues]

**Recommendations:**
[Security improvements]

#### A08: Software and Data Integrity Failures
**Check for:**
- Unsigned updates
- Deserialization vulnerabilities
- Insecure CI/CD pipelines
- Auto-update without integrity verification

**Findings & Recommendations:**
[Integrity-related issues and fixes]

#### A09: Security Logging and Monitoring Failures
**Check for:**
- Missing security logging
- Insufficient log retention
- Lack of alerting
- Logs containing sensitive data

**Findings:**
[Logging gaps]

**Recommendations:**
[Logging strategy]

#### A10: Server-Side Request Forgery (SSRF)
**Check for:**
- Unvalidated URLs
- Network security zones
- Response handling issues

**Findings & Recommendations:**
[SSRF vulnerabilities and fixes]

### 2. Authentication & Authorization

**Authentication Review:**
- Password storage (hashing algorithm)
- Session management
- Token handling (JWT, refresh tokens)
- OAuth implementation
- Multi-factor authentication
- Password reset flow
- Account lockout policies

**Authorization Review:**
- Role-based access control (RBAC)
- Permission checking consistency
- API endpoint protection
- Client-side vs server-side checks
- Cross-user data access prevention

**Code Locations to Review:**
[Specific files and functions]

**Recommendations:**
[Detailed improvements with code examples]

### 3. Input Validation & Sanitization

**Input Validation:**
- Client-side validation (insufficient alone)
- Server-side validation (required)
- Type checking
- Length limits
- Format validation
- Whitelist vs blacklist approaches

**Sanitization:**
- HTML sanitization (XSS prevention)
- SQL query parameterization
- Command injection prevention
- File upload validation
- URL validation

**Vulnerable Code Examples:**
```typescript
// Before (vulnerable)
[Show vulnerable code]

// After (secure)
[Show fixed code]
```

### 4. Data Protection

**Sensitive Data Inventory:**
- What sensitive data is stored?
- Where is it stored?
- How is it protected?
- Who has access?
- What's the retention policy?

**Encryption:**
- Encryption at rest (check)
- Encryption in transit (check)
- Key management
- Cipher suites used
- Encryption algorithm strength

**PII Handling:**
- Minimization (collect only what's needed)
- Anonymization opportunities
- Pseudonymization
- Right to erasure (GDPR)
- Data export capabilities

**Recommendations:**
[Data protection improvements]

### 5. API Security

**API Endpoints Review:**
- Authentication required?
- Rate limiting implemented?
- Input validation?
- Output encoding?
- CORS configuration
- API versioning

**For each endpoint:**
```
GET /api/entries/:id
✅ Authentication: Required
⚠️  Rate limiting: Missing
✅ Input validation: Implemented
❌ Authorization: Not checking ownership
```

**Recommendations:**
[API hardening steps]

### 6. Frontend Security

**XSS Prevention:**
- React's built-in XSS protection
- `dangerouslySetInnerHTML` usage review
- Third-party component security
- Content Security Policy (CSP)

**CSRF Prevention:**
- CSRF tokens
- SameSite cookies
- Double-submit cookies

**Client-side Storage:**
- localStorage security
- sessionStorage security
- Cookie security (HttpOnly, Secure, SameSite)
- No sensitive data in client storage

**Recommendations:**
[Frontend security improvements]

### 7. Infrastructure Security

**Environment Variables:**
- No secrets in code
- .env files gitignored
- Secret management strategy

**HTTPS:**
- HTTPS enforced
- SSL/TLS configuration
- Certificate management
- HSTS header

**Security Headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: [policy]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: [policy]
```

**Status:** [Implemented / Missing / Needs Improvement]

### 8. Dependency Security

**Audit Results:**
```bash
# Run and include results
npm audit
# or
yarn audit
```

**Critical/High Severity Issues:**
[List each with remediation steps]

**Recommended Actions:**
1. [Immediate updates needed]
2. [Alternative packages to consider]
3. [Automated scanning setup]

### 9. Error Handling & Information Disclosure

**Error Messages:**
- Stack traces exposed? ❌ Should not be in production
- Database errors shown? ❌ Should be generic
- Path disclosure? ❌ Should be hidden
- Version information? ❌ Should not be exposed

**Logging Security:**
- Sensitive data in logs?
- Log injection vulnerabilities?
- Log access controls?

**Recommendations:**
[Error handling improvements]

### 10. Third-Party Integrations

For each integration, assess:

**[Integration Name]:**
- API key security
- Data shared
- Trust level
- Fallback if compromised
- Regular audit schedule

### 11. Security Testing Recommendations

**Automated Testing:**
- Static Application Security Testing (SAST)
  - Tools: [Recommend specific tools]
- Dependency scanning
  - Setup: [Instructions]
- Secret scanning
  - Tools: [Recommend]

**Manual Testing:**
- Penetration testing schedule
- Security code reviews
- Threat modeling sessions

### 12. Incident Response Plan

**Preparation:**
- Security contact
- Incident classification
- Response team
- Communication plan

**Detection:**
- Monitoring and alerting
- Log analysis
- Anomaly detection

**Response Playbook:**
1. [Step for data breach]
2. [Step for account compromise]
3. [Step for DDoS]
4. [Step for other incidents]

### 13. Compliance Checklist

**GDPR (if applicable):**
- [ ] Right to access
- [ ] Right to erasure
- [ ] Right to portability
- [ ] Consent management
- [ ] Privacy policy
- [ ] Data processing agreements
- [ ] Breach notification procedures

**Other Compliance:**
[Add relevant compliance requirements]

### 14. Security Roadmap

**Immediate (Fix in 1-7 days):**
- **Critical vulnerabilities:**
  1. [Vulnerability with severity and fix]
  2. [Vulnerability]

**Short-term (Fix in 1-4 weeks):**
- **High-priority improvements:**
  1. [Improvement]
  2. [Improvement]

**Long-term (Ongoing):**
- **Strategic security initiatives:**
  1. [Initiative]
  2. [Initiative]

### 15. Security Best Practices Guide

Create an ongoing security checklist:

**Before Every Deployment:**
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Secrets rotated (if due)
- [ ] Security tests passing
- [ ] Penetration test (for major releases)

**Ongoing:**
- [ ] Weekly: Dependency vulnerability check
- [ ] Monthly: Security audit
- [ ] Quarterly: Penetration test
- [ ] Annually: Full security review

## Output Format

Deliver as a comprehensive security report with:
- Executive summary
  - Overall security posture
  - Critical findings (severity: critical/high)
  - Top 3 priorities
- Detailed findings by category
  - Each with severity rating
  - Affected code locations
  - Exploit scenarios
  - Remediation steps
  - Code examples
- Security roadmap
- Best practices guide
- Compliance checklist

For each vulnerability:
```
**Vulnerability:** [Name]
**Severity:** Critical / High / Medium / Low
**Location:** [File and line numbers]
**Description:** [What's wrong]
**Exploit Scenario:** [How it could be exploited]
**Impact:** [What damage could be done]
**Remediation:** [How to fix it]
**Code Example:** [Before and after]
**Verification:** [How to test the fix]
```

Be thorough, technical, and specific. Include code examples for all recommendations.
```

---

### Template: Quick Security Scan

For faster, focused security check:

```markdown
You are a security engineer conducting a rapid security assessment.

## Context
- **App:** [Your App Name]
- **Tech Stack:** [Your stack]
- **Focus Areas:** [Specific concerns if any]

## Your Task

Conduct a rapid security scan focusing on critical issues:

### 1. Quick OWASP Check

Scan for top 5 OWASP vulnerabilities:
1. **Broken Access Control** - Can users access data they shouldn't?
2. **Injection** - Any SQL/NoSQL/command injection risks?
3. **Cryptographic Failures** - Sensitive data properly encrypted?
4. **Security Misconfiguration** - Security headers, defaults?
5. **Vulnerable Components** - Outdated dependencies with known CVEs?

For each, provide:
- ✅ Secure / ⚠️ Needs Review / ❌ Vulnerable
- If vulnerable: specific location and fix

### 2. Authentication & Authorization

Quick checks:
- Password storage method
- Session management security
- API authentication
- Permission checking
- User data isolation

### 3. Input Validation

Check all user inputs for:
- Server-side validation
- Type checking
- Sanitization
- Length limits

### 4. Dependency Audit

```bash
npm audit --audit-level=high
```

List high/critical vulnerabilities and fixes.

### 5. Immediate Actions

Top 5 actions to take right now:
1. [Action]
2. [Action]
3. [Action]
4. [Action]
5. [Action]

## Output Format

Brief security report with:
- Traffic light status for each area (🟢🟡🔴)
- Critical findings only
- Immediate action items
- Quick fixes (code examples)
```

---

## Task Execution Checklist

**For Optimization Task:**
- [ ] Uses Sonnet 4.5 model
- [ ] Comprehensive context provided
- [ ] Focuses on actionable improvements
- [ ] Requests prioritized roadmap
- [ ] Includes code examples
- [ ] Quantifies expected improvements
- [ ] Addresses tech debt

**For Security Task:**
- [ ] Uses Sonnet 4.5 model
- [ ] Complete tech stack specified
- [ ] OWASP Top 10 coverage
- [ ] Includes severity ratings
- [ ] Provides remediation steps
- [ ] Has code examples
- [ ] Creates security roadmap
- [ ] Compliance requirements noted

---

## Scheduling Recommendations

**Code Optimization:**
- Run weekly during active development
- Run after major feature additions
- Run before performance audits
- Run after user complaints about speed

**Security Checks:**
- Run weekly minimum
- Run after adding new features
- Run after dependency updates
- Run before each major release
- Run after security news/CVEs

---

**Critical:** Security and optimization are ongoing processes, not one-time tasks. Keep these agents running regularly!
