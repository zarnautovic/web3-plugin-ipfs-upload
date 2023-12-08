import * as fs from "fs";
import { Contract, ContractAbi, Web3PluginBase, types } from "web3";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { IPFSContractAbi } from "./ContractAbi";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "template";

  private readonly _contract: Contract<typeof IPFSContractAbi>;

  public constructor(abi: ContractAbi, address: types.Address) {
    super();
    this._contract = new Contract(abi, address);
  }

  public test(param: string): void {
    console.log(param);
  }

  public async uploadFile(filePath: string): Promise<void> {
    const helia = await createHelia();
    const unixFs = unixfs(helia);

    const bytes = this.readFileAsBytes(filePath);
    const cid = await unixFs.addBytes(bytes);

    const receipt = await this._contract.methods.store(cid.toString()).send({
      from: "0x303DCE3136490CBf862cb3aBAdeE37018Bc6206c",
    });
    console.log("Transaction Hash: " + receipt.transactionHash);
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
    template: IpfsPlugin;
  }
}
