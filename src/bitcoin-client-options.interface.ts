import { RpcClientOptions } from 'jsonrpc-ts';

export interface BitcoinClientOptions extends RpcClientOptions {
  version: string;
}
