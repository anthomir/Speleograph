import { Inject, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import axios from 'axios';
import { CaveObservation } from '../../models/CaveObservation';
import fs from 'fs';
import { User } from '../../models/User';
import { Role } from '../../models/Enum';

@Service()
export class CaveObservationService {
    @Inject(CaveObservation)
    private CaveObservation: MongooseModel<CaveObservation>;

    @Inject(User)
    private User: MongooseModel<User>;

    async find(req: Req, res: Res, filter?: string) {
        try {
            return res.status(200).json({ success: true, data: await this.CaveObservation.find(filter ? JSON.parse(filter) : {}) });
        } catch (err) {
            return res.status(500).json({ success: false, err: 'Internal Server Error' });
        }
    }

    async create(req: Req, res: Res, caveMetadata: any) {
        try {
            let request = { exp: undefined, iat: undefined, sub: undefined };
            request = { ...request, ...req.user };

            let user = await this.User.findById(request.sub);

            if (!user) {
                return res.status(500).json({ success: true, err: 'unauthorized' });
            }
            caveMetadata.createdBy = user._id;

            let cave = await this.CaveObservation.create(caveMetadata);
            return res.status(200).json({ success: true, data: cave });
        } catch (err) {
            return res.status(500).json({ success: false, err: 'Internal Server Error' });
        }
    }

    async postFile(req: Req, res: Res, file: any) {
        if (!file) return res.status(400).json({ success: false, err: 'File should be of type .CSV' });

        const filename = file.filename;
        const mimetype = file.mimetype.substring(file.mimetype.indexOf('/') + 1);

        fs.rename(`./public/uploads/${filename}`, `./public/uploads/${filename}.${mimetype}`, function (err) {
            if (err) return res.status(500).json({ success: false, err: '' });
        });
        return res.status(200).json({ success: false, data: { fileUrl: `${process.env.PRODUCTION_URL}/uploads/${filename}.${mimetype}` } });
    }

    async delete(req: Req, res: Res, id: string) {
        try {
            let request = { exp: undefined, iat: undefined, sub: undefined };
            request = { ...request, ...req.user };

            let contributionData = await this.CaveObservation.findById(id).lean();

            let user = await this.User.findById(request.sub).select('+role');

            if (!contributionData) {
                return res.status(404).json({ success: false, err: 'Contribution not found' });
            }
            if (!user) {
                return res.status(404).json({ success: false, err: 'User not found' });
            }

            if (contributionData.createdBy != user.id && user.role != Role.Admin) {
                return res.status(500).json({ success: true, err: 'Internal server error' });
            } else {
                let response = await this.CaveObservation.deleteOne({ _id: id });
                return res.status(200).json({ success: true, data: response });
            }
        } catch (err) {
            return res.status(500).json({ success: false, err: err });
        }
    }
}
