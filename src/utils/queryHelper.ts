import moment = require('moment');
import { constQueries } from 'src/constants/queries';

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
export class QueryHelper {
  getDocumentQuery(fields: Field[], isOrderBy: boolean = false) {
    const sqlQuery = constQueries.documentSqlQuery;
    let query = '';
    fields.forEach((field) => {
      query =
        query +
        'AND' +
        ' ' +
        'f.' +
        field.name +
        '=' +
        `'${field.value}'` +
        ' ';
    });
    if (isOrderBy) {
      query = query + 'ORDER BY f._ts DESC';
    }
    return sqlQuery + query;
  }
  getSingleFieldQuery(field: Array<string>, type: string, extraConfig?: any) {
    let query = '';
    let allFields = '';
    field.forEach((_) => {
      const temp = `f['${_}'],`;
      allFields = allFields.concat(temp);
    });
    if (extraConfig['isOverdue']) {
      query = `select DISTINCT ${allFields} f.documentId from documents f where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false)) AND f.type='instance' AND f.lifecycleState='${type}' AND udf.ifOverdue('${extraConfig.docTypeTargetProcessingTimeString}', f.receivedDate, f.pages)=1`;
    } else {
      query = `select DISTINCT ${allFields} f.documentId from documents f where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false)) AND f.type='instance' AND f.lifecycleState='${type}'`;
    }
    return query;
  }
  getDocumentTypeEntities(
    documentType: string,
    type: string,
    extraConfig?: any,
  ) {
    let query = ``;
    if (extraConfig['isOverdue']) {
      query = `select f.entities from documents f where f.documentType = "${documentType}" AND f.type="documentTypeDefinition"  AND f.lifecycleState='${type}' AND udf.ifOverdue('${extraConfig.docTypeTargetProcessingTimeString}', f.receivedDate, f.pages)=1`;
    } else {
      query = `select f.entities from documents f where f.documentType = "${documentType}" AND f.type="documentTypeDefinition"  AND f.lifecycleState='${type}'`;
    }
    return query;
  }
  getExtractionModuleQuery(fields: Field[]) {
    const sqlQuery = constQueries.extractionModuleSqlQuery;
    let query = '';
    fields.forEach((field) => {
      query = 'e.' + field.name + '=' + `'${field.value}'` + ' ';
    });
    return sqlQuery + query;
  }

  getCountQuery(
    fields: Field[],
    hasEntity: boolean,
    entityJoinQueries: any = null,
    extraConfig?: any,
  ) {
    let sqlQuery = constQueries.documentSqlQueryCount;
    let query = '';
    if (hasEntity && entityJoinQueries && entityJoinQueries.length > 0) {
      const joinQueries = entityJoinQueries.join(' ');
      sqlQuery = `SELECT COUNT(1) as count FROM documents f join ${joinQueries} where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false))`;
    }

    fields
      .filter((item) => !item.isLike)
      .forEach((field) => {
        const fieldName = field.isEntity
          ? field.name
          : 'f.' +
            (field.isMetadata
              ? `documentMetaData['${field.name}']`
              : field.name);
        query =
          query + 'AND' + ' ' + fieldName + '=' + `'${field.value}'` + ' ';
      });

    fields
      .filter((item) => item.isLike)
      .forEach((field) => {
        if (field.value !== '' && !Array.isArray(field.value)) {
          field.value = [field.value];
        }
        // if (field.value !== '') {
        //query = query + 'AND' + ' ' + 'f.' + field.name + ' LIKE ' + `'%${field.value}%'` + ' ';
        let fieldName = field.isEntity
          ? field.name
          : 'f.' +
            (field.isMetadata
              ? `documentMetaData['${field.name}']`
              : field.name);
        if (field.value.length > 0 && Array.isArray(field.value)) {
          // query = query + ` AND ARRAY_CONTAINS(${fieldName}, '${field.value}', true) `;
          query =
            query +
            ` AND ARRAY_CONTAINS(['${field.value.join("', '")}'], f.${
              field.name
            }, true) `;
        }
        // }
      });
    //Start ***Commented Due to wrong Pagination***
    // fields
    //     .filter(item => item.isLike)
    //     .forEach(field => {
    //         if (field.value !== '') {
    //             //query = query + 'AND' + ' ' + 'f.' + field.name + ' LIKE ' + `'%${field.value}%'` + ' ';
    //             if(field.name!='masterDocumentType' && field.name!='status')
    //             {
    //                 let fieldName = field.isEntity ? field.name : 'f.' + (field.isMetadata ? `documentMetaData['${field.name}']` : field.name);
    //                 query = query + ` AND CONTAINS(${fieldName}, '${field.value}', true) `;
    //             }
    //             else
    //             {
    //                 let fieldName = field.isEntity ? field.name : 'f.' + (field.isMetadata ? `documentMetaData['${field.name}']` : field.name);
    //                 query = query + ` AND CONTAINS(${fieldName}, '', true) `;
    //             }
    //         }
    //     });
    //End ***Commented Due to wrong Pagination***

    if (extraConfig['isOverdue']) {
      query += ` AND udf.ifOverdue('${extraConfig.docTypeTargetProcessingTimeString}', f.receivedDate, f.pages)=1`;
    }

    return sqlQuery + query;
  }

  getDocumentTypeCount(fields: Field[], extraConfig: any) {
    const sqlQuery = constQueries.documentTypeCountQuery;
    let query = '';
    fields.forEach((field) => {
      query =
        query +
        'AND' +
        ' ' +
        'f.' +
        field.name +
        '=' +
        `'${field.value}'` +
        ' ';
    });

    if (extraConfig['isOverdue']) {
      query += ` AND udf.ifOverdue('${extraConfig.docTypeTargetProcessingTimeString}', f.receivedDate, f.pages)=1 `;
    }

    query = query + 'GROUP BY f.masterDocumentType';
    return sqlQuery + query;
  }

  getInstanceQuery(
    selectFields: any,
    fields: Field[],
    startIndex: number,
    rowCount: number,
    orderByField: string,
    orderDirection: string,
    hasEntity: boolean,
    entityJoinQueries: any = null,
    extraConfig?: any,
  ) {
    let sqlQuery = '';
    if (hasEntity && entityJoinQueries && entityJoinQueries.length > 0) {
      const joinQueries = entityJoinQueries.join(' ');
      sqlQuery = `SELECT DISTINCT ${selectFields} FROM documents f join ${joinQueries} where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false))`;
    } else {
      sqlQuery = `SELECT DISTINCT ${selectFields} FROM documents f where (IS_DEFINED(f.isDeleted)= false OR (IS_DEFINED(f.isDeleted) AND f.isDeleted=false))`;
    }
    let query = '';

    fields
      .filter((item) => !item.isLike)
      .forEach((field) => {
        const fieldName = field.isEntity
          ? field.name
          : 'f.' +
            (field.isMetadata
              ? `documentMetaData['${field.name}']`
              : field.name);
        query =
          query + 'AND' + ' ' + fieldName + '=' + `'${field.value}'` + ' ';
      });

    fields
      .filter((item) => item.isLike)
      .forEach((field) => {
        if (field.value !== '') {
          // query = query + 'AND' + ' ' + 'f.' + field.name + ' LIKE ' + `'%${field.value}%'` + ' ';
          const fieldName = field.isEntity
            ? field.name
            : 'f.' +
              (field.isMetadata
                ? `documentMetaData['${field.name}']`
                : field.name);
          if (field.name === 'receivedDate') {
            const dateFormat = 'YYYY/MM/DD HH:mm:ss';
            const dayStart = moment(
              new Date(
                Array.isArray(field.value) ? field.value[0] : field.value,
              ).setHours(0, 0, 0, 0),
            ).format(dateFormat);
            const dayEnd = moment(
              new Date(
                Array.isArray(field.value)
                  ? field.value[1]
                    ? field.value[1]
                    : field.value[0]
                  : field.value,
              ).setHours(23, 59, 59, 999),
            ).format(dateFormat);
            query =
              query +
              `AND ${fieldName} >= "${dayStart}" and f.receivedDate < "${dayEnd}"`;
          } else {
            if (!Array.isArray(field.value)) {
              field.value = [field.value];
            }
            if (field.value.length > 0) {
              query =
                query +
                `AND ARRAY_CONTAINS(['${field.value.join(
                  "', '",
                )}'], ${fieldName})`;
            }
            // else {
            //     query = field.value!==''? query + `AND CONTAINS(${fieldName}, '${field.value}', true) `:query;
            // }
          }
        }
      });

    if (extraConfig['isOverdue']) {
      query =
        query +
        ` AND udf.ifOverdue('${extraConfig.docTypeTargetProcessingTimeString}', f.receivedDate, f.pages)=1 `;
    }
    query =
      query +
      `ORDER BY ${orderByField} ${orderDirection} OFFSET ${startIndex} LIMIT ${rowCount}`;
    return sqlQuery + query;
  }
}
