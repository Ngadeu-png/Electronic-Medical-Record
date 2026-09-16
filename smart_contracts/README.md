# EMR Smart Contracts

This folder contains a Truffle scaffold for the Electronic Medical Record (EMR) system, ready to deploy to Ganache.

Quick start:

1. Install dependencies

```bash
npm install
```

2. Run Ganache (desktop app or CLI) and ensure it's listening on `127.0.0.1:7545`.

3. Compile and migrate

```bash
npx truffle compile
npx truffle migrate --network development
```

4. Interact via Truffle console

```bash
npx truffle console --network development
const emr = await EMR.deployed()
await emr.createRecord(accounts[1], accounts[2], "QmHash")
```

Notes:
- This is a minimal example. Consider integrating IPFS for storing actual medical data and storing only references on-chain.
- Add access control (roles) and encryption before production use.
