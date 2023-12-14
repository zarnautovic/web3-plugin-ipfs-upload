web3-plugin-ipfs-upload
===========

Home task for Chainsafe

Install
------------

```bash
git clone
npm i
```

How to use
------------

```bash
const web3 = new Web3(provider_url);
web3.registerPlugin(new IpfsPlugin());
```

node

```bash
await web3.ipfs.uploadFile(path_to_file, from_address) or await web3.ipfs.uploadFile(unit8Array, from_address)
await web.ipfs.getEvents(from_address)
```

browser

```bash
await web3.ipfs.uploadFile(unit8Array, from_address)
await web.ipfs.getEvents(from_address)
```

Tests
------------

```bash
npm run test-e2e-node
npm run test-e2e-chrome
npm run test-e2e-firefox
npm run test-e2e-edge
```
