import { Web3 } from "web3";
import { IpfsPlugin } from "../lib/index.js";

// import { IPFSContractAbi } from "../lib/ContractAbi.js";

const web3: Web3 = new Web3(
  new Web3.providers.HttpProvider("https://1rpc.io/sepolia")
);

web3.eth.accounts.wallet
  .add("0x2f579a3d3f74f27c1667687ba090586bc717a6afb45700ccb96dab3e8143a3bf")
  .get(0)!;
// const privateKey =
//   "2f579a3d3f74f27c1667687ba090586bc717a6afb45700ccb96dab3e8143a3bf";

// const contractAddress = "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";

web3.registerPlugin(new IpfsPlugin());

// run upload file
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    // await getAllEvents();

    await uploadFile();
  } catch (e) {
    console.log(e);
  }
})();

setTimeout(() => {
  process.exit(0);
}, 20000);

async function uploadFile(): Promise<void> {
  const cid = await web3.ipfs.uploadFile("./README.md");
  console.log(cid);
}

// async function getAllEvents(): Promise<void> {
//   await web3.ipfs.getEvents();
// }
