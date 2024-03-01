import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtToken, TokenActions } from '../types/jwt-token.type';
import {
  jwtTokenGet,
  jwtTokenValidate,
} from '../utils/jwt-token-base-validation.lib';
import { validateAccount } from '../utils/account-validation.lib';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token: JwtToken = jwtTokenGet(request);
      if (!jwtTokenValidate(token)) {
        return false;
      }
      if (token.action !== TokenActions.login) {
        Logger.error(
          `Wrong token action. "login" action required, but got: ${token.action}`,
        );
        return false;
      }
      if ((await validateAccount(token.uuid)) === false) {
        return false;
      }

      request.res.locals.token = token;
      return true;
    } catch (err) {
      return false;
    }
  }
}
