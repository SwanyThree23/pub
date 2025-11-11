# Feature Building Tasks (1-4)

Use **Haiku 4.5** model for cost-effective feature development.

---

## Feature Task #1: [Customize Title]

### Default Example: Folder Organization System

```markdown
# Task: Build Folder Organization System

## Context
- App: [Your App Name]
- Tech Stack: Next.js, TypeScript, Tailwind CSS, Local Storage
- Current State: Entries are displayed in a flat list

## Requirements

### Core Functionality
1. **Folder Creation**
   - Add "New Folder" button in sidebar
   - Prompt for folder name
   - Create folder in local storage

2. **Folder Display**
   - Show folders in collapsible list
   - Display entry count for each folder
   - Default "Uncategorized" folder for ungrouped entries

3. **Entry Organization**
   - Drag and drop entries between folders
   - Right-click menu: "Move to folder"
   - Entries can only be in one folder at a time

4. **Folder Management**
   - Rename folders
   - Delete folders (moves entries to "Uncategorized")
   - Collapse/expand folders

### UI Requirements
- Clean, minimal design matching existing aesthetic
- Smooth animations for drag-drop
- Intuitive folder icons
- Responsive on mobile

### Technical Requirements
- Store folder structure in localStorage
- Update data model to include folderId
- Maintain performance with many folders/entries

## Acceptance Criteria
- [ ] Users can create new folders
- [ ] Drag-drop works smoothly
- [ ] Folders persist after page reload
- [ ] No data loss during operations
- [ ] Works on mobile devices

## Implementation Notes
- Use existing component structure
- Follow TypeScript best practices
- Maintain existing styling patterns
```

---

## Feature Task #2: [Customize Title]

### Default Example: Color Coding System

```markdown
# Task: Add Color Coding for Entries

## Context
- App: [Your App Name]
- Tech Stack: Next.js, TypeScript, Tailwind CSS
- Purpose: Help users visually organize and categorize entries

## Requirements

### Core Functionality
1. **Color Selection**
   - Color picker in entry editor
   - 8-10 predefined colors (red, blue, green, yellow, purple, etc.)
   - Save color with entry data

2. **Visual Indicators**
   - Colored dot/badge next to entry title in sidebar
   - Color border or highlight in editor view
   - Color legend/key (optional)

3. **Color Management**
   - Change color of existing entries
   - Remove color (set to default)
   - Bulk color assignment (future enhancement)

### UI Requirements
- Color picker component (can use existing library)
- Colors should be accessible (WCAG compliant)
- Subtle implementation - not overwhelming
- Match existing design language

### Technical Requirements
- Add `color` field to entry data model
- Update localStorage schema
- Use Tailwind CSS color utilities
- Type-safe color definitions

## Acceptance Criteria
- [ ] Users can assign colors to entries
- [ ] Colors display correctly in sidebar
- [ ] Colors persist after reload
- [ ] Color picker is intuitive
- [ ] Mobile-friendly color selection

## Design Suggestions
- Use Tailwind's color palette
- Implement as dropdown or popover
- Show color preview in real-time
```

---

## Feature Task #3: [Customize Title]

### Default Example: Entry Titles System

```markdown
# Task: Add Automatic Entry Titles

## Context
- App: [Your App Name]
- Current State: Entries only show date/time in sidebar
- Goal: Improve entry identification and navigation

## Requirements

### Core Functionality
1. **Auto-Generated Titles**
   - Extract first line of content as title
   - If first line is long, truncate to 50 characters
   - If content is markdown heading, use that
   - Fallback to timestamp if content is empty

2. **Manual Title Editing**
   - Editable title field in entry editor
   - Save custom titles separately from content
   - Clear indicator when title is custom vs. auto

3. **Title Display**
   - Show titles in sidebar entry list
   - Replace or supplement timestamp
   - Truncate long titles with ellipsis
   - Full title on hover tooltip

### UI Requirements
- Prominent but not intrusive title field
- Clear edit affordance
- Graceful degradation for empty entries
- Consistent typography

### Technical Requirements
- Add `title` and `titleType` to entry model
  ```typescript
  interface Entry {
    id: string;
    title: string;
    titleType: 'auto' | 'custom';
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- Auto-generate on content change
- Preserve custom titles when content changes
- Migration for existing entries

## Acceptance Criteria
- [ ] Titles auto-generate from content
- [ ] Users can set custom titles
- [ ] Titles display in sidebar
- [ ] Existing entries get titles
- [ ] Performance remains good

## Implementation Notes
- Use regex or markdown parser for extraction
- Debounce auto-generation
- Add migration script for existing data
```

---

## Feature Task #4: [Customize Title]

### Default Example: Social Media Sharing

```markdown
# Task: Add Social Media Share Buttons

## Context
- App: [Your App Name]
- Purpose: Allow users to share entries on social platforms
- Privacy: Respect user privacy and data control

## Requirements

### Core Functionality
1. **Share Buttons**
   - Twitter share button
   - Facebook share button
   - LinkedIn share button
   - Copy link button

2. **Share Content**
   - Generate shareable link (if applicable)
   - Or copy entry text to clipboard
   - Optional: Create share image with entry preview
   - Respect privacy settings

3. **Privacy Controls**
   - Make entry "shareable" toggle
   - Default: private (not shareable)
   - Warning before sharing private content
   - User confirmation dialog

### UI Requirements
- Share button in entry view
- Modal/popover with share options
- Clear icons for each platform
- Feedback on successful share/copy

### Technical Requirements
- Use Web Share API (where supported)
- Fallback to manual share URLs
- Copy to clipboard functionality
- URL shortening (optional)

### Platform Share URLs
```javascript
const shareUrls = {
  twitter: `https://twitter.com/intent/tweet?text=${text}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
};
```

## Acceptance Criteria
- [ ] Share buttons appear in entry view
- [ ] Clicking opens share dialog/new window
- [ ] Copy to clipboard works
- [ ] Privacy toggle prevents sharing private entries
- [ ] Mobile-friendly implementation

## Security Considerations
- Don't expose private data in URLs
- Sanitize content before sharing
- Validate user permissions

## Future Enhancements
- Share analytics
- Custom share messages
- Image generation for shares
```

---

## Customization Template

### Blank Template for Your Features

```markdown
# Task: [Feature Name]

## Context
- App: [Your App Name]
- Tech Stack: [Your Stack]
- Current State: [What exists now]
- Goal: [What you want to achieve]

## Requirements

### Core Functionality
1. [Main Feature Component]
   - [Specific requirement]
   - [Specific requirement]
   - [Specific requirement]

2. [Secondary Feature Component]
   - [Specific requirement]
   - [Specific requirement]

3. [Additional Components]
   - [Requirements]

### UI Requirements
- [Design requirement]
- [Design requirement]
- [Design requirement]

### Technical Requirements
- [Technical detail]
- [Technical detail]
- [Technical detail]

## Acceptance Criteria
- [ ] [Testable requirement]
- [ ] [Testable requirement]
- [ ] [Testable requirement]
- [ ] [Testable requirement]

## Implementation Notes
- [Helpful context for AI agent]
- [Constraints or preferences]
- [References to existing code]
```

---

## Feature Ideas Library

**Quick feature ideas to get started:**

### User Experience
- ✨ Dark mode toggle
- ✨ Keyboard shortcuts
- ✨ Search functionality
- ✨ Filters and sorting
- ✨ Tags system
- ✨ Favorites/bookmarks
- ✨ Recent entries widget

### Data Management
- 💾 Export to PDF/Markdown
- 💾 Import from other apps
- 💾 Auto-save indicators
- 💾 Version history
- 💾 Backup to cloud
- 💾 Data sync across devices

### Productivity
- ⚡ Templates for entries
- ⚡ Quick entry shortcut
- ⚡ Daily reminders
- ⚡ Streak tracking
- ⚡ Word count statistics
- ⚡ Reading time estimates

### Social & Sharing
- 🌐 Public entry links
- 🌐 Collaborative entries
- 🌐 Comments system
- 🌐 Entry reactions
- 🌐 Share to social media

### Customization
- 🎨 Custom themes
- 🎨 Font selection
- 🎨 Layout options
- 🎨 Custom color schemes
- 🎨 Background images

### Advanced Features
- 🚀 Rich text editor enhancements
- 🚀 Image uploads
- 🚀 Voice notes
- 🚀 PDF attachments
- 🚀 Drawing/sketching
- 🚀 Code syntax highlighting
- 🚀 Math equation support

---

## Best Practices for Feature Tasks

### 1. Keep Scope Small
✅ "Add a dark mode toggle"
❌ "Rebuild entire theming system"

### 2. Be Specific
✅ "Add folder system with drag-drop"
❌ "Make organization better"

### 3. Include Context
- Current state
- Tech stack
- Design preferences
- Existing patterns to follow

### 4. Define Success
- Clear acceptance criteria
- Testable outcomes
- Edge cases to handle

### 5. Consider Mobile
- Always mention mobile responsiveness
- Touch interactions
- Small screen layouts

### 6. Reference Existing Code
- Point to similar features
- Mention component structure
- Note styling patterns

---

## Feature Task Checklist

Before submitting a feature task:

- [ ] Feature is small and focused
- [ ] No overlap with other active tasks
- [ ] Clear requirements defined
- [ ] UI/UX expectations stated
- [ ] Technical constraints noted
- [ ] Acceptance criteria listed
- [ ] Mobile considerations included
- [ ] Uses Haiku 4.5 model
- [ ] Context about app provided
- [ ] Success metrics clear

---

**Pro Tip:** Start with the provided examples, test the workflow, then customize for your specific app!
