import { Context, Res } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { Authenticate } from '@tsed/passport';
import { Use } from '@tsed/platform-middlewares';
import { Patch } from '@tsed/schema';
import { CaveObservationService } from '../../services/observation/observation.service';
import { SensorService } from '../../services/sensor/sensor.service';
import { SensorTypeService } from '../../services/sensorType/sensorType.service';
import { User } from 'src/models/User';
import { Role } from 'src/models/Enum';

@Controller('/general')
export class GeneralController {
    @Inject(CaveObservationService)
    private observationSevice: CaveObservationService;
    @Inject(SensorService)
    private sensorService: SensorService;
    @Inject(SensorTypeService)
    private sensorTypeService: SensorTypeService;

    @Authenticate('jwt')
    @Patch('/restore')
    async getById(@Context('user') user: User, @Res() res: Res) {
        try {
            if (user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const cor = await this.observationSevice.restore({});
            const str = await this.sensorTypeService.restore({});
            const sr = await this.sensorService.restore({});

            if (cor.status === 200 && str.status === 200 && sr.status === 200) {
                return res.status(200).json({ message: 'All data restored successfully' });
            } else {
                return res.status(500).json({ message: 'Error restoring data' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
