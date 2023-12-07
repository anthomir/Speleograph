import { Service } from '@tsed/di';
import cron from 'node-cron';

import { exec } from 'child_process';

@Service()
export class SnapshotService {
    startBackgroundJob(): void {
        console.log('Snapshot Service Started...');
        cron.schedule('0 0 * * *', () => {
            this.snapshot();
        });
    }

    async snapshot(): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
        const backupPath = `/backup/snapshot_${timestamp}`;

        exec(`docker exec speleograph-mongodb-1 mongodump --out ${backupPath}`, (error, stdout, stderr) => {
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
