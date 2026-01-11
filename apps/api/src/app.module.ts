import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GymsModule } from './gyms/gyms.module';
import { MembersModule } from './members/members.module';
import { PlansModule } from './plans/plans.module';
import { MembershipsModule } from './memberships/memberships.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { TrainersModule } from './trainers/trainers.module';
import { ClassesModule } from './classes/classes.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        GymsModule,
        MembersModule,
        PlansModule,
        MembershipsModule,
        InvoicesModule,
        PaymentsModule,
        TrainersModule,
        ClassesModule,
        ReportsModule,
        AuditModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
})
export class AppModule { }
