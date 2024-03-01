import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtToken } from '../types/jwt-token.type';

export const TokenData = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext): Promise<JwtToken> => {
    try {
      const req = ctx.switchToHttp().getRequest<Request>();

      const tokenData: JwtToken = req?.res?.locals?.token;
      if (!tokenData?.uuid || !tokenData?.email || !tokenData?.accountType) {
        Logger.error(
          `Access token is broken in if statement. TokenData: ${JSON.stringify(
            tokenData,
          )}`,
        );
        throw new UnauthorizedException(`Access token is broken`);
      }
      return tokenData;
    } catch (err) {
      Logger.error(
        `Catch exception: Access token is broken in decorator. Error: ${err}`,
      );
      throw new UnauthorizedException(`Access token is broken`);
    }
  },
);
