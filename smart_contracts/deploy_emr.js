const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const provider = process.env.ETH_PROVIDER || 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(provider));

async function main(){
  const artifactPath = path.join(__dirname, 'build', 'contracts', 'EMR.json');
  if (!fs.existsSync(artifactPath)){
    console.error('EMR artifact not found. Run `npx truffle compile` first.');
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath));
  const accounts = await web3.eth.getAccounts();
  console.log('Accounts from provider:', accounts.slice(0,5));
  const deployer = accounts[0];
  const EMR = new web3.eth.Contract(artifact.abi);
  console.log('Deploying EMR from', deployer);
  const deployed = await EMR.deploy({data: artifact.bytecode}).send({from: deployer, gas: 6721975});
  console.log('EMR deployed at', deployed.options.address);

  // Update artifact.networks with a simple entry for chainId 1337
  const networkId = process.env.CHAIN_ID || '1337';
  artifact.networks = artifact.networks || {};
  artifact.networks[networkId] = { address: deployed.options.address };
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  console.log('Updated artifact with network address.');
}

main().catch(err => { console.error(err); process.exit(1); });
