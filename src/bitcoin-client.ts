/**
 * AUTO-GENERATED FILE. DO NOT MODIFY.
 *
 * This class was automatically generated.
 * It should not be modified by hand.
 */
/* tslint:disable */
import { RpcClient } from 'jsonrpc-ts';
import { BitcoinClientOptions } from './bitcoin-client-options.interface';
import { BitcoinRpcService } from './bitcoin-rpc-service.interface';
import { IGetWalletInfo, IGetBlockChainInfo } from './interfaces';
export class BitcoinClient {
  private readonly rpcClient: RpcClient<BitcoinRpcService>;
  /**
   * Create a **BitcoinClient**.
   * @param {BitcoinClientOptions} options - add options to config the underlying RPC Engine.
   */
  constructor(readonly options: BitcoinClientOptions) {
    this.rpcClient = new RpcClient(options);
  }

  /**
   * The getaccount RPC returns the name of the account associated with the given address.
   * @param {string} address - A P2PKH or P2SH Bitcoin address belonging either to a specific account or the default account (“”).
   * @async
   * @public
   * @return {string} the Rpc response as **string**
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
   * @async
   * @public
   * @return {IGetWalletInfo} the Rpc response as **IGetWalletInfo**
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
   * @async
   * @public
   * @return {IGetBlockChainInfo} the Rpc response as **IGetBlockChainInfo**
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

  /**
   * The getnewaddress RPC returns a new Bitcoin address for receiving payments. If an account is specified, payments received with the address will be credited to that account.
   * @param {string} account - The name of the account to put the address in. The default is the default account, an empty string (“”).
   * @param {string} addressType - The address type to use. Options are ‘legacy’, ‘p2sh-segwit’, and ‘bech32’. Default is set by -addresstype.
   * @async
   * @public
   * @return {string} the Rpc response as **string**
   */
  public async getNewAddress(account?: string, addressType?: string): Promise<string> {
    const res = await this.rpcClient.makeRequest<'getnewaddress', string>({
      method: 'getnewaddress',
      id: Date.now(),
      params: [account, addressType],
      jsonrpc: '2.0',
    });
    // TODO: Handle Errors

    return res.data.result!;
  }
}
