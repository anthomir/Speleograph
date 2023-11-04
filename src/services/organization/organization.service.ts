import { Inject, Service } from '@tsed/di';
import { MongooseModel } from '@tsed/mongoose';
import { Organization } from 'src/models/organization';

@Service()
export class OrganizationService {
    @Inject(Organization)
    private Organization: MongooseModel<Organization>;

    // JWT
    async find(filter: any, take: string, skip: string, sortBy: string): Promise<{ response: any; err: String | null }> {
        try {
            const data = filter
                ? await this.Organization.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.Organization.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length == 0) {
                return { response: null, err: null };
            }

            return { response: data, err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ response: any; err: String | null }> {
        try {
            const response = await this.Organization.create({
                mbox: body.mbox,
                homepage: body.homepage,
                streetAddress: body.streetAddress,
                postalCode: body.postalCode,
                addressLocality: body.addressLocality,
                addressCountry: body.addressCountry,
            });

            return { response, err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error: ' + err };
        }
    }

    async delete(id: string): Promise<{ response: any; err: String | null }> {
        try {
            const data = await this.Organization.deleteOne({ _id: id });

            if (data.deletedCount == 0) {
                return { response: null, err: 'Delete Failed: We encountered an issue while attempting to delete the data' };
            }
            return { response: 'Deleted successfully', err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error' };
        }
    }
}
