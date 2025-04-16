import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MongoClient } from "mongodb";

import dotenv from "dotenv";

dotenv.config();

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: process.env.HUGGINGFACE_MODEL,
});


async function performVectorSearch(query, limit = 10) {
    let client;
    console.log(query);
    try {
        // Initialize MongoDB client and collection
        client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
        const collection = client
            .db(process.env.DB_NAME)
            .collection("products_vectors");

        // Configure vector store
        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collection,
            indexName: "products_vectors",
            textKey: "text",
            embeddingKey: "embedding",
        });

        // Perform similarity search
        const results = await vectorStore.similaritySearch(query, limit);
        return results;

    } catch (error) {
        console.error("Error during vector search:", error);
        throw error;
    } finally {
        // Ensure connection is closed
        if (client) await client.close();
    }
}


export { performVectorSearch };