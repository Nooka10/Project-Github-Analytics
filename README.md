#Project Github Analytics

Le but de ce projet était de proposer une page listant les utilisateurs Github les plus suivis, les repos les plus starés ainsi que les repos les plus forkés. 

De plus, nous avons tenté de mettre un place un équivalent au célèbre "6th degré of Kevin Bacon" adapté à Github.

Pour cela, nous avons mis en place une API manipulant un graphe dans lequel un noeud représente un utilisateur Github et un lien entre deux noeud représente un utilisateur suivant un autre.

Notre graphe est non dirigé et le poids de chaque arrête est de 1. Comme il s'agit d'un graphe non dirigé, on ne sait pas si le lien entre 2 utilisateurs signifie que A suit B ou l'inverse. Nous avons toutefois gardé cela ainsi afin de maximiser les chemins entre les différents utilisateurs.
En effet, notre application fonctionnerait parfaitement si elle pouvait contenir l'ensemble de la communauté Github... Malheureusement, ce n'est pas possible car nous sommes limités à 500 Mb de stockage par AtlasDB....

Pour remplir notre base de données, nous avons créé un crawler qui récupère 100 utilisateurs sur Github et les enregistre dans notre base de données. Ensuite, pour chaque utilisateur pas encore visité, le crawler récupère tous ses followers et les ajoute à la DB ainsi qu'au graphe.

