import { ENV } from "./_core/env";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

interface ManifestationRecord {
  "Week Of": string;
  Spiritual?: number;
  Social?: number;
  Relationship?: number;
  Status?: number;
  Team?: number;
  Business?: number;
  Travel?: number;
  Environment?: number;
  Family?: number;
  Skills?: number;
  Health?: number;
  Affirmations?: number;
  "Spiritual Current State"?: string;
  "Social Current State"?: string;
  "Relationship Current State"?: string;
  "Status Current State"?: string;
  "Team Current State"?: string;
  "Business Current State"?: string;
  "Travel Current State"?: string;
  "Environment Current State"?: string;
  "Family Current State"?: string;
  "Skills Current State"?: string;
  "Health Current State"?: string;
  "Affirmations Current State"?: string;
}

export async function saveManifestationToAirtable(data: ManifestationRecord) {
  const response = await fetch(
    `${AIRTABLE_API_URL}/${ENV.airtableBaseId}/${ENV.airtableManifestationsTable}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: data,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${error}`);
  }

  return response.json();
}

export async function getLatestManifestation(): Promise<ManifestationRecord | null> {
  const response = await fetch(
    `${AIRTABLE_API_URL}/${ENV.airtableBaseId}/${ENV.airtableManifestationsTable}?maxRecords=1&sort%5B0%5D%5Bfield%5D=Week%20Of&sort%5B0%5D%5Bdirection%5D=desc`,
    {
      headers: {
        Authorization: `Bearer ${ENV.airtableApiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch from Airtable");
  }

  const data = await response.json();
  if (data.records && data.records.length > 0) {
    return data.records[0].fields as ManifestationRecord;
  }

  return null;
}

