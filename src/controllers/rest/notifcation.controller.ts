import { PathParams, QueryParams, Res } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { Authenticate } from '@tsed/passport';
import { Use } from '@tsed/platform-middlewares';
import { Get, Patch, Put } from '@tsed/schema';
import { AdminAuth } from '../../middlewares/adminAuth';
import { NotificationService } from '../../services/notification/notification.service';

@Controller('/sensor')
export class NotificationController {
    @Inject(NotificationService)
    private notificationService: NotificationService;

    @Get('/:id')
    @Use(AdminAuth)
    @Authenticate('jwt')
    async findById(@Res() res: Res, @PathParams('id') id: string) {
        try {
            if (id.length != 24) {
                return res.status(400).json({ sucess: false, err: 'Bad request' });
            }
            const result = await this.notificationService.findById({ _id: id, isDeleted: false });

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
    @Use(AdminAuth)
    @Authenticate('jwt')
    async find(
        @Res() res: Res,
        @QueryParams('filter') filter: string,
        @QueryParams('skip') skip: string,
        @QueryParams('take') take: string,
        @QueryParams('sortBy') sortBy: string,
    ) {
        try {
            let query = filter ? filter : {};
            query = { ...query, ...{ isDeleted: false } };

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
    @Use(AdminAuth)
    @Authenticate('jwt')
    async markAsRead(@Res() res: Res, @QueryParams('ids') ids: string[]) {
        try {
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
