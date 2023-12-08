import { Web3 } from "web3";
import { IpfsPlugin } from "../lib/index.js";

import { IPFSContractAbi } from "../lib/ContractAbi.js";

const web3: Web3 = new Web3(
  new Web3.providers.HttpProvider("https://rpc.notadegen.com/eth/sepolia")
);
web3.setProvider("https://rpc.notadegen.com/eth/sepolia");
web3.registerPlugin(
  new IpfsPlugin(IPFSContractAbi, "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB")
);

web3.template.test("test-param");

// run upload file
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    await uploadFile();
  } catch (e) {
    console.log(e);
  }
})();

async function uploadFile(): Promise<void> {
  const cid = await web3.template.uploadFile("./README.md");
  console.log(cid);
}
