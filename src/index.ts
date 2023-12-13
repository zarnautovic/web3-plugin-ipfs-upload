import * as fs from "fs";
import { Contract, Web3Context, Web3PluginBase } from "web3";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { IPFSContractAbi } from "../lib/ContractAbi.js";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private readonly _contract: Contract<typeof IPFSContractAbi>;

  public constructor() {
    super();
    this._contract = new Contract(
      IPFSContractAbi,
      "0x7af963cF6D228E564e2A0aA0DdBF06210B38615D"
    );
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    this._contract.link(parentContext);
  }

  public async uploadFile(filePath: string): Promise<void> {
    try {
      const helia = await createHelia();
      const unixFs = unixfs(helia);

      const bytes = this.readFileAsBytes(filePath);
      const cid = await unixFs.addBytes(bytes);

      const tx = await this._contract.methods.store(cid.toString());
      console.log(
        await tx.send({ from: "0x303DCE3136490CBf862cb3aBAdeE37018Bc6206c" })
      );
    } catch (error: any) {
      console.log(error);
      console.log("======================================");
      console.log(error.request.params);
    }
  }

  public async getEvents(): Promise<void> {
    try {
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
