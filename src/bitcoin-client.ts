/**
 * AUTO-GENERATED FILE.  DO NOT MODIFY.
 *
 * This class was automatically generated.
 * It should not be modified by hand.
 */
import { RpcClient, RpcClientOptions } from 'jsonrpc-ts';
import { BitcoinRpcService } from './bitcoin-rpc-service.interface';
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
  public async getWalletInfo(): Promise<{
    walletversion: number;
    balance: number;
    txcount: number;
    keypoololdest: number;
    keypoolsize: number;
    unlocked_until: number;
  }> {
    const res = await this.rpcClient.makeRequest<
      'getwalletinfo',
      {
        walletversion: number;
        balance: number;
        txcount: number;
        keypoololdest: number;
        keypoolsize: number;
        unlocked_until: number;
      }
    >({
      method: 'getwalletinfo',
      id: Date.now(),
      params: [],
      jsonrpc: '2.0',
    });
    // TODO: Handle Errors

    return res.data.result!;
  }
}
