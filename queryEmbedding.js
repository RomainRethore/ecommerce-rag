import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";

import dotenv from "dotenv";

dotenv.config();

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: process.env.HUGGINGFACE_MODEL,
});

const text = "The quick brown fox jumps over the lazy dog";

async function generateEmbeddings(text) {
    try {
        const embedding = await embeddings.embedQuery(text);
        // console.log(embedding);
        return embedding;
    } catch (error) {
        console.error("Error getting embeddings:", error);
    }
}

async function getProductsIdsByUserId(userId) {
    try {
        const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
        const collection = client
            .db(process.env.DB_NAME)
            .collection("orders");

        const orders = await collection.find({ userId: userId }).toArray();
        const products = [];
        orders.forEach(order => {
            order.products.forEach(product => {
                products.push(product);
            });
            // console.log(product.products);
        });
        // console.log(typeof products);
        return products;
    } catch (error) {
        console.error("Error getting products:", error);
    }
}

async function getProductsByIds(productId) {
    try {
        const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
        const collection = client
            .db(process.env.DB_NAME)
            .collection("products_vectors");

        const products = await collection.find({ "item.id": { $in: productId } }).toArray();
        // console.log(products.length);
        return products;
    } catch (error) {
        console.error("Error getting product:", error);
    }
}

function extractProductsListData(products) {
    // console.log(products);
    let productsData = "";
    products.forEach(product => {
        const productData = `${product.item.name} ${product.item.description} ${product.item.category}`;
        productsData += productData + " ";
        // console.log(productData);
    });
    // console.log(productsData);
    return productsData;
}


async function generateProductsEmbeddingsForUser(userId) {
    const productsIds = await getProductsIdsByUserId(userId);
    const productsList = extractProductsListData(productsIds);
    generateEmbeddings(productsList);
}

async function getProductsListData(userId) {
    const productsIds = await getProductsIdsByUserId(userId);
    const products = await getProductsByIds(productsIds);
    const productsList = extractProductsListData(products);
    return productsList;
}

export { getProductsListData };