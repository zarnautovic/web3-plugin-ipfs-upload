import * as fs from "fs";
import { Contract, Web3Context, Web3PluginBase } from "web3";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { IPFSContractAbi } from "./ContractAbi.js";

export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";

  private readonly contractAddress: string =
    "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";

  private readonly _contract: Contract<typeof IPFSContractAbi>;

  public constructor() {
    super();
    this._contract = new Contract(IPFSContractAbi, this.contractAddress);
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);
    this._contract.link(parentContext);
  }

  public async uploadFile(
    filePath: string,
    accountAddress: string
  ): Promise<void> {
    try {
      const helia = await createHelia();
      const unixFs = unixfs(helia);

      const bytes = this.readFileAsBytes(filePath);
      const cid = await unixFs.addBytes(bytes);

      const tx = await this._contract.methods.store(cid.toString());
      console.log(await tx.send({ from: accountAddress }));
    } catch (error) {
      throw error;
    }
  }

  public async getEvents(accountAddress: string): Promise<string[]> {
    try {
      const events = await this._contract.getPastEvents("CIDStored", {
        filter: { owner: accountAddress },
        fromBlock: 4880025,
      });

      const cids: string[] = events.map((event: any) => {
        return event.returnValues.cid;
      });

      return cids;
    } catch (error) {
      throw error;
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
