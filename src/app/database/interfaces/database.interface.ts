import type { EndpointTemplateReferenceModel } from "./endpoint-template-reference.interface"
import type { EndpointModel } from "./endpoint.interface"
import type { LogModel } from "./log.interface"
import type { RelayPayloadTemplateModel } from "./relay-payload-template.interface"
import type { ResponseTemplateModel } from "./response-template.interface"
import type { UserModel } from "./user.interface"
import type { Sequelize } from "sequelize"

export interface Models {
  User: UserModel
  Endpoint: EndpointModel
  Log: LogModel
  ResponseTemplate: ResponseTemplateModel
  RelayPayloadTemplate: RelayPayloadTemplateModel
  EndpointTemplateReference: EndpointTemplateReferenceModel
}

export interface Db {
  connected: boolean
  sequelize: Sequelize
  models: Models
}
