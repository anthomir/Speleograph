import { Context, PathParams, QueryParams, Res } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { Authenticate } from '@tsed/passport';
import { Get, Patch, Put } from '@tsed/schema';
import { NotificationService } from '../../services/notification/notification.service';
import { User } from '../../models/User';
import { Role } from '../../models/Enum';
import mongoose from 'mongoose';

@Controller('/notification')
export class NotificationController {
    @Inject(NotificationService)
    private notificationService: NotificationService;

    @Get('/:id')
    @Authenticate('jwt')
    async findById(@Context('user') user: User, @Res() res: Res, @PathParams('id') id: string) {
        try {
            if (user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            const result = await this.notificationService.findById({ _id: id });

            if (result.status === 200) {
                return res.status(200).json({ success: true, data: result.data });
            } else if (result.status === 404) {
                return res.status(404).json({ success: false, err: result.message });
            } else {
                return res.status(500).json({ success: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, err: 'Internal server error' });
        }
    }

    @Get('/')
    @Authenticate('jwt')
    async find(
        @Context('user') user: User,
        @Res() res: Res,
        @QueryParams('filter') filter: string,
        @QueryParams('skip') skip: string,
        @QueryParams('take') take: string,
        @QueryParams('sortBy') sortBy: string,
    ) {
        try {
            if (user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            let query = filter ? filter : {};

            const result = await this.notificationService.find(query, skip, take, sortBy);
            if (result.status === 200) {
                return res.status(200).json({ success: false, data: result.data, unreadCount: result.count });
            } else {
                return res.status(result.status).json({ success: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    @Patch('/mark-as-read')
    @Authenticate('jwt')
    async markAsRead(@Context('user') user: User, @Res() res: Res, @QueryParams('ids') ids: string[]) {
        try {
            if (user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
                return { status: 400, message: 'Invalid ObjectId in the array of notification IDs' };
            }

            const result = await this.notificationService.markNotificationsAsRead({ _id: { $in: ids } });

            if (result.status === 200) {
                return res.status(200).json({ success: true, message: 'Notifications marked as read successfully' });
            } else {
                return res.status(result.status).json({ success: false, err: result.message });
            }
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
