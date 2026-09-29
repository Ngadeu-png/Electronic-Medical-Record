# EMR Smart Contracts

This folder contains the EMR contract. The backend stores clinical notes and the random salt in MongoDB, and anchors only salted SHA-256 hashes and per-record hashed patient/doctor references on-chain.

Quick start:

1. Install dependencies

```bash
npm install
```

2. Run Ganache and ensure it's listening on `127.0.0.1:8545` with chain ID `1337`.

3. Compile and deploy the EMR contract

```bash
npx truffle compile
node deploy_emr.js
```

The deploy script writes the contract address into `build/contracts/EMR.json` under chain ID `1337`. Configure the backend environment:

```env
ETH_PROVIDER=http://127.0.0.1:8545
CHAIN_ID=1337
# Optional: use a specific unlocked Ganache account as the transaction signer.
ETH_ACCOUNT=0x...
# Optional: override the address stored in the Truffle artifact.
EMR_CONTRACT_ADDRESS=0x...
```

The backend defaults to the first unlocked account from the provider when `ETH_ACCOUNT` is unset. Restart the backend after configuration. Medical notes and the random hash salt remain off-chain; do not put patient data or private keys in the contract or source control. This local Ganache setup is for development, not production.
