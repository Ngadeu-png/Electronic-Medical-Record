const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const providerUrl = process.env.ETH_PROVIDER || 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const artifactPath = path.join(__dirname, 'build', 'contracts', 'EMR.json');
if (!fs.existsSync(artifactPath)) {
  console.error('EMR artifact not found. Run `npx truffle compile` first.');
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath));
const abi = artifact.abi;
const bytecode = artifact.bytecode;

// Use deployer private key from env, or default to Ganache deterministic first key
const defaultKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
const privateKey = process.env.DEPLOYER_PRIVATE_KEY || defaultKey;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

async function deploy() {
  console.log('Using account', account.address);
  const EMR = new web3.eth.Contract(abi);
  const deployTx = EMR.deploy({ data: bytecode });
  let lastTxHash = null;
  const gas = await deployTx.estimateGas({ from: account.address }).catch(() => null);
  // Use a high gas limit matching Ganache block gas limit to avoid "code couldn't be stored" errors
  const gasLimit = gas || 30000000;
  console.log('Estimated gas:', gas, 'Using gasLimit:', gasLimit);

  const deployed = await deployTx.send({
    from: account.address,
    gas: gasLimit,
    // set a reasonable maxPriorityFee / maxFee for EIP-1559 chains
    maxPriorityFeePerGas: 1000000000,
    maxFeePerGas: 30000000000
  }).on('transactionHash', tx => {
    console.log('tx hash', tx);
    lastTxHash = tx;
  });

  console.log('Deployed EMR at', deployed.options.address);

  const deployments = {
    network: providerUrl,
    EMR: deployed.options.address,
    deployer: account.address
  };
  fs.writeFileSync(path.join(__dirname, 'deployments.json'), JSON.stringify(deployments, null, 2));
  console.log('Wrote deployments.json');

  // Persist deployment to MongoDB (if available)
  try {
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    dotenv.config();
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emedical';
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    // require models after connecting so they register on the mongoose instance
    const models = require('../backend_server/src/models/db-models');
    if (models && models.ContractDeployment) {
      await models.ContractDeployment.create({
        name: 'EMR',
        address: deployed.options.address,
        network: providerUrl,
        deployer: account.address,
        txHash: lastTxHash,
        deployedAt: new Date(),
      });
      console.log('Saved deployment record to MongoDB');
    } else {
      console.log('ContractDeployment model not found; skipping DB write');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Failed to save deployment to DB:', err.message || err);
  }
}

deploy().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
