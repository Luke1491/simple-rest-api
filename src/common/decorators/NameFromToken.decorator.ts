import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const emailFromToken = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    try {
      const req = ctx.switchToHttp().getRequest<Request>();

      const emailFromToken: string = req?.res?.locals?.token?.user;
      if (!emailFromToken) {
        Logger.error(
          `Access token is broken in if statement. TokenData: ${JSON.stringify(
            emailFromToken,
          )}`,
        );
        throw new UnauthorizedException(`Access token is broken`);
      }
      return emailFromToken;
    } catch (err) {
      Logger.error(
        `Catch exception: Access token is broken in decorator. Error: ${err}`,
      );
      throw new UnauthorizedException(`Access token is broken`);
    }
  },
);
