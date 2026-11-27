export interface UserWithRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  role: string;
  companyId: string;
}
