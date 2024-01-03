import {
  BlobServiceClient,
  generateAccountSASQueryParameters,
  StorageSharedKeyCredential,
  AccountSASPermissions,
  ContainerClient,
  BlobClient,
} from '@azure/storage-blob';
import { AppConstants } from 'src/constants';
import * as moment from 'moment';
import { BlobUtilities } from 'azure-storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlobStorage {
  static trainFormRecognizerStorage: BlobServiceClient;
  static trainingProcessedDataStorage: BlobServiceClient;
  static publishedProcessedDataStorage: BlobServiceClient;

  constructor() {
    type storageResult = { client: BlobServiceClient; didFail: boolean };
    type blobClientRequest = { clientLabel: string; connString: string };

    if (!BlobStorage.trainFormRecognizerStorage) {
      if (
        AppConstants.formRecognizerStorageAccountOrConnectionString &&
        AppConstants.storageAccountTrainingPipelineConnectionString &&
        AppConstants.storageAccountPublishedPipelineConnectionString
      ) {
        const blobClientsToGet: blobClientRequest[] = [
          {
            clientLabel: 'Train Storage Account',
            connString:
              AppConstants.formRecognizerStorageAccountOrConnectionString,
          },
          {
            clientLabel: 'Training Pipeline Storage Account',
            connString:
              AppConstants.storageAccountTrainingPipelineConnectionString,
          },
          {
            clientLabel: 'Published Pipeline Storage Account',
            connString:
              AppConstants.storageAccountPublishedPipelineConnectionString,
          },
        ];

        console.log(`storage.ts: Initializing blob clients:`, blobClientsToGet);

        const storageResults: storageResult[] = blobClientsToGet.reduce(
          (
            storageResults: storageResult[],
            blobClientRequest: blobClientRequest,
          ) => {
            try {
              return storageResults.concat(<storageResult>{
                didFail: false,
                client: BlobServiceClient.fromConnectionString(
                  blobClientRequest.connString,
                ),
              });
            } catch (ex) {
              console.error(
                `storage.ts: Error: failed to instantiate a blob client [${blobClientRequest.clientLabel}] ` +
                  `using connection string: [${blobClientRequest.connString}]. ` +
                  `This usually indicates a configuration error. Check your .env file.`,
              );
              // console.error(`storage.ts: Error: Detailed error on attempt to instantiate ${blobClientRequest.clientLabel}:`, ex);
              return storageResults.concat(<storageResult>{
                didFail: true,
                client: null,
              });
            }
          },
          [] as storageResult[],
        );

        if (storageResults.some((sr) => sr.didFail)) {
          const errMsg = `BlobStorage: constructor: One or more attempts to initialize blob storage failed, see logs for details.`;
          throw errMsg;
        }

        try {
          BlobStorage.trainFormRecognizerStorage = storageResults[0].client;
        } catch (ex) {
          console.error(
            `storage.ts: Error: failed to intantiate BlobStorage.storage using connection string: [${AppConstants.formRecognizerStorageAccountOrConnectionString}]`,
          );
          console.error(
            'storage.ts: Error: Detailed error on attempt to instantiate BlobStorage.storage:',
            ex,
          );
        }

        try {
          BlobStorage.trainingProcessedDataStorage = storageResults[1].client;
        } catch (ex) {
          console.error(
            'storage.ts: Error: failed to intantiate Testing BlobStorage.processedDataStorage with error:',
            ex,
          );
        }
        try {
          BlobStorage.publishedProcessedDataStorage = storageResults[2].client;
        } catch (ex) {
          console.error(
            'storage.ts: Error: failed to intantiate Published BlobStorage.processedDataStorage with error:',
            ex,
          );
        }
      }
    }
  }

  trainUri() {
    return BlobStorage.trainFormRecognizerStorage.url;
  }

  async getSasToken() {
    ///Create Access Key Credential
    let skc: any = BlobStorage.trainFormRecognizerStorage.credential;

    let tmr = moment().add(-24, 'h').toDate();
    let tmrs = moment().add(24, 'h');
    let tmres = tmrs.toDate();
    ///Generate SAS Token
    let sas = generateAccountSASQueryParameters(
      {
        permissions: AccountSASPermissions.parse('rwdlac'),
        resourceTypes: 'sco',
        services: 'b',
        startsOn: tmr,
        expiresOn: tmres,
      },
      skc,
    );
    return sas.toString();
  }
  async getSasTokenForProcessDocument(lifecycleState: string) {
    ///Create Access Key Credential
    let skc: any;

    if (lifecycleState == 'training') {
      skc = await BlobStorage.trainingProcessedDataStorage.credential;
    }

    if (lifecycleState == 'published') {
      skc = await BlobStorage.publishedProcessedDataStorage.credential;
    }

    let tmr = moment().add(-24, 'h').toDate();
    let tmrs = moment().add(24, 'h');
    let tmres = tmrs.toDate();
    ///Generate SAS Token
    let sas = generateAccountSASQueryParameters(
      {
        permissions: AccountSASPermissions.parse('rwdlac'),
        resourceTypes: 'sco',
        services: 'b',
        startsOn: tmr,
        expiresOn: tmres,
        version: '2019-02-02',
      },
      skc,
    );
    return sas.toString();
  }

  async getFile(folder: string, fileName) {
    let containerClient: ContainerClient =
      BlobStorage.trainFormRecognizerStorage.getContainerClient(
        AppConstants.storageTrainingContainerName,
      );
    let token = await this.getSasToken();
    return containerClient.url + '/' + folder + '/' + fileName + '?' + token;
  }

  async getDocument(folder: string, fileName, lifecycleState: string) {
    //    let containerClient: ContainerClient = BlobStorage.trainFormRecognizerStorage.getContainerClient(AppConstants.storageTrainingContainerName);
    let containerClient: ContainerClient;
    if (lifecycleState == 'training') {
      containerClient =
        BlobStorage.trainingProcessedDataStorage.getContainerClient(
          AppConstants.uploadDocumentContainerName,
        );
    } else {
      containerClient =
        BlobStorage.publishedProcessedDataStorage.getContainerClient(
          AppConstants.uploadDocumentContainerName,
        );
    }
    let token = await this.getSasTokenForProcessDocument(lifecycleState);
    return containerClient.url + '/' + folder + '/' + fileName + '?' + token;
  }
  async postDocument(
    folder: string,
    fileName,
    lifecycleState: string,
    arrayBuffer,
  ) {
    let containerClient: ContainerClient;
    if (lifecycleState == 'training') {
      containerClient =
        BlobStorage.trainingProcessedDataStorage.getContainerClient(
          AppConstants.uploadDocumentContainerName,
        );
    } else {
      containerClient =
        BlobStorage.publishedProcessedDataStorage.getContainerClient(
          AppConstants.uploadDocumentContainerName,
        );
    }
    let blockBlobClient = containerClient.getBlockBlobClient(
      folder + '/' + fileName,
    );
    let metadata = {};
    let uploadBlobResponse = await blockBlobClient.upload(
      arrayBuffer,
      arrayBuffer.length,
      metadata,
    );
    return uploadBlobResponse;
  }
  async getFiles(folderName: string) {
    let containerClient: ContainerClient =
      BlobStorage.trainFormRecognizerStorage.getContainerClient(
        AppConstants.storageTrainingContainerName,
      );

    let SAS = await this.getSasToken();

    let blobs = [];
    try {
      for await (const response of containerClient
        .listBlobsFlat({
          prefix: folderName + '/',
        })
        .byPage({ maxPageSize: 20 })) {
        for (const item of response.segment.blobItems) {
          let fullFileName = '';
          if (!item.name.endsWith('.json')) {
            fullFileName = item.name;
          }
          if (
            item.name.indexOf(
              `/${AppConstants.formRecognizerTrainingFolderName}/`,
            ) < 0 &&
            item.name.indexOf(
              `/${AppConstants.formRecognizerUIElementsFolderName}/`,
            ) < 0 &&
            item.name.endsWith('.pdf')
          ) {
            let isPdf = false;
            let name = '';

            if (item.name.endsWith('.pdf')) {
              name = item.name.replace('.pdf', '');
              isPdf = true;
            }

            let existing = blobs.find((x) => x.name == name);
            let itemUrl = item.name;
            let url =
              decodeURIComponent(
                containerClient.getBlockBlobClient(itemUrl).url,
              ) +
              '?' +
              SAS;
            if (existing) {
              blobs = blobs.map((blobItem) => {
                if (blobItem.name == name) {
                  if (isPdf) {
                    blobItem.pdfUrl = url;
                  }

                  if (fullFileName) {
                    blobItem.fullFileName = fullFileName;
                  }
                }
                return blobItem;
              });
            } else {
              blobs.push({
                name: name,
                fullFileName: fullFileName ? fullFileName : '',
                pdfUrl: isPdf ? url : '',
              });
            }
          }
        }
      }
    } catch (ex) {}

    return blobs;
  }
  // definition

  ///upload text data to blob
  public async uploadData(container: string, fileName: string, content: any) {
    try {
      let uploaded = await BlobStorage.trainFormRecognizerStorage
        .getContainerClient(AppConstants.storageTrainingContainerName)
        .getBlockBlobClient(fileName)
        .upload(JSON.stringify(content), JSON.stringify(content).length);

      ///uploaded object

      return uploaded;
      //console.log(JSON.stringify(content).length);
    } catch (error) {
      console.log(error);
    }
  }

  async createBlob(
    containerName: string,
    folderName: string,
    blobName: string,
    arrayBuffer: ArrayBuffer,
  ) {
    try {
      console.log(
        `create blob called for container:${containerName},folder name:${folderName} and blob name:${blobName}`,
      );

      var containerClient: ContainerClient;
      containerClient =
        await BlobStorage.trainFormRecognizerStorage.getContainerClient(
          containerName,
        );
      let blockBlobClient = containerClient.getBlockBlobClient(
        folderName + '/' + blobName,
      );
      let uploadBlobResponse = await blockBlobClient.upload(
        arrayBuffer,
        arrayBuffer.byteLength,
      );
      return uploadBlobResponse;
    } catch (error) {
      console.log(error);
    }
  }

  getContrainerClient(connectionString: string, containerName: string) {
    let containerClient: ContainerClient = null;
    const serviceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    if (serviceClient) {
      containerClient = serviceClient.getContainerClient(containerName);
    }

    return containerClient;
  }

  async uploadProcessDocuments(
    folderName: string,
    blobName: string,
    arrayBuffer: ArrayBuffer,
    containerClient: ContainerClient,
    className: string,
  ) {
    try {
      console.log(
        `create blob called for container:${containerClient.containerName},folder name:${folderName} and blob name:${blobName}`,
      );
      let blockBlobClient = containerClient.getBlockBlobClient(
        folderName + '/' + blobName,
      );
      let metadata = {};
      if (className) {
        metadata = {
          metadata: {
            documentType: className,
          },
        };
      }

      let uploadBlobResponse = await blockBlobClient.upload(
        arrayBuffer,
        arrayBuffer.byteLength,
        metadata,
      );
      return uploadBlobResponse;
    } catch (error) {
      console.log(error);
    }
  }

  async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }

  async readText(containerName: string, folderName: string, blobName: string) {
    var containerClient =
      await BlobStorage.trainFormRecognizerStorage.getContainerClient(
        containerName,
      );
    let blockBlobClient = containerClient.getBlockBlobClient(
      folderName + '/' + blobName,
    );
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    return await this.streamToString(
      downloadBlockBlobResponse.readableStreamBody,
    );
  }

  async readTextFromUri(containerName: string, uri: string) {
    var containerClient =
      await BlobStorage.trainFormRecognizerStorage.getContainerClient(
        containerName,
      );
    let blockBlobClient = containerClient.getBlockBlobClient(uri);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    return await this.streamToString(
      downloadBlockBlobResponse.readableStreamBody,
    );
  }

  async writeText(
    containerName: string,
    folderName: string,
    blobName: string,
    arrayBuffer: string,
  ) {
    try {
      console.log(
        `create blob called for container:${containerName} and blob name:${blobName}`,
      );

      var containerClient =
        await BlobStorage.trainFormRecognizerStorage.getContainerClient(
          containerName,
        );

      let blockBlobClient = containerClient.getBlockBlobClient(
        folderName + '/' + blobName,
      );
      let uploadBlobResponse = await blockBlobClient.upload(
        arrayBuffer,
        arrayBuffer.length,
      );

      return uploadBlobResponse;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllFiles(containerName, folderName: string) {
    let containerClient: ContainerClient =
      BlobStorage.trainFormRecognizerStorage.getContainerClient(containerName);

    let blobs = [];

    try {
      for await (const response of containerClient
        .listBlobsFlat({
          prefix: folderName + '/',
        })
        .byPage({ maxPageSize: 20 })) {
        for (const item of response.segment.blobItems) {
          let itemUrl = item.name;
          //let url = containerClient.getBlockBlobClient(itemUrl).url;
          blobs.push(itemUrl);
        }
      }
    } catch (ex) {
      console.log(ex);
    }

    return blobs;
  }

  async download(containerName: string, path: string) {
    try {
      var containerClient =
        await BlobStorage.trainFormRecognizerStorage.getContainerClient(
          containerName,
        );
      let blockBlobClient = containerClient.getBlockBlobClient(path);
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      return await downloadBlockBlobResponse.readableStreamBody;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteBlob(containerName: string, path: string) {
    try {
      const containerClient =
        await BlobStorage.trainFormRecognizerStorage.getContainerClient(
          containerName,
        );
      const blockBlobClient = containerClient.getBlockBlobClient(path);
      await blockBlobClient.delete();
      return true;
    } catch (error) {
      console.log(error);
    }
  }

  // This is a pretty brute force way of deleting a single blob but msft seem to force it when your blob is in a container
  // Their infrastructure code encodes the / separator to %2F and then complains that the container doesn't exist.
  // This code gets all the blobs "flat", iterates over that collection and deletes it when it finds a match.
  async deleteBlobByFileName(containerClient: any, fileNameToDelete: string) {
    try {
      for await (const blob of containerClient.listBlobsFlat()) {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        if (blob.name === fileNameToDelete) {
          console.log(
            'deleteBlobByName: Deleting a blob of file name:',
            blob.name,
          );
          await blockBlobClient.delete();
        }
      }
      return true;
    } catch (error) {
      console.log(error);
    }
  }

  // This is a pretty brute force way of deleting a single blob but msft seem to force it when your blob is in a container
  // Their infrastructure code encodes the / separator to %2F and then complains that the container doesn't exist.
  // This code gets all the blobs "flat", iterates over that collection and deletes it when it finds a match.
  // async deleteBlobByFileName(containerName: string, fileNameToDelete: string, lifecycleState: string, folderName) {
  //     try {
  //         let containerClient;
  //         if (lifecycleState == 'training') {
  //             containerClient = await BlobStorage.trainingProcessedDataStorage.getContainerClient(containerName);
  //         }

  //         if (lifecycleState == 'published') {
  //             containerClient = await BlobStorage.publishedProcessedDataStorage.getContainerClient(containerName);
  //         }

  //         const processedFolder = AppConstants.processedDocumentContainerFolderName;

  //         for await (const blob of containerClient.listBlobsFlat()) {
  //             let areBlobsToDelete = blob.name.startsWith(`${processedFolder}/${folderName}`) || blob.name.endsWith(`${fileNameToDelete}`);

  //             if (areBlobsToDelete) {
  //                 let blockBlobClient = containerClient.getBlockBlobClient(blob.name);
  //                 console.log('deleteBlobByName: Deleting a blob of file name:', blob.name);
  //                 await blockBlobClient.delete();
  //             }
  //         }

  //         return true;
  //     } catch (error) {
  //         console.log(error);
  //     }
  // }

  generateSharedAccessSignature() {
    const expiryTime = parseInt(AppConstants.tokenExpiryTime);
    let startDate = new Date();
    let expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + expiryTime);
    startDate.setMinutes(startDate.getMinutes() - expiryTime);
    const sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: BlobUtilities.SharedAccessPermissions.READ,
        Start: startDate,
        Expiry: expiryDate,
      },
    };
    return sharedAccessPolicy;
  }
}
