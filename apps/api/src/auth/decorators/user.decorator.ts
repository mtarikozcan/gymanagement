import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const session = request.session;

        const user = {
            id: session?.userId,
            gymId: session?.gymId,
            role: session?.role,
        };

        return data ? user[data as keyof typeof user] : user;
    },
);

export const CurrentGym = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.session?.gymId;
    },
);
