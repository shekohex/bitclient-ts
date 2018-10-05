export interface IGetBlockChainInfo {
  chain: string;
  blocks: string;
  headers: string;
  bestblockhash: string;
  difficulty: string;
  mediantime: string;
  verificationprogress: string;
  chainwork: string;
  pruned: string;
  softforks: Softfork[];
  bip9_softforks: Bip9softforks;
}
interface Bip9softforks {
  csv: Csv;
  segwit: Segwit;
}
interface Segwit {
  status: string;
  bit: string;
  startTime: string;
  timeout: string;
  since: string;
}
interface Csv {
  status: string;
  startTime: string;
  timeout: string;
  since: string;
}
interface Softfork {
  id: string;
  version: string;
  reject: Reject;
}
interface Reject {
  status: string;
}
