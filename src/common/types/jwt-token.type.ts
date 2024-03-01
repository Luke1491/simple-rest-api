import { AccountTypes } from '../enums/account-types.enum';

export enum TokenActions {
  register = 'register',
  login = 'login',
  reset_password = 'reset-password',
  activate_account = 'activate-account',
}

export interface IJwtTokenContent {
  uuid: string;
  email: string;
  name?: string;
  accountType: AccountTypes;
  action: TokenActions;
}

export type JwtToken = IJwtTokenContent;
