export interface IGetInfo {
  version: number;
  protocolversion: number;
  walletversion: number;
  balance: number;
  blocks: number;
  timeoffset: number;
  proxy: string;
  difficulty: number;
  testnet: boolean;
  keypoololdest: number;
  keypoolsize: number;
  paytxfee: number;
  relayfee: number;
  unlocked_until: number;
  errors: string;
}
