# Fulfilment Application Integration Guide

**Author**: Manus AI
**Date**: Nov 13, 2025

## 1. Introduction

This document provides a comprehensive guide for a Manus agent to integrate the new "Fulfilment" application into the existing "Sunday Planning System." The goal is to embed the Fulfilment app within the Sunday Planning System, making it accessible via a new "Fulfilment" tab in the sidebar.

### 1.1. Target Audience

This guide is intended for a Manus agent with expertise in web development, database management, and application deployment. It assumes a working knowledge of the Sunday Planning System's architecture.

### 1.2. System Overview

The Sunday Planning System is a full-stack application with the following components:

| Component | Technology | Location |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Wouter | `/client` |
| **Backend** | Node.js, Express, tRPC | `/server` |
| **Database** | PostgreSQL | Digital Ocean |
| **Deployment** | Digital Ocean App Platform | - |

## 2. Prerequisites

Before starting the integration, ensure you have the following:

1.  **Fulfilment Application Code**: The complete source code for the Fulfilment application.
2.  **Access to Sunday Planning System**: A working copy of the Sunday Planning System repository.
3.  **Digital Ocean Credentials**: Access to the Digital Ocean account where the Sunday Planning System is deployed.

## 3. Integration Steps

### 3.1. Code Placement

1.  **Create a New Directory**: Inside the `client/src/pages` directory of the Sunday Planning System, create a new directory named `fulfilment`.
2.  **Copy Fulfilment App Code**: Place the entire frontend code of the Fulfilment application into this new `fulfilment` directory.

### 3.2. Frontend Integration

The Sunday Planning System's frontend uses a component-based architecture. The Fulfilment application will be integrated as a new page component.

1.  **Create a Wrapper Component**: In the `client/src/pages` directory, you will find a placeholder file named `Fulfilment.tsx`. This file will serve as the entry point for the Fulfilment application. You will need to modify this file to render the main component of the Fulfilment application.

    ```typescript
    // client/src/pages/Fulfilment.tsx

    import { Sidebar } from "@/components/layout/Sidebar";
    import { FulfilmentApp } from "./fulfilment/App"; // Assuming the main component is named App

    export default function Fulfilment() {
      return (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar>
            <FulfilmentApp />
          </Sidebar>
        </div>
      );
    }
    ```

2.  **Sidebar Navigation**: The link to the Fulfilment page has already been added to the sidebar in `client/src/components/layout/Sidebar.tsx`.

3.  **Routing**: The route for the Fulfilment page has already been added in `client/src/App.tsx`.

### 3.3. Backend Integration

If the Fulfilment application has its own backend, you will need to integrate it with the Sunday Planning System's backend.

1.  **API Endpoints**: If the Fulfilment app needs new API endpoints, add them to the `server/routers.ts` file. Create a new router for the Fulfilment app and mount it in the `appRouter`.

    ```typescript
    // server/routers.ts

    import { fulfilmentRouter } from "./fulfilmentRouter"; // Create this file

    export const appRouter = router({
      // ... existing routers
      fulfilment: fulfilmentRouter,
    });
    ```

2.  **Database Integration**: If the Fulfilment app requires its own database tables, add the schema definitions to `drizzle/schema.ts`. Then, run the database migration to create the new tables.

    ```bash
    cd /home/ubuntu/sunday-planning-system
    export DATABASE_URL="<your_database_url>"
    npm run db:push
    ```

### 3.4. Deployment

The Sunday Planning System is deployed on Digital Ocean's App Platform, with auto-deployment from the `main` branch of the GitHub repository.

1.  **Commit and Push**: Once you have integrated the Fulfilment application's code, commit the changes to the `main` branch.

    ```bash
    cd /home/ubuntu/sunday-planning-system
    git add .
    git commit -m "Integrate Fulfilment application"
    git push origin main
    ```

2.  **Digital Ocean Deployment**: The push to the `main` branch will automatically trigger a new deployment on Digital Ocean. You can monitor the deployment progress in the Digital Ocean dashboard.

## 4. Verification

After the deployment is complete, follow these steps to verify the integration:

1.  **Navigate to the Fulfilment Page**: Open the Sunday Planning System in your browser and click on the "Fulfilment" link in the sidebar.
2.  **Check for Errors**: Open the browser's developer console and check for any errors.
3.  **Test Functionality**: Test the functionality of the Fulfilment application to ensure it is working as expected.

## 5. Conclusion

This guide provides the necessary steps to integrate the Fulfilment application into the Sunday Planning System. If you encounter any issues, refer to the Sunday Planning System's existing code for patterns and best practices.
