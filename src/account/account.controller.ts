import { Body, Controller, Get, UseGuards, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth-token.guard';
import { AccountDataResponse } from './dto/account-data.resp.dto';
import {
  ResponseSchema,
  ResponseSchemaObj,
} from 'src/common/types/response-schema.type';
import { TokenData } from 'src/common/decorators/TokenData.decorator';
import { JwtToken } from 'src/common/types/jwt-token.type';
import { AccountService } from './account.service';
import { IControllerFactory } from '../common/interfaces/controller-factory.interface';
import { AccountUpdateBodyDto } from './dto/account-update-body.req.dto';

@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController implements IControllerFactory {
  constructor(private accountService: AccountService) {}

  @Get('health-check')
  async healthCheck(): Promise<ResponseSchemaObj<boolean>> {
    return new ResponseSchemaObj<boolean>(
      200,
      'Account service is operational!',
      true,
    );
  }

  //get account data
  @Get()
  async getAccountData(
    @TokenData() tokenData: JwtToken,
  ): Promise<ResponseSchema<AccountDataResponse>> {
    const account = await this.accountService.getAccountData(tokenData);
    return new ResponseSchemaObj<AccountDataResponse>(
      200,
      'Account data',
      account,
    );
  }

  //update account data
  @Put()
  async updateAccountData(
    @TokenData() tokenData: JwtToken,
    @Body() body: AccountUpdateBodyDto,
  ): Promise<ResponseSchema<AccountDataResponse>> {
    const account = await this.accountService.updateAccountData(
      tokenData,
      body,
    );
    return new ResponseSchemaObj<AccountDataResponse>(
      200,
      'Account data updated',
      account,
    );
  }

  //delete account (move it as inactive)
  @Delete()
  async deleteAccount(
    @TokenData() tokenData: JwtToken,
  ): Promise<ResponseSchemaObj<AccountDataResponse>> {
    const deletedAccount = await this.accountService.deleteAccount(tokenData);
    return new ResponseSchemaObj<AccountDataResponse>(
      200,
      'Account deleted',
      deletedAccount,
    );
  }
}
