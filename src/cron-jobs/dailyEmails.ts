import { Inject, Service } from '@tsed/di';
import cron from 'node-cron';
import { SensorType } from '../models/SensorType';
import { MongooseModel } from '@tsed/mongoose';
import { Sensor } from '../models/Sensor';
import { CaveObservation } from '../models/CaveObservation';
import { User } from '../models/User';
import sgMail from '@sendgrid/mail';
import { Role } from '../models/Enum';
sgMail.setApiKey(String(process.env.SENDGRID_API));

@Service()
export class DailyEmail {
    @Inject(SensorType)
    SensorType: MongooseModel<SensorType>;
    @Inject(Sensor)
    Sensor: MongooseModel<Sensor>;
    @Inject(CaveObservation)
    CaveObservation: MongooseModel<CaveObservation>;
    @Inject(User)
    User: MongooseModel<User>;

    startBackgroundJob(): void {
        console.log('Admin Email Service Started...');

        cron.schedule('0 0 * * *', () => {
            this.emailNotification();
            console.log(' ** CRON JOB RAN ');
        });
    }

    async createNow(): Promise<void> {
        await this.emailNotification();
    }

    async emailNotification(): Promise<void> {
        try {
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const sensors = await this.Sensor.find({ deletedAt: { $gte: twentyFourHoursAgo } });
            const caveObservations = await this.CaveObservation.find({ deletedAt: { $gte: twentyFourHoursAgo } });
            const sensorTypes = await this.SensorType.find({ deletedAt: { $gte: twentyFourHoursAgo } });

            if (!sensors && !caveObservations && !sensorTypes) {
                return;
            }

            const users = await this.User.find({ role: Role.Admin });

            users.forEach(async (user) => {
                const mailOptions = {
                    to: user.email,
                    from: String(process.env.EMAIL),
                    subject: 'Speleograph Admin Notification',
                    html: `
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: 'Arial', sans-serif;
                                line-height: 1.6;
                                margin: 0;
                                padding: 0;
                            }
                            .container {
                                max-width: 600px;
                                margin: 20px auto;
                            }
                            .header {
                                background-color: #007BFF;
                                color: #fff;
                                padding: 20px;
                                text-align: center;
                            }
                            .content {
                                padding: 20px;
                            }
                            .footer {
                                background-color: #f8f8f8;
                                padding: 10px;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Hello ${user.firstName},</h1>
                                <p>This is a daily notification to inform you about the objects that have been deleted in the past 24 hours.</p>
                            </div>
                            <div class="content">
                                <h2>Sensors: ${sensors.length}</h2>
                                <ul>
                                    ${sensors.map((sensor) => `<li>${sensor}</li>`).join('')}
                                </ul>
                                <h2>Sensor Types: ${sensorTypes.length}</h2>
                                <ul>
                                    ${sensorTypes.map((type) => `<li>${type}</li>`).join('')}
                                </ul>
                                <h2>Cave Observation: ${caveObservations.length}</h2>
                                <ul>
                                    ${caveObservations.map((observation) => `<li>${observation}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="footer">
                                <p>Speleograph</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                };

                await sgMail.send(mailOptions, false, (err, result): any => {
                    if (err) {
                        console.log(`Error Daily Email: ${err}`);
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    }
}
