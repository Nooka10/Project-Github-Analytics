#Project Github Analytics

Le but de ce projet était de proposer une page listant les utilisateurs Github les plus suivis, les repos les plus starés ainsi que les repos les plus forkés. 

De plus, nous avons tenté de mettre un place un équivalent au célèbre "6th degree of Kevin Bacon" adapté à Github.

Pour cela, nous avons mis en place une API manipulant un graphe dans lequel un noeud représente un utilisateur Github et un lien entre deux noeud représente un utilisateur suivant un autre.

Notre graphe est non dirigé et le poids de chaque arrête est de 1. Comme il s'agit d'un graphe non dirigé, on ne sait pas si le lien entre 2 utilisateurs signifie que A suit B ou l'inverse. Nous avons toutefois gardé cela ainsi afin de maximiser les chemins entre les différents utilisateurs, malgré un nombre réduit d'utilisateurs dans la base de données.
En effet, notre application fonctionnerait parfaitement si elle pouvait contenir l'ensemble de la communauté Github... Malheureusement, ce n'est pas possible car nous sommes limités à 500 Mb de stockage par AtlasDB.... Nous ne pouvons même pas stoquer 30'000 utilisateurs dans notre base de données à cause des limitations de Heroku. En effet, au démarrage, notre API charge le graphe en mémoire. Avec 30'000 utilisateurs, cela fait péter la limite autorisée par Heroku qui kill automatiquement notre API...
Nous avons donc dû nous contenter d'un graphe au nombre d'utilisateurs restreints et donc au nombre de chemins également limité...



Pour remplir notre base de données, nous avons créé 2 crawlers.
Le premier récupère les utilisateurs les plus suivis, les repos les plus starrés ainsi que les repos les plus forkés et les ajoute à la base de données. Toutes les heures, il supprime les collections et les recrée afin de mettre à jour les données.

Pour remplir notre graphe, nous utilisons un deuxième crawler qui récupère 100 utilisateurs sur Github et les enregistre dans notre base de données. Ensuite, pour chaque utilisateur qui n'a pas encore été visité, le crawler récupère tous ses followers et les ajoute à la DB ainsi qu'au graphe. En même temps, il ajoute une arrête entre l'utilisateur et chacun de ses followers.





# Initialisation du projet

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

