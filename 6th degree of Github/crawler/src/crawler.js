const request = require('superagent');
const config = require('./config');

class Crawler {
  /**
   * Construit le Crawler qui va petit à petit récupérer tous les utilisateurs de Github ainsi que leurs followers et les ajouter au graphe de notre API.
   */
  constructor () {
    this.loggedUsername = process.env.loggedUsername;
    this.oauth_token = process.env.oauth_token;
    const url = `${config.url}utils/`;
    // on récupère le numéro de la page enregistré dans la DB -> on continuera le crawling à partir de cette page.
    request.get(url)
      .then((res) => {
        if (res.body.length === 0) { // il n'y a pas de page enregistrée dans la DB
          return request.post(url, { numberPageToFetch: 0 }) // on en crée une valant 0 et on l'enregistre dans la DB
            .then((val) => {
              this.firstUserToVisit = val.body;
            });
        }
        // une valeur existe déjà dans la DB --> on la récupère
        this.firstUserToVisit = res.body[0];
        return Promise.resolve();
      })
      .then(() => this.processCrawler()) // lance le crawler
      .catch(err => console.log(`erreur dans le constructeur: ${err.name}\n${err.message}`));
  }

  /**
   * S'il n'y a pas d'utilisateur à visiter, en récupère 100 via l'API Github et les ajoute à la DB.
   * Sinon, récupère tous les followers des 10 premiers utilisateur pas encore visité enregistrés dans la DB, les ajoute à la DB et au graphe de notre API.
   * @returns {Promise<T | void | never>}
   */
  processCrawler () {
    return this.fetchUserToVisit()
      .then((usersToVisit) => {
        if (usersToVisit.length === 0) { // il n'y a plus d'utilisateur en attente de visite.
          this.fetchGithubUsers(); // on récupère les 30 prochains utilisateurs via l'API Github et on les enregistre dans notre DB.
        } else { // il y a des utilisateurs en attente de visite --> on les visite
          usersToVisit.forEach(user => this.visitUser(user)); // On visite chaque utilisateur présent dans le tableau des utilisateurs à visiter.
        }
      })
      .catch(err => console.log(`erreur dans fetchAndProcessCrawler: ${err.name}\n${err.message}`));
  }

  /**
   * Récupère dans la DB les 10 premiers utilisateurs qui n'ont pas encore été visités.
   * @returns {Promise<T | void>}
   */
  fetchUserToVisit () {
    const url = `${config.url}users`;
    return request.get(url)
      .query({ visited: false, limit: 1 }) // on récupère jusqu'à 10 utilisateurs présents dans la DB mais qui n'ont pas encore été visités.
      .then(results => results.body)
      .catch(err => console.log(`erreur dans fetchUserToVisit: ${err.name}\n${err.message}`));
  }

  /**
   * Récupère 100 utilisateur via l'API Github et les ajoute à la base de données.
   * @returns {*}
   */
  fetchGithubUsers () {
    const url = `https://api.github.com/users?page=${this.firstUserToVisit.numberPageToFetch}&per_page=100`; // on récupère les 100 prochain utilisateurs
    // sur l'API Github
    try {
      return request.get(url)
        .auth(this.loggedUsername, this.oauth_token)
        .then(res => this.addArrayOfUsersToDB(res.body.map(u => u.login))).then(() => { // on enregistre le login des utiissateurs récupérés dans notre DB.
          const urlPut = `${config.url}utils/${this.firstUserToVisit._id}`;
          this.firstUserToVisit.numberPageToFetch += 1;
          return request.put(urlPut, this.firstUserToVisit); // on met à jour le numéro de la dernière page d'utilisateurs fetchée sur l'API Github dans
          // notre DB.
        });
    } catch (err) {
      console.log(`erreur dans fetchGithubUsers: ${err.name}\n${err.message}`);
      return new Promise(resolve => {
        setTimeout(this.fetchGithubUsers().then(() => resolve()), 3600); // une erreur s'est produite, on attend une heure et on réessaye.
      });
    }
  }

  /**
   * Ajoute l'utilisateur passé en paramètre à notre DB via notre API. On enregistre que le login de l'utilisateur.
   * @param user, l'utilisateur Github à ajouter à notre DB.
   * @returns {Request}
   */
  addUserToDB (user) {
    const url = `${config.url}users`;
    return request.post(`${url}/`, { login: user.login, visited: false }); // pas besoin de checker si l'utilisateur est déjà dans la DB -> l'API le fait
  }

  /**
   * Ajoute tous les utilisateurs du tableau d'utilisateurs passé en paramètre à notre DB via notre API. On enregistre que le login de l'utilisateur.
   * @param users, un tableau d'utilisateurs Github à ajouter à notre DB.
   * @returns {Promise<any[]>}
   */
  addArrayOfUsersToDB (users) {
    const url = `${config.url}users/addallusers`;

    const size = 1000;
    const promises = [];
    for (let i = 0; i < users.length; i += size) {
      const tab = users.map(u => ({ login: u, visited: false })).slice(i, i + size); // découpe le tableau d'utilisateurs en tranches de 1000 afin que le
      // payload ne soit pas trop gros
      promises.push(request.post(`${url}/`, tab)); // pas besoin de checker si l'utilisateur est déjà dans la DB -> l'API le fait
    }

    return Promise.all(promises);
  }

  /**
   * Visite l'utilisateur reçu en paramètre. Visiter un utilisateur correspond à parcourir tous ces followers et les ajouter à notre DB.
   * @param user, l'utilisateur Github à visiter.
   * @returns {Promise<Request | never | void>}
   */
  visitUser (user) {
    const url = `${config.url}users/${user.login}`;
    return this.fetchUserFollowers(user)
      .then(() => {
        user.visited = true;
        return request.put(url, user);
      }) // on met à jour notre DB pour enregistrer que l'utilisateur à été visité (visited = true).
      .catch(err => console.log(`erreur dans visitUser: ${err.name}\n${err.message}`));
  }

  /**
   * Ajoute tous les followers de l'utilisateur reçu en paramètre à notre DB, comme utilisateurs à visiter et relie l'utilisateur à chacun de ses
   * followers dans le graphe de notre API.
   * @param user, l'utilisateur dont on souhaite fetcher les followers.
   * @returns {*}
   */
  fetchUserFollowers (user) {
    const urlFollowers = `https://api.github.com/users/${user.login}/followers?per_page=100`;

    /**
     * Récupère tous les followers petit à petit et appelle la fonction allFollowersAreAvailable() lorsqu'elle les a tous récupérés.
     * @param url, l'url à fetcher.
     * @param userLogin, l'utilisateur dont on souhaite récupérer les followers.
     * @param loggedUsername, le login d'authentification à l'API Github.
     * @param credential, le token d'authentification à l'API Github.
     * @param allFollowersAreAvailable, la fonction appelée lorsque tous les followers auront été récupérés.
     * @returns {Request|PromiseLike<T | never>|Promise<T | never>}
     */
    function fetchAllFollowers (url, userLogin, loggedUsername, credential, allFollowersAreAvailable) {
      return request.get(url)
        .auth(loggedUsername, credential)
        .then((res) => {
          const followers = res.body.map(r => r.login);
          if (res.links.next) {
            return allFollowersAreAvailable(followers) // on envoie à l'API les followers déjà récupérés.
              .then(() => fetchAllFollowers(res.links.next, userLogin, loggedUsername, credential, allFollowersAreAvailable) // on fetch les followers suivants
                .catch((err) => {
                  console.log(`erreur dans fetchUserFollower/fetchAllFollowers après une ou plusieurs récursions: ${err.name}\n${err.message}`);
                  return err;
                }));
          } else {
            return allFollowersAreAvailable(followers) // on envoie à l'API les derniers followers récupérés.
              .catch((err) => {
                console.log(`erreur dans fetchUserFollower/allFollowersAreAvailable: ${err.name}\n${err.message}`);
                return err;
              });
          }
        });
    }

    /**
     * Enregistre le tableau de followers dans la DB et ajoute les liens entre l'utilisateur et ses followers dans le graphe de notre API.
     * @param saveUsersToDB, la fonction pour enregistrer les utilisateurs dans la DB.
     * @param addEdges, la fonction pour enregistrer les liens entre l'utilisateur et ses followers dans la DB.
     * @returns {function(*=): (*|Promise<T | void>)}
     */
    function callback (saveUsersToDB, addEdges) {
      return tabFollowers => saveUsersToDB(tabFollowers)
        .then(() => addEdges(user, tabFollowers)) // on ajoute tous les folowers qui sont dans le tableau à notre DB et on crée
        // un lien entre l'utilisateur et chacun de ses followers.
        .catch((err) => {
          console.log(`erreur dans fetchUserFollower/callback: ${err.name}\n${err.message}`);
          return err;
        });
    }

    try {
      // on essaye de récupérer les followers sur l'API Github
      return fetchAllFollowers(urlFollowers, user, this.loggedUsername, this.oauth_token,
                               callback(this.addArrayOfUsersToDB, this.addAllEdgesBetweenUserAndFollowers));
    } catch (err) {
      // en cas d'erreur, on attend une heure puis on réessaye.
      console.log(`erreur dans fetchUserFollower/fetchAllFollowers: ${err.name}\n${err.message}`);
      return new Promise((resolve, reject) => {
        setTimeout(fetchAllFollowers(urlFollowers, user, this.loggedUsername, this.oauth_token,
                                     callback(this.addArrayOfUsersToDB, this.addAllEdgesBetweenUserAndFollowers).then(() => resolve())), 3600);
      });
    }
  }

  /**
   * Ajoute une arrête entre l'utilisateur et chacun de ses followers dans le graphe de notre API.
   * @param user
   * @param followers, un  tableau contenant tous les followers de l'utilisateur.
   * @returns {Promise<any[]>}
   */
  addAllEdgesBetweenUserAndFollowers (user, followers) {
    const url = `${config.url}graph/addalledges`;

    const size = 1000;
    const promises = [];
    for (let i = 0; i < followers.length; i += size) {
      const tab = followers.slice(i, i + size);
      promises.push(request.post(`${url}/`, tab).query({ username: user.login }));
    }

    return Promise.all(promises);
  }

  /**
   * Ajoute une arrête entre les 2 utilisateurs reçus en paramètre dans le graphe de notre API.
   * @param user1
   * @param user2
   * @returns {*|Promise<T | void>}
   */
  addEdgeBetweenTwoUsers (user1, user2) {
    const urlPost = `${config.url}graph/addedge`;
    return request.post(urlPost, { usernameFrom: user1.login, usernameTo: user2 }) // on ajoute un edge entre l'utilisateur et le follower dans le
    // graph de notre API.
      .catch(err => console.log(`erreur dans addEdgeBetweenUsers: ${err.name}\n${err.message}`));
  }

  /**
   * Active le crawler. Celui-ci récupèrera autant d'utilisateur que possible, tant que les 5'000 requêtes ne sont pas atteintes.
   * Il se relance automatiquement toutes les heures.
   */
  activateCrawler () {
    this.processCrawler(); // lance une 1ère fois le crawler
    this.timer = setInterval(this.processCrawler, 10000); // attend une minute avant de relancer le crawler.
  }

  /**
   * Permet de désactiver le crawler.
   */
  desactivateCrawler () {
    clearInterval(this.timer);
  }
}

module.exports = Crawler;
