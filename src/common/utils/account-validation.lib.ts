import { Logger } from '@nestjs/common';
import { AccountStatus, PrismaClient } from '@prisma/client';

export async function validateAccount(uuid: string): Promise<boolean> {
  try {
    if (!uuid) {
      Logger.error(`Account uuid is broken. TokenData: ${uuid}`);
      return false;
    }

    const prisma = new PrismaClient();
    const user = await prisma.account.findUnique({
      where: { uuid },
    });

    if (!user) {
      Logger.error(`Account not found. TokenData: ${uuid}`);
      return false;
    }
    if (user.status === AccountStatus.DELETED) {
      Logger.error(`Account is deleted. TokenData: ${uuid}`);
      return false;
    }
    return true;
  } catch (error) {
    Logger.error(`Account validation error. Error: ${error}`);
    return false;
  }
}
