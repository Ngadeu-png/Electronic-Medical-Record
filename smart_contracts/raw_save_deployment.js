const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

async function main() {
  const deploymentsPath = path.join(__dirname, 'deployments.json');
  if (!fs.existsSync(deploymentsPath)) {
    console.error('deployments.json not found');
    process.exit(1);
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath));
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emedical';
  console.log('Connecting to', dbUri);
  await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });
  const coll = mongoose.connection.db.collection('contractdeployments');
  const entries = Object.entries(deployments).filter(([k]) => k !== 'network' && k !== 'deployer');
  for (const [name, address] of entries) {
    try {
      const res = await coll.updateOne({ address }, { $set: { name, address, network: deployments.network, deployer: deployments.deployer, deployedAt: new Date() } }, { upsert: true });
      console.log('Raw saved', name, address, res.result || res);
    } catch (err) {
      console.error('Raw save failed', err.message || err);
    }
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
