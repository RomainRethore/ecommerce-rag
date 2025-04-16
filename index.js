import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { getProductsListData } from "./queryEmbedding.js";
import { performVectorSearch } from "./retrieval.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_DB_CLOUD_URL;

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB', err));


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/products', async (req, res) => {
    const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
    const collection = client
        .db(process.env.DB_NAME)
        .collection("products");

    const response = await collection.find({}).toArray();
    // const responseWithId = response.map(item => {
    //     return {
    //         id: item.id
    //     }
    // });
    // res.send(responseWithId);
    res.send(response);
}
);

app.get('/users/:id/orders', async (req, res) => {
    const userId = req.params.id;
    const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
    const collection = client
        .db(process.env.DB_NAME)
        .collection("orders");
    const response = await collection.find({ userId: userId }).toArray();

    res.send(response);
}
);

app.get('/orders', async (req, res) => {
    const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
    const collection = client
        .db(process.env.DB_NAME)
        .collection("orders");
    const response = await collection.find({}).toArray();
    res.send(response);
}
);

app.get('/user/:userid/recommendations', async (req, res) => {
    const userId = req.params.userid;
    const products = await getProductsListData(userId);
    const response = await performVectorSearch(products, 3);
    res.send(response);
}
);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});