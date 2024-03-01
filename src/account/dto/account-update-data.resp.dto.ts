import { AccountType } from '@prisma/client';
import { AccountUpdateBodyDto } from './account-update-body.req.dto';

//make type AccountUpdateDataDto from class AccountUpdateBodyDto (contain all props)
export type AccountUpdateDataDto = AccountUpdateBodyDto & {
  uuid: string;
  email: string;
  name: string;
  accountType: AccountType;
};
