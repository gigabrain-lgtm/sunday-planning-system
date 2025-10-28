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

















