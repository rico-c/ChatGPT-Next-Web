import { MongoClient } from "mongodb";
require("dotenv").config();

const uri = `mongodb+srv://${process.env.MONGO_DB_URL}@gpt.ckfcddq.mongodb.net/?retryWrites=true&w=majority`;
const options = { connectTimeoutMS: 30000 };

let client;
let clientPromise: Promise<MongoClient>;

client = new MongoClient(uri, options);
clientPromise = client.connect();

export default clientPromise;
