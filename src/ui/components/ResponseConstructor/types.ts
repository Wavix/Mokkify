export type ObjectAttribute = "key" | "value" | "type"

export interface ResponseConstructorItem {
  uuid: string
  parentUUID: string | null
  key: string
  value?: string | number | undefined | null | boolean
  type?: FieldOption
}

export enum FieldOption {
  String = "String",
  Number = "Number",
  Null = "Null",
  Dynamic = "Dynamic",
  Variable = "Variable",
  Boolean = "Boolean",
  Array = "Array",
  ArrayElement = "ArrayElement"
}
