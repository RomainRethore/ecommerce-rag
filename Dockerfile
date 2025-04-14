# Étape de build
FROM node:23-alpine

# Dossier de travail
WORKDIR /app

# Copie des fichiers
COPY package*.json ./
RUN npm install
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrage
CMD ["node", "index.js"]
