import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { Organization } from '../../models/Organization';
import { UpdateOrganizationDto } from '../../dto/organization/updateOrganization';

@Service()
export class OrganizationService {
    @Inject(Organization)
    private Organization: MongooseModel<Organization>;

    // JWT
    async findById(id: string): Promise<{ status: number; data: Organization | null; message: string | null }> {
        try {
            const organization = await this.Organization.findById(id);

            if (!organization) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            return { status: 200, data: organization, message: 'Sensor found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(
        filter: any,
        skip: string,
        take: string,
        sortBy: string,
    ): Promise<{ status: number; data: Organization[] | null; message: string | null }> {
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

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No organizations found' };
            }

            return { status: 200, data, message: 'Sensors found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Organization | null; message: string }> {
        try {
            const newOrganization = await this.Organization.create({
                mbox: body.mbox,
                homepage: body.homepage,
                streetAddress: body.streetAddress,
                postalCode: body.postalCode,
                addressLocality: body.addressLocality,
                addressCountry: body.addressCountry,
            });

            if (newOrganization) {
                return { status: 201, data: newOrganization, message: 'Sensor created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the organization' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const result = await this.Organization.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Sensor deleted successfully' };
            } else {
                return { status: 404, message: 'Sensor not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async updateOrganization(id: string, newData: UpdateOrganizationDto): Promise<{ status: number; data: Organization | null; message: string }> {
        try {
            const organization = await this.Organization.findById(id);

            if (!organization) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            const updateData: Partial<Organization> = {};

            for (const field in newData) {
                if (field in organization) {
                    const key = field as keyof UpdateOrganizationDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedOrganization = await this.Organization.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            if (updatedOrganization) {
                return { status: 200, data: updatedOrganization, message: 'Sensor updated successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to update the organization' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }
}
