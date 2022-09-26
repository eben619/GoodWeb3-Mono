import { BigNumber, Contract } from "ethers";
import { providers, Signer } from "ethers";
import { chainDefaultGasPrice, Envs } from "../constants";
import { Deferrable } from "@ethersproject/properties";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";

//@ts-ignore
import IdentityABI from "@gooddollar/goodprotocol/artifacts/abis/IIdentity.min.json";
//@ts-ignore
import UBISchemeABI from "@gooddollar/goodprotocol/artifacts/abis/UBIScheme.min.json";
//@ts-ignore 
import GoodDollarStakingABI from "@gooddollar/goodprotocol/artifacts/abis/GoodDollarStaking.min.json"
//@ts-ignore 
import GoodDollarABI from "@gooddollar/goodprotocol/artifacts/abis/IGoodDollar.min.json";
import { IIdentity, UBIScheme, GoodDollarStaking, IGoodDollar } from "@gooddollar/goodprotocol/types";
//@ts-ignore
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";


export const CONTRACT_TO_ABI: { [key: string]: any } = {
  Identity: IdentityABI,
  UBIScheme: UBISchemeABI,
  GoodDollarStaking: GoodDollarStakingABI,
  GoodDollar: GoodDollarABI
};

export const noBaseFeeChains: Readonly<number[]> = [122, 42220]

// export type EnvKey = keyof typeof Contracts;
// export type EnvValue = typeof Contracts[EnvKey] & { networkId: number };
// export type ContractKey = keyof EnvValue;
export type EnvKey = string;
export type EnvValue = any;

export class BaseSDK {
  provider: providers.JsonRpcProvider;
  env: typeof Envs[EnvKey];
  contracts: EnvValue;
  signer: Signer | void = undefined;
  constructor(provider: providers.JsonRpcProvider, envKey: EnvKey = "production") {
    this.provider = provider;
    this.env = Envs[envKey];
    // console.log('this envKey -->', {envKey})

    this.contracts = Contracts[envKey as keyof typeof Contracts] as EnvValue;
    console.log('baseSDK -- provider/env -->', {provider, envKey})
    provider.getNetwork().then(network => {
      if (network.chainId != this.contracts.networkId)
        throw new Error(
          `BaseSDK: provider chainId doesn't much env (${envKey as string}) chainId. provider:${network.chainId} env:${
            this.contracts.networkId
          }`
        );

      this.provider.getGasPrice = async () => {
        return BigNumber.from(chainDefaultGasPrice[network.chainId])
      }

    });

    try {
      const signer = provider.getSigner();
      signer.getAddress()
        .then(addr => async () => {
          const network = await provider.getNetwork();

          if (noBaseFeeChains.includes(network.chainId)){

            // These overrides are not used by useDapp hooks, so manual override or rely on default
            signer.sendTransaction = async(transaction: Deferrable<TransactionRequest>) : Promise<TransactionResponse> => {
              console.log('sendTransaction')
                signer._checkProvider("sendTransaction");
                const tx = await signer.populateTransaction(transaction);
                tx.type = 0; 
                const signedTx = await signer.signTransaction(tx);
                return await this.provider.sendTransaction(signedTx);
            }

            signer.getGasPrice = async() => {
              return BigNumber.from(chainDefaultGasPrice[network.chainId]);
            }
          }

          this.signer = signer;
          console.log('(sdk) this signer -->', {signer})
        }).catch(e => {
          console.warn("BaseSDK: provider has no signer", { signer, provider, e });
        });
    } catch (e) {
        console.warn("BaseSDK: provider has no signer", { provider, e });
    }
  }

  getContract(contractName: "UBIScheme"): UBIScheme;
  getContract(contractName: "Identity"): IIdentity;
  getContract(contractName: "GoodDollarStaking"): GoodDollarStaking;
  getContract(contractName: "GoodDollar"): IGoodDollar;
  getContract(contractName: string): Contract;
  getContract(contractName: string) {
    switch (contractName) {
      case "UBIScheme":
        return new Contract(
          this.contracts["UBIScheme"],
          CONTRACT_TO_ABI["UBIScheme"].abi,
          this.signer || this.provider
        ) as UBIScheme;
      case "Identity":
        return new Contract(
          this.contracts["Identity"],
          CONTRACT_TO_ABI["Identity"].abi,
          this.signer || this.provider
        ) as IIdentity;
      case "GoodDollarStaking": 
        return new Contract(
          this.contracts["GoodDollarStaking"],
          CONTRACT_TO_ABI["GoodDollarStaking"].abi,
          this.signer || this.provider
        ) as any;
      case "GoodDollar":
        return new Contract(
          this.contracts["GoodDollar"],
          CONTRACT_TO_ABI["GoodDollar"].abi,
          this.signer || this.provider
        ) as any;
      default:
        return new Contract(
          this.contracts[contractName],
          CONTRACT_TO_ABI[contractName].abi,
          this.signer || this.provider
        );
    }
  }
}