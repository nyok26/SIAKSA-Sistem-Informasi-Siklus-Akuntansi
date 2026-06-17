import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { COMPANY_ID_REQUIRED_MESSAGE, HEADER_COMPANY_ID } from '../constants/headers.constants';

export const CompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest() as {
      headers: Record<string, string | string[] | undefined>;
      companyId?: string;
    };

    if (request.companyId) {
      return request.companyId;
    }

    const companyIdHeader = request.headers[HEADER_COMPANY_ID];
    const companyId = Array.isArray(companyIdHeader) ? companyIdHeader[0] : companyIdHeader;

    if (!companyId) {
      throw new BadRequestException(COMPANY_ID_REQUIRED_MESSAGE);
    }

    return companyId;
  },
);
