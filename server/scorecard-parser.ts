/**
 * Parse scorecard data from Excel worksheet
 * 
 * Expected format:
 * - Scorecard sheet: Metrics in rows, months in columns
 * - Sales projection sheet: Revenue projections and targets
 */

interface ScorecardData {
  overall: {
    netProfit: number;
    churnRateNumber: number;
    churnRateDollar: number;
  };
  marketing: {
    qualifiedLeadsEmail: number;
    qualifiedLeadsMQL: number;
    qualifiedLeadsSQL: number;
    totalLeads: number;
    adSpend: number;
    costPerLead: number;
  };
  sales: {
    netMRR: number;
    newMRRCashCollected: number;
    newMRRClosed: number;
    newOneTimeServiceCash: number;
    closedDeals: number;
  };
  fulfillment: {
    revenuePerStrategist: number;
    effectiveChurnDollar: number;
    effectiveChurnRateNumber: number;
    effectiveChurnRateDollar: number;
    notifiedChurnDollar: number;
    notifiedChurnNumber: number;
  };
  salesProjection: {
    currentMonth: number;
    targetRevenue: number;
    newClientsNeeded: number;
    clientsChurn: number;
    qualifiedMeetingsRequired: number;
    conversionRate: number;
    averageSaleValue: number;
  };
  month: string;
  fetchedAt: Date;
}

export function parseScorecardData(
  scorecardWorksheet: any,
  salesProjectionWorksheet: any
): ScorecardData {
  const scorecard = scorecardWorksheet.values;
  const salesProj = salesProjectionWorksheet.values;
  
  // Find the most recent month column (rightmost with data)
  const monthRowIndex = 2; // Row 3 (0-indexed)
  const monthRow = scorecard[monthRowIndex];
  
  // Find last non-empty column
  let lastMonthCol = monthRow.length - 1;
  while (lastMonthCol > 0 && !monthRow[lastMonthCol]) {
    lastMonthCol--;
  }
  
  const currentMonth = monthRow[lastMonthCol];
  
  // Helper function to find row by label
  const findRowValue = (label: string, colIndex: number): any => {
    for (let i = 0; i < scorecard.length; i++) {
      const row = scorecard[i];
      if (row[0] && row[0].toString().includes(label)) {
        return row[colIndex] || 0;
      }
    }
    return 0;
  };
  
  // Parse Overall section
  const overall = {
    netProfit: parseFloat(findRowValue("Net profit", lastMonthCol)) || 0,
    churnRateNumber: parseFloat(findRowValue("Churn % (#)", lastMonthCol)) || 0,
    churnRateDollar: parseFloat(findRowValue("Churn % ($)", lastMonthCol)) || 0,
  };
  
  // Parse Marketing section
  const marketing = {
    qualifiedLeadsEmail: parseInt(findRowValue("Qualified leads from Email", lastMonthCol)) || 0,
    qualifiedLeadsMQL: parseInt(findRowValue("Qualified leads from Ads (MQL)", lastMonthCol)) || 0,
    qualifiedLeadsSQL: parseInt(findRowValue("Qualified leads from Ads (SQL)", lastMonthCol)) || 0,
    totalLeads: parseInt(findRowValue("Total leads", lastMonthCol)) || 0,
    adSpend: parseFloat(findRowValue("Ad Spend", lastMonthCol)) || 0,
    costPerLead: parseFloat(findRowValue("Ad Cost per Qualified Lead", lastMonthCol)) || 0,
  };
  
  // Parse Sales section
  const sales = {
    netMRR: parseFloat(findRowValue("Net MRR", lastMonthCol)) || 0,
    newMRRCashCollected: parseFloat(findRowValue("New MRR Cash Collected", lastMonthCol)) || 0,
    newMRRClosed: parseFloat(findRowValue("New MRR Closed", lastMonthCol)) || 0,
    newOneTimeServiceCash: parseFloat(findRowValue("New One Time Service Cash Collected", lastMonthCol)) || 0,
    closedDeals: parseInt(findRowValue("Closed deals signed", lastMonthCol)) || 0,
  };
  
  // Parse Fulfillment section
  const fulfillment = {
    revenuePerStrategist: parseFloat(findRowValue("Revenue per strategist", lastMonthCol)) || 0,
    effectiveChurnDollar: parseFloat(findRowValue("Effective Churn $", lastMonthCol)) || 0,
    effectiveChurnRateNumber: parseFloat(findRowValue("Effective Churn % (#)", lastMonthCol)) || 0,
    effectiveChurnRateDollar: parseFloat(findRowValue("Effective Churn % ($)", lastMonthCol)) || 0,
    notifiedChurnDollar: parseFloat(findRowValue("Notified Churn $", lastMonthCol)) || 0,
    notifiedChurnNumber: parseInt(findRowValue("Notified Churn (#)", lastMonthCol)) || 0,
  };
  
  // Parse Sales Projection section
  const findSalesProjValue = (label: string, colIndex: number = 1): any => {
    for (let i = 0; i < salesProj.length; i++) {
      const row = salesProj[i];
      if (row[0] && row[0].toString().includes(label)) {
        return row[colIndex] || 0;
      }
    }
    return 0;
  };
  
  const salesProjection = {
    currentMonth: parseFloat(findSalesProjValue("Current Month", 1)) || 0,
    targetRevenue: parseFloat(findSalesProjValue("Target revenue in next january", 1)) || 0,
    newClientsNeeded: parseInt(findSalesProjValue("Number of new clients to add", 3)) || 0, // Oct column
    clientsChurn: parseInt(findSalesProjValue("Clients churned", 3)) || 0,
    qualifiedMeetingsRequired: parseInt(findSalesProjValue("Qualified Meetings Required", 3)) || 0,
    conversionRate: parseFloat(findSalesProjValue("Percentage Conversion from Qualified Meeting to Close", 1)) || 0,
    averageSaleValue: parseFloat(findSalesProjValue("Average sales value", 1)) || 0,
  };
  
  return {
    overall,
    marketing,
    sales,
    fulfillment,
    salesProjection,
    month: currentMonth,
    fetchedAt: new Date(),
  };
}
