# GENESIX — Authentification et discussions

## Parcours utilisateur
- `index.html` ouvre la page de connexion.
- `register.html` crée un compte avec Firebase Authentication (Email/Mot de passe).
- Après création du compte, le profil est enregistré dans Firestore dans `users/{uid}`.
- Une fois le profil enregistré, l'utilisateur est envoyé directement vers `discussions.html`.
- `login.html` connecte un compte existant et redirige vers `discussions.html`.
- Si aucun utilisateur n'est connecté, `discussions.html` renvoie vers `login.html`.

## Firebase à activer
Dans Firebase Console, projet `starlink-investit` :
1. Authentication → Sign-in method → activer **Email/Password**.
2. Firestore Database → créer la base de données.
3. Authentication → Settings → Authorized domains : ajouter le domaine Vercel utilisé.
4. Déployer les règles Firestore ci-dessous.

## Règles Firestore de départ
Ces règles permettent aux utilisateurs connectés de lire les profils et conversations nécessaires à l'interface actuelle. Elles constituent un point de départ, à renforcer avant une mise en production publique (notamment pour les groupes et la confidentialité des profils).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }

    match /users/{userId} {
      allow read: if signedIn();
      allow create: if signedIn() && request.auth.uid == userId;
      allow update: if signedIn() && request.auth.uid == userId;
      allow delete: if false;
    }

    match /chats/{chatId} {
      allow read: if signedIn() && request.auth.uid in resource.data.members;
      allow create: if signedIn()
        && request.auth.uid in request.resource.data.members;
      allow update: if signedIn() && request.auth.uid in resource.data.members;
      match /messages/{messageId} {
        allow read: if signedIn()
          && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
        allow create: if signedIn()
          && request.auth.uid == request.resource.data.senderId
          && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
        allow update, delete: if false;
      }
    }
  }
}
```

## Déploiement Vercel
- Importer le dossier racine contenant `package.json`, `vercel.json`, `api/` et `public` (ici les pages HTML sont à la racine du projet).
- Le routage API est limité à `/api/*`. Les pages HTML et les ressources statiques restent servies comme fichiers.
- Les fichiers `login.html`, `register.html`, `discussions.html` et `index.html` sont des pages statiques directes.

## Important pour l'espace admin
Aucun fichier `admin.html` n'a été créé ou ajouté. Les fichiers que tu n'as pas demandés restent à développer par toi.
