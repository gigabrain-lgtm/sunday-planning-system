import * as fs from 'fs';
import * as path from 'path';

export interface Agency {
  id: string;
  name: string;
  slackChannel: string;
  logo: string;
  teamSize: number;
  department?: string;
}

const ORG_CHART_PATH = path.join(__dirname, '../client/src/data/orgChart.ts');

/**
 * Read the org chart file and parse it
 */
function readOrgChart(): any {
  try {
    const content = fs.readFileSync(ORG_CHART_PATH, 'utf-8');
    // Extract the orgChartData object using regex
    const match = content.match(/export const orgChartData = ({[\s\S]*?});/);
    if (!match) {
      throw new Error('Could not find orgChartData in file');
    }
    // Use eval to parse the object (in a real production app, use a proper parser)
    const orgChartData = eval(`(${match[1]})`);
    return orgChartData;
  } catch (error) {
    console.error('[Agencies] Error reading org chart:', error);
    throw error;
  }
}

/**
 * Write the org chart file
 */
function writeOrgChart(data: any): void {
  try {
    const content = `// Organization Chart Data
export const orgChartData = ${JSON.stringify(data, null, 2)};

export interface Agency {
  id: string;
  name: string;
  slackChannel: string;
  logo: string;
  teamSize: number;
}

export interface Department {
  name: string;
  agencies: Agency[];
}

export interface Service {
  id: string;
  name: string;
  slackChannel: string;
  logo: string;
  teamSize: number;
}

export function getAllAgencies(): Agency[] {
  const agencies: Agency[] = [];
  orgChartData.departments.forEach((dept: Department) => {
    agencies.push(...dept.agencies);
  });
  return agencies;
}

export function getAgencyById(id: string): Agency | undefined {
  return getAllAgencies().find(agency => agency.id === id);
}

export function getAgencyByName(name: string): Agency | undefined {
  return getAllAgencies().find(agency => 
    agency.name.toLowerCase() === name.toLowerCase()
  );
}
`;
    fs.writeFileSync(ORG_CHART_PATH, content, 'utf-8');
  } catch (error) {
    console.error('[Agencies] Error writing org chart:', error);
    throw error;
  }
}

/**
 * Get all agencies
 */
export function getAllAgencies(): Agency[] {
  try {
    const data = readOrgChart();
    const agencies: Agency[] = [];
    data.departments.forEach((dept: any) => {
      dept.agencies.forEach((agency: any) => {
        agencies.push({
          ...agency,
          department: dept.name,
        });
      });
    });
    return agencies;
  } catch (error) {
    console.error('[Agencies] Error getting all agencies:', error);
    return [];
  }
}

/**
 * Create a new agency
 */
export function createAgency(input: {
  name: string;
  slackChannel: string;
  department: string;
  logo?: string;
  teamSize?: number;
}): Agency {
  try {
    const data = readOrgChart();
    
    // Generate ID from name
    const id = input.name.toLowerCase().replace(/\s+/g, '-');
    
    // Find the department
    const dept = data.departments.find((d: any) => d.name === input.department);
    if (!dept) {
      throw new Error(`Department "${input.department}" not found`);
    }
    
    // Check if agency already exists
    const exists = dept.agencies.some((a: any) => a.id === id);
    if (exists) {
      throw new Error(`Agency with ID "${id}" already exists`);
    }
    
    // Create new agency
    const newAgency: Agency = {
      id,
      name: input.name,
      slackChannel: input.slackChannel,
      logo: input.logo || '',
      teamSize: input.teamSize || 1,
    };
    
    // Add to department
    dept.agencies.push(newAgency);
    
    // Write back to file
    writeOrgChart(data);
    
    return { ...newAgency, department: input.department };
  } catch (error) {
    console.error('[Agencies] Error creating agency:', error);
    throw error;
  }
}

/**
 * Update an existing agency
 */
export function updateAgency(input: {
  id: string;
  name?: string;
  slackChannel?: string;
  logo?: string;
  teamSize?: number;
}): Agency {
  try {
    const data = readOrgChart();
    
    // Find the agency in any department
    let found = false;
    let updatedAgency: Agency | null = null;
    let deptName = '';
    
    for (const dept of data.departments) {
      const agencyIndex = dept.agencies.findIndex((a: any) => a.id === input.id);
      if (agencyIndex !== -1) {
        const agency = dept.agencies[agencyIndex];
        
        // Update fields
        if (input.name !== undefined) agency.name = input.name;
        if (input.slackChannel !== undefined) agency.slackChannel = input.slackChannel;
        if (input.logo !== undefined) agency.logo = input.logo;
        if (input.teamSize !== undefined) agency.teamSize = input.teamSize;
        
        updatedAgency = { ...agency, department: dept.name };
        deptName = dept.name;
        found = true;
        break;
      }
    }
    
    if (!found) {
      throw new Error(`Agency with ID "${input.id}" not found`);
    }
    
    // Write back to file
    writeOrgChart(data);
    
    return updatedAgency!;
  } catch (error) {
    console.error('[Agencies] Error updating agency:', error);
    throw error;
  }
}

/**
 * Delete an agency
 */
export function deleteAgency(id: string): void {
  try {
    const data = readOrgChart();
    
    // Find and remove the agency from any department
    let found = false;
    
    for (const dept of data.departments) {
      const agencyIndex = dept.agencies.findIndex((a: any) => a.id === id);
      if (agencyIndex !== -1) {
        dept.agencies.splice(agencyIndex, 1);
        found = true;
        break;
      }
    }
    
    if (!found) {
      throw new Error(`Agency with ID "${id}" not found`);
    }
    
    // Write back to file
    writeOrgChart(data);
  } catch (error) {
    console.error('[Agencies] Error deleting agency:', error);
    throw error;
  }
}
