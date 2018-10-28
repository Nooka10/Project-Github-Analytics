# Project Github Analytics

***Créateurs: Antoine Rochat & Benoît Schopfer***

## Objectif :

Le but de ce projet était de proposer une page listant les utilisateurs Github les plus suivis, les repos les plus starés ainsi que les repos les plus forkés. 

De plus, nous avons tenté de mettre un place un équivalent au célèbre "6th degree of Kevin Bacon" adapté à Github.

Pour cela, nous avons mis en place une API manipulant un graphe dans lequel un noeud représente un utilisateur Github et un lien entre deux noeud représente un utilisateur suivant un autre.

Notre graphe est non dirigé et le poids de chaque arrête est de 1. Comme il s'agit d'un graphe non dirigé, on ne sait pas si le lien entre 2 utilisateurs signifie que A suit B ou l'inverse. Nous avons toutefois gardé cela ainsi afin de maximiser les chemins entre les différents utilisateurs, malgré un nombre réduit d'utilisateurs dans la base de données.
En effet, notre application fonctionnerait parfaitement si elle pouvait contenir l'ensemble de la communauté Github... Malheureusement, ce n'est pas possible car nous sommes limités à 500 Mb de stockage par AtlasDB.... Nous ne pouvons même pas stoquer 30'000 utilisateurs dans notre base de données à cause des limitations de Heroku. En effet, au démarrage, notre API charge le graphe en mémoire. Avec 30'000 utilisateurs, cela fait péter la limite autorisée par Heroku qui kill automatiquement notre API...
Nous avons donc dû nous contenter d'un graphe au nombre d'utilisateurs restreints et donc au nombre de chemins également limité...



Pour remplir notre base de données, nous avons créé 2 crawlers.
Le premier récupère les utilisateurs les plus suivis, les repos les plus starrés ainsi que les repos les plus forkés et les ajoute à la base de données. Toutes les heures, il supprime les collections et les recrée afin de mettre à jour les données.

Pour remplir notre graphe, nous utilisons un deuxième crawler qui récupère 100 utilisateurs sur Github et les enregistre dans notre base de données. Ensuite, pour chaque utilisateur qui n'a pas encore été visité, le crawler récupère tous ses followers et les ajoute à la DB ainsi qu'au graphe. En même temps, il ajoute une arrête entre l'utilisateur et chacun de ses followers.



## Initialisation du projet

Notre projet est composé de :

- 1 API (serveur) connectée à une base de données MongoDB.
- 2 crawlers récupérant des informations sur l'API Github et les enregistrant dans la base de données.
- 1 client interrogeant notre API et affichant notre frontend.

Pour démarrer tous cela, il faut:

1. Effectuer la commande suivante dans les 4 sous-dossier du projet (*CrawlerBestOfGithub, Crawler6thDegreeOfGithub, Serveur, Client*) :

   ```bash
   npm install
   ```

2. Entrez les variables d'environnements du serveur :

   1. copiez le fichier *.env.default* situé à la racine du dossier *serveur* et renommez le en *.env*.
   2. Entrez les variables d'environnement manquantes, notemment:
      - le numéro de votre port
      - le nom de votre hôte mongoDB
      - le port de votre hôte mongoDB
      - le nom de votre base de données MongoDB

3. Lancer le serveur à l'aide de la commande :

   ```bash
   npm start
   ```

4. Lancer le client à l'aide de la commande :

   ```bash
   npm start
   ```

Malheureusement, à cause des limitations d'Atlas et de Heroku, notre 2nd crawler ne peut pas pleinement fonctionner...
En effet, nous devons éviter de faire grossir la base de données pour ne pas dépasser les limites... Du coup, nous l'avons tous simplement pas activé...
Si vous voulez le voir en action, nous vous conseillons de le faire tourner localement. Pour cela:

1. Démarrez le serveur comme expliqué ci-dessus.
2. Entrez les variables d'environnements du crawler :
   1. copiez le fichier *.env.default* situé à la racine du dossier *Crawler6thDegreeOfGithub* et renommez le en *.env*.
   2. Entrez les variables d'environnement manquantes, notemment:
      - votre username Github
      - votre token d'authentification à l'API Github
      - l'url de votre serveur
      - le numéro de port de votre serveur

3. Lancer le crawler à l'aide de la commande :

   ```bash
   npm start
   ```

4. Si vous partez d'une base de données vide, le premier démarrage du crawler va ajouter les 100 premiers utilisateurs de Github.

5. Par la suite, le crawler va lire la base de données et chercher les utilisateurs qui n'ont pas encore été visités. S'il y en a, il va en prendre 5, récupérer leurs followers et les ajouter à la base de données ainsi qu'au graphe. De plus, il va ajouter une arrête dans le graphe entre chaque utilisateur et chacun de ses followers.



Si vous souhaitez utiliser une base de données déjà populée, vous pouvez utiliser les exports que nous vous avons mis dans le dossier *db* à la racine du serveur.