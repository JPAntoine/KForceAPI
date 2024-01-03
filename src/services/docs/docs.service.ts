import { Injectable } from '@nestjs/common';
import { DocumentCosmosDB } from 'src/library/document.cosmos.container';
import { IDocumentDetails } from 'src/types/document';
import { QueryHelper } from 'src/utils/queryHelper';
import * as helper from './helper';

@Injectable()
export class DocsService {
  blob: BlobStorage;
  documentDataBase: DocumentCosmosDB;
  queryHelper: QueryHelper = new QueryHelper();

  constructor(private readonly documentDb: DocumentCosmosDB) {
    this.documentDataBase = documentDb;
  }

  getDocumentsById = async (
    documentId: string,
  ): Promise<Partial<IDocumentDetails>> =>
    await helper.getDocumentsById(this, documentId);
}
