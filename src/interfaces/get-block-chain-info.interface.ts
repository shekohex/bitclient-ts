export interface IGetBlockChainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  chainwork: string;
  pruned: boolean;
  softforks: Softfork[];
  bip9_softforks: Bip9softforks;
}
interface Bip9softforks {
  csv: Csv;
  segwit: Segwit;
}
interface Segwit {
  status: string;
  bit: number;
  startTime: number;
  timeout: number;
  since: number;
}
interface Csv {
  status: string;
  startTime: number;
  timeout: number;
  since: number;
}
interface Softfork {
  id: string;
  version: number;
  reject: Reject;
}
interface Reject {
  status: boolean;
}
