export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  users: User[];
  clients: Client[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  portalToken: string;
  organizationId: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  clientId: string;
  client: Client;
  updates: Update[];
  files: FileItem[];
  approvals: Approval[];
  checklistItems: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

export interface Update {
  id: string;
  content: string;
  projectId: string;
  authorId: string;
  author: User;
  createdAt: Date;
}

export interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  projectId: string;
  uploadedById: string;
  createdAt: Date;
}

export interface Approval {
  id: string;
  title: string;
  description: string | null;
  status: ApprovalStatus;
  projectId: string;
  respondedAt: Date | null;
  createdAt: Date;
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  projectId: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";
