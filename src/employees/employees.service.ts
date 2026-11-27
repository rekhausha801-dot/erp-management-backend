import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmploymentType, Gender, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { CreateEmployeeDto, EmployeeStatus } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: {
        companyId_employeeCode: {
          companyId,
          employeeCode: dto.employeeCode,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Employee with code ${dto.employeeCode} already exists`,
      );
    }

    return this.prisma.employee.create({
      data: {
        companyId,
        employeeCode: dto.employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender as Gender | undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        joiningDate: new Date(dto.hireDate),
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        basicSalary: dto.salary ?? 0,
        employmentType: dto.employeeType as EmploymentType,
        isActive: dto.status ? dto.status === EmployeeStatus.ACTIVE : true,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        bankAccount: dto.bankAccountNumber,
        bankName: dto.bankName,
        panNumber: dto.panNumber,
        aadharNumber: dto.aadharNumber,
      },
      include: { department: true, designation: true },
    });
  }

  async findAll(companyId: string, query: QueryEmployeeDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.EmployeeWhereInput = {
      companyId,
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.designationId ? { designationId: query.designationId } : {}),
      ...(query.employeeType
        ? { employmentType: query.employeeType as EmploymentType }
        : {}),
      ...(query.status
        ? { isActive: query.status === EmployeeStatus.ACTIVE }
        : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { employeeCode: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { department: true, designation: true },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: { department: true, designation: true },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeDto) {
    await this.findOne(companyId, id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        employeeCode: dto.employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender as Gender | undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        joiningDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        basicSalary: dto.salary,
        employmentType: dto.employeeType as EmploymentType | undefined,
        isActive:
          dto.status !== undefined
            ? dto.status === EmployeeStatus.ACTIVE
            : undefined,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        bankAccount: dto.bankAccountNumber,
        bankName: dto.bankName,
        panNumber: dto.panNumber,
        aadharNumber: dto.aadharNumber,
      },
      include: { department: true, designation: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive: false, exitDate: new Date() },
    });
  }

  async createDepartment(companyId: string, dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('Department already exists');
    }
    return this.prisma.department.create({
      data: { companyId, name: dto.name, description: dto.description },
    });
  }

  async findDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createDesignation(companyId: string, dto: CreateDesignationDto) {
    const existing = await this.prisma.designation.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('Designation already exists');
    }
    return this.prisma.designation.create({
      data: { companyId, name: dto.name, description: dto.description },
    });
  }

  async findDesignations(companyId: string) {
    return this.prisma.designation.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
