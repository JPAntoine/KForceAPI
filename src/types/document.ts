import { Field } from '../utils/queryHelper';
import {
  IPublishTextClassificationStatus,
  ITextClassificationTrainingStatus,
} from './configurations';

export interface ICongnitiveSearchConfig {
  searchUrl: string;
  searchApiVersion: string;
  searchIndexName: string;
  searchKey: string;
  enableAdvancedSearch: false;
}
export interface IDocument {
  documentId: string;
  documentType: string;
  status: string;
  time: number;
  lifecycleState: string;
  pages?: any[];
  documentPath?: string;
  processingProgressPercentage?: number;
  metadata?: any;
  documentTypes?: string;
}

export interface ILandingPageDocumentInfo {
  documents: Array<IDocument>;
  maximumProcessedFilesCanDelete: number;
  totalItems: number;
  totalPages: number;
  docTypeCounts: Array<IDocTypeCount>;
  allDocumentNames: Array<IDocName>;
}

export interface IDocTypeCount {
  docType: string;
  count: number;
}

export interface IDocName {
  documentName: string;
}

export interface IGridConfig {
  startIndex: number;
  orderByField: string;
  orderDirection: string;
  pageSize: number;
  fields: Array<Field>;
  filters?: { [key: string]: IFilterValue };
  advanceFilter?: any;
  findOverdue?: boolean;
}

export interface IFilterValue {
  matchMode: string;
  value: string | string[];
}

export interface IDocumentDetails extends IDocument {
  documentId: string;
  documentType: string;
  documentName: string;
  status: string;
  time: number;
  entities: Array<IEnity>;
  correlationId: string;
  rejectReason?: string;
  rejectDate?: Date;
  masterDocumentType: string;
  classificationConfidenceScore: number;
  rejectedBy?: string;
  documentTypeArray?: Array<IDocumentTypeObj>;
  processingProgressPercentage?: number;
}
export interface IDocumentTypeObj {
  documentType: string;
  classificationScore: string;
}

export interface ISecurityClass {
  id: string;
  name: string;
}

export interface IModule {
  id: number;
  name: string;
  default: boolean;
  isChild?: boolean;
  parentModuleId?: number;
  disabled?: boolean;
  restrictedToEntityTypes?: Array<EntityType>;
  entityTypeConfiguration?: Array<IEntityTypeConfiguration>;
  configuration?: Array<IModuleConfiguration>;
  trainingRequired?: boolean;
  family?: string;
}

export interface IModuleObject {
  modules: Array<Partial<IModule>>;
  lookups: any;
}

interface IModuleConfigurationField {
  name: string;
  type:
    | 'String'
    | 'Number'
    | 'Boolean'
    | 'Complex'
    | 'ArrayOfString'
    | 'ArrayOfComplex';
  optional: boolean;
  listType?: any;
  defaultValue?: any;
  disabled?: boolean;
  visible?: boolean;
  fields?: Array<IModuleConfigurationField>;
}

export interface IModuleConfiguration {
  configurationLevel: string;
  entityType: EntityType;
  fields?: Array<IModuleConfigurationField>;
}

export interface IEntityTypeConfiguration {
  entityType: EntityType;
  singleExtractionMode: boolean;
  multiInstance: CheckboxState;
  mandatory: CheckboxState;
}

export interface CheckboxState {
  visible: boolean;
  checked: boolean;
}

export enum EntityType {
  Text = 'Text',
  Derived = 'derived',
  Hyperlink = 'Hyperlink',
  Checkbox = 'Checkbox',
  Signature = 'Signature',
  Array = 'Array',
  DrawnRegion = 'region',
  TableDefinition = 'Table Definition',
}

export interface IConfigData {
  securityClass: string;
  retentionPeriod: number;
  documentType: string;
  formRecThreshold: number;
  webHooks: Array<string>;
  modules: Array<string>;
  isTopicModelingEnabled: boolean;
  isTextClassificationEnabled: boolean;
  destinations: Array<IDestination>;
  entities: IEnity[];
  mappedEntities: any[];
  extractionModules: any;
  buildMode?: string; // build mode for the document
  baselineConfiguration: any;
  metadata?: any;
}
export interface IAssetBlob {
  name: string;
  pdfUrl: string;
}
export interface IEnity {
  entityId: number;
  entityName: string;
  valueType: string;
  values: Array<IEnityValue>;
  trainingImproved?: boolean;
  extractionModules: Array<any>;
  isTableDefinition?: boolean;
  entityType?: string;
  webHooks?: number[];
  mandatory: boolean;
  confidenceScore?: number;
  instanceExists?: boolean;
  isTableName?: boolean;
  entityAlternateName?: string;
  validationAssociation?: any;
  multiinstance?: boolean;
  fieldNames?: Array<any>;
}

export interface EntityValueCategory {
  name: string;
  subCategory?: EntityValueCategory;
  sortOrder?: number;
}

export interface IEnityValue {
  value: string;
  initialValue: string;
  pageNumber: number;
  confidenceScore: number;
  boundingBox: Array<number>;
  modified: false;
  trainingImproved?: boolean;
  category?: EntityValueCategory;
}

export interface IDocumentType {
  name: string;
  value: string;
  documentContainerName?: string;
  modelId: string;
  trainingStatus?: IDocumentTrainingStatus;
  publishedStatus?: IDocumentPublishStatus;
  id: string;
  lifecycleState?: string;
  formRecognizerThreshold: number;
  readOnly?: boolean;
  enableTextClassification?: boolean;
  subModels?: Array<IDocumentType>;
  isDefaultSubType?: boolean;
  masterDocumentType?: string;
  minimumDocumentTrainingCount?: number;
  userId?: string;
  maximumFilesCanTrain?: number;
  documentType?: string;
  buildMode?: string;
}

export interface IChangeDocumentTypePostData {
  documentType: string;
  masterDocumentType: string;
  documentContainerName: string;
  classificationTagName: string;
  documentInstanceId: string;
  lifecycleState: string;
  documentTypes: string;
  triggerId: string;
  pageNumber?: number;
  isNew?: boolean;
}

export interface IDocumentTypePostData {
  documentType: string;
  documentContainerName: string;
  classificationTagName: string;
  id: string;
  masterDocumentType: string;
  trainingInitiatedBy: string;
  isFormRecTrainingEnabled: boolean;
  isTextTrainingEnabled: boolean;
  isTopicModelingEnabled: boolean;
  isPublishDocumentType: boolean;
  extractionModules?: string;
}

export interface IDocumentTypeDefinition {
  type: string;
  documentType: string;
  classificationTagName: string;
  modelId: string;
  documentId: string;
  documentName: string;
  documentPath: string;
  documentContainerName: string;
  // buildModel:string;
  status: string;
  pages: [];
  entities: Array<IEnity>;
  retentionPeriod?: number;
  repeatingDataObjects?: any;
  definitions?: any;
  FrVersion?: string;
  overlappingDataObjects?: IOverlappingDataObject[];
  webHooks: string[];
}

export interface IDocumentData {
  container: string;
  fileName: string;
  content: string;
  id?: string;
  documentType?: string;
  userId?: string;
  forceGenerate?: boolean;
}

export interface IDocumentAndType {
  fileName: string;
  documentType: string;
}

export interface IDocumentExport {
  documentId: string;
  documentType: string;
  status: string;
  entities: Array<IEnity>;
  time: number;
}

export interface IModuleData {
  moduleId: number;
  moduleName: string;
}

export interface IWebhookData {
  type: string;
  webHooks: Array<IWebHook>;
}

export interface IWebHook {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

export interface IDestinationData {
  destinations: Array<IDestination>;
}
export interface IDestination {
  name: string;
  queuename: string;
  properties?: any[];
  mappedEntities?: any;
}

export interface IDConfigData {
  entities: Partial<IEntityArr>;
  extractionModules: any;
  numberOfDocuments: number;
  destinations: Array<IDestination>;
  transformers: IWebHook[];
}

export interface IEntitys {
  fieldName: string;
  accuracy: number;
}

export interface IEntityArr {
  formRecThreshold: number;
  overallAccuracy: number;
  formRecLastTrained: string;
  entities: IEntitys[];
  status: string;
}

export interface IDocConfig {
  title: string;
  trainingData: any;
  publishedData: any;
}

export interface IFieldsJson {
  fields: IField[];
  webHooks?: string[];
  definitions?: any;
  overlappingDataObjects?: IOverlappingDataObject[];
  tables?: any;
}

export interface IOverlappingDataObject {
  entityName: string;
  fieldNames: any[];
}

export interface IField {
  fieldFormat: string;
  fieldType: string;
  fieldKey: string;
  generatedBy?: string;
  entityTableInfo?: ITableEntityInfo;
  entityType?: string;
  webHooks?: number[];
  mandatory?: boolean;
  multiinstance?: boolean;
  extractionModules?: any[];
}

export interface ITableDefinition {
  columns: Array<IExtractColumn>;
}

export interface IExtractColumn {
  name: string;
  show: boolean;
  actualName: string;
}
export interface ITableEntityInfo {
  isLoadColumnNamesFromTable: boolean;
  tableDefinition?: ITableDefinition;
  tableFeature: object;
}

export interface IDocumentTrainingStatus {
  instanceId?: string;
  status: string;
  trainingStartDateTime?: number;
  trainingInitiatedBy?: string;
  formRecognizer?: ITrainingStatus;
  trainingCompletedDateTime?: number;
  fileChanges?: number;
  tagChanges?: number;
  versionNumber?: number;
  textClassificationTrainingStatus?: ITextClassificationTrainingStatus;
}

export interface IDocumentPublishStatus {
  status: string;
  publishStartDateTime?: number;
  publishInitiatedBy?: string;
  formRecognizer?: ITrainingStatus;
  instanceId?: string;
  publishedCompletedDateTime?: number;
  steps?: IPublishSteps;
  versionNumber?: number;
  publishTextClassificationStatus?: IPublishTextClassificationStatus;
}

export interface IPublishSteps {
  isFormRecognizerDocumentBackedUp?: boolean;
  isImageUploadedToCV?: boolean;
  isTrained?: boolean;
  isPublished?: boolean;
  reasonForNotTrained?: string;
  status: string;
}

export interface ITrainingStatus {
  status?: string;
  reason?: string;
  completedDateTime?: Date;
  runFRTrai?: boolean;
  lastTrained?: Date;
  lastStatus?: string;
  lastReason?: string;
  runTextTraining?: boolean;
}

export interface ITrainingRequest {
  folderName: string;
  lifecycleState: string;
  correlationId: string;
  masterDocumentType: string;
  trainingInitiatedBy: string;
  isFormRecTrainingEnabled: boolean;
  clientType: string;
  isTextTrainingEnabled: boolean;
  isTopicModelingEnabled?: boolean;
}

export interface IPublishRequest {
  folderName: string;
  correlationId: string;
  publishInitiatedBy: string;
  lifecycleState: string;
  masterDocumentType: string;
  clientType: string;
  isTextTrainingEnabled: boolean;
  isPublishDocumentType: boolean;
}

export interface IUpdateEntityConfidence {
  documentId: string;
  entityName: string;
  newConfidenceScore: number;
}

export interface IRejectDocumentData {
  rejectReason: string;
  documentId: string;
  rejectDate: Date;
  rejectedBy: string;
  timeSpent: number;
  lifecycleState: string;
  documentType?: string;
}
export interface IValidateData {
  id: string;
  status: string;
  validatedBy: string;
  validatedDate: Date;
  timeSpent: number;
  lifecycleState: string;
}
export interface ILandingPageDocumentInfo {
  documents: Array<IDocument>;
  maximumProcessedFilesCanDelete: number;
}

export interface IFileToProcess {
  fileUrl: string;
  documentTYpe: string;
}

export interface IFileToProcessRequest {
  files: IFileToProcess[];
  id?: any;
  type?: string;
  trigger: number;
}

export interface IBlobInfo {
  container: string;
  folder: string;
  blobName: string;
  type: string;
}

export type BiDemandData = {
  categories: Array<Category>;
};

export type Category = {
  name: string;
  sortOrder: number;
  entities: Array<CategoryEntity>;
};

export type CategoryEntity = {
  name: string;
  values: Array<CategoryEntityValue>;
};

export type CategoryEntityValue = {
  value: string;
  display: boolean;
  category?: Category;
};

export interface IBaseLineConfigration {
  isEnabled: boolean;
  targetProcessingTime?: number;
  manualProcessingTime?: number;
  manualProcessingRate?: number;
  dipValidationRate?: number;
  businessGroupOwner?: string;
}

export type IRenameDocumentType = {
  documentType: string;
  newDocumentType: string;
  id: string;
  initiatedBy: string;
};

export interface IClientsConfiguration {
  id: string;
  type: string;
  clients?: IClient[];
}

export interface IClient {
  id: number;
  name: string;
  trainingstatusqueueName: string;
}

export interface IReqGenerateUIElement {
  clientID: number;
  component: string;
  responseBlobPath: any;
  responseQueues: string[];
  documentType?: string;
  eventType?: string;
  eventData?: {
    uploadedFiles?: Array<string>;
    addedModules?: Array<number>;
    deletedModules?: Array<number>;
    assetList?: Array<string>;
    tagName?: string;
  };
}

export interface IReqPromptOpenAI {
  promptText: string;
  temperature: string;
}

export interface IInvokeRequest {
  clientID: number;
  modules: IInvokeModulesData[];
}

export interface IInvokeModulesData {
  moduleId: number;
  component: string;
  fullFileName: string;
}

export interface IExtractionModule {
  moduleId: number;
  nextSteps?: Array<IExtractionModule>;
  default?: boolean;
}

export interface IRepeatingObject {
  entityName: string;
  fieldNames: Array<string>;
}
export interface IModuleTrainingData {
  moduleId: number;
  value: Array<ITrainingData>;
}
export interface ITrainingData {
  document: string;
  labels: Array<ILabel>;
  $schema?: string;
}

export interface ILabel {
  label: string;
  key?: any;
  isTableDefinition?: boolean;
  mandatory?: boolean;
  entityType: string;
  value: Array<ILabelValue>;
}

export interface ILabelValue {
  page: number;
  text: string;
  boundingBoxes: Array<Array<string>>;
}
