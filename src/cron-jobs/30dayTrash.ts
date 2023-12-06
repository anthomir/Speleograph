import { Inject, Service } from '@tsed/di';
import { MongooseModel } from '@tsed/mongoose';
import cron from 'node-cron';
import { CaveObservation } from '../models/CaveObservation';
import { Sensor } from '../models/Sensor';
import { SensorType } from '../models/SensorType';

@Service()
export class TrashingService {
    @Inject(SensorType)
    sensorType: MongooseModel<SensorType>;
    @Inject(Sensor)
    sensor: MongooseModel<Sensor>;
    @Inject(CaveObservation)
    caveObservation: MongooseModel<CaveObservation>;

    //Midnight everyday
    startBackgroundJob(): void {
        console.log('Cleaning Service Started...');
        cron.schedule('0 0 * * *', () => {
            this.clearingSensors();
            this.clearingSensorTypes();
            this.clearingObservations();
        });
    }

    async clearingSensors(): Promise<void> {
        console.log('Running: Cron-Job Clearing Sensors...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            await this.sensor.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo },
            });
        } catch (err) {
            console.log('Error Deleting Sensors:', err);
        }
    }

    async clearingSensorTypes(): Promise<void> {
        console.log('Running: Cron-Job Clearing SensorTypes...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            await this.sensorType.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo },
            });
        } catch (err) {
            console.log('Error Deleting SensorTypes:', err);
        }
    }

    async clearingObservations(): Promise<void> {
        console.log('Running: Cron-Job Clearing Observations...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            await this.caveObservation.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo },
            });
        } catch (err) {
            console.log('Error Deleting Observations:', err);
        }
    }
}
