# Bayrou-Meter
https://agreeable-tree-0d812be03.2.azurestaticapps.net/

## 🏗 Architecture de l’application

### Frontend
- Application **React (Vite + TailwindCSS)**.  
- Routes :  
  - `/login` → connexion  
  - `/` → home  
- Authentification par **JWT** stocké dans `localStorage`.  

### Backend
- API REST en **Azure Functions (Node.js)**.  
- Gère les **comptes utilisateurs** et les **votes**.  

### CosmosDB
- Container `users` : stocke les utilisateurs  
  ```json
  {
    "id": "uuid",
    "pseudo": "hugo",
    "email": "hugo@example.com",
    "createdAt": "2025-09-22T00:00:00Z"
  }
  ```
- Container `votes` : stocke les votes  
  ```json
  {
    "id": "userId",
    "userId": "uuid",
    "choice": "oui",
    "createdAt": "2025-09-22T00:00:00Z"
  }
  ```

### Sécurité
- Les **JWT** sont générés lors du **signup/login**.  
- Vérification obligatoire du **token** pour accéder aux endpoints sécurisés :  
  - `/api/auth-me`  
  - `/api/vote`  

---

## 🌐 Endpoints disponibles (API REST)

### 🔑 Authentification

#### `POST /api/auth-signup`
➝ Crée un utilisateur et renvoie un JWT.  

**Body :**
```json
{ "pseudo": "hugo", "email": "hugo@example.com" }
```

---

#### `POST /api/auth-login`
➝ Vérifie un utilisateur existant et renvoie son JWT.  

---

#### `GET /api/auth-me`
➝ Retourne l’utilisateur courant.  

**Headers :**
```
Authorization: Bearer <token>
```

---

### 🗳 Votes

#### `POST /api/vote`
➝ Crée ou met à jour le vote d’un utilisateur.  

**Body :**
```json
{ "userId": "uuid", "choice": "oui" }
```

---

#### `GET /api/votes`
➝ Retourne tous les votes + statistiques (total, oui/non, pourcentages).  

---

## ⚙️ Instructions pour exécuter/tester localement

### 1. Cloner le projet
```bash
git clone https://github.com/username/bayrou-meter.git
cd bayrou-meter
```

### 2. Installer les dépendances
#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Accéder à l’app sur `http://localhost:5173`.

#### Backend (Azure Functions)
```bash
cd api
npm install
func start
```
L’API sera disponible sur `http://localhost:7071/api`.

### 3. Variables d’environnement
Créer un fichier `local.settings.json` dans `/api` :
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_CONNECTION_STRING": "<votre-chaîne-connexion>",
    "COSMOS_DB_DATABASE": "polling-db",
    "COSMOS_DB_USERS_CONTAINER": "users",
    "COSMOS_DB_VOTES_CONTAINER": "votes",
    "AUTH_JWT_SECRET": "supersecret"
  }
}
```

### 4. Lancer les tests unitaires
```bash
npm test
```
