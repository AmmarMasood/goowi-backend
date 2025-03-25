import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line
      const { password, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    if (user && user.email) {
      const token = this.jwtService.sign({
        email: user.email,
        sub: user._id,
        iat: Math.floor(Date.now() / 1000),
      });
      await this.usersService.setEmailVerificationToken(user._id as any, token);
      await this.mailerService.sendVerificationEmail(user.email, token);
    }

    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getDetails(user: any): Promise<any> {
    return await this.usersService.findOne(user.userId);
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    await this.usersService.activateUser(user._id as string);

    if (user) {
      return {
        message: 'Email verified successfully',
      };
    }

    return {
      message: 'Invalid or expired token',
    };
  }

  async resentVerifyEmail(reqUser: any) {
    const { user }: any = await this.usersService.findOne(reqUser.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isVerified) {
      throw new UnauthorizedException('User is already verified');
    }

    const token = this.jwtService.sign({
      email: user.email,
      sub: user._id,
      iat: Math.floor(Date.now() / 1000),
    });
    await this.usersService.setEmailVerificationToken(user._id, token);
    await this.mailerService.sendVerificationEmail(user.email, token);

    return {
      message: 'Verification email sent successfully',
    };
  }
}
