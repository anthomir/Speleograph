import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { UpdateSensorDto } from '../../dto/sensor/updateSensor';
import { Sensor } from '../../models/Sensor';

@Service()
export class SensorService {
    @Inject(Sensor)
    private Sensor: MongooseModel<Sensor>;

    // JWT
    async findById(id: string): Promise<{ status: number; data: Sensor | null; message: string | null }> {
        try {
            const sensor = await this.Sensor.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            return { status: 200, data: sensor, message: 'Sensor found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ status: number; data: Sensor[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.Sensor.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.Sensor.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No sensors found' };
            }

            return { status: 200, data, message: 'Sensors found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Sensor | null; message: string }> {
        try {
            const newSensor = await this.Sensor.create({
                name: body.name,
                serialNo: body.serialNo,
                sensorTypeId: body.sensorTypeId,
                createdBy: body.createdBy,
            });

            if (newSensor) {
                return { status: 201, data: newSensor, message: 'Sensor created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the sensor' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const result = await this.Sensor.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Sensor deleted successfully' };
            } else {
                return { status: 404, message: 'Sensor not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    // JWT
    async updateSensor(id: string, newData: UpdateSensorDto): Promise<{ status: number; data: Sensor | null; message: string }> {
        try {
            const sensor = await this.Sensor.findById(id);

            if (!sensor) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            const updateData: Partial<Sensor> = {};

            for (const field in newData) {
                if (field in sensor) {
                    const key = field as keyof UpdateSensorDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedSensor = await this.Sensor.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            if (updatedSensor) {
                return { status: 200, data: updatedSensor, message: 'Sensor updated successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to update the sensor' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }
}
