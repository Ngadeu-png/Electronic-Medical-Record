const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

async function main() {
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emedical';
  await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });
  const coll = mongoose.connection.db.collection('contractdeployments');
  const docs = await coll.find({}).toArray();
  console.log('Raw ContractDeployments:', docs);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
