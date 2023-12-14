import { EventLog, Web3, Web3BaseWalletAccount, core } from "web3";
import { IpfsPlugin } from "../src/ipfs_plugin";
import { expect, describe, it, beforeAll } from "vitest";

describe("IPFS plugin Tests", () => {
  const privateKey: string =
    "0x2f579a3d3f74f27c1667687ba090586bc717a6afb45700ccb96dab3e8143a3bf";

  it("should register IPFS plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context("http://127.0.0.1:8545");
    web3Context.registerPlugin(new IpfsPlugin());
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IPFS plugin get events test", () => {
    let web3: Web3;
    let account: Web3BaseWalletAccount;

    beforeAll(() => {
      web3 = new Web3(
        new Web3.providers.WebsocketProvider(
          "wss://ethereum-sepolia.publicnode.com"
        )
      );

      account = web3.eth.accounts.wallet.add(privateKey).get(0)!;

      web3.registerPlugin(new IpfsPlugin());
    });

    it("should call IPFS plugin get Events method with user address", async () => {
      const events = (await web3.ipfs.getEvents(account.address)) as EventLog[];
      expect(events).toBeInstanceOf(Array);
      expect(events[0]).toHaveProperty("returnValues");
      expect(events[0].returnValues).toHaveProperty("cid");
      expect(events[0].returnValues).toHaveProperty("owner");
      expect(events[0].returnValues.owner).toEqual(account.address);
    });

    it("should throw error if user address is not valid", async () => {
      const invalidAddress = "0x123";
      await expect(web3.ipfs.getEvents(invalidAddress)).rejects.toThrow(
        `Address is not a valid address: ${invalidAddress}`
      );
    });
  });

  describe("IPFS plugin upload file test", () => {
    let web3: Web3;
    let account: Web3BaseWalletAccount;

    beforeAll(() => {
      web3 = new Web3(
        new Web3.providers.HttpProvider(
          "https://ethereum-sepolia.blockpi.network/v1/rpc/public"
        )
      );
      account = web3.eth.accounts.wallet.add(privateKey).get(0)!;

      web3.registerPlugin(new IpfsPlugin());
    });

    it("should call IPFS plugin upload file method with user address", async () => {
      const receiptStatus = await web3.ipfs.uploadFile(
        "test/test-file.txt",
        account.address
      );
      expect(receiptStatus).toEqual(true);
    }, 100000);

    it("should throw error if user address is not valid", async () => {
      const invalidAddress = "0x123";
      await expect(
        web3.ipfs.uploadFile("test/test-file.txt", invalidAddress)
      ).rejects.toThrow(`Address is not a valid address: ${invalidAddress}`);
    });
  });
});
