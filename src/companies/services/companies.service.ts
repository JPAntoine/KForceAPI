import { Container, SqlQuerySpec } from '@azure/cosmos';
import { InjectModel } from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { resCompanyDto } from '../dtos/resCompany.dto';
import { Company } from '../entities/company.entities';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company) private readonly companiesContainer: Container,
  ) {}

  async getByName(name: string): Promise<resCompanyDto> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE LOWER(c.Name) like LOWER(@value)',
      parameters: [
        {
          name: '@value',
          value: `%${name}%`,
        },
      ],
    };

    const cosmosResults = await this.companiesContainer?.items
      ?.query<Company>(querySpec)
      .fetchAll();

    const res = cosmosResults.resources.map<resCompanyDto>((value) => {
      return {
        name: value.Name,
        location: value.Location,
        description: value.Profile,
        websiteUrl: value.Website,
        companySize: value['Company Size'],
        imagURl: value.Image,
        id: value.id,
      };
    });

    return res[0];
  }
}
