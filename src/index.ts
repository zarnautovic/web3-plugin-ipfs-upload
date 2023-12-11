import * as fs from "fs";
import { Contract, ContractAbi, Web3PluginBase, types } from "web3";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { IPFSContractAbi } from "./ContractAbi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private readonly _contract: Contract<typeof IPFSContractAbi>;
  private readonly _web3: any;

  public constructor(abi: ContractAbi, address: types.Address, web3: any) {
    super();
    this._contract = new Contract(abi, address, web3);
    this._web3 = web3;
  }

  public test(param: string): void {
    console.log(param);
  }

  public async uploadFile(filePath: string): Promise<void> {
    const helia = await createHelia();
    const unixFs = unixfs(helia);

    const bytes = this.readFileAsBytes(filePath);
    const cid = await unixFs.addBytes(bytes);

    this._contract.setProvider(this._web3.currentProvider);

    const privateKey =
      "2f579a3d3f74f27c1667687ba090586bc717a6afb45700ccb96dab3e8143a3bf";
    const privateKeyBuffer = Buffer.from(privateKey, "hex");

    var account = this._web3.eth.accounts.privateKeyToAccount(privateKeyBuffer);
    this._web3.eth.accounts.wallet.add(account);
    this._web3.eth.defaultAccount = account.address;
    var accountFrom = account.address;

    const tx = this._contract.methods.store(cid.toString());
    const estimated = await tx.estimateGas();

    // const encoded = this._contract.methods.store(cid.toString()).encodeABI();
    // var block = await this._web3.eth.getBlock("latest");

    // var tx = {
    //   data: encoded,
    //   from: accountFrom,
    //   gasPrice: "200000000000",
    // };

    const receipt = await tx.send({
      // used first account from your wallet.
      from: accountFrom,
      gas: estimated.toString(),
    });

    console.log(receipt);

    // const signed = await this._web3.eth.accounts.signTransaction(
    //   tx,
    //   privateKey
    // );

    // console.log(signed);

    // let receipt = await this._web3.eth.sendSignedTransaction(
    //   signed.rawTransaction
    // );

    // console.log(receipt);

    console.log(cid.toString());
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
