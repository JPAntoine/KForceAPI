import { IDocumentDetails } from 'src/types/document';
import { DocsService } from './docs.service';
import { AppConstants } from 'src/constants';
import { ServiceHelper } from 'src/utils/serviceHelper';

export class Field {
  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
  name: string;
  value: string | string[];
  isLike?: boolean;
  isEntity?: boolean;
  isMetadata?: boolean;
}

export async function getDocumentsById(
  base: DocsService,
  documentId: string,
): Promise<Partial<IDocumentDetails>> {
  let fields: Field[] = [
    new Field('id', documentId),
    new Field('type', 'instance'),
  ];
  let query = base.queryHelper.getDocumentQuery(fields);

  const items = (await base.documentDataBase.getItems(query).fetchAll())
    .resources;

  const document: Partial<IDocumentDetails> = {};
  if (items.length > 0) {
    const item = items[0];
    const docInstanceFileName = `${item['documentId']}.json`;
    //  let docInstanceFromBlob = await base.blob.getAllFiles('documents', 'processed/'+item['documentId']);
    let blobRes;
    try {
      const stream = await base.blob.getDocument(
        AppConstants.processedDocumentContainerFolderName +
          '/' +
          item['documentId'],
        docInstanceFileName,
        item['lifecycleState'],
      );
      const res = await ServiceHelper.getWithAutoRetry(stream, {});
      blobRes = res.data;
    } catch (ex) {}

    if (item.hasOwnProperty('documentType')) {
      //TODO:BK refactor to use platform api
      fields = [
        new Field('type', 'documentTypeDefinition'),
        new Field('documentType', item['documentType']),
      ];
      query = base.queryHelper.getDocumentQuery(fields);

      // let docTypeResponse = await this.documentDataBase
      //     .getItems(`SELECT * FROM documents f where f.type='documentTypeDefinition' and f.documentType='${item['documentType']}'`)
      //     .fetchAll();
      const docTypeResponse = await base.documentDataBase
        .getItems(query)
        .fetchAll();

      const docType = docTypeResponse.resources[0];

      let documentPath = item['documentPath'];

      const lifecycleState = item['lifecycleState'];

      const accessToken =
        await base.blob.getSasTokenForProcessDocument(lifecycleState);

      const documentTypeArray = [];

      if (item['pages']) {
        item['pages'].forEach((page) => {
          let documentTypeObj = {};
          if (page.documentType && page.classificationScore) {
            documentTypeObj = {
              documentType: page.documentType,
              classificationScore: page.classificationScore,
            };
            documentTypeArray.push(documentTypeObj);
          }
        });
      }

      if (documentPath) {
        documentPath = documentPath.split('?')[0];
        documentPath = documentPath + '?' + accessToken;
      }
      document.documentName = decodeURIComponent(item['documentName']);
      document['documentPath'] = documentPath;
      document['documentType'] = item['documentType'];
      if (docType) {
        document['documentTypeId'] = docType['id'];
        document['documentConfidence'] =
          docType['formRecognizerThreshold'] || 0.0;
      }
      const objects = [];
      if (blobRes['objects']) {
        blobRes['objects'].forEach((x) => {
          if (!objects.find((y) => y.objectName == x.objectName)) {
            objects.push({ objectName: x.objectName });
          }
        });
      }
      objects.forEach((x) => {
        const objs = blobRes['objects'].filter(
          (y) => y.objectName == x.objectName,
        );
        objs.forEach((o) => {
          const namePart = o.instance.split('_');
          o.pageNumber = Number(namePart[namePart.length - 1]);
        });
        x.instances = objs;
      });

      document['documentId'] = blobRes['id'];
      document['status'] = blobRes['status'];
      document['time'] = blobRes['receivedDate'];
      document['pages'] = blobRes['pages'];
      document['processingStatus'] = blobRes['processingStatus'] || [];
      document['documentTypes'] = blobRes['documentTypes'];
      document['entities'] = blobRes['entities'];
      document['readResults'] = blobRes['readResults'] || [];
      document['tables'] = blobRes['tables'] || [];
      document['objects'] = objects;
      document['lifecycleState'] = lifecycleState;
      document['triggerId'] = blobRes['triggerId'];
      document['repeatingDataObjects'] = blobRes['repeatingDataObjects'];
      document['readOnly'] = blobRes['readOnly'];
      document['rejectReason'] = blobRes['rejectReason'];
      document['masterDocumentType'] = blobRes['masterDocumentType'];
      document['classificationConfidenceScore'] =
        blobRes['classificationConfidenceScore'];
      document['documentTypeArray'] = documentTypeArray;
      document['lifecycleState'] = blobRes['lifecycleState'] || '';
    }
  }

  return document;
}
