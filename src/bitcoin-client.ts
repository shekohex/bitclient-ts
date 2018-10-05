/**
 * AUTO-GENERATED FILE.  DO NOT MODIFY.
 *
 * This class was automatically generated.
 * It should not be modified by hand.
 */
import { RpcClient, RpcClientOptions } from 'jsonrpc-ts';
import { BitcoinRpcService } from './bitcoin-rpc-service.interface';
import { IGetBlockChainInfo, IGetWalletInfo } from './interfaces';
export class BitcoinClient {
  private readonly rpcClient: RpcClient<BitcoinRpcService>;
  constructor(readonly options: RpcClientOptions) {
    this.rpcClient = new RpcClient(options);
  }

  /**
   * The getaccount RPC returns the name of the account associated with the given address.
   */
  public async getAccount(address: string): Promise<string> {
    const res = await this.rpcClient.makeRequest<'getaccount', string>({
      method: 'getaccount',
      id: Date.now(),
      params: [address],
      jsonrpc: '2.0',
    });
    // TODO: Handle Errors

    return res.data.result!;
  }

  /**
   * The getwalletinfo RPC provides information about the wallet.
   */
  public async getWalletInfo(): Promise<IGetWalletInfo> {
    const res = await this.rpcClient.makeRequest<'getwalletinfo', IGetWalletInfo>({
      method: 'getwalletinfo',
      id: Date.now(),
      params: [],
      jsonrpc: '2.0',
    });
    // TODO: Handle Errors

    return res.data.result!;
  }

  /**
   * The getblockchaininfo RPC provides information about the current state of the block chain.
   */
  public async getBlockChainInfo(): Promise<IGetBlockChainInfo> {
    const res = await this.rpcClient.makeRequest<'getblockchaininfo', IGetBlockChainInfo>({
      method: 'getblockchaininfo',
      id: Date.now(),
      params: [],
      jsonrpc: '2.0',
    });
    // TODO: Handle Errors

    return res.data.result!;
  }
}
