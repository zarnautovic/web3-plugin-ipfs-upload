import {
  Contract,
  EventLog,
  Web3Context,
  Web3PluginBase,
  validator,
} from "web3";
import { IPFSContractAbi } from "./ipfs_contract_abi";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { Utils } from "./utils";

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
    file: string | Uint8Array,
    accountAddress: string
  ): Promise<boolean> {
    try {
      this.checkValidAddress(accountAddress);

      this.checkFileInput(file);

      const cid = await this.uploadToIpfs(file);
      const tx = await this._contract.methods.store(cid);

      const receipt = await tx.send({ from: accountAddress });

      if (receipt.status !== BigInt(1)) {
        throw new Error("Transaction failed");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  public async getEvents(
    accountAddress: string
  ): Promise<(string | EventLog)[]> {
    try {
      this.checkValidAddress(accountAddress);

      const events = await this._contract.getPastEvents("CIDStored", {
        filter: { owner: accountAddress },
        fromBlock: 4880025,
      });

      return events;
    } catch (error) {
      throw error;
    }
  }

  private async uploadToIpfs(file: string | Uint8Array): Promise<string> {
    const helia = await createHelia();
    const unixFs = unixfs(helia);
    let bytes: Uint8Array = new Uint8Array();

    if (typeof file === "string") {
      bytes = Utils.readFile(file);
    } else {
      bytes = file;
    }

    const cid = await unixFs.addBytes(bytes);
    return cid.toString();
  }

  private checkValidAddress(address: string): void {
    if (!validator.isAddress(address)) {
      throw new Error(`Address is not a valid address: ${address}`);
    }
  }

  private checkFileInput(file: string | Uint8Array): void {
    if (typeof file === "string" && !Utils.isServer()) {
      throw new Error("File input must be a Unit8Array on browser");
    }
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
