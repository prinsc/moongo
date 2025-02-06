# Moongo

Moongo est un projet personnel né du constat qu'il n'existait pas de solution en ligne pour jouer à **Skyjo** en multijoueur. J'ai donc développé ce jeu, même si c'est un **vieux projet**, codé avec **jQuery** et utilisant **Socket.io**, une technologie que j'ai découverte au passage. Il permet de jouer jusqu'à **8 joueurs simultanément** et s'adapte à tous les écrans grâce à son **interface responsive**.

[![Gameplay](https://i.postimg.cc/mD9wSqVc/Plan-de-travail-1.jpg)](https://www.youtube.com/watch?v=P8fxx-cT_UY)

## Fonctionnalités

- Jeu basé sur les règles de **Skyjo**, avec une variante : ajout d'une carte "-4" pour plus de stratégie.
- Multijoueur en temps réel grâce à **Socket.io**.
- Interface simple et fonctionnelle.
- Jouable jusqu'à **8 joueurs**.
- **Responsive** : fonctionne sur PC, tablette et mobile.

## Installation

### Prérequis

- **Node.js** installé sur votre machine
- **Ngrok** (si vous voulez jouer en ligne avec un ami)

### Étapes d'installation

1. Cloner le projet :
   ```bash
   git clone https://github.com/prinsc/moongo
   cd moongo
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur local :

   ```bash
   npm run start
   ```

   Cela démarrera un serveur sur le **port 80**.

4. (Optionnel) Pour jouer avec un ami à distance, utiliser **Ngrok** :
   ```bash
   ngrok http 80
   ```
   Cela générera une URL publique à partager.

## Notes

- Le projet est **ancien et mal codé** (utilisation de jQuery).
- Il s'agit avant tout d'une expérimentation avec **Socket.io**.
- Peut contenir des bugs, mais reste fonctionnel !

## Licence

Projet personnel, aucune licence spécifique.
