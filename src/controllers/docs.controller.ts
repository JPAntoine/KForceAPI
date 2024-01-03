import { Controller, Get, Param } from '@nestjs/common';
import { DocsService } from '../services/docs/docs.service';
import { IDocumentDetails } from 'src/types/document';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get(':id')
  getOne(@Param() params: any): Promise<Partial<IDocumentDetails>> {
    console.log(params.id);
    return this.docsService.getDocumentsById(params.id);
  }

}
