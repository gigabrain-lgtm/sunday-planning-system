# Project TODO

## Database Schema
- [x] Create weekly_planning table for business and personal planning
- [x] Create manifestations table for tracking 12 life pillars
- [x] Add indexes for efficient querying by user and week

## Backend Integration
- [x] Set up environment variables for Airtable and Slack
- [x] Integrate Airtable API client
- [x] Integrate Slack API client
- [x] Integrate ClickUp API client
- [x] Create planning router with save and getLatest procedures
- [x] Create needleMovers router for ClickUp integration
- [x] Create slack router for daily posting
- [x] Set up cron scheduler for daily 7 AM EST Slack posts

## Frontend Components
- [x] Create BusinessPlanning component
- [x] Create ManifestationTracker component
- [x] Create PersonalPlanning component
- [x] Create BusinessNeedleMovers component
- [x] Create SundayPlanning page with multi-step workflow
- [x] Create TestSlack page for manual testing
- [x] Update App.tsx with proper routing

## Bugs

## Fixed Bugs
- [x] Fix ClickUp API key not configured error
- [x] Fix team member assignment dropdown showing only Unassigned
- [x] Fix Add button not working in Manifestation Tracker
- [x] Filter team members to only show those with access to the specific ClickUp list (not entire workspace)
- [x] Fix Add button to immediately create task in ClickUp and show in Active Needle Movers
- [x] Timeline view should start from next week (not current week)
- [x] Remove specific date ranges from week headers in timeline view

## New Features
- [ ] Make tasks draggable between weeks in Gantt chart (future enhancement)

## Completed New Features
- [x] Show actual workspace members in assignment dropdown
- [x] Change "Add Another" button to "Add" and immediately add to active needle movers list
- [x] Add "Move to Roadmap" button in Active Needle Movers section
- [x] Add separate "Moved to Roadmap" section to show tasks that were moved
- [x] Create Roadmap page as 5th step after Needle Movers
- [x] Fetch and display roadmap tasks from ClickUp Roadmap list
- [x] Update progress calculation to include Roadmap step
- [x] Show "New Roadmap" section with tasks moved during current session
- [x] Show "Existing Roadmap" section with tasks from ClickUp list
- [x] Add planning capability to Roadmap page with expandable tasks
- [x] Allow adding notes/details to roadmap tasks
- [x] Add target date or week selection for roadmap tasks
- [x] Make roadmap tasks editable (priority, assignee, notes)
- [x] Add weekly Gantt chart view to Roadmap page
- [x] Add toggle to switch between List View and Timeline View
- [x] Keep tasks always expanded in list view (remove collapse functionality)
- [x] Display next 12 weeks in Timeline View with date ranges
- [x] Color-code tasks by priority in Timeline View
- [x] Group tasks by target week in Timeline View
- [x] Match the exact layout and styling from reference
- [x] Simplify rating colors - all blue when selected
- [x] Remove colorful borders on state inputs
- [x] Remove character counters
- [x] Split current state into two textboxes: Reflection and Actionables
- [x] Create OKR Review component as new planning step
- [x] Fetch Objectives and Key Results from ClickUp
- [x] Display Objectives with descriptions (why it's important)
- [x] Show Key Results under each Objective with progress details
- [x] Add action buttons for each Key Result (This Week, Automate, Delegate, Eliminate, Roadmap)
- [x] Integrate OKR Review as step 4 (between Personal Planning and Needle Movers)
- [x] Update progress calculation to include OKR Review step (6 steps total)
- [x] Add backend router for OKR operations
- [x] Add Strategic Thinking prompts to guide OKR review process
- [x] Make objectives expandable/collapsible
- [x] Move Strategic Thinking questions from objective level to under each Key Result
- [x] Fetch subtasks for each Key Result from ClickUp
- [x] Display subtasks under each Key Result
- [x] Move action buttons from Key Results to individual subtasks
- [x] Update backend to fetch subtasks for Key Results
- [x] Make Key Results expandable to show Strategic Thinking and subtasks
- [x] Add text inputs for Strategic Thinking questions (What did we do last week, What did we learn, What's the 20%)
- [x] Add "Add Task" button under each Key Result to create new subtasks
- [x] Add delete/remove button for each subtask
- [x] Create backend mutation to add new subtasks to ClickUp
- [x] Create backend mutation to delete subtasks from ClickUp
- [x] Fix addSubtask to fetch parent task's list ID before creating subtask
- [x] Implement prefetching of all ClickUp data when Sunday Planning page loads
- [x] Prefetch Objectives and Key Results with subtasks
- [x] Prefetch Needle Movers tasks (business and personal)
- [x] Prefetch Roadmap tasks
- [x] Prefetch team members
- [x] Use React Query prefetchQuery during Business Planning step
- [x] Cache all prefetched data for instant navigation between steps
- [x] Remove login requirement from Sunday Planning System
- [x] Make the app publicly accessible without authentication
- [x] Create mock user from environment variables for public access
- [x] Maintain ClickUp integration functionality with public access

## Testing & Verification
- [ ] Test database operations
- [ ] Test Airtable integration
- [ ] Test Slack posting
- [ ] Test ClickUp integration
- [ ] Test complete Sunday planning workflow
- [ ] Verify cron scheduler


- [x] Add planning capability to Roadmap page with expandable tasks
- [x] Allow adding notes/details to roadmap tasks
- [x] Add target date or week selection for roadmap tasks
- [x] Make roadmap tasks editable (priority, assignee, notes)



## Bugs























## New Features - Refined OKR-Driven Workflow
- [x] Implement "This Week" action in OKR Review to move subtasks to Needle Movers list
- [x] Fix moveTaskToList to remove parent relationship when moving subtasks
- [x] Fix moveToNeedleMovers to CREATE new task instead of moving (ClickUp API limitation: cannot convert subtasks to tasks)
- [x] Add getTask function to fetch subtask details from ClickUp
- [x] Update moveToNeedleMovers to copy subtask data to new Needle Mover task
- [x] Implement task linking using ClickUp's Task Links API (instead of custom fields)
- [x] Create linkTasks function to link Needle Mover tasks to Key Results
- [x] Fix enrichWithOKRLinkage to use correct field name (task_id) from ClickUp API
- [x] Fetch linked_tasks data when loading Needle Movers
- [x] Create OKR badge component showing "🎯 Objective Name"
- [x] Display OKR badges in Needle Movers task cards
- [ ] Color-code tasks by Objective (assign colors to objectives)
- [ ] Add "Promote to This Week" button in Roadmap to move to Needle Movers
- [ ] Add "Snooze to Next Week" button in Roadmap to increment target week
- [ ] Group Needle Movers by Objective
- [ ] Group Roadmap tasks by Objective
- [ ] Add OKR progress dashboard showing task distribution
- [ ] Calculate Key Result completion percentage based on completed tasks



## OKR Dashboard - New Interactive View
- [x] Create OKR Dashboard component as new page/tab
- [x] Display all Objectives with expandable Key Results
- [x] Create database table to store Key Result → Objective mappings
- [x] Add backend mutations to save/update Key Result-Objective mappings
- [x] Create UI to assign Key Results to Objectives (dropdown selection)
- [x] Update fetchKeyResults to include mapped Objective IDs from database
- [x] Add OKR Dashboard to navigation (between OKR Review and Needle Movers)
- [ ] BUG: Configure Mappings modal Save button onClick not triggering (event handler not being called)
- [ ] WORKAROUND: Manually insert mappings via SQL for now, fix UI later
- [x] Fix Key Results showing under Objectives in OKR Dashboard (using database mappings)
- [ ] Update OKR Review to filter Key Results by Objective using database mappings
- [ ] Under each Key Result, show "This Week" section with tasks from Needle Movers list
- [ ] Under each Key Result, show "Roadmap" section with tasks from Roadmap list, grouped by week
- [ ] Filter Needle Movers tasks by linked Key Result ID
- [ ] Filter Roadmap tasks by linked Key Result ID
- [ ] Add OKR Dashboard to navigation (between OKR Review and Needle Movers)
- [ ] Set default week for Needle Movers tasks to current week
- [ ] Set default week for Roadmap tasks to next week
- [ ] Ensure bidirectional sync: tasks appear in both OKR Dashboard and original pages
- [ ] Add week picker for Roadmap tasks in OKR Dashboard
- [ ] Style OKR Dashboard to match existing design system



## AI-Powered Task Categorization
- [x] Create backend endpoint to analyze tasks and suggest Key Result mappings using AI
- [x] Fetch all Needle Movers tasks, Key Results, and Objectives
- [x] Use keyword matching to suggest most relevant Key Result for each task
- [x] Create review UI showing AI suggestions with accept/edit/skip options
- [x] Implement bulk save for approved mappings
- [x] Add "Auto-Categorize" button in OKR Dashboard
- [ ] Apply same AI categorization to Roadmap tasks (future enhancement)
- [ ] Enhance matching algorithm with actual LLM integration (future enhancement)





## Bug Fixes
- [x] Investigated React error: "button cannot contain a nested button" - unable to reproduce in current version, functionality working correctly



## New Feature Request
- [x] Add "Auto-Categorize" button to Needle Movers page for easy task categorization



## Critical Bugs to Fix
- [ ] Fix React hydration error: "button cannot be a descendant of button" in TaskCategorizationReview
- [ ] Fix ClickUp API error: SHARD_006 "Not found" error



## Payment Request System Integration

### Database Schema
- [x] Add payment_requests table to drizzle/schema.ts with all payment type fields
- [x] Create migration SQL file for payment_requests table
- [x] Test database connection with PostgreSQL

### Backend Implementation
- [x] Add database helper functions in server/db.ts for payment requests
- [x] Add tRPC endpoints in server/routers.ts for payment requests
- [x] Add payment type validation (credit_card, ach, wire, invoice)
- [x] Add owner notification when new payment request is submitted

### Frontend Implementation
- [x] Create PaymentRequests.tsx page component
- [x] Add route to App.tsx for /payment-requests
- [x] Add sidebar menu item in Sidebar.tsx with DollarSign icon
- [x] Create payment request form with dynamic fields based on payment type
- [x] Add confirmation checkboxes for credit card and invoice types
- [ ] Create payment requests list view
- [ ] Create payment request detail view

### Testing & Deployment
- [ ] Test locally with development database
- [ ] Test all payment type forms (credit card, ACH, wire, invoice)
- [ ] Test form validation and confirmation checkboxes
- [ ] Commit and push to main branch
- [ ] Verify deployment in Digital Ocean
- [ ] Test in production environment
