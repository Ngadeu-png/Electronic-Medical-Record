const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  const deploymentsPath = path.join(__dirname, 'deployments.json');
  if (!fs.existsSync(deploymentsPath)) {
    console.error('deployments.json not found');
    process.exit(1);
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath));

  const mongoose = require('mongoose');
  mongoose.set('bufferTimeoutMS', 20000);
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emedical';
  console.log('Connecting to', dbUri);
  await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 }).catch(err => { throw err; });
  console.log('Mongoose connection state:', mongoose.connection.readyState);
  const models = require('../backend_server/src/models/db-models');
  if (!models || !models.ContractDeployment) {
    console.error('ContractDeployment model not found in backend models');
    await mongoose.disconnect();
    process.exit(1);
  }

  // deployments.json format: { network, EMR: address, deployer }
  const entries = Object.entries(deployments).filter(([k]) => k !== 'network' && k !== 'deployer');
  for (const [name, address] of entries) {
    try {
      // upsert by address
      await models.ContractDeployment.updateOne(
        { address },
        { $set: { name, address, network: deployments.network, deployer: deployments.deployer, deployedAt: new Date() } },
        { upsert: true, maxTimeMS: 5000 }
      );
      console.log('Saved', name, address);
    } catch (err) {
      console.error('Failed to save', name, address, err.message || err);
    }
  }
  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err => { console.error(err); process.exit(1); });
