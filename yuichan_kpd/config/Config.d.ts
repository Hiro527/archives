/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    token: string
    prefix: string
    guildId: string
    reportChannelId: string
    logChannelId: string
    kpdRoleId: string
    reportCommand: string
  }
  export const config: Config
  export type Config = IConfig
}
