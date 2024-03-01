import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBodyDto } from './dto/register-body.req.dto.';
import {
  ResponseSchema,
  ResponseSchemaObj,
} from 'src/common/types/response-schema.type';
import { RegisterResponse } from './dto/register.resp.dto';
import { SignInDto } from './dto/sign-in.req.dto';
import { SignInResponse } from './dto/sign-in.resp.dto';
import { IControllerFactory } from '../common/interfaces/controller-factory.interface';

@Controller('auth')
export class AuthController implements IControllerFactory {
  constructor(private authService: AuthService) {}

  @Get('health-check')
  async healthCheck(): Promise<ResponseSchemaObj<boolean>> {
    return new ResponseSchemaObj<boolean>(
      200,
      'Auth service is operational!',
      true,
    );
  }

  @Get('test')
  async test(): Promise<string> {
    return 'Hello World';
  }

  @Post('sign-up')
  async register(
    @Body() body: RegisterBodyDto,
  ): Promise<ResponseSchema<RegisterResponse>> {
    const createdUser = await this.authService.register(body);
    return new ResponseSchemaObj<RegisterResponse>(
      201,
      'User created',
      createdUser,
    );
  }

  @Get('verify-account')
  async verifyAccount(
    @Param('token') token: string,
  ): Promise<ResponseSchema<{ token: string }>> {
    const accessToken = await this.authService.verifyAccountAfterRegistration(
      token,
    );
    if (accessToken) {
      return new ResponseSchemaObj(200, 'Account verified', {
        token: accessToken,
      });
    }
    return new ResponseSchemaObj(400, 'Account not verified', { token: '' });
  }

  @Post('sign-in')
  async signIn(
    @Body() body: SignInDto,
  ): Promise<ResponseSchema<SignInResponse>> {
    const tokenString: string = await this.authService.signIn(body);
    return new ResponseSchemaObj<SignInResponse>(200, 'Sign in successful', {
      token: tokenString,
    });
  }

  //send forgot password email
  @Get('forgot-password/:email')
  async forgotPassword(
    @Param('email') email: string,
  ): Promise<ResponseSchema<string>> {
    const { err } = await this.authService.forgotPassword(email);
    if (err) {
      return new ResponseSchemaObj<string>(500, 'Mailer error!', err);
    }
    return new ResponseSchemaObj<string>(
      200,
      'Password reset email sent!',
      `Email has been send to ${email}`,
    );
  }

  //reset password
  @Get('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
  ): Promise<ResponseSchema<string>> {
    const { err } = await this.authService.resetPassword(token);
    if (err) {
      return new ResponseSchemaObj<string>(500, 'Token error!', err);
    }
    return new ResponseSchemaObj<string>(
      200,
      'Password reset successful!',
      `Password has been reset`,
    );
  }
}
