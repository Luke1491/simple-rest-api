import { AccountType } from '@prisma/client';

export type RegisterResponse = {
  user: {
    uuid: string;
    email: string;
    type: AccountType;
  };
};
