import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role } from '../enums/role.enum';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return true;
    }

    const headerCompanyId = request.headers['x-company-id'] as string | undefined;
    const companyId = headerCompanyId || user.companyId;

    if (!companyId) {
      throw new ForbiddenException('Company context is required');
    }

    if (user.role === Role.SUPER_ADMIN) {
      request.companyId = companyId;
      return true;
    }

    const membership = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: user.userId,
          companyId,
        },
      },
    });

    if (!membership || !membership.isActive) {
      throw new ForbiddenException(
        'Access denied: you do not have access to this company',
      );
    }

    request.companyId = companyId;
    request.user.companyId = companyId;
    request.user.role = membership.role;
    return true;
  }
}
