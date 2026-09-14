const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

async function main() {
  mongoose.set('bufferTimeoutMS', 20000);
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emedical';
  console.log('Connecting to', dbUri);
  await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 }).catch(err => { throw err; });
  console.log('Mongoose connection state:', mongoose.connection.readyState);
  const models = require('../backend_server/src/models/db-models');
  if (!models || !models.ContractDeployment) {
    console.error('ContractDeployment model not found');
    await mongoose.disconnect();
    process.exit(1);
  }
  const docs = await models.ContractDeployment.find({}).lean().maxTimeMS(5000).catch(err => { throw err; });
  console.log('ContractDeployments:', docs);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
