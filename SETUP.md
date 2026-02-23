# 🚀 Mododium — Setup

## ⚠️ Première fois ? Faites ça en premier !

```bash
npm install
```

> Cette commande installe Vite et toutes les dépendances dans `node_modules/`.
> **Sans ça, rien ne marche.**

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement Vite (http://localhost:3000) |
| `npm run build` | Build de production dans `/dist` |
| `npm run preview` | Prévisualise le build de production |
| `npm start` | Lance `node src/index.js` (point d'entrée Node brut) |

---

## ❓ Erreurs fréquentes

### `'vite' is not recognized`
→ Vous n'avez pas encore fait `npm install`. Lancez-le d'abord.

### `ESM / compileSourceTextModule` error
→ Assurez-vous de ne pas avoir `"type": "module"` dans `package.json` (déjà corrigé).

---

## Variables d'environnement

Éditez `.env` à la racine :

```env
VITE_ADMIN_PASSWORD=admin123
VITE_DEFAULT_THEME_COLOR=#e8ff00
```
