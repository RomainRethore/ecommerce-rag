import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";

import dotenv from "dotenv";

dotenv.config();

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: process.env.HUGGINGFACE_MODEL,
});

// const text = "The quick brown fox jumps over the lazy dog";

// async function getEmbeddings() {
//     try {
//         const embedding = await embeddings.embedQuery(text);
//         console.log(embedding);
//     } catch (error) {
//         console.error("Error getting embeddings:", error);
//     }
// }
// getEmbeddings();

async function createIndex(collection_name) {
    try {
        const client = new MongoClient(process.env.MONGO_DB_CLOUD_URL || "");
        const collection = client
            .db(process.env.DB_NAME)
            .collection(collection_name);

        const vector_collection = client
            .db(process.env.DB_NAME)
            .collection(`${collection_name}_vectors`);

        await client.db(process.env.DB_NAME).collection(`${collection_name}_vectors`).deleteMany({});

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: vector_collection,
            indexName: `${collection_name}_vectors`, // The name of the Atlas search index. Defaults to "default"
            textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
            embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
        })

        const collection_items = await collection.find({}).toArray();
        // console.log(collection_items);

        const documents = [];

        collection_items.forEach(item => {
            const document = {
                pageContent: `${item.name + " " + item.description + " " + item.category}`,
                metadata: { item },
            };
            // console.log(item.name)
            documents.push(document);
        });

        await vectorStore.addDocuments(documents);

    } catch (error) {
        console.error("Error creating index:", error);
    }
}

async function main() {
    await createIndex("products");
}

main()
    .then(() => {
        console.log("Index creation completed");
    })
    .catch((error) => {
        console.error("Error in index creation:", error);
    });