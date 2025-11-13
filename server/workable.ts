import { ENV } from './_core/env';
import { cache } from './cache';

const WORKABLE_API_BASE = 'https://gigabrands.workable.com/spi/v3';
const WORKABLE_API_KEY = process.env.WORKABLE_API_KEY;

interface WorkableCandidate {
  id: string;
  name: string;
  email: string;
  job: {
    id: string;
    title: string;
    shortcode: string;
  };
  stage: string;
  sourced: boolean;
  created_at: string;
  profile_url?: string; // Workable backend profile URL
}

interface WorkableJob {
  id: string;
  title: string;
  shortcode: string;
  state: string;
}

/**
 * Fetch all jobs from Workable
 */
export async function fetchWorkableJobs(): Promise<WorkableJob[]> {
  if (!WORKABLE_API_KEY) {
    throw new Error('WORKABLE_API_KEY not configured');
  }

  const response = await fetch(`${WORKABLE_API_BASE}/jobs`, {
    headers: {
      'Authorization': `Bearer ${WORKABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Workable API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.jobs || [];
}

/**
 * Fetch candidates for a specific job
 */
export async function fetchAllWorkableCandidates(useCache: boolean = true): Promise<WorkableCandidate[]> {
  const cacheKey = 'workable:all_candidates';
  const cacheFile = '/tmp/workable_candidates_cache.json';
  
  // Try to get from file cache first
  if (useCache) {
    try {
      const fs = await import('fs/promises');
      const fileData = await fs.readFile(cacheFile, 'utf-8');
      const cached = JSON.parse(fileData);
      console.log(`[Workable] Using file-cached candidate data (${cached.length} candidates)`);
      // Also populate in-memory cache
      cache.set(cacheKey, cached, 3600);
      return cached;
    } catch (err) {
      console.log('[Workable] No file cache found, will fetch from API');
    }
  }
  
  console.log('[Workable] Fetching fresh candidate data from API');
  
  if (!WORKABLE_API_KEY) {
    throw new Error('WORKABLE_API_KEY not configured');
  }

  let allCandidates: WorkableCandidate[] = [];
  let nextUrl: string | null = `${WORKABLE_API_BASE}/candidates?limit=100`;

  // Paginate through all candidates
  while (nextUrl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for large datasets
    
    try {
      const response: Response = await fetch(nextUrl, {
        headers: {
          'Authorization': `Bearer ${WORKABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Workable API error: ${response.statusText} - ${errorText}`);
      }

      const data: any = await response.json();
      allCandidates = allCandidates.concat(data.candidates || []);
      nextUrl = data.paging?.next || null;
      
      console.log(`[Workable] Fetched ${allCandidates.length} candidates so far...`);
      
      // Add 2 second delay between pagination requests to avoid rate limiting
      if (nextUrl) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Workable API request timed out after 30 seconds');
      }
      throw error;
    }
  }
  
  // Save to both in-memory and file cache
  cache.set(cacheKey, allCandidates, 3600);
  
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(cacheFile, JSON.stringify(allCandidates), 'utf-8');
    console.log(`[Workable] Cached ${allCandidates.length} candidates to file and memory`);
  } catch (err) {
    console.error('[Workable] Failed to write file cache:', err);
  }

  return allCandidates;
}

/**
 * Map Workable stage names to our standardized stages
 */
export function mapWorkableStage(workableStage: string): string {
  const stageMap: Record<string, string> = {
    'Applied': 'applied',
    'Processing': 'ci_passed', // Map Processing to CI Passed stage
    'CI Passed': 'ci_passed',
    'Screening Call': 'screening_call',
    'HR Interview': 'hr_interview',
    'HR Interview Conducted': 'hr_conducted',
    'Hiring Manager Feedback': 'hr_passed',
    'Hiring Manager Interview': 'hiring_manager',
    'CEO Review': 'ceo_review',
  };

  return stageMap[workableStage] || workableStage.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Determine if candidate is from LinkedIn Ads or Headhunting
 */
export function getCandidateSource(candidate: WorkableCandidate): 'linkedin_ads' | 'headhunting' {
  // If sourced flag is true, it's headhunting
  // Otherwise, it's from LinkedIn ads (applied)
  return candidate.sourced ? 'headhunting' : 'linkedin_ads';
}

/**
 * Sync candidates from Workable and calculate metrics
 * Now uses job title mappings to support multiple Workable jobs per role
 */
/**
 * Sync all Workable jobs and calculate metrics for each job
 * Returns job-level metrics without requiring role mappings
 */
export async function syncAllWorkableJobs(forceRefresh: boolean = false) {
  const jobs = await fetchWorkableJobs();
  const allCandidates = await fetchAllWorkableCandidates(!forceRefresh);
  
  const jobMetrics = [];
  
  for (const job of jobs) {
    const candidates = allCandidates.filter(c => c.job.shortcode === job.shortcode);
    
    // Group candidates by source and stage
    const metrics: Record<string, Record<string, number>> = {
      linkedin_ads: {},
      headhunting: {},
    };
    
    for (const candidate of candidates) {
      const source = getCandidateSource(candidate);
      const stage = mapWorkableStage(candidate.stage);
      
      if (!metrics[source][stage]) {
        metrics[source][stage] = 0;
      }
      metrics[source][stage]++;
    }
    
    jobMetrics.push({
      jobId: job.id,
      jobTitle: job.title,
      jobShortcode: job.shortcode,
      jobState: job.state,
      metrics,
      totalCandidates: candidates.length,
    });
  }
  
  return jobMetrics;
}

/**
 * Fetch all candidates in CEO Review stage with their Workable profile URLs
 */
export async function fetchCEOReviewCandidates(forceRefresh: boolean = false) {
  // ALWAYS use cache - Recruitment Funnel is responsible for populating it
  // This ensures we never make duplicate API calls
  const allCandidates = await fetchAllWorkableCandidates(true); // true = use cache
  
  console.log(`[CEO Review] Total candidates in cache: ${allCandidates.length}`);
  console.log(`[CEO Review] Unique stages:`, Array.from(new Set(allCandidates.map(c => c.stage))));
  console.log(`[CEO Review] Brand Manager candidates:`, allCandidates.filter(c => c.job.title.includes('Brand Manager')).map(c => ({ name: c.name, stage: c.stage })));
  
  // Filter for CEO Review stage
  const ceoReviewCandidates = allCandidates.filter(c => c.stage === 'CEO Review');
  console.log(`[CEO Review] Found ${ceoReviewCandidates.length} candidates in CEO Review stage`);
  console.log(`[CEO Review] CEO Review candidates:`, ceoReviewCandidates.map(c => ({ name: c.name, jobTitle: c.job.title })));
  
  // Get all roles with interviewer data
  const { getAllRoles } = await import('./db');
  const roles = await getAllRoles();
  
  // Create a map of role names to interviewer data
  const roleMap = new Map(roles.map(r => [r.roleName.toLowerCase(), r]));
  
  // Format with Workable profile URLs and interviewer data
  return ceoReviewCandidates.map(candidate => {
    // Try to match candidate job title to a role
    const role = roleMap.get(candidate.job.title.toLowerCase());
    
    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      jobTitle: candidate.job.title,
      jobShortcode: candidate.job.shortcode,
      source: getCandidateSource(candidate),
      createdAt: candidate.created_at,
      // Use profile_url from Workable API if available, otherwise construct it
      workableUrl: candidate.profile_url || `https://gigabrands.workable.com/backend/candidates/db/profile/${candidate.id}`,
      // Add interviewer data from role
      technicalInterviewer: role?.technicalInterviewer || null,
      finalInterviewer: role?.finalInterviewer || null,
    };
  });
}

export async function syncWorkableMetrics(roleId: number, mappedJobTitles: string[], forceRefresh: boolean = false) {
  const jobs = await fetchWorkableJobs();
  const allCandidates = await fetchAllWorkableCandidates(!forceRefresh);
  
  // Find all matching Workable jobs from mappings
  const matchingJobs = jobs.filter(j => 
    mappedJobTitles.some(title => j.title.toLowerCase() === title.toLowerCase())
  );

  if (matchingJobs.length === 0) {
    console.warn(`No Workable jobs found for role ${roleId} with mappings:`, mappedJobTitles);
    return null;
  }

  // Get candidates from all mapped jobs
  const jobShortcodes = matchingJobs.map(j => j.shortcode);
  const candidates = allCandidates.filter(c => jobShortcodes.includes(c.job.shortcode));

  // Group candidates by source and stage
  const metrics: Record<string, Record<string, number>> = {
    linkedin_ads: {},
    headhunting: {},
  };

  for (const candidate of candidates) {
    const source = getCandidateSource(candidate);
    const stage = mapWorkableStage(candidate.stage);

    if (!metrics[source][stage]) {
      metrics[source][stage] = 0;
    }
    metrics[source][stage]++;
  }

  return {
    jobTitles: matchingJobs.map(j => j.title),
    metrics,
    totalCandidates: candidates.length,
  };
}

/**
 * Move a candidate to a different stage in Workable
 * @param candidateId - The candidate's Workable ID
 * @param targetStage - The target stage slug (e.g., "set_interview", "hired")
 * @param memberId - The member ID performing the move (optional, will use a default if not provided)
 */
export async function moveCandidateToStage(
  candidateId: string,
  targetStage: string,
  memberId?: string
): Promise<void> {
  if (!WORKABLE_API_KEY) {
    throw new Error('WORKABLE_API_KEY not configured');
  }

  // Use a default member ID if not provided (you may need to update this)
  const memberIdToUse = memberId || 'default_member_id';

  const response = await fetch(
    `${WORKABLE_API_BASE}/candidates/${candidateId}/move`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORKABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_id: memberIdToUse,
        target_stage: targetStage,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to move candidate: ${response.statusText} - ${errorText}`);
  }
}

/**
 * Update tags for a candidate in Workable
 * @param candidateId - The candidate's Workable ID
 * @param tags - Array of tag names to assign to the candidate
 */
export async function updateCandidateTags(
  candidateId: string,
  tags: string[]
): Promise<void> {
  if (!WORKABLE_API_KEY) {
    throw new Error('WORKABLE_API_KEY not configured');
  }

  const response = await fetch(
    `${WORKABLE_API_BASE}/candidates/${candidateId}/tags`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${WORKABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update candidate tags: ${response.statusText} - ${errorText}`);
  }
}

/**
 * Move candidate to Set Interview stage and tag with interviewer name
 * @param candidateId - The candidate's Workable ID
 * @param interviewerName - Name of the interviewer to tag
 * @param memberId - Optional member ID performing the action
 */
export async function scheduleInterviewWithTag(
  candidateId: string,
  interviewerName: string,
  memberId?: string
): Promise<void> {
  // First, move the candidate to "Set Interview" stage
  // Note: The exact stage slug may need to be adjusted based on your Workable setup
  await moveCandidateToStage(candidateId, 'set_interview', memberId);
  
  // Then, add the interviewer name as a tag
  await updateCandidateTags(candidateId, [interviewerName]);
}

/**
 * Fetch candidate activities (including comments) from Workable API
 * @param candidateId - The candidate's Workable ID
 * @param actionsFilter - Optional filter for specific action types (e.g., 'comment')
 */
export async function fetchCandidateActivities(
  candidateId: string,
  actionsFilter?: string
): Promise<any[]> {
  if (!WORKABLE_API_KEY) {
    throw new Error('WORKABLE_API_KEY not configured');
  }

  const url = new URL(`${WORKABLE_API_BASE}/candidates/${candidateId}/activities`);
  if (actionsFilter) {
    url.searchParams.append('actions', actionsFilter);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${WORKABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch candidate activities: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.activities || [];
}

/**
 * Fetch candidate comments from Workable API
 * @param candidateId - The candidate's Workable ID
 */
export async function fetchCandidateComments(candidateId: string) {
  const activities = await fetchCandidateActivities(candidateId, 'comment');
  
  return activities.map((activity) => ({
    id: activity.id || `${activity.created_at}-${activity.member?.id}`,
    body: activity.body || '',
    author: activity.member?.name || 'Unknown',
    createdAt: activity.created_at || new Date().toISOString(),
  }));
}

/**
 * Fetch full candidate details including resume URL
 * @param candidateId - The candidate's Workable ID
 */
export async function fetchCandidateDetails(candidateId: string) {
  if (!WORKABLE_API_KEY) {
    throw new Error('WORKABLE_API_KEY not configured');
  }

  const response = await fetch(
    `${WORKABLE_API_BASE}/candidates/${candidateId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WORKABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch candidate details: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    resumeUrl: data.resume_url,
    coverLetter: data.cover_letter,
    headline: data.headline,
    summary: data.summary,
  };
}
