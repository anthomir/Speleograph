import { Inject, OnInit, OnRoutesInit, Req, Res, Service } from '@tsed/common';
import { MongooseModel } from '@tsed/mongoose';
import { Person } from '../../models/Person';
import { UpdatePersonDto } from '../../dto/person/updatePerson';

@Service()
export class PersonService {
    @Inject(Person)
    private Person: MongooseModel<Person>;

    // JWT
    async findById(id: string): Promise<{ status: number; data: Person | null; message: string | null }> {
        try {
            const person = await this.Person.findById(id);

            if (!person) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            return { status: 200, data: person, message: 'Sensor found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async find(filter: any, skip: string, take: string, sortBy: string): Promise<{ status: number; data: Person[] | null; message: string | null }> {
        try {
            const data = filter
                ? await this.Person.find(JSON.parse(filter))
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined)
                : await this.Person.find()
                      .limit(take ? parseInt(take) : 100)
                      .skip(skip ? parseInt(skip) : 0)
                      .sort(sortBy ? sortBy : undefined);

            if (data.length === 0) {
                return { status: 404, data: null, message: 'No persons found' };
            }

            return { status: 200, data, message: 'Sensors found successfully' };
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    // JWT
    async post(body: any): Promise<{ status: number; data: Person | null; message: string }> {
        try {
            const newPerson = await this.Person.create({
                firstname: body.firstname,
                lastname: body.lastname,
                nick: body.nick,
            });

            if (newPerson) {
                return { status: 201, data: newPerson, message: 'Sensor created successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to create the person' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }

    async deleteById(id: string): Promise<{ status: number; message: string }> {
        try {
            const result = await this.Person.deleteOne({ _id: id });

            if (result.deletedCount === 1) {
                return { status: 200, message: 'Sensor deleted successfully' };
            } else {
                return { status: 404, message: 'Sensor not found' };
            }
        } catch (error) {
            return { status: 500, message: 'Internal server error' };
        }
    }

    async updatePerson(id: string, newData: UpdatePersonDto): Promise<{ status: number; data: Person | null; message: string }> {
        try {
            const person = await this.Person.findById(id);

            if (!person) {
                return { status: 404, data: null, message: 'Sensor not found' };
            }

            const updateData: Partial<Person> = {};

            for (const field in newData) {
                if (field in person) {
                    const key = field as keyof UpdatePersonDto;
                    updateData[key] = newData[key];
                }
            }

            const updatedPerson = await this.Person.findByIdAndUpdate(id, updateData, {
                new: true,
            });

            if (updatedPerson) {
                return { status: 200, data: updatedPerson, message: 'Sensor updated successfully' };
            } else {
                return { status: 500, data: null, message: 'Failed to update the person' };
            }
        } catch (error) {
            return { status: 500, data: null, message: 'Internal server error' };
        }
    }
}
