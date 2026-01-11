import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

interface RegisterDto {
    email: string;
    name: string;
    password: string;
}

interface LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Req() req: Request,
    ) {
        const user = await this.authService.register(dto.email, dto.name, dto.password);

        // Set session
        (req.session as any).userId = user.id;

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
    ) {
        const user = await this.authService.login(dto.email, dto.password);

        // Set session
        (req.session as any).userId = user.id;
        (req.session as any).gymId = user.gymId;
        (req.session as any).role = user.role;

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                gymId: user.gymId,
                role: user.role,
            },
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Logout failed' });
            }
            res.clearCookie('connect.sid');
            return res.json({ success: true });
        });
    }

    @Get('me')
    async me(@Req() req: Request) {
        const userId = (req.session as any).userId;
        if (!userId) {
            return { user: null };
        }

        const user = await this.authService.getUser(userId);
        return { user };
    }

    @Post('switch-gym')
    @HttpCode(HttpStatus.OK)
    async switchGym(
        @Body() dto: { gymId: string },
        @Req() req: Request,
    ) {
        const userId = (req.session as any).userId;
        const user = await this.authService.switchGym(userId, dto.gymId);

        if (!user) {
            return { success: false, error: 'Gym not found or access denied' };
        }

        (req.session as any).gymId = user.gymId;
        (req.session as any).role = user.role;

        return { success: true, user };
    }
}
