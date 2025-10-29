# Deployment Guide - Sunday Planning System

This guide explains how to deploy the Sunday Planning System to DigitalOcean App Platform.

## Prerequisites

- GitHub repository: https://github.com/gigabrain-lgtm/sunday-planning-system
- DigitalOcean account with PostgreSQL database
- Database connection string (you'll add this in step 3)

## Deployment Steps

### 1. Connect GitHub to DigitalOcean

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Select **"GitHub"** as the source
4. Authorize DigitalOcean to access your GitHub account
5. Select repository: `gigabrain-lgtm/sunday-planning-system`
6. Select branch: `main`

### 2. Configure the App

1. DigitalOcean will auto-detect the `app.yaml` file
2. Review the configuration:
   - **Service**: web (Node.js application)
   - **Build command**: `pnpm install && pnpm build`
   - **Run command**: `pnpm start`
   - **Port**: 3000

### 3. Set Environment Variables

Add these environment variables in the DigitalOcean App Platform dashboard:

**Required:**
- `DATABASE_URL`: Your DigitalOcean PostgreSQL connection string
- `CLICKUP_API_KEY`: Your ClickUp API key
- `JWT_SECRET`: A secure random string for JWT signing
- `OAUTH_SERVER_URL`: Your OAuth server URL

**API Keys:**
- `SLACK_BOT_TOKEN`: Your Slack bot token
- `AIRTABLE_API_KEY`: Your Airtable API key
- `AIRTABLE_BASE_ID`: Your Airtable base ID

**Optional:**
- `VITE_ANALYTICS_ENDPOINT`: Analytics endpoint URL
- `VITE_ANALYTICS_WEBSITE_ID`: Analytics website ID
- `OWNER_NAME`: Your name
- `OWNER_OPEN_ID`: Your OpenID

### 4. Deploy

1. Click **"Create App"**
2. DigitalOcean will automatically:
   - Build the application
   - Run database migrations
   - Deploy to production
3. Wait for deployment to complete (usually 5-10 minutes)

### 5. Verify Deployment

1. Once deployed, you'll get a public URL (e.g., `https://sunday-planning-system-xxxxx.ondigitalocean.app`)
2. Visit the URL to verify the application is running
3. Test the main features:
   - OKR Dashboard
   - Needle Movers
   - Task Categorization

## Database Migrations

The application uses Drizzle ORM for database management. Migrations are automatically run during deployment.

To manually run migrations locally:

```bash
pnpm db:push
```

## Monitoring

In DigitalOcean App Platform dashboard, you can:
- View logs: **Logs** tab
- Monitor performance: **Metrics** tab
- Manage environment variables: **Settings** tab
- View deployment history: **Deployments** tab

## Troubleshooting

### Application won't start
- Check logs in DigitalOcean dashboard
- Verify all required environment variables are set
- Ensure database connection string is correct

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check that your DigitalOcean database is running
- Ensure SSL mode is set to `require`

### API errors (ClickUp, Slack, etc.)
- Verify API keys are correct
- Check that tokens haven't expired
- Review API rate limits

## Rollback

To rollback to a previous version:

1. Go to **Deployments** tab in DigitalOcean
2. Select a previous deployment
3. Click **"Rollback"**

## Continuous Deployment

The app is configured for automatic deployment:
- Every push to `main` branch triggers a new build
- Deployment happens automatically after successful build
- Previous version remains available for quick rollback

## Support

For issues or questions:
1. Check DigitalOcean logs
2. Review GitHub Actions workflow
3. Check the application logs at `/var/log/app.log` (if SSH access available)

