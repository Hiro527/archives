/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    token: string
    prefix: string
    guildId: string
    notifyCh: string
    updateCh: string
    logCh: string
    release: string
  }
  export const config: Config
  export type Config = IConfig
}
