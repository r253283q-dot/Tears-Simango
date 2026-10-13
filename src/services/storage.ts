import { Company, FeedbackItem, UserProfile, AuditLogItem, ModelBenchmark } from '../types';
import { analyzeFeedbackText } from './nlpEngine';

const STORAGE_KEYS = {
  COMPANIES: 'zsci_clean_companies_v2',
  FEEDBACK: 'zsci_clean_feedback_v2',
  USERS: 'zsci_clean_users_v2',
  AUDIT_LOGS: 'zsci_clean_audit_logs_v2',
  ACTIVE_COMPANY_ID: 'zsci_clean_active_company_id_v2',
  CURRENT_USER_ID: 'zsci_clean_current_user_id_v2',
  CURRENT_PORTAL: 'zsci_clean_current_portal_v2', // 'customer' | 'admin'
};

export const MODEL_BENCHMARKS: ModelBenchmark[] = [
  {
    language: 'English',
    datasetSize: 12500,
    accuracy: 94.2,
    precision: 0.938,
    recall: 0.941,
    f1Score: 0.939,
    latencyMs: 24,
  },
  {
    language: 'Shona',
    datasetSize: 8400,
    accuracy: 90.5,
    precision: 0.899,
    recall: 0.908,
    f1Score: 0.903,
    latencyMs: 38,
  },
  {
    language: 'Ndebele',
    datasetSize: 7200,
    accuracy: 89.8,
    precision: 0.892,
    recall: 0.901,
    f1Score: 0.896,
    latencyMs: 39,
  },
  {
    language: 'Code-Mixed',
    datasetSize: 11200,
    accuracy: 91.8,
    precision: 0.914,
    recall: 0.920,
    f1Score: 0.917,
    latencyMs: 44,
  }
];

class StorageService {
  private companies: Company[] = [];
  private feedbackItems: FeedbackItem[] = [];
  private users: UserProfile[] = [];
  private auditLogs: AuditLogItem[] = [];
  private activeCompanyId: string = '';
  private currentUserId: string = '';
  private currentPortal: 'customer' | 'admin' = 'customer';

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Purge any legacy demo data from v1 keys
      localStorage.removeItem('zsci_companies_v1');
      localStorage.removeItem('zsci_feedback_v1');
      localStorage.removeItem('zsci_users_v1');
      localStorage.removeItem('zsci_audit_logs_v1');
      localStorage.removeItem('zsci_active_company_id_v1');
      localStorage.removeItem('zsci_current_user_id_v1');
      localStorage.removeItem('zsci_current_portal_v1');

      const storedCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      if (storedCompanies) {
        this.companies = JSON.parse(storedCompanies);
      } else {
        this.companies = [];
        this.saveCompanies();
      }

      const storedFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      if (storedFeedback) {
        this.feedbackItems = JSON.parse(storedFeedback);
      } else {
        this.feedbackItems = [];
        this.saveFeedback();
      }

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [];
      }

      // Ensure system administrator exists for platform management
      const hasAdmin = this.users.some(u => u.role === 'Admin');
      if (!hasAdmin) {
        this.users.unshift({
          id: 'user-admin-root',
          name: 'Platform Administrator',
          email: 'admin@platform.co.zw',
          username: 'admin',
          password: 'admin123',
          role: 'Admin',
          companyId: '',
          status: 'Active',
          lastActive: 'Just now'
        });
        this.saveUsers();
      }

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        this.auditLogs = [];
        this.saveAuditLogs();
      }

      const storedActiveCompany = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
      if (storedActiveCompany && this.companies.some(c => c.id === storedActiveCompany)) {
        this.activeCompanyId = storedActiveCompany;
      } else {
        this.activeCompanyId = '';
      }

      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (storedCurrentUser && this.users.some(u => u.id === storedCurrentUser)) {
        this.currentUserId = storedCurrentUser;
      } else {
        this.currentUserId = '';
      }

      const storedPortal = localStorage.getItem(STORAGE_KEYS.CURRENT_PORTAL);
      if (storedPortal === 'admin' || storedPortal === 'customer') {
        this.currentPortal = storedPortal;
      }
    } catch {
      this.companies = [];
      this.feedbackItems = [];
      this.users = [];
      this.auditLogs = [];
      this.activeCompanyId = '';
      this.currentUserId = '';
    }
  }

  private saveCompanies() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(this.companies));
    } catch {}
  }

  private saveFeedback() {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(this.feedbackItems));
    } catch {}
  }

  private saveUsers() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch {}
  }

  private saveAuditLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch {}
  }

  // --- Companies & Workspaces ---
  public getCompanies(): Company[] {
    return [...this.companies];
  }

  public getCompany(id: string): Company | undefined {
    return this.companies.find(c => c.id === id);
  }

  public getActiveCompany(): Company | null {
    if (this.companies.length === 0) return null;
    const currentUser = this.getCurrentUser();
    // Non-admin company user is strictly isolated to their own registered company
    if (currentUser && currentUser.role !== 'Admin' && currentUser.companyId) {
      return this.companies.find(c => c.id === currentUser.companyId) || null;
    }
    // Admin viewing of active company
    if (this.activeCompanyId) {
      return this.companies.find(c => c.id === this.activeCompanyId) || null;
    }
    return null;
  }

  public setActiveCompanyId(id: string): void {
    if (this.companies.some(c => c.id === id)) {
      this.activeCompanyId = id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, id);
    }
  }

  public updateCompany(updated: Company): void {
    this.companies = this.companies.map(c => c.id === updated.id ? updated : c);
    this.saveCompanies();
  }

  public addCompany(company: Omit<Company, 'id' | 'dateRegistered' | 'feedbackCount' | 'userCount'>): Company {
    const newComp: Company = {
      ...company,
      id: `comp-${Date.now().toString(36)}`,
      dateRegistered: new Date().toISOString().split('T')[0],
      feedbackCount: 0,
      userCount: 1
    };
    this.companies.push(newComp);
    if (!this.activeCompanyId) {
      this.activeCompanyId = newComp.id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, this.activeCompanyId);
    }
    this.saveCompanies();
    this.addAuditLog('Business Registration', `New enterprise entity registered: ${newComp.name}`, 'Success');
    return newComp;
  }

  public registerCompanyAndAdmin(data: {
    name: string;
    sector: string;
    email: string;
    username?: string;
    password?: string;
    phone: string;
    city: string;
    adminName: string;
  }): { company: Company; user: UserProfile } {
    const existing = this.users.find(
      u => u.email.toLowerCase() === data.email.toLowerCase() ||
      (data.username && u.username && u.username.toLowerCase() === data.username.toLowerCase())
    );
    if (existing) {
      throw new Error('An account with this email or username already exists.');
    }

    const newComp: Company = {
      id: `comp-${Date.now().toString(36)}`,
      name: data.name,
      sector: data.sector,
      email: data.email,
      phone: data.phone,
      city: data.city,
      status: 'Active',
      dateRegistered: new Date().toISOString().split('T')[0],
      feedbackCount: 0,
      userCount: 1
    };

    const newUser: UserProfile = {
      id: `user-${Date.now().toString(36)}`,
      name: data.adminName,
      email: data.email,
      username: data.username || data.email.split('@')[0],
      password: data.password || 'password123',
      role: 'Manager',
      companyId: newComp.id,
      status: 'Active',
      lastActive: 'Just now'
    };

    this.companies.push(newComp);
    this.users.push(newUser);
    this.activeCompanyId = newComp.id;
    this.currentUserId = newUser.id;

    this.saveCompanies();
    this.saveUsers();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, this.activeCompanyId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);

    this.addAuditLog('Tenant Self-Registration', `Company ${newComp.name} registered by ${newUser.name}`, 'Success');

    return { company: newComp, user: newUser };
  }

  public login(usernameOrEmail: string, password: string): { success: boolean; error?: string; user?: UserProfile; company?: Company | null } {
    const target = this.users.find(u =>
      (u.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
       (u.username && u.username.toLowerCase() === usernameOrEmail.toLowerCase()))
    );

    if (!target) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (target.password !== password) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (target.status !== 'Active') {
      return { success: false, error: 'Account has been suspended. Contact administrator.' };
    }

    this.currentUserId = target.id;
    this.activeCompanyId = target.companyId;
    target.lastActive = 'Just now';

    this.saveUsers();
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    if (this.activeCompanyId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, this.activeCompanyId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    }

    const company = target.companyId ? this.getCompany(target.companyId) || null : null;
    this.addAuditLog('User Login', `Authenticated session established for ${target.email}`, 'Success');

    return { success: true, user: target, company };
  }

  public logout(): void {
    const currentUser = this.getCurrentUser();
    this.currentUserId = '';
    this.activeCompanyId = '';
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    this.addAuditLog('User Logout', `Session ended for ${currentUser?.email || 'User'}`, 'Success');
  }

  public isUserAuthenticated(): boolean {
    if (!this.currentUserId) return false;
    return this.users.some(u => u.id === this.currentUserId);
  }

  public deleteCompany(id: string): void {
    const targetComp = this.getCompany(id);
    this.companies = this.companies.filter(c => c.id !== id);
    this.feedbackItems = this.feedbackItems.filter(f => f.companyId !== id);
    this.users = this.users.filter(u => u.companyId !== id);

    if (this.activeCompanyId === id) {
      this.activeCompanyId = '';
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    }

    this.saveCompanies();
    this.saveFeedback();
    this.saveUsers();
    this.addAuditLog('Business Deletion', `Deleted company tenant: ${targetComp?.name || id}`, 'Warning');
  }

  // --- Feedback Data Isolated By Company ---
  public getFeedbackByCompany(companyId: string): FeedbackItem[] {
    if (!companyId) return [];
    return this.feedbackItems
      .filter(item => item.companyId === companyId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAllFeedback(): FeedbackItem[] {
    return [...this.feedbackItems];
  }

  public addFeedbackItem(companyId: string, rawText: string, channel: FeedbackItem['channel'], customerIdentifier?: string): FeedbackItem {
    const analysis = analyzeFeedbackText(rawText);
    const newItem: FeedbackItem = {
      id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      text: rawText,
      channel,
      sentiment: analysis.sentiment,
      language: analysis.language,
      issue: analysis.issue,
      priority: analysis.priority,
      responseRequired: analysis.responseRequired,
      customerInsight: analysis.customerInsight,
      customerIdentifier: customerIdentifier || 'Anonymous',
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };

    this.feedbackItems.unshift(newItem);
    this.saveFeedback();

    const comp = this.getCompany(companyId);
    if (comp) {
      comp.feedbackCount = this.getFeedbackByCompany(companyId).length;
      this.updateCompany(comp);
    }

    this.addAuditLog('Sentiment Analysis', `Processed single feedback for ${comp?.name || companyId} (${analysis.language})`, 'Success');

    return newItem;
  }

  public addBatchFeedback(companyId: string, items: Array<{ text: string; channel: FeedbackItem['channel']; customerIdentifier?: string; timestamp?: string }>): FeedbackItem[] {
    const results: FeedbackItem[] = items.map(entry => {
      const analysis = analyzeFeedbackText(entry.text);
      return {
        id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        companyId,
        text: entry.text,
        channel: entry.channel,
        sentiment: analysis.sentiment,
        language: analysis.language,
        issue: analysis.issue,
        priority: analysis.priority,
        responseRequired: analysis.responseRequired,
        customerInsight: analysis.customerInsight,
        customerIdentifier: entry.customerIdentifier || 'Anonymous',
        timestamp: entry.timestamp || new Date().toISOString(),
        status: 'Pending'
      };
    });

    this.feedbackItems.unshift(...results);
    this.saveFeedback();

    const comp = this.getCompany(companyId);
    if (comp) {
      comp.feedbackCount = this.getFeedbackByCompany(companyId).length;
      this.updateCompany(comp);
    }

    this.addAuditLog('Batch Ingestion', `Batch analysis of ${results.length} records completed for ${comp?.name || companyId}`, 'Success');

    return results;
  }

  public updateFeedbackStatus(id: string, status: FeedbackItem['status']): void {
    const item = this.feedbackItems.find(f => f.id === id);
    if (item) {
      item.status = status;
      this.saveFeedback();
    }
  }

  public deleteFeedbackItem(id: string): void {
    const item = this.feedbackItems.find(f => f.id === id);
    if (item) {
      const companyId = item.companyId;
      this.feedbackItems = this.feedbackItems.filter(f => f.id !== id);
      this.saveFeedback();
      const comp = this.getCompany(companyId);
      if (comp) {
        comp.feedbackCount = this.getFeedbackByCompany(companyId).length;
        this.updateCompany(comp);
      }
    }
  }

  // --- Users & Accounts ---
  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public getCurrentUser(): UserProfile | null {
    if (!this.currentUserId) return null;
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || null;
  }

  public setCurrentUserId(id: string): void {
    if (this.users.some(u => u.id === id)) {
      this.currentUserId = id;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    }
  }

  public updateUser(user: UserProfile): void {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    this.saveUsers();
  }

  public addUser(user: Omit<UserProfile, 'id' | 'lastActive'>): UserProfile {
    const newUser: UserProfile = {
      ...user,
      id: `user-${Date.now().toString(36)}`,
      lastActive: 'Just now'
    };
    this.users.push(newUser);
    this.saveUsers();

    const comp = this.getCompany(newUser.companyId);
    if (comp) {
      comp.userCount = this.users.filter(u => u.companyId === comp.id).length;
      this.updateCompany(comp);
    }

    this.addAuditLog('User Account Provisioning', `New account ${newUser.email} created`, 'Success');
    return newUser;
  }

  public deleteUser(id: string): void {
    const targetUser = this.users.find(u => u.id === id);
    if (!targetUser) return;
    this.users = this.users.filter(u => u.id !== id);
    if (this.currentUserId === id) {
      this.currentUserId = '';
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    this.saveUsers();

    const comp = this.getCompany(targetUser.companyId);
    if (comp) {
      comp.userCount = this.users.filter(u => u.companyId === comp.id).length;
      this.updateCompany(comp);
    }
    this.addAuditLog('User Deletion', `Deleted user account: ${targetUser.email}`, 'Warning');
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  public addAuditLog(action: string, details: string, status: AuditLogItem['status'] = 'Success'): void {
    const currentUser = this.getCurrentUser();
    const currentComp = this.getActiveCompany();
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorEmail: currentUser ? currentUser.email : 'System Action',
      actorRole: currentUser ? currentUser.role : 'System',
      companyName: currentComp ? currentComp.name : 'Platform System',
      action,
      details,
      ipAddress: '197.221.240.54',
      status
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
    this.saveAuditLogs();
  }

  // --- Portal Switching ---
  public getCurrentPortal(): 'customer' | 'admin' {
    return this.currentPortal;
  }

  public setCurrentPortal(portal: 'customer' | 'admin'): void {
    this.currentPortal = portal;
    localStorage.setItem(STORAGE_KEYS.CURRENT_PORTAL, portal);
  }
}

export const storage = new StorageService();
