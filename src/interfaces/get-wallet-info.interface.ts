export interface IGetWalletInfo {
  walletversion: number;
  balance: number;
  txcount: number;
  keypoololdest: number;
  keypoolsize: number;
  unlocked_until: number;
}
