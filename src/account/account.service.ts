import { Injectable } from '@nestjs/common';
import { JwtToken } from '../common/types/jwt-token.type';
import { AccountDataResponse } from './dto/account-data.resp.dto';
import { PrismaService } from 'src/db/prisma.service';
import { AccountStatus, AccountType } from '@prisma/client';
import { AccountUpdateBodyDto } from './dto/account-update-body.req.dto';
import { AccountUpdateDataDto } from './dto/account-update-data.resp.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async getAccountData(token: JwtToken): Promise<AccountDataResponse> {
    try {
      // Get user details from database
      const user = await this.prisma.account.findUnique({
        where: { uuid: token.uuid },
        include: { profile: true },
      });
      // Return user details
      return {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        accountType: user.type as AccountType,
      };
    } catch (err) {
      throw new Error(`Unable to get user details`);
    }
  }

  //updateAccountData
  async updateAccountData(
    token: JwtToken,
    updateAccountData: AccountUpdateBodyDto,
  ): Promise<AccountUpdateDataDto> {
    try {
      const data = this.prepareUpdateData(updateAccountData);
      // Update user details in database
      const updatedUser = await this.prisma.account.update({
        where: { uuid: token.uuid },
        data: data,
        include: { profile: true },
      });
      // Return updated user details
      return {
        uuid: updatedUser.uuid,
        email: updatedUser.email,
        name: updatedUser.name,
        accountType: updatedUser.type as AccountType,
        ...updateAccountData,
      };
    } catch (err) {
      throw new Error(`Unable to update user details`);
    }
  }

  //deleteAccount
  async deleteAccount(token: JwtToken): Promise<AccountDataResponse> {
    try {
      // Move user to inactive status
      await this.prisma.account.update({
        where: { uuid: token.uuid },
        data: { status: AccountStatus.DELETED },
      });
      // Return user details
      return {
        uuid: token.uuid,
        email: token.email,
        name: token.name,
        accountType: token.accountType,
      };
    } catch (err) {
      throw new Error(`Unable to delete user`);
    }
  }

  private prepareUpdateData(
    updateAccountData: AccountUpdateBodyDto,
  ): Partial<AccountUpdateDataDto> {
    const data: Partial<AccountUpdateDataDto> = {};

    if (updateAccountData.password) {
      data.password = updateAccountData.password;
    }
    if (updateAccountData.name) {
      data.name = updateAccountData.name;
    }
    if (updateAccountData.bio) {
      data.bio = updateAccountData.bio;
    }
    if (updateAccountData.givenName) {
      data.givenName = updateAccountData.givenName;
    }
    if (updateAccountData.familyName) {
      data.familyName = updateAccountData.familyName;
    }
    if (updateAccountData.language) {
      data.language = updateAccountData.language;
    }
    if (updateAccountData.locale) {
      data.locale = updateAccountData.locale;
    }
    if (updateAccountData.address) {
      data.address = updateAccountData.address;
    }
    if (updateAccountData.city) {
      data.city = updateAccountData.city;
    }
    if (updateAccountData.state) {
      data.state = updateAccountData.state;
    }
    if (updateAccountData.zip) {
      data.zip = updateAccountData.zip;
    }
    if (updateAccountData.country) {
      data.country = updateAccountData.country;
    }
    if (updateAccountData.phone) {
      data.phone = updateAccountData.phone;
    }
    if (updateAccountData.website) {
      data.website = updateAccountData.website;
    }
    return data;
  }
}
