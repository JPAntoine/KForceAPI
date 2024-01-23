import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { resCompanyDto } from '../dtos/resCompany.dto';
import { CompaniesService } from '../services/companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiQuery({ name: 'companyName' })
  async GetCompanyByName(
    @Query('companyName') companyName: string,
  ): Promise<resCompanyDto> {
    return this.companiesService.getByName(companyName);
  }
}
