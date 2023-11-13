import { User } from '../models/User';
import { Middleware } from '@tsed/platform-middlewares';
import { Context, Req, Res } from '@tsed/common';
import { Unauthorized } from '@tsed/exceptions';

@Middleware()
export class AdminAuth {
    use(@Req() req: Req, @Res() res: Res, @Context() context: Context) {
        const user: User | undefined = context.user;

        if (!user || user.role !== 'admin') {
            res.status(401).json({ success: false, err: 'Unauthorized' });
        }
    }
}
