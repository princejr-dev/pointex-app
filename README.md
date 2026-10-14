# Pointex

**Pointex** est un jeu mobile développé avec React Native et Expo, conçu pour offrir une expérience de jeu interactive, fluide et accessible sur Android.

## Présentation

Pointex est un projet de jeu mobile dont le développement met l'accent sur l'expérience utilisateur, la réactivité de l'interface et une identité visuelle moderne.

## Technologies utilisées

- **React Native** — développement de l'interface mobile.
- **Expo** — environnement de développement et outils de compilation.
- **TypeScript** — typage statique et fiabilité du code.
- **React** — architecture basée sur les composants.
- **NativeWind** — stylisation des interfaces avec des classes utilitaires.
- **React Native Skia** — rendu graphique avancé.
- **React Native Reanimated** — animations fluides.
- **Expo Audio** — gestion des fonctionnalités audio.
- **AsyncStorage** — stockage local des données.
- **Phosphor React Native** — bibliothèque d'icônes.

## Prérequis

Avant de commencer, installez :

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Expo](https://expo.dev/)

## Installation

Clonez le dépôt :

```bash
git clone https://github.com/princejr-dev/pointex-app.git
cd pointex-app
```

Installez les dépendances :

```bash
npm install
```

## Lancer le projet

Démarrez le serveur de développement :

```bash
npx expo start
```

Vous pouvez ensuite ouvrir le projet avec Expo Go, lorsque les fonctionnalités utilisées sont compatibles, ou lancer un émulateur Android.

Pour lancer le projet directement sur Android avec l'environnement natif configuré :

```bash
npx expo run:android
```

## Générer une version Android

Pointex utilise EAS Build pour générer ses versions Android.

Pour générer un APK installable directement sur un appareil Android :

```bash
eas build --platform android --profile preview
```

Pour générer un Android App Bundle (AAB) destiné à la distribution sur le Google Play Store :

```bash
eas build --platform android --profile production
```

La configuration des profils de compilation se trouve dans `eas.json`.

## Structure du projet

Le projet est organisé autour des principaux éléments suivants :

- `App.tsx` — point d'entrée principal de l'application.
- `screens/` — écrans de l'application.
- `components/` — composants d'interface réutilisables.
- `assets/` — ressources graphiques, audio et autres fichiers statiques.
- `app.json` — configuration Expo.
- `package.json` — dépendances et scripts du projet.
- `eas.json` — configuration des builds EAS.

## Développement

Le projet utilise TypeScript afin de faciliter la maintenance du code et de limiter certaines erreurs pendant le développement.

Les contributions et améliorations peuvent porter sur les performances, l'expérience utilisateur, l'interface graphique et la stabilité de l'application.

## Licence

Aucune licence open source n'est actuellement spécifiée. Tous droits réservés, sauf indication contraire.

---

Développé avec React Native, TypeScript et Expo.
