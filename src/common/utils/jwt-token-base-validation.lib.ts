import * as jwt from 'jsonwebtoken';
import { JwtToken } from '../types/jwt-token.type';
import { Logger } from '@nestjs/common';

export function jwtTokenGet(request: any): JwtToken | null {
  if (!request.headers.authorization) {
    return null;
  }
  try {
    const auth = request.headers.authorization.split(' ')[1];
    const token: JwtToken = jwt.verify(
      auth,
      process.env.JWT_SECRET || ' ',
    ) as JwtToken;
    return token;
  } catch (err) {
    return null;
  }
}

export function jwtTokenValidate(token: JwtToken): boolean {
  if (!token) {
    return false;
  }
  if (
    !token.uuid ||
    !token.email ||
    !token.accountType ||
    !token.action ||
    !token.name
  ) {
    Logger.error(`Access token is broken. TokenData: ${JSON.stringify(token)}`);
    return false;
  }
  return true;
}
