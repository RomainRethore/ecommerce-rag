const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

app.get('/products', (req, res) => {
    res.send('Liste des produits');
}
);

app.get('/users/:id/orders', (req, res) => {
    const userId = req.params.id;
    res.send(`Liste des commandes de l'utilisateur ${userId}`);
}
);

app.post('/orders', (req, res) => {
    const orderData = req.body;

    res.send('Créer une nouvelle commande');
}
);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});