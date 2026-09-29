const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

const providerUrl = process.env.ETH_PROVIDER || 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Load compiled Truffle artifact produced by `truffle compile` / `truffle migrate`
const artifactPath = path.join(__dirname, '..', '..', 'smart_contracts', 'build', 'contracts', 'EMR.json');
if (!fs.existsSync(artifactPath)) {
  console.warn('EMR artifact not found at', artifactPath, '— compile & migrate first');
}

let emrAbi = [];
let emrAddress = null;
try {
  const artifact = JSON.parse(fs.readFileSync(artifactPath));
  emrAbi = artifact.abi;
  const deployedAddress = artifact.networks?.[process.env.CHAIN_ID || '1337']?.address;
  const firstDeployment = Object.values(artifact.networks || {}).find((network) => network.address);
  emrAddress = process.env.EMR_CONTRACT_ADDRESS || deployedAddress || firstDeployment?.address || null;
} catch (e) {
  console.warn('Unable to load EMR contract artifact:', e.message);
}

function getContract() {
  if (!emrAbi.length) throw new Error('EMR ABI not loaded; compile the smart contract first');
  if (!emrAddress) throw new Error('EMR contract not deployed (no address found in artifact)');
  return new web3.eth.Contract(emrAbi, emrAddress);
}

async function anchorRecord({ patientId, doctorId, dataHash }) {
  const accounts = await web3.eth.getAccounts();
  const from = process.env.ETH_ACCOUNT || accounts[0];
  if (!from) throw new Error('No blockchain signer available; configure ETH_ACCOUNT or an unlocked provider account');

  const contract = getContract();
  const method = contract.methods.createRecord(patientId, doctorId, dataHash);
  const estimatedGas = await method.estimateGas({ from });
  const gas = Number(process.env.ETH_GAS || Math.ceil(estimatedGas * 1.2));
  const receipt = await method.send({
    from,
    gas,
  });
  const event = receipt.events?.RecordCreated;

  return {
    recordId: event?.returnValues?.id || null,
    transactionHash: receipt.transactionHash,
  };
}

module.exports = {
  web3,
  getContract,
  anchorRecord,
  emrAddress,
};
