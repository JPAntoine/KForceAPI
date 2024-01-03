export const constQueries = {
  documentSqlQuery:
    'SELECT * FROM documents f where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false)) ',
  extractionModuleSqlQuery: 'SELECT * FROM extractionmodule e where ',
  documentSqlQueryCount:
    'SELECT COUNT(1) as count FROM documents f where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false))',
  documentTypeCountQuery:
    'SELECT COUNT(1) as count, f.masterDocumentType as docType FROM documents f where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false))',
  verificationListQuery:
    'SELECT f.model, f.subModel, f.runBy, f.runAt, f.status, f.overAllVerificationStatus, f.rid FROM documents f where 1=1',
};
