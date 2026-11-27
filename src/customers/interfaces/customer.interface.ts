export interface CustomerRecord {
  id: string;
  companyId: string;
  name: string;
  email?: string | null;
  isActive: boolean;
}
