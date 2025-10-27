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

## New Features
- [x] Show actual workspace members in assignment dropdown
- [x] Change "Add Another" button to "Add" and immediately add to active needle movers list
- [x] Add "Move to Roadmap" button in Active Needle Movers section
- [x] Add separate "Moved to Roadmap" section to show tasks that were moved
- [x] Create Roadmap page as 5th step after Needle Movers
- [x] Fetch and display roadmap tasks from ClickUp Roadmap list
- [x] Update progress calculation to include Roadmap step
- [x] Show "New Roadmap" section with tasks moved during current session
- [x] Show "Existing Roadmap" section with tasks from ClickUp list

## Completed Features
- [x] Update Manifestation Tracker UI to match reference design (https://manifestation-tracker.netlify.app/)
- [x] Add ability to edit manifestation states inline
- [x] Add ability to remove individual manifestation states
- [x] Match the exact layout and styling from reference
- [x] Simplify rating colors - all blue when selected
- [x] Remove colorful borders on state inputs
- [x] Remove character counters
- [x] Split current state into two textboxes: Reflection and Actionables

## Testing & Verification
- [ ] Test database operations
- [ ] Test Airtable integration
- [ ] Test Slack posting
- [ ] Test ClickUp integration
- [ ] Test complete Sunday planning workflow
- [ ] Verify cron scheduler

