import { Inject, Service } from '@tsed/di';
import { MongooseModel } from '@tsed/mongoose';
import { Area } from 'src/models/Area';
import { BibliographicResource } from '../../models/BibliographicResource';

@Service()
export class BibliographicResourceService {
    @Inject(BibliographicResource)
    private BibliographicResource: MongooseModel<BibliographicResource>;

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ response: any; err: String | null }> {
        try {
            const data = filter
                ? await this.BibliographicResource.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.BibliographicResource.find()
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
            const response = await this.BibliographicResource.create({
                documentType: body.documentType,
                title: body.title,
                subject: body.subject,
                language: body.language,
                publisher: body.publisher,
                creator: body.creator,
                date: body.date,
                format: body.format,
                identifier: body.identifier,
                source: body.source,
            });

            return { response, err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error: ' + err };
        }
    }

    async delete(id: string): Promise<{ response: any; err: String | null }> {
        try {
            const data = await this.BibliographicResource.deleteOne({ _id: id });

            if (data.deletedCount == 0) {
                return { response: null, err: 'Delete Failed: We encountered an issue while attempting to delete the data' };
            }
            return { response: 'Deleted successfully', err: null };
        } catch (err) {
            return { response: null, err: 'Internal server error' };
        }
    }
}
