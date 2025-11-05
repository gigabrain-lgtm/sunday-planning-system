/**
 * OKR Database Operations
 * Handles all database interactions for the OKR system
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { ParsedWeeklyReport } from './clickup-report-parser';

export interface SalesUpdate {
  weekStartDate: string;
  qualifiedLeads?: number;
  lostClients?: number;
  churnReason?: string;
  newDeals?: number;
  newDealValue?: number;
  notes?: string;
  updatedBy?: number;
}

export interface FinanceUpdate {
  month: string;
  newMRR?: number;
  churnedMRR?: number;
  monthEndCloseDays?: number;
  expenseTrackingCoverage?: number;
  notes?: string;
  updatedBy?: number;
}

export interface OKRProgress {
  keyResultId: string;
  date: string;
  currentValue?: number;
  targetValue?: number;
  confidence?: number;
  notes?: string;
  dataSource?: string;
}

export interface ConfidenceUpdate {
  keyResultId: string;
  confidence: number;
  notes?: string;
  updatedBy?: number;
}

/**
 * Save a ClickUp weekly report to the database
 */
export async function saveClickUpWeeklyReport(report: ParsedWeeklyReport): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    INSERT INTO clickup_weekly_reports (
      week_start_date,
      total_meetings,
      show_rate,
      discovery_calls,
      second_meetings,
      closed_won,
      revenue_generated,
      pending_revenue,
      conversion_discovery_to_second,
      conversion_second_to_close,
      active_prospects,
      raw_report_text
    ) VALUES (
      ${report.weekStartDate},
      ${report.totalMeetings},
      ${report.showRate},
      ${report.discoveryCalls},
      ${report.secondMeetings},
      ${report.closedWon},
      ${report.revenueGenerated},
      ${report.pendingRevenue},
      ${report.conversionDiscoveryToSecond},
      ${report.conversionSecondToClose},
      ${report.activeProspects},
      ${report.rawReportText}
    )
    ON CONFLICT (week_start_date) 
    DO UPDATE SET
      total_meetings = EXCLUDED.total_meetings,
      show_rate = EXCLUDED.show_rate,
      discovery_calls = EXCLUDED.discovery_calls,
      second_meetings = EXCLUDED.second_meetings,
      closed_won = EXCLUDED.closed_won,
      revenue_generated = EXCLUDED.revenue_generated,
      pending_revenue = EXCLUDED.pending_revenue,
      conversion_discovery_to_second = EXCLUDED.conversion_discovery_to_second,
      conversion_second_to_close = EXCLUDED.conversion_second_to_close,
      active_prospects = EXCLUDED.active_prospects,
      raw_report_text = EXCLUDED.raw_report_text
  `);
}

/**
 * Get the latest ClickUp weekly report
 */
export async function getLatestClickUpReport(): Promise<ParsedWeeklyReport | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT * FROM clickup_weekly_reports
    ORDER BY week_start_date DESC
    LIMIT 1
  `);

  if (!result.rows || result.rows.length === 0) return null;

  const row = result.rows[0] as any;
  return {
    weekStartDate: row.week_start_date,
    totalMeetings: row.total_meetings,
    showRate: parseFloat(row.show_rate),
    discoveryCalls: row.discovery_calls,
    secondMeetings: row.second_meetings,
    closedWon: row.closed_won,
    revenueGenerated: parseFloat(row.revenue_generated),
    pendingRevenue: parseFloat(row.pending_revenue),
    conversionDiscoveryToSecond: parseFloat(row.conversion_discovery_to_second),
    conversionSecondToClose: parseFloat(row.conversion_second_to_close),
    activeProspects: row.active_prospects,
    rawReportText: row.raw_report_text,
  };
}

/**
 * Save a sales team update
 */
export async function saveSalesUpdate(update: SalesUpdate): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    INSERT INTO sales_updates (
      week_start_date,
      qualified_leads,
      lost_clients,
      churn_reason,
      new_deals,
      new_deal_value,
      notes,
      updated_by
    ) VALUES (
      ${update.weekStartDate},
      ${update.qualifiedLeads},
      ${update.lostClients},
      ${update.churnReason},
      ${update.newDeals},
      ${update.newDealValue},
      ${update.notes},
      ${update.updatedBy}
    )
    ON CONFLICT (week_start_date)
    DO UPDATE SET
      qualified_leads = EXCLUDED.qualified_leads,
      lost_clients = EXCLUDED.lost_clients,
      churn_reason = EXCLUDED.churn_reason,
      new_deals = EXCLUDED.new_deals,
      new_deal_value = EXCLUDED.new_deal_value,
      notes = EXCLUDED.notes,
      updated_by = EXCLUDED.updated_by,
      updated_at = NOW()
  `);
}

/**
 * Get sales updates for a specific month
 */
export async function getSalesUpdatesForMonth(month: string): Promise<SalesUpdate[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM sales_updates
    WHERE DATE_TRUNC('month', week_start_date) = ${month}::date
    ORDER BY week_start_date DESC
  `);

  return (result.rows || []).map((row: any) => ({
    weekStartDate: row.week_start_date,
    qualifiedLeads: row.qualified_leads,
    lostClients: row.lost_clients,
    churnReason: row.churn_reason,
    newDeals: row.new_deals,
    newDealValue: parseFloat(row.new_deal_value || 0),
    notes: row.notes,
    updatedBy: row.updated_by,
  }));
}

/**
 * Save a finance update
 */
export async function saveFinanceUpdate(update: FinanceUpdate): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    INSERT INTO finance_updates (
      month,
      new_mrr,
      churned_mrr,
      month_end_close_days,
      expense_tracking_coverage,
      notes,
      updated_by
    ) VALUES (
      ${update.month},
      ${update.newMRR},
      ${update.churnedMRR},
      ${update.monthEndCloseDays},
      ${update.expenseTrackingCoverage},
      ${update.notes},
      ${update.updatedBy}
    )
    ON CONFLICT (month)
    DO UPDATE SET
      new_mrr = EXCLUDED.new_mrr,
      churned_mrr = EXCLUDED.churned_mrr,
      month_end_close_days = EXCLUDED.month_end_close_days,
      expense_tracking_coverage = EXCLUDED.expense_tracking_coverage,
      notes = EXCLUDED.notes,
      updated_by = EXCLUDED.updated_by,
      updated_at = NOW()
  `);
}

/**
 * Get the latest finance update
 */
export async function getLatestFinanceUpdate(): Promise<FinanceUpdate | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT * FROM finance_updates
    ORDER BY month DESC
    LIMIT 1
  `);

  if (!result.rows || result.rows.length === 0) return null;

  const row = result.rows[0] as any;
  return {
    month: row.month,
    newMRR: parseFloat(row.new_mrr || 0),
    churnedMRR: parseFloat(row.churned_mrr || 0),
    monthEndCloseDays: row.month_end_close_days,
    expenseTrackingCoverage: parseFloat(row.expense_tracking_coverage || 0),
    notes: row.notes,
    updatedBy: row.updated_by,
  };
}

/**
 * Save OKR progress snapshot
 */
export async function saveOKRProgress(progress: OKRProgress): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    INSERT INTO okr_progress (
      key_result_id,
      date,
      current_value,
      target_value,
      confidence,
      notes,
      data_source
    ) VALUES (
      ${progress.keyResultId},
      ${progress.date},
      ${progress.currentValue},
      ${progress.targetValue},
      ${progress.confidence},
      ${progress.notes},
      ${progress.dataSource || 'manual'}
    )
  `);
}

/**
 * Get latest progress for a Key Result
 */
export async function getLatestOKRProgress(keyResultId: string): Promise<OKRProgress | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT * FROM okr_progress
    WHERE key_result_id = ${keyResultId}
    ORDER BY date DESC
    LIMIT 1
  `);

  if (!result.rows || result.rows.length === 0) return null;

  const row = result.rows[0] as any;
  return {
    keyResultId: row.key_result_id,
    date: row.date,
    currentValue: parseFloat(row.current_value || 0),
    targetValue: parseFloat(row.target_value || 0),
    confidence: row.confidence,
    notes: row.notes,
    dataSource: row.data_source,
  };
}

/**
 * Update confidence level for a Key Result
 */
export async function updateConfidence(update: ConfidenceUpdate): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Save to confidence log
  await db.execute(sql`
    INSERT INTO okr_confidence_log (
      key_result_id,
      confidence,
      notes,
      updated_by
    ) VALUES (
      ${update.keyResultId},
      ${update.confidence},
      ${update.notes},
      ${update.updatedBy}
    )
  `);

  // Also update the latest progress entry
  const today = new Date().toISOString().split('T')[0];
  await db.execute(sql`
    INSERT INTO okr_progress (
      key_result_id,
      date,
      confidence,
      notes,
      data_source
    ) VALUES (
      ${update.keyResultId},
      ${today},
      ${update.confidence},
      ${update.notes},
      'manual'
    )
    ON CONFLICT (key_result_id, date)
    DO UPDATE SET
      confidence = EXCLUDED.confidence,
      notes = EXCLUDED.notes
  `);
}

/**
 * Get confidence history for a Key Result
 */
export async function getConfidenceHistory(keyResultId: string, limit: number = 10): Promise<ConfidenceUpdate[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM okr_confidence_log
    WHERE key_result_id = ${keyResultId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);

  return (result.rows || []).map((row: any) => ({
    keyResultId: row.key_result_id,
    confidence: row.confidence,
    notes: row.notes,
    updatedBy: row.updated_by,
  }));
}

/**
 * Get user's OKR role
 */
export async function getUserOKRRole(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT role FROM user_roles
    WHERE user_id = ${userId}
    LIMIT 1
  `);

  if (!result.rows || result.rows.length === 0) return null;
  return (result.rows[0] as any).role;
}

/**
 * Set user's OKR role
 */
export async function setUserOKRRole(userId: number, role: 'owner' | 'sales' | 'bookkeeper'): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    INSERT INTO user_roles (user_id, role)
    VALUES (${userId}, ${role})
    ON CONFLICT (user_id)
    DO UPDATE SET role = EXCLUDED.role
  `);
}
