const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

const providerUrl = process.env.ETH_PROVIDER || 'http://127.0.0.1:7545';
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
  // pick any deployed network address
  if (artifact.networks) {
    const networkIds = Object.keys(artifact.networks);
    if (networkIds.length > 0) {
      // choose the first network entry
      emrAddress = artifact.networks[networkIds[0]].address;
    }
  }
} catch (e) {
  // ignore — handled below
}

function getContract(){
  if (!emrAbi) throw new Error('EMR ABI not loaded');
  if (!emrAddress) throw new Error('EMR contract not deployed (no address found in artifact)');
  return new web3.eth.Contract(emrAbi, emrAddress);
}

async function getAccounts(){
  return await web3.eth.getAccounts();
}

module.exports = {
  web3,
  getContract,
  getAccounts,
  emrAddress
};
