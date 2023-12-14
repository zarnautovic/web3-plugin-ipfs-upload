import * as fs from "fs";
import path from "path";
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
import { fileURLToPath } from "url";

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
  ): Promise<BigInt> {
    try {
      this.checkValidAddress(accountAddress);

      const cid = await this.uploadToIpfs(filePath);
      const tx = await this._contract.methods.store(cid);

      const receipt = await tx.send({ from: accountAddress });

      if (receipt.status !== BigInt(1)) {
        throw new Error("Transaction failed");
      }

      return receipt.status;
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

  private readFileAsBytes(filePath: string): Uint8Array {
    const __dirname = this.getDirName(import.meta.url);
    const file = fs.readFileSync(
      String(`${__dirname}/../${filePath}`),
      "utf-8"
    );
    const bytes = new TextEncoder().encode(file);
    return bytes;
  }

  private async uploadToIpfs(filePath: string): Promise<string> {
    const helia = await createHelia();
    const unixFs = unixfs(helia);

    const bytes = this.readFileAsBytes(filePath);
    const cid = await unixFs.addBytes(bytes);
    return cid.toString();
  }

  private getDirName(moduleUrl: string): string {
    const filename = fileURLToPath(moduleUrl);
    return path.dirname(filename);
  }

  private checkValidAddress(address: string): void {
    if (!validator.isAddress(address)) {
      throw new Error(`Address is not a valid address: ${address}`);
    }
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
