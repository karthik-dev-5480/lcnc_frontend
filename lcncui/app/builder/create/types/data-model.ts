export interface DataTable {
  id: number;
  tableName: string;
  description?: string;
  columns?: DataColumn[];
  relationships?: any[];
}

export interface DataColumn {
  id?: number;
  columnName: string;
  dataType: string;
  length: number;
  precision: number;
  scale: number;
  isPrimaryKey: boolean;
  isIdentity: boolean;
  isRequired: boolean;
  isUnique: boolean;
  columnOrder: number;
}

export interface DataRelationship {
  id?: number;
  fkName?: string; // Optional, can be auto-generated
  
  // Changed from string names to number IDs
  sourceTableId: number;
  sourceColumnId: number;
  targetTableId: number;
  targetColumnId: number;
}