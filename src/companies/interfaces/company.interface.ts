export interface CompanyRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
