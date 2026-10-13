export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export type LanguageType = 'English' | 'Shona' | 'Ndebele' | 'Code-Mixed';

export type ChannelType = 'WhatsApp' | 'Facebook' | 'TikTok' | 'Instagram' | 'SMS' | 'CSV / Excel';

export type IssueCategory =
  | 'Pricing & Tariffs'
  | 'Network & Uptime'
  | 'Transaction & Payments'
  | 'Delivery & Logistics'
  | 'Customer Support'
  | 'Product Quality'
  | 'Account & Verification'
  | 'General Inquiry';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type UserRole = 'Admin' | 'Manager' | 'Analyst';

export interface FeedbackItem {
  id: string;
  companyId: string;
  text: string;
  channel: ChannelType;
  sentiment: SentimentType;
  language: LanguageType;
  issue: IssueCategory;
  priority: PriorityLevel;
  responseRequired: boolean;
  customerInsight: string;
  customerIdentifier?: string;
  timestamp: string; // ISO string
  status: 'Pending' | 'Responded' | 'Resolved';
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  email: string;
  phone: string;
  city: string;
  status: 'Active' | 'Suspended' | 'Pending Review';
  dateRegistered: string;
  feedbackCount: number;
  userCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  companyId: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}

export interface AuthSession {
  user: UserProfile;
  company: Company | null;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole | 'System';
  companyName: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Info';
}

export interface ModelBenchmark {
  language: LanguageType;
  datasetSize: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latencyMs: number;
}

export interface ReportConfig {
  companyId: string;
  startDate: string;
  endDate: string;
  includeRecommendations: boolean;
  includeLanguageBreakdown: boolean;
  channelFilter?: ChannelType | 'All';
}
