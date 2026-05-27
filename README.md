# 🔦 3D Ray Tracing Engine

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)

> Un moteur de rendu 3D par lancer de rayons (Ray Casting) minimaliste construit "from scratch" en TypeScript pour comprendre le calcul des intersections et la modélisation de la lumière.

## 📝 À propos du projet

Ce projet a été réalisé dans le cadre d'un TP de géométrie algorithmique. L'objectif était d'effectuer un rendu en ray tracing d'un cube sans utiliser de bibliothèques 3D externes (comme Three.js). 

Contrairement à la rasterization (qui projette les sommets 3D sur un écran 2D), ce projet utilise le principe du **Ray Casting** : pour chaque pixel de l'écran, un rayon est lancé depuis la caméra vers la scène pour calculer la couleur du point d'impact physique.

### ✨ Fonctionnalités clés

* **Algorithme de Möller-Trumbore :** Implémentation mathématique pour calculer de manière performante l'intersection entre un rayon et un triangle, sans avoir à calculer l'équation du plan.
* **Illumination de Phong :** Modèle d'éclairage réaliste calculé au point d'impact, combinant :
  * La lumière *Ambiante* (couleur de base dans l'ombre).
  * La lumière *Diffuse* (intensité variant selon l'angle de la normale par rapport à la lumière).
  * La lumière *Spéculaire* (reflet brillant calculé avec le vecteur de réflexion).
* **Bibliothèque Mathématique :** Fonctions vectorielles personnalisées (produit scalaire, produit vectoriel, normalisation, réflexion) entièrement typées en TypeScript.
* **Rendu Asynchrone :** Le calcul des rayons se fait par passes successives (entrelacement) grâce à une boucle asynchrone, permettant un rendu progressif sans bloquer l'interface web.
* **Contrôles interactifs :** Déplacement de la source lumineuse et rotation de la scène en temps réel au clavier.

## 📂 Structure du projet

* `src/client/main.ts` : Point d'entrée. Contient la définition du cube (sommets/indices), la boucle de raytracing pixel par pixel, le calcul de l'éclairage de Phong et la gestion des contrôles.
* `src/client/math.ts` : Cœur mathématique. Regroupe les types (`vec3`, `Mat4`) et les opérations sur les vecteurs et matrices.
* `public/` : Contient l'interface `index.html` (avec les instructions des contrôles) et les styles.

## 🚀 Démarrage rapide

### Prérequis
Assurez-vous d'avoir un environnement capable de transpiler et servir du TypeScript, comme [Bun](https://bun.sh/) ou Node.js.

### Installation

1. Clonez le dépôt :
    ```bash
    git clone git@github.com:RubenWihler/ray-tracing-3d.git
    ```

2. Installez les dépendances :
    ```bash
    bun install
    ```

3. Lancez le serveur :
    ```bash
    bun run dev:serveur
    bun run dev:client
    ```

4. Ouvrez votre navigateur sur http://localhost:3000 (ou le port indiqué par votre terminal).

## 🎮 Contrôles

* **Lumière (Axes X, Y, Z)** : `Q`/`W`, `A`/`S`, `Y`/`X`
* **Rotation du cube (Axes X, Y, Z)** : `D`/`F`, `E`/`R`, `C`/`V`
* **Réinitialiser** : `§`

## 🧠 Ce que j'ai appris
- Traduire des concepts de géométrie pure (rayons, normales, réflexion) en algorithmes utilisables.
- Implémenter et optimiser l'algorithme d'intersection de Möller-Trumbore.
- Calculer des intensités lumineuses (dot product) pour recréer l'aspect physique des matériaux avec le modèle de Phong.
- Gérer les performances d'un calcul très lourd (boucle imbriquée sur chaque pixel) dans un navigateur web sans figer l'interface.
