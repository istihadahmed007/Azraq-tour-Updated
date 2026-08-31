import fs from 'fs';
import path from 'path';
import { emailService, EmailNotificationPayload } from './emailService';

export type UnifiedRequestType =
  | 'flight'
  | 'visa'
  | 'package'
  | 'hotel'
  | 'ai_planner'
  | 'contact'
  | 'custom';

export type UnifiedRequestStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'PROCESSING'
  | 'WAITING_FOR_CUSTOMER'
  | 'COMPLETED'
  | 'CANCELLED';

export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type EmailNotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface InternalAdminNote {
  id: string;
  authorName: string;
  authorEmail: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface UnifiedRequest {
  id: string;
  request_id: string; // e.g. AZQ-20260831-00001
  user_id?: string;
  request_type: UnifiedRequestType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subject?: string;
  destination?: string;
  origin?: string;
  travel_date?: string;
  return_date?: string;
  passengers?: number;
  message?: string;
  metadata?: Record<string, any>;
  status: UnifiedRequestStatus;
  priority: RequestPriority;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  email_notification_status: EmailNotificationStatus;
  email_sent_at?: string;
  email_error?: string;
  admin_notes: InternalAdminNote[];
  client_ip?: string;
  user_agent?: string;
}

const REQUESTS_DB_FILE = path.join(process.cwd(), '.requests_db.json');

class RequestsStore {
  private requests: UnifiedRequest[] = [];
  private sequenceCounter: number = 1;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(REQUESTS_DB_FILE)) {
        const raw = fs.readFileSync(REQUESTS_DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.requests = data;
          // compute current sequence counter for today
          const todayPrefix = this.getTodayDatePrefix();
          const todayMatches = this.requests.filter((r) => r.request_id?.startsWith(`AZQ-${todayPrefix}-`));
          if (todayMatches.length > 0) {
            let maxSeq = 0;
            todayMatches.forEach((r) => {
              const parts = r.request_id.split('-');
              if (parts.length === 3) {
                const seq = parseInt(parts[2], 10);
                if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
              }
            });
            this.sequenceCounter = maxSeq + 1;
          }
        }
      }
    } catch (err) {
      console.error('[RequestsStore] Failed to load requests from disk:', err);
      this.requests = [];
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(REQUESTS_DB_FILE, JSON.stringify(this.requests, null, 2), 'utf-8');
    } catch (err) {
      console.error('[RequestsStore] Failed to save requests to disk:', err);
    }
  }

  private getTodayDatePrefix(): string {
    const d = new Date();
    const yyyy = d.getFullYear().toString();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  /**
   * Generate sequential Request ID: AZQ-YYYYMMDD-00001
   */
  public generateRequestId(): string {
    const datePrefix = this.getTodayDatePrefix();
    const seqString = this.sequenceCounter.toString().padStart(5, '0');
    this.sequenceCounter++;
    return `AZQ-${datePrefix}-${seqString}`;
  }

  /**
   * Duplicate Protection: Checks if same email + same request_type + same destination was submitted in the last 30s
   */
  public isDuplicateSubmission(email: string, requestType: string, destination?: string): boolean {
    const thirtySecAgo = Date.now() - 30 * 1000;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedDest = (destination || '').trim().toLowerCase();

    return this.requests.some((r) => {
      const matchEmail = (r.customer_email || '').trim().toLowerCase() === normalizedEmail;
      const matchType = r.request_type === requestType;
      const matchDest = (r.destination || '').trim().toLowerCase() === normalizedDest;
      const recent = new Date(r.created_at).getTime() > thirtySecAgo;
      return matchEmail && matchType && matchDest && recent;
    });
  }

  /**
   * Create a new Request with duplicate protection and email dispatch
   */
  public async createRequest(
    data: {
      userId?: string;
      requestType: UnifiedRequestType;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      subject?: string;
      destination?: string;
      origin?: string;
      travelDate?: string;
      returnDate?: string;
      passengers?: number;
      message?: string;
      metadata?: Record<string, any>;
      priority?: RequestPriority;
      assignedTo?: string;
    },
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<UnifiedRequest> {
    // 1. Duplicate check
    if (this.isDuplicateSubmission(data.customerEmail, data.requestType, data.destination)) {
      const recent = this.requests.find(
        (r) =>
          (r.customer_email || '').trim().toLowerCase() === (data.customerEmail || '').trim().toLowerCase() &&
          r.request_type === data.requestType
      );
      if (recent) {
        return recent;
      }
    }

    const now = new Date().toISOString();
    const requestId = this.generateRequestId();
    const uuid = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newRequest: UnifiedRequest = {
      id: uuid,
      request_id: requestId,
      user_id: data.userId || undefined,
      request_type: data.requestType || 'custom',
      customer_name: (data.customerName || 'Valued Traveler').trim(),
      customer_email: (data.customerEmail || '').trim(),
      customer_phone: (data.customerPhone || '').trim(),
      subject: data.subject?.trim() || `${data.requestType.toUpperCase()} Request - ${data.destination || 'Azraq Travel'}`,
      destination: data.destination?.trim() || undefined,
      origin: data.origin?.trim() || undefined,
      travel_date: data.travelDate?.trim() || undefined,
      return_date: data.returnDate?.trim() || undefined,
      passengers: typeof data.passengers === 'number' ? data.passengers : 1,
      message: data.message?.trim() || undefined,
      metadata: data.metadata || {},
      status: 'NEW',
      priority: data.priority || 'NORMAL',
      assigned_to: data.assignedTo || 'Unassigned (Banani Desk)',
      created_at: now,
      updated_at: now,
      email_notification_status: 'PENDING',
      admin_notes: [],
      client_ip: clientInfo?.ip,
      user_agent: clientInfo?.userAgent,
    };

    // Store in memory & persist
    this.requests.unshift(newRequest);
    this.saveToDisk();

    // Trigger instant email notifications asynchronously
    const emailPayload: EmailNotificationPayload = {
      requestId: newRequest.request_id,
      requestType: newRequest.request_type,
      customerName: newRequest.customer_name,
      customerEmail: newRequest.customer_email,
      customerPhone: newRequest.customer_phone,
      subject: newRequest.subject,
      destination: newRequest.destination,
      origin: newRequest.origin,
      travelDate: newRequest.travel_date,
      returnDate: newRequest.return_date,
      passengers: newRequest.passengers,
      message: newRequest.message,
      priority: newRequest.priority,
      status: newRequest.status,
      metadata: newRequest.metadata,
      submittedTime: newRequest.created_at,
      clientIp: newRequest.client_ip,
    };

    this.dispatchEmailsForRequest(newRequest.id, emailPayload);

    return newRequest;
  }

  /**
   * Dispatch Admin Notification & Customer Confirmation with tracking
   */
  private async dispatchEmailsForRequest(requestDbId: string, payload: EmailNotificationPayload) {
    try {
      const [adminResult, customerResult] = await Promise.allSettled([
        emailService.sendAdminNotification(payload),
        emailService.sendCustomerConfirmation(payload),
      ]);

      const target = this.requests.find((r) => r.id === requestDbId);
      if (target) {
        const isAdminSent = adminResult.status === 'fulfilled' && adminResult.value.status === 'SENT';
        target.email_notification_status = isAdminSent ? 'SENT' : 'FAILED';
        target.email_sent_at = new Date().toISOString();
        if (adminResult.status === 'rejected') {
          target.email_error = adminResult.reason?.message || 'Admin notification failed to dispatch.';
        }
        target.updated_at = new Date().toISOString();
        this.saveToDisk();
      }
    } catch (err: any) {
      console.error('[RequestsStore] Error dispatching emails:', err);
      const target = this.requests.find((r) => r.id === requestDbId);
      if (target) {
        target.email_notification_status = 'FAILED';
        target.email_error = err.message || 'Email delivery encountered an error.';
        this.saveToDisk();
      }
    }
  }

  /**
   * Resend Admin & Customer notification email
   */
  public async resendEmailNotification(
    requestIdOrDbId: string,
    actor?: { name: string; email: string }
  ): Promise<{ success: boolean; message: string; request: UnifiedRequest }> {
    const req = this.requests.find(
      (r) => r.id === requestIdOrDbId || r.request_id.toLowerCase() === requestIdOrDbId.toLowerCase()
    );

    if (!req) {
      throw new Error(`Request '${requestIdOrDbId}' not found.`);
    }

    const emailPayload: EmailNotificationPayload = {
      requestId: req.request_id,
      requestType: req.request_type,
      customerName: req.customer_name,
      customerEmail: req.customer_email,
      customerPhone: req.customer_phone,
      subject: req.subject,
      destination: req.destination,
      origin: req.origin,
      travelDate: req.travel_date,
      returnDate: req.return_date,
      passengers: req.passengers,
      message: req.message,
      priority: req.priority,
      status: req.status,
      metadata: req.metadata,
      submittedTime: req.created_at,
      clientIp: req.client_ip,
    };

    const adminResult = await emailService.sendAdminNotification(emailPayload);
    if (req.customer_email) {
      await emailService.sendCustomerConfirmation(emailPayload).catch(() => {});
    }

    req.email_notification_status = adminResult.status;
    req.email_sent_at = new Date().toISOString();
    if (!adminResult.success && adminResult.error) {
      req.email_error = adminResult.error;
    } else {
      req.email_error = undefined;
    }

    // Add internal audit note
    if (actor) {
      req.admin_notes.push({
        id: `note_${Date.now()}`,
        authorName: actor.name || 'Admin',
        authorEmail: actor.email || 'admin@azraqtrips.com',
        role: 'Admin',
        text: `Manually resent email notification (Provider: ${adminResult.provider}, Status: ${adminResult.status}).`,
        createdAt: new Date().toISOString(),
      });
    }

    req.updated_at = new Date().toISOString();
    this.saveToDisk();

    return {
      success: adminResult.success,
      message: `Notification email resent (${adminResult.provider}: ${adminResult.status})`,
      request: req,
    };
  }

  /**
   * Get all requests for Admin with flexible search, filter, and pagination
   */
  public getAllRequests(options?: {
    search?: string;
    type?: string;
    status?: string;
    priority?: string;
    dateRange?: 'today' | '7days' | '30days' | 'all';
    sortBy?: 'newest' | 'oldest' | 'priority';
    limit?: number;
    offset?: number;
  }): { requests: UnifiedRequest[]; total: number; counts: Record<string, number> } {
    let filtered = [...this.requests];

    // Compute status counts
    const counts: Record<string, number> = {
      all: this.requests.length,
      NEW: 0,
      CONTACTED: 0,
      PROCESSING: 0,
      WAITING_FOR_CUSTOMER: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      flight: 0,
      visa: 0,
      package: 0,
      hotel: 0,
      ai_planner: 0,
      contact: 0,
      custom: 0,
    };

    this.requests.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status]++;
      if (counts[r.request_type] !== undefined) counts[r.request_type]++;
    });

    if (options?.type && options.type !== 'all') {
      filtered = filtered.filter((r) => r.request_type === options.type);
    }

    if (options?.status && options.status !== 'all') {
      filtered = filtered.filter((r) => r.status === options.status);
    }

    if (options?.priority && options.priority !== 'all') {
      filtered = filtered.filter((r) => r.priority === options.priority);
    }

    if (options?.dateRange && options.dateRange !== 'all') {
      const now = Date.now();
      let cutOff = 0;
      if (options.dateRange === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        cutOff = d.getTime();
      } else if (options.dateRange === '7days') {
        cutOff = now - 7 * 24 * 60 * 60 * 1000;
      } else if (options.dateRange === '30days') {
        cutOff = now - 30 * 24 * 60 * 60 * 1000;
      }
      filtered = filtered.filter((r) => new Date(r.created_at).getTime() >= cutOff);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.request_id.toLowerCase().includes(q) ||
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_email.toLowerCase().includes(q) ||
          r.customer_phone.toLowerCase().includes(q) ||
          (r.destination && r.destination.toLowerCase().includes(q)) ||
          (r.origin && r.origin.toLowerCase().includes(q)) ||
          (r.message && r.message.toLowerCase().includes(q)) ||
          (r.assigned_to && r.assigned_to.toLowerCase().includes(q))
      );
    }

    // Sort
    if (options?.sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (options?.sortBy === 'priority') {
      const pMap: Record<RequestPriority, number> = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      filtered.sort((a, b) => (pMap[b.priority] || 0) - (pMap[a.priority] || 0));
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const total = filtered.length;
    if (options?.offset !== undefined || options?.limit !== undefined) {
      const offset = options?.offset || 0;
      const limit = options?.limit || 50;
      filtered = filtered.slice(offset, offset + limit);
    }

    return { requests: filtered, total, counts };
  }

  /**
   * Find single request by DB ID or AZQ Request ID
   */
  public getRequestById(id: string): UnifiedRequest | undefined {
    return this.requests.find(
      (r) => r.id === id || r.request_id.toLowerCase() === id.toLowerCase()
    );
  }

  /**
   * Update request status, priority, staff assignment, or add internal notes
   */
  public updateRequest(
    id: string,
    updates: {
      status?: UnifiedRequestStatus;
      priority?: RequestPriority;
      assignedTo?: string;
      internalNote?: string;
    },
    actor?: { name: string; email: string; role?: string }
  ): UnifiedRequest {
    const req = this.getRequestById(id);
    if (!req) {
      throw new Error(`Request with ID '${id}' not found.`);
    }

    if (updates.status && updates.status !== req.status) {
      const oldStatus = req.status;
      req.status = updates.status;
      if (actor) {
        req.admin_notes.push({
          id: `note_${Date.now()}_status`,
          authorName: actor.name,
          authorEmail: actor.email,
          role: actor.role || 'Admin',
          text: `Status changed from ${oldStatus} to ${updates.status}.`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (updates.priority) {
      req.priority = updates.priority;
    }

    if (updates.assignedTo !== undefined) {
      req.assigned_to = updates.assignedTo;
    }

    if (updates.internalNote && updates.internalNote.trim()) {
      req.admin_notes.push({
        id: `note_${Date.now()}_custom`,
        authorName: actor?.name || 'Admin Specialist',
        authorEmail: actor?.email || 'admin@azraqtrips.com',
        role: actor?.role || 'Admin',
        text: updates.internalNote.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    req.updated_at = new Date().toISOString();
    this.saveToDisk();
    return req;
  }

  /**
   * User requests list (sanitized to remove internal admin notes)
   */
  public getUserRequests(query: { email?: string; userId?: string }): any[] {
    const normEmail = (query.email || '').trim().toLowerCase();
    const userId = query.userId;

    const matched = this.requests.filter((r) => {
      const matchEmail = normEmail && (r.customer_email || '').trim().toLowerCase() === normEmail;
      const matchUser = userId && r.user_id === userId;
      return matchEmail || matchUser;
    });

    // Strip internal admin notes to never leak staff-only comments to clients
    return matched.map((r) => {
      const { admin_notes, client_ip, user_agent, ...safeCustomerView } = r;
      return safeCustomerView;
    });
  }

  /**
   * Delete a request
   */
  public deleteRequest(id: string): boolean {
    const idx = this.requests.findIndex((r) => r.id === id || r.request_id === id);
    if (idx === -1) return false;
    this.requests.splice(idx, 1);
    this.saveToDisk();
    return true;
  }
}

export const requestsStore = new RequestsStore();
