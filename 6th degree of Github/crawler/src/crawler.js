const request = require('superagent');
const config = require('./config');

class Crawler {
  /**
   * Construit le Crawler qui va petit à petit récupérer tous les utilisateurs de Github ainsi que leurs followers et les ajouter au graph de notre API.
   */
  constructor () {
    this.loggedUsername = process.env.loggedUsername;
    this.oauth_token = process.env.oauth_token;
    const url = `${config.url}utils/`;
    // on récupère la valeur enregistré dans la DB -> on continuera le crawling à partir de cet id.
    request.get(url)
      .then((res) => {
        if (res.body.length === 0) { // il n'y a pas de valeur enregistrée dans la DB
          return request.post(url, { githubIdLastUserVisited: 0 }) // on en crée une valant 0 dans la DB
            .then((val) => {
              this.firstUserToVisit = val.body;
            });
        } // une valeur existe déjà dans la DB --> on la récupère
        this.firstUserToVisit = res.body[0];
        return Promise.resolve();
      }).then(() => this.fetchAndProcessCrawler()) // lance le crawler
      .catch(err => console.log(`erreur dans le constructeur: ${err.name}\n${err.message}\n${err.stack}`));
  }

  /**
   * S'il n'y a pas d'utilisateur à visiter, en récupère 30 via l'API Github et les ajoute à la DB.
   * Ensuite, récupère tous les followers de chaque utilisateur pas encore visité, les ajoute à la DB et au graph de notre API.
   */
  fetchAndProcessCrawler () {
    return this.fetchUserToVisit()
      .then((usersToVisit) => {
        if (usersToVisit.length === 0) { // il n'y a plus d'utilisateur en attente de visite.
          this.fetchGithubUsers(); // on récupère les 30 prochains utilisateurs via l'API Github et on les enregistre dans notre DB.
        } else { // il y a des utilisateurs en attente de visite --> on les visite
          usersToVisit.forEach((user) => {
            this.visitUser(user); // On visite chaque utilisateur présent dans le tableau des utilisateurs à visiter.
          });
        }
      })
      .catch(err => console.log(`erreur dans fetchAndProcessCrawler: ${err.name}\n${err.message}\n${err.stack}`));
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
      .catch(err => console.log(`erreur dans visitUser: ${err.name}\n${err.message}\n${err.stack}`));
  }

  /**
   * Récupère 30 utilisateur via l'API Github et les ajoute à la base de données.
   * @returns {Promise<T | void>}
   */
  fetchGithubUsers () {
    const url = `https://api.github.com/users?since=${this.firstUserToVisit.githubIdLastUserVisited}&per_page=100`; // on récupère les utilisateurs à partir de
    // ceux qui n'ont pas encore été récupérés.
    return request.get(url)
      .auth(this.loggedUsername, this.oauth_token)
      .then(res => new Promise((resolve) => {
        res.body.forEach(
          user => this.addUserToDB(user) // On ajoute chaque utilisateur récupéré à notre DB.
            .then(() => {
              this.firstUserToVisit.githubIdLastUserVisited = user.id; // après chaque ajout, on enregistre l'id de l'utilisateur. Son id + 1 correspond
              // au 1er id à récupérer dans l'API Github lors du prochain appel à fetchGithubUsers().
              return resolve(); // résout la promesse --> le foreach est terminé
            })
        );
      }).then(() => {
        const urlPut = `${config.url}utils/${this.firstUserToVisit._id}`;
        return request.put(urlPut, this.firstUserToVisit); // on met à jour le nombre d'utilisateurs récupérés sur
        // l'API Github dans notre DB.
      }).catch(err => console.log(`erreur dans fetchGithubUsers: ${err.name}\n${err.message}\n${err.stack}`)))
      .catch(err => console.log(`erreur dans fetchGithubUsers: ${err.name}\n${err.message}\n${err.stack}`));
  }

  /**
   * Récupère dans la DB tous les utilisateurs qui n'ont pas encore été visités.
   * @returns {Promise<T | void>}
   */
  fetchUserToVisit () {
    const url = `${config.url}users`;
    return request.get(url)
      .query({ visited: false, limit: 1 }) // on récupère jusqu'à 10 utilisateurs présents dans la DB mais qui n'ont pas encore été visité.
      .then(results => results.body)
      .catch(err => console.log(`erreur dans fetchUserToVisit: ${err.name}\n${err.message}\n${err.stack}`));
  }

  /**
   * Ajoute l'utilisateur passé en paramètre à notre DB via notre API. On enregistre que le login de l'utilisateur.
   * @param user, l'utilisateur Github à ajouter à notre DB.
   * @returns {Promise<T | void>}
   */
  addUserToDB (user) {
    const url = `${config.url}users`;
    return request.post(`${url}/`, { login: user.login, visited: false }); // pas besoin de checker si l'utilisateur est déjà dans la DB -> l'API le fait
  }

  /**
   * Ajoute tous les utilisateurs du tableau d'utilisateurs passé en paramètre à notre DB via notre API. On enregistre que le login de l'utilisateur.
   * @param users, un tableau d'utilisateurs Github à ajouter à notre DB.
   * @returns {Promise<T | void>}
   */
  addArrayOfUsersToDB (users) {
    const url = `${config.url}users`;
    return request.post(`${url}/`, users.map(user => { return { login: user.login, visited: false };})); // pas besoin de checker si l'utilisateur est déjà
    // dans la DB ->
    // l'API le fait
  }

  /**
   * Ajoute tous les followers de l'utilisateur reçu en paramètre à notre DB, comme utilisateurs à visiter et relie l'utilisateur à chaqu'un de ses
   * followers dans le graphe de notre API.
   * @param user, l'utilisateur dont on souhaite fetcher les followers.
   * @returns {Promise<T | void>}
   */
  fetchUserFollowers (user) {
    const urlFollowers = `https://api.github.com/users/${user.login}/followers`;
    let followers = [];

    function fetchAllFollowers (url, userLogin, loggedUsername, credential, allFollowersAreAvailable) {
      return request.get(url)
        .auth(loggedUsername, credential)
        .then((res) => {
          followers = followers.concat(res.body.map(r => r.login));
          if (res.links.next) {
            fetchAllFollowers(res.links.next, userLogin, loggedUsername, credential, allFollowersAreAvailable);
          } else {
            allFollowersAreAvailable(followers);
          }
        })
        .catch(err => console.log(`erreur dans fetchUserFollower/fetchAllFollowers: ${err.name}\n${err.message}\n${err.stack}`));
    }

    return fetchAllFollowers(urlFollowers, user, this.loggedUsername, this.oauth_token, tabFollowers => {
      return this.addArrayOfUsersToDB(tabFollowers) // on ajoute tous les utilisateurs qui sont dans le tableau à notre DB.
        .then(() => tabFollowers.map(u => this.addEdgeBetweenTwoUsers(user, u)))
        .catch(err => console.log(`erreur dans fetchUserFollower/fetchAllFollowers: ${err.name}\n${err.message}\n${err.stack}`));
    });
    /*
      tabFollowers.forEach(
      (u) => { // on ajoute tous les followers de l'utilisateur passé en paramètre à notre DB et dans notre graphe.
        const urlPost = `${config.url}graph/addEdge`;
        return this.addUserToDB(u) // on ajoute le follower à notre DB.
          .then(() => request.post(urlPost, { usernameFrom: user.login, usernameTo: u.login })) // on ajoute un edge entre l'utilisateur et le
          // follower dans le graph de notre API.
          .catch(err => console.log(`erreur dans fetchUserFollower/fetchAllFollowers: ${err.name}\n${err.message}\n${err.stack}`));
      }
    ));
    */
  }

  addEdgeBetweenTwoUsers (user1, user2) {
    const urlPost = `${config.url}graph/addEdge`;
    return request.post(urlPost, { usernameFrom: user1.login, usernameTo: user2.login }) // on ajoute un edge entre l'utilisateur et le follower dans le
    // graph de notre API.
      .catch(err => console.log(`erreur dans addEdgeBetweenUsers: ${err.name}\n${err.message}\n${err.stack}`));
  }

  /**
   * Active le crawler. Celui-ci récupèrera autant d'utilisateur que possible, tant que les 5'000 requêtes ne sont pas atteintes.
   * Il se relance automatiquement toutes les heures.
   */
  activateCrawler () {
    this.fetchAndProcessCrawler(); // lance une 1ère fois le crawler
    // this.timer = setInterval(this.fetchAndProcessCrawler, 10000); // attend une minute avant de relancer le crawler.
  }

  /**
   * Permet de désactiver le crawler.
   */
  desactivateCrawler () {
    clearInterval(this.timer);
  }
}

module.exports = Crawler;
