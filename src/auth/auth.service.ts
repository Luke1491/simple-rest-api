import { Injectable } from '@nestjs/common';
import { RegisterBodyDto } from './dto/register-body.req.dto.';
import { PrismaService } from 'src/db/prisma.service';
import { MailService } from 'src/common/services/mailer.service';
import { Logger, BadRequestException } from '@nestjs/common';
import { bcrypt } from 'bcrypt';
import { JwtToken, TokenActions } from 'src/common/types/jwt-token.type';
import * as jwt from 'jsonwebtoken';
import { AccountStatus, AccountType } from '@prisma/client';
import { RegisterResponse } from './dto/register.resp.dto';
import { AccountTypes } from 'src/common/enums/account-types.enum';
import { SignInDto } from './dto/sign-in.req.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(body: RegisterBodyDto): Promise<RegisterResponse> {
    // Number of salt rounds for bcrypt
    const saltRounds = 10;
    try {
      const newUser = await this.prisma.account.create({
        data: {
          email: body.email,
          // uuid: uuidv4(),
          password: await bcrypt.hash(body.password, saltRounds),
          status: AccountStatus.CREATED,
          type: body.type || AccountType.user,
          lastLogged: new Date().toISOString(),
          profile: {
            create: {
              givenName: body.firstName,
              familyName: body.lastName,
            },
          },
          business: {
            create: {
              name: `${body.firstName} ${body.lastName}`,
            },
          },
        },
        include: {
          profile: true,
          business: true,
        },
      });

      //create activation token
      const tokenData: JwtToken = {
        uuid: newUser.uuid,
        email: newUser.email,
        accountType: newUser.type as AccountTypes,
        action: TokenActions.register,
      };
      const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      //send email with activation token
      await this.mailService.sendActivationToken(
        newUser.email,
        newUser?.profile?.givenName || newUser.email || '',
        token,
      );

      return {
        user: {
          uuid: newUser.uuid,
          email: newUser.email,
          type: newUser.type,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Account creation error.`);
    }
  }

  async verifyAccountAfterRegistration(token: string): Promise<string> {
    try {
      const tokenData = jwt.verify(token, process.env.JWT_SECRET) as JwtToken;
      if (tokenData.action !== TokenActions.register) {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.prisma.account.findUnique({
        where: {
          uuid: tokenData.uuid,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.status !== AccountStatus.CREATED) {
        throw new BadRequestException('Account already activated');
      }

      await this.prisma.account.update({
        where: {
          uuid: user.uuid,
        },
        data: {
          status: AccountStatus.ACTIVATED,
        },
      });

      //return access token (with action login)
      const accessTokenData: JwtToken = {
        uuid: user.uuid,
        email: user.email,
        accountType: user.type as AccountTypes,
        action: TokenActions.login,
      };
      return jwt.sign(accessTokenData, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
    } catch (error) {
      throw new BadRequestException(`Account activation error.`);
    }
  }

  async signIn(body: SignInDto): Promise<string> {
    const user = await this.prisma.account.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!(await bcrypt.compare(body.password, user.password))) {
      throw new BadRequestException('Invalid password');
    }

    const tokenData: JwtToken = {
      uuid: user.uuid,
      email: user.email,
      accountType: user.type as AccountTypes,
      action: TokenActions.login,
    };
    return jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }

  async forgotPassword(email: string): Promise<{ err: string }> {
    const user = await this.prisma.account.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return { err: 'User not found' };
    }

    const tokenData: JwtToken = {
      uuid: user.uuid,
      email: user.email,
      accountType: user.type as AccountTypes,
      action: TokenActions.reset_password,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    try {
      await this.mailService.sendResetPasswordToken(
        user.email,
        user?.profile?.givenName || user.email || '',
        token,
      );
      return { err: null };
    } catch (error) {
      return { err: error };
    }
  }

  //resetPassword
  async resetPassword(token: string): Promise<{ err: string }> {
    try {
      const tokenData = jwt.verify(token, process.env.JWT_SECRET) as JwtToken;
      if (tokenData.action !== TokenActions.reset_password) {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.prisma.account.findUnique({
        where: {
          uuid: tokenData.uuid,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      //reset password
      const saltRounds = 10;
      const newPassword = '123456';
      await this.prisma.account.update({
        where: {
          uuid: user.uuid,
        },
        data: {
          password: await bcrypt.hash(newPassword, saltRounds),
        },
      });

      return { err: null };
    } catch (error) {
      return { err: error };
    }
  }
}
