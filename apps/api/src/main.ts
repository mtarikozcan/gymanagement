import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import session from 'express-session';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS configuration
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });

    // Cookie parser
    app.use(cookieParser());

    // Session configuration
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'pulsegym-secret-change-in-production',
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'lax',
            },
        }),
    );

    // Global prefix
    app.setGlobalPrefix('api');

    const port = process.env.API_PORT || 3001;
    await app.listen(port);

    console.log(`🏋️ PulseGym API running on http://localhost:${port}`);
}

bootstrap();
