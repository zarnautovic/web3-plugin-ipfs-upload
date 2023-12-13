import { Web3 } from "web3";
import { IpfsPlugin } from "../lib/index.js";

const web3: Web3 = new Web3(
  new Web3.providers.WebsocketProvider("wss://ethereum-sepolia.publicnode.com")
);

const privateKey: string =
  "0x2f579a3d3f74f27c1667687ba090586bc717a6afb45700ccb96dab3e8143a3bf";

const account = web3.eth.accounts.wallet.add(privateKey).get(0)!;

web3.registerPlugin(new IpfsPlugin());

// run upload file
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    const events = await getAllEvents();
    console.log(events);

    // await uploadFile();
  } catch (e) {
    console.log(e);
  }
})();

setTimeout(() => {
  process.exit(0);
}, 50000);

// async function uploadFile(): Promise<void> {
//   await web3.ipfs.uploadFile("./README.md", account.address);
// }

async function getAllEvents(): Promise<string[]> {
  return await web3.ipfs.getEvents(account.address);
}
