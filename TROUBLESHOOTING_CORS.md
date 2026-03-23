# Guide de Dépannage - Erreurs CORS et Connexion

## Problème Résolu ✅

**Erreur:** `Access to fetch at 'http://localhost:3000/auth/login' from origin 'http://localhost:5174'`

**Cause:** CORS (Cross-Origin Resource Sharing) n'était pas configuré pour accepter les requêtes du frontend sur le port 5174.

**Solution appliquée:**
1. Mis à jour `backend/src/main.ts` pour accepter les ports 5173 **ET** 5174
2. Redémarré le backend (npm run start:dev)
3. Relancé le frontend

---

## ✅ Serveurs Actuellement Actifs

| Service | Port | URL | Statut |
|---------|------|-----|--------|
| **Backend (NestJS)** | 3000 | http://localhost:3000 | ✅ En cours |
| **Frontend (Vite)** | 5173 | http://localhost:5173 | ✅ En cours |

---

## Identifiants de Test

**Admin Account:**
- Username: `admin_ops_2026`
- Password: `Adm1n!Esport2026#`
- Role: `admin`

Teste la connexion maintenant sur **http://localhost:5173** 🎉

---

## Si vous Recevez des Erreurs CORS à l'Avenir

### Erreur 1: Port utilisé
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Arrêter tous les processus Node
Get-Process node | Stop-Process -Force

# Relancer le backend
cd backend
npm run start:dev
```

### Erreur 2: Frontend sur port différent
Si le frontend démarre sur le port 5175, 5176, etc., au lieu de 5173, c'est que le port est déjà utilisé.

**Solution:**
```powershell
# Dans backend/src/main.ts, ajouter le nouveau port à CORS_ORIGIN:
--accent-strong: #ff8e2e;
--accent-soft: #ff9d4f;
```

Exemple - Ajouter support pour 5175:
```typescript
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
```

### Erreur 3: Connexion refusée
```
Error: Failed to fetch at http://localhost:3000/auth/login
```

**Causes possibles:**
1. Backend n'est pas en cours d'exécution
2. Mauvaise DATABASE_URL dans .env
3. Base de données PostgreSQL non accessible

**Solutions:**
```bash
# Vérifier que PostgreSQL tourne
postgres -V

# Vérifier le statut du backend
curl http://localhost:3000

# Vérifier les logs du backend
npm run start:dev  # Pas en background pour voir les erreurs
```

---

## Architecture Correcte

```
┌─────────────────────────────────────────┐
│    Frontend (React + Vite)              │
│    http://localhost:5173                │
│                                         │
│    - Login form → /auth/login           │
│    - Dashboard → /teams, /players, etc  │
└──────────────────┬──────────────────────┘
                   │
                   │ fetch() + Bearer Token
                   │ CORS allowed ✅
                   │
┌──────────────────▼──────────────────────┐
│    Backend (NestJS)                     │
│    http://localhost:3000                │
│                                         │
│    ✅ CORS enabled for:                 │
│      - http://localhost:5173            │
│      - http://localhost:5174            │
│      - (configurable via CORS_ORIGIN)   │
│                                         │
│    Routes:                              │
│    - POST /auth/login                   │
│    - POST /auth/register                │
│    - GET /auth/me                       │
│    - GET /teams, /players, /heroes      │
│                                         │
└──────────────────┬──────────────────────┘
                   │
                   │ Prisma ORM
                   │
┌──────────────────▼──────────────────────┐
│    Database (PostgreSQL)                │
│    localhost:5432 (par défaut)          │
│    Base: ow_esport                       │
└─────────────────────────────────────────┘
```

---

## Variables d'Environnement Importantes

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ow_esport
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (.env optionnel)
```env
VITE_API_URL=http://localhost:3000
```

---

## Commandes Utiles

```bash
# Arrêter tout
Get-Process node | Stop-Process -Force

# Backend
cd backend
npm run start:dev      # Dev avec hot reload
npm run build          # Compiler
npm run start:prod     # Production

# Frontend
cd frontend
npm run dev            # Dev server
npm run build          # Production build
npm run preview        # Voir le build

# Base de données
npx prisma generate   # Générer Prisma Client
npx prisma migrate dev --name init  # Créer migration
npx prisma db seed    # Insérer données de test
```

---

## Prochaine Étape

Visite **http://localhost:5173** et connecte-toi avec:
- **Username:** admin_ops_2026  
- **Password:** Adm1n!Esport2026#

Tu devrais voir le dashboard avec les pages dynamiques (O, T, P, H) ! 🚀
