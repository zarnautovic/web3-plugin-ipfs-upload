import * as fs from "fs";
import { Contract, ContractAbi, Web3PluginBase, types } from "web3";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { IPFSContractAbi } from "./ContractAbi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private readonly _contract: Contract<typeof IPFSContractAbi>;
  private readonly _web3: any;
  private readonly _account: any;

  public constructor(
    abi: ContractAbi,
    address: types.Address,
    web3: any,
    privateKey: string
  ) {
    super();
    web3.eth.accounts.privateKeyToAccount("0x" + privateKey);
    this._account = web3.eth.accounts.wallet.add("0x" + privateKey).get(0)!;
    this._contract = new web3.eth.Contract(abi, address, web3);
    this._web3 = web3;
  }

  public async uploadFile(filePath: string): Promise<void> {
    try {
      const helia = await createHelia();
      const unixFs = unixfs(helia);

      const bytes = this.readFileAsBytes(filePath);
      const cid = await unixFs.addBytes(bytes);

      this._contract.setProvider(this._web3.currentProvider);

      const tx = this._contract.methods.store(cid.toString());
      const estimated = await tx.estimateGas();

      //   const encoded = tx.encodeABI();
      // var block = await this._web3.eth.getBlock("latest");

      console.log(estimated);
      console.log(this._web3.eth.defaultAccount);

      console.log(await this._web3.eth.getAccounts());

      const blockNumber = await this._web3.eth.getBlockNumber();
      console.log("Latest block number:", blockNumber);

      //   const tx = {
      //     data: encoded,
      //     from: this._web3.eth.defaultAccount,
      //     gasPrice: "40000000",
      //     maxFeePerGas: "4620857334",
      //   };

      const receipt = await this._contract.methods.store("bla").send({
        from: this._account.address,
      });

      console.log(receipt);

      //   const privateKey =
      //     "2f579a3d3f74f27c1667687ba090586bc717a6afb45700ccb96dab3e8143a3bf";
      //   const signed = await this._web3.eth.accounts.signTransaction(
      //     tx,
      //     privateKey
      //   );

      //   let receipt = await this._web3.eth.sendSignedTransaction(
      //     signed.rawTransaction
      //   );

      //   console.log(receipt);

      //   this._web3.eth
      //     .sendTransaction({
      //       to: this._web3.eth.defaultAccount,
      //       value: "0x1",
      //       from: this._web3.eth.defaultAccount,
      //     })
      //     .on("receipt", console.log)
      //     .on("error", console.log)
      //     .on("transactionHash", console.log);
    } catch (error: any) {
      console.log(error);
      console.log("======================================");
      console.log(error.request.params);
    }
  }

  public async getEvents(): Promise<void> {
    try {
      this._contract.setProvider(this._web3.currentProvider);

      const events = await this._contract.events.CIDStored();

      console.log(events);
    } catch (error) {
      console.log(error);
    }
  }

  private readFileAsBytes(filePath: string): Uint8Array {
    const file = fs.readFileSync(String(filePath), "utf-8");
    const bytes = new TextEncoder().encode(file);
    return bytes;
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
