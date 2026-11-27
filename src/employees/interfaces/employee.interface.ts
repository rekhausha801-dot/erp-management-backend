export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  departmentId?: string;
  designationId?: string;
  salary?: number;
  employeeType: EmployeeType;
  status: EmployeeStatus;
  address?: string;
  emergencyContact?: string;
  bankAccountNumber?: string;
  bankName?: string;
  panNumber?: string;
  aadharNumber?: string;
  companyId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum EmployeeType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSummary {
  employeeId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  lateDays: number;
}

export interface LeaveSummary {
  employeeId: string;
  leaveBalances: LeaveBalance[];
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
