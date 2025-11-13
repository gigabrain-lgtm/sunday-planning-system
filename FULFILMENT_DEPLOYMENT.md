# Fulfilment Module Deployment Guide

## Overview

The MRP Inventory application has been successfully integrated into the Sunday Planning System as the "Fulfilment" module. This guide explains what was added and how to deploy it.

## What Was Added

### Backend Files

1. **`server/mrp.ts`** - MRP API integration
   - Functions to fetch inventory data from MRP API
   - Functions to fetch list of sellers

2. **`server/fulfilment.ts`** - Fulfilment business logic
   - ClickUp task creation from inventory items
   - Template mapping for different task types
   - Product description formatting

3. **`server/routers.ts`** - Updated with fulfilment router
   - `fulfilment.getSellers` - Get list of MRP sellers
   - `fulfilment.getInventory` - Get inventory for a seller
   - `fulfilment.createTask` - Create ClickUp task from product
   - `fulfilment.getClients` - Get ClickUp clients

### Frontend Files

1. **`client/src/pages/fulfilment/InventoryApp.tsx`** - Main inventory component
   - Seller selector dropdown
   - Inventory table with product details
   - Action buttons for creating tasks (Main Image, Gallery, A+ Content, Price, Coupon)
   - Real-time task creation with toast notifications

2. **`client/src/pages/Fulfilment.tsx`** - Updated page wrapper
   - Integrates InventoryApp component
   - Uses existing Sidebar layout

### Configuration Files

1. **`server/_core/env.ts`** - Added MRP environment variables
2. **`.env.example`** - Updated with MRP configuration

## Environment Variables Required

Add these environment variables to your Digital Ocean App Platform:

```bash
# MRP Integration
MRP_API_URL=https://api.myrealprofit.com
MRP_API_KEY=your-mrp-api-key-here

# ClickUp (if not already set)
CLICKUP_API_KEY=pk_82195661_L32W2R69UK373MVCYG3EJXMJ830N1RT6
```

## Deployment Steps

### 1. Commit and Push Changes

```bash
cd /home/ubuntu/sunday-planning-system
git add -A
git commit -m "Add Fulfilment module with MRP inventory integration"
git push origin main
```

### 2. Set Environment Variables in Digital Ocean

1. Go to Digital Ocean App Platform
2. Select your "sunday-planning-system" app
3. Go to Settings → App-Level Environment Variables
4. Add the following variables:
   - `MRP_API_URL` = `https://api.myrealprofit.com`
   - `MRP_API_KEY` = (your MRP API key)
   - `CLICKUP_API_KEY` = `pk_82195661_L32W2R69UK373MVCYG3EJXMJ830N1RT6`

### 3. Deploy

The app will auto-deploy when you push to GitHub. You can also manually trigger a deployment from the Digital Ocean dashboard.

## Features

### Inventory Management

- **Seller Selection**: Choose from available MRP sellers
- **Product List**: View all products with:
  - ASIN (clickable link to Amazon)
  - SKU
  - Product title
  - Price
  - Sellable, Reserved, and Total quantities
  - Calculated inventory value
  
### Task Creation

Five action buttons per product:

1. **Main Image** (Blue) - Uses ClickUp template `86a8m8nz1`
2. **Gallery Images** (Indigo) - Uses ClickUp template `86a8m8nz1`
3. **A+ Content** (Green) - Uses ClickUp template `86a5m44f8`
4. **Change Price** (Yellow) - Creates regular task
5. **Apply Coupon/Discount** (Orange) - Creates regular task

### Task Details

Each created task includes:
- Task name: `{Type} - {ASIN} - {Product Title}`
- Description with full product details
- Tags: task type, "mrp-inventory", ASIN
- Direct Amazon product link
- Status: "Open"

Tasks are created in ClickUp list ID: `901305874515` (Creative Task Templates)

## Testing

After deployment, test the integration:

1. Navigate to the "Fulfilment" tab in the sidebar
2. Select a seller from the dropdown
3. Verify inventory loads correctly
4. Click an action button to create a test task
5. Verify the task appears in ClickUp

## Troubleshooting

### "MRP_API_KEY not configured" error

- Ensure the environment variable is set in Digital Ocean
- Redeploy the app after adding the variable

### "Failed to fetch sellers" error

- Check that MRP_API_URL is correct
- Verify MRP_API_KEY is valid
- Check MRP API status

### "Failed to create task" error

- Verify CLICKUP_API_KEY is set and valid
- Check that template IDs exist in your ClickUp workspace
- Ensure list ID `901305874515` exists

### Inventory not loading

- Check browser console for errors
- Verify seller name is correct
- Check MRP API response format

## API Endpoints

The following tRPC endpoints are available:

- `GET /api/fulfilment/getSellers` - List all MRP sellers
- `GET /api/fulfilment/getInventory?sellerName={name}` - Get inventory for seller
- `POST /api/fulfilment/createTask` - Create ClickUp task from product
- `GET /api/fulfilment/getClients` - Get ClickUp clients

## Future Enhancements

Potential improvements:

1. **Client-Seller Mapping**: Link ClickUp clients to MRP sellers
2. **Batch Task Creation**: Select multiple products and create tasks at once
3. **Task Status Tracking**: Show which products already have tasks
4. **Custom Templates**: Allow users to configure templates per task type
5. **Inventory Filters**: Filter by price, quantity, or product name
6. **Export**: Export inventory data to CSV/Excel

## Support

For issues or questions:
- Check the browser console for client-side errors
- Check Digital Ocean logs for server-side errors
- Verify all environment variables are set correctly
- Ensure MRP and ClickUp APIs are accessible

## Summary

The Fulfilment module is now fully integrated and ready for deployment. Once environment variables are set in Digital Ocean, the app will automatically deploy and the Fulfilment tab will be functional.
