# Agency Slug Implementation Summary

## Overview
Implemented dynamic agency slug functionality that allows agencies to customize their submission link URLs independently from their internal database IDs.

## What Changed

### 1. Database Schema
- **Added `slug` field** to the `agencies` table
- Field type: `varchar(255)`, nullable
- Purpose: Stores custom URL slugs for agencies (e.g., "victoria" instead of "video-marketer")

### 2. Backend Updates

#### Schema (`drizzle/schema.ts`)
- Added `slug` field to agencies table definition
- Migration file created: `drizzle/0002_wonderful_legion.sql`

#### Database Functions (`server/db.ts`)
- Updated `upsertAgency()` to save and update slug field

#### API Routes (`server/routers.ts`)
- Updated `updateAgency` mutation to accept `slug` parameter
- Added slug to the input validation schema

#### Server-side Types (`server/orgChart.ts`)
- Added `slug?: string` to Agency interface

### 3. Frontend Updates

#### Data Layer (`client/src/data/orgChart.ts`)
- Added `slug?: string` to Agency interface
- Updated `getSubmissionLink()` to accept slug parameter

#### Submission Page (`client/src/pages/ExternalSubmissions.tsx`)
- Updated agency merging logic to include slug from database overrides
- Modified URL resolution to check slug first, then ID, then name
- Priority order: `agency.slug` → `agency.id` → `agency.name`

#### Agencies Page (`client/src/pages/OrgChart.tsx`)
- Added slug input field to Edit Agency dialog
- Updated `editingAgency` state to include slug
- Modified `handleEdit()` to preserve existing slug
- Updated `handleSaveEdit()` to save slug to database
- Changed `copySubmissionLink()` to use slug instead of ID
- Added warning text: "This will change the agency's submission link URL. Old links will break."

## How It Works

### URL Generation
1. When copying a submission link, the system uses `agency.slug` if available
2. If no slug is set, it falls back to `agency.id`
3. Example: Agency with slug "victoria" generates: `/submissions?agency=victoria`

### URL Resolution
When a user visits a submission link, the system tries to match in this order:
1. First, check if `agency.slug` matches the URL parameter
2. If not found, check if `agency.id` matches
3. If still not found, check if the slugified name matches
4. This ensures backward compatibility with old links (until slug is changed)

### Database Behavior
- Slug is optional - if not set, the system uses the agency ID
- Slug is stored in the `agencies` table alongside other overrides
- When an agency is edited, the slug can be updated
- **Breaking Change**: Changing a slug will break old bookmarked links

## Usage Instructions

### For Agency Managers
1. Navigate to the Agencies page
2. Click "Edit" on any agency card
3. Fill in the "URL Slug" field with your desired slug (e.g., "victoria")
4. Leave empty to use the default agency ID
5. Click "Save"
6. Copy the new submission link - it will use your custom slug

### For Developers
```typescript
// Get agency with slug
const agency = {
  id: 'video-marketer',
  name: 'Video Marketer',
  slug: 'victoria', // custom slug
  slackChannelId: 'C123456',
  department: 'branding'
};

// Generate submission link
const link = getSubmissionLink(agency.slug || agency.id);
// Result: https://your-domain.com/submissions?agency=victoria
```

## Important Notes

### Breaking Changes
- **Old links will break** when a slug is changed
- Example: If "video-marketer" is changed to "victoria", the old link `/submissions?agency=video-marketer` will still work until the slug is saved
- After saving the slug, only `/submissions?agency=victoria` will work

### Backward Compatibility
- Agencies without custom slugs continue to work with their IDs
- The system falls back to ID if slug is not set
- Existing submission links continue to work until slugs are changed

### Database Migration
- Migration was applied directly to production database
- SQL: `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS slug varchar(255);`
- No data loss - all existing agencies continue to work

## Testing Checklist

- [x] Database schema updated
- [x] Backend API accepts slug parameter
- [x] Frontend edit dialog shows slug field
- [x] Submission link generation uses slug
- [x] URL resolution checks slug first
- [x] Changes committed and pushed to GitHub
- [ ] Deployment completed on Digital Ocean
- [ ] Test editing an agency and setting a custom slug
- [ ] Test copying submission link with custom slug
- [ ] Test submitting content via new slug URL
- [ ] Verify old link breaks after slug change

## Next Steps

1. **Wait for deployment** (~3-4 minutes)
2. **Test the feature**:
   - Edit an agency (e.g., Video Marketer)
   - Set slug to "victoria"
   - Copy the submission link
   - Verify it contains `/submissions?agency=victoria`
   - Submit test content via the new link
3. **Verify breaking change**:
   - Try accessing old link with `agency=video-marketer`
   - Confirm it no longer works (agency not found)

## Files Modified

1. `drizzle/schema.ts` - Added slug field to agencies table
2. `drizzle/0002_wonderful_legion.sql` - Migration file
3. `server/db.ts` - Updated upsertAgency function
4. `server/routers.ts` - Updated updateAgency mutation
5. `server/orgChart.ts` - Added slug to Agency interface
6. `client/src/data/orgChart.ts` - Added slug to Agency interface
7. `client/src/pages/ExternalSubmissions.tsx` - Updated URL resolution
8. `client/src/pages/OrgChart.tsx` - Added slug editing UI

## Deployment Info

- **Repository**: github.com/gigabrain-lgtm/sunday-planning-system
- **Branch**: main
- **Commit**: 4f54cf7
- **Platform**: Digital Ocean App Platform
- **Auto-deploy**: Enabled
- **Estimated deployment time**: 3-4 minutes
