import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { COMPANY_ID_REQUIRED_MESSAGE, HEADER_COMPANY_ID } from '../constants/headers.constants';

@Injectable()
export class CompanyIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as {
      headers: Record<string, string | string[] | undefined>;
      companyId?: string;
    };

    const companyIdHeader = request.headers[HEADER_COMPANY_ID];
    const companyId = Array.isArray(companyIdHeader) ? companyIdHeader[0] : companyIdHeader;

    if (!companyId) {
      throw new BadRequestException(COMPANY_ID_REQUIRED_MESSAGE);
    }

    request.companyId = companyId;
    return true;
  }
}
