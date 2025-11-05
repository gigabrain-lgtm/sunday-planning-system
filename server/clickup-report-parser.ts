/**
 * ClickUp Weekly Report Parser
 * Extracts metrics from weekly meeting reports
 */

export interface ParsedWeeklyReport {
  weekStartDate: string;
  totalMeetings: number;
  showRate: number;
  discoveryCalls: number;
  secondMeetings: number;
  closedWon: number;
  revenueGenerated: number;
  pendingRevenue: number;
  conversionDiscoveryToSecond: number;
  conversionSecondToClose: number;
  activeProspects: number;
  rawReportText: string;
}

/**
 * Parse a ClickUp weekly report text
 * @param reportText - The full text of the weekly report
 * @param weekStartDate - The Monday of the week this report covers (YYYY-MM-DD)
 * @returns Parsed metrics object
 */
export function parseClickUpWeeklyReport(
  reportText: string,
  weekStartDate: string
): ParsedWeeklyReport {
  // Helper to extract number from pattern
  const extractNumber = (pattern: RegExp): number => {
    const match = reportText.match(pattern);
    if (!match || !match[1]) return 0;
    return parseFloat(match[1].replace(/,/g, ''));
  };

  // Extract metrics using regex patterns
  const totalMeetings = extractNumber(/Total Meetings:\s*(\d+)/i);
  const showRate = extractNumber(/Show Rate:.*?(\d+(?:\.\d+)?)%/i);
  const discoveryCalls = extractNumber(/Discovery Calls:\s*(\d+)/i);
  const secondMeetings = extractNumber(/Second Meetings:\s*(\d+)/i);
  const closedWon = extractNumber(/Closed Won:\s*(\d+)/i);
  const revenueGenerated = extractNumber(/Revenue Generated:\s*\$?([\d,]+(?:\.\d+)?)/i);
  const pendingRevenue = extractNumber(/Pending Revenue:\s*\$?([\d,]+(?:\.\d+)?)/i);
  const activeProspects = extractNumber(/Active Prospects:\s*(\d+)/i);

  // Extract conversion rates
  const conversionDiscoveryToSecond = extractNumber(/Discovery.*?Second Meeting:\s*(\d+(?:\.\d+)?)%/i);
  const conversionSecondToClose = extractNumber(/Second Meeting.*?Closed Won:\s*(\d+(?:\.\d+)?)%/i);

  return {
    weekStartDate,
    totalMeetings,
    showRate,
    discoveryCalls,
    secondMeetings,
    closedWon,
    revenueGenerated,
    pendingRevenue,
    conversionDiscoveryToSecond,
    conversionSecondToClose,
    activeProspects,
    rawReportText: reportText,
  };
}

/**
 * Get the Monday of the current week
 */
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Validate that a parsed report has reasonable data
 */
export function validateParsedReport(report: ParsedWeeklyReport): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (report.totalMeetings < 0) {
    errors.push('Total meetings cannot be negative');
  }

  if (report.showRate < 0 || report.showRate > 100) {
    errors.push('Show rate must be between 0 and 100');
  }

  if (report.discoveryCalls < 0) {
    errors.push('Discovery calls cannot be negative');
  }

  if (report.revenueGenerated < 0) {
    errors.push('Revenue generated cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Example usage and test
 */
export function testParser() {
  const sampleReport = `
Weekly Meeting Report
Total Meetings: 26
Performance Metrics
Sales Hours This Week: 4.5 hours
Show Rate: 35% (9/26)
No Shows: 0 of 26
Cancelled: 5 of 26
Unknown Status: 12 of 26
Call Type Breakdown
Discovery Calls: 20
Second Meetings: 4
Pending Decisions: 1
Follow-up/Rebooks: 0
Scheduled Calls This Week
Total Scheduled: 36
Scheduled Call Breakdown
Discovery Calls: 29
Second Meetings: 6
Pending Decisions: 1
Follow-up/Rebooks: 0
Pipeline Analytics
Current Pipeline Health
Active Prospects: 22 total
Discovery Calls: 14
Second Meetings: 7
Pending Decisions: 1
Conversion Rates
Discovery → Second Meeting: 33%
Second Meeting → Pending Decision: 13%
Second Meeting → Closed Won: 0% (0/8)
Pending Decision → Closed Won: 0%
Overall Win Rate: 0% (0 won, 0 lost)
Deal Results This Period
Closed Won: 0 deals
Average Time to Close: 0 days
Revenue Generated: $0
Pending Revenue: $6,500
Lost Deals: 0
Unqualified/Not Fit: 3
Nurturing: 0
  `;

  const parsed = parseClickUpWeeklyReport(sampleReport, getCurrentWeekMonday());
  const validation = validateParsedReport(parsed);

  return {
    parsed,
    validation,
  };
}
