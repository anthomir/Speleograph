import { Service } from '@tsed/di';
import cron from 'node-cron';

import { exec } from 'child_process';

@Service()
export class SnapshotService {
    startBackgroundJob(): void {
        console.log('Initializing Background Jobs');
        cron.schedule('0 0 * * *', () => {
            this.snapshot();
        });
    }

    async snapshot(): Promise<void> {
        exec('docker exec mongodb mongodump --out /backup', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error: ${stderr}`);
                return;
            }
            console.log(`Backup created successfully: ${stdout}`);
        });
    }
}
