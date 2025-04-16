import fs from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';


dotenv.config();

const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL);
const dbName = process.env.DB_NAME;

async function importData() {
    try {
        await client.connect();
        const db = client.db(dbName);

        const products = JSON.parse(fs.readFileSync('./data/products_real_rap90s_detailed.json', 'utf-8'));
        const orders = JSON.parse(fs.readFileSync('./data/generated_orders.json', 'utf-8'));

        await db.collection('products').deleteMany({});
        await db.collection('orders').deleteMany({});

        await db.collection('products').insertMany(products);
        await db.collection('orders').insertMany(orders);

        console.log('Data imported successfully');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

importData();