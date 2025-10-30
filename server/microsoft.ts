import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { ENV } from "./_core/env";

// Microsoft Graph API client for OneDrive access
export class MicrosoftGraphClient {
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Search for a file by name in the user's OneDrive
   */
  async findFileByName(fileName: string): Promise<any> {
    try {
      const response = await this.client
        .api("/me/drive/root/search(q='{fileName}')")
        .get();
      
      if (response.value && response.value.length > 0) {
        return response.value[0]; // Return first match
      }
      
      throw new Error(`File not found: ${fileName}`);
    } catch (error) {
      console.error("Error finding file:", error);
      throw error;
    }
  }

  /**
   * Download Excel file content from OneDrive
   */
  async downloadExcelFile(fileId: string): Promise<ArrayBuffer> {
    try {
      const response = await this.client
        .api(`/me/drive/items/${fileId}/content`)
        .get();
      
      return response;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Get Excel worksheet data
   */
  async getWorksheetData(fileId: string, sheetName: string): Promise<any> {
    try {
      const response = await this.client
        .api(`/me/drive/items/${fileId}/workbook/worksheets/${sheetName}/usedRange`)
        .get();
      
      return response;
    } catch (error) {
      console.error("Error getting worksheet data:", error);
      throw error;
    }
  }

  /**
   * Get specific cell value from Excel
   */
  async getCellValue(fileId: string, sheetName: string, cellAddress: string): Promise<any> {
    try {
      const response = await this.client
        .api(`/me/drive/items/${fileId}/workbook/worksheets/${sheetName}/range(address='${cellAddress}')`)
        .get();
      
      return response.values[0][0];
    } catch (error) {
      console.error("Error getting cell value:", error);
      throw error;
    }
  }
}

/**
 * OAuth 2.0 authorization URL for Microsoft
 */
export function getMicrosoftAuthUrl(redirectUri: string): string {
  const scopes = [
    "Files.Read",
    "Files.Read.All",
    "offline_access",
  ];

  const params = new URLSearchParams({
    client_id: ENV.microsoftClientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    response_mode: "query",
  });

  return `https://login.microsoftonline.com/${ENV.microsoftTenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getMicrosoftAccessToken(code: string, redirectUri: string): Promise<any> {
  const params = new URLSearchParams({
    client_id: ENV.microsoftClientId,
    client_secret: ENV.microsoftClientSecret,
    code: code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${ENV.microsoftTenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshMicrosoftAccessToken(refreshToken: string): Promise<any> {
  const params = new URLSearchParams({
    client_id: ENV.microsoftClientId,
    client_secret: ENV.microsoftClientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${ENV.microsoftTenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return response.json();
}
