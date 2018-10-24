
const mongoose = require('mongoose');

const credentials = require('../github_credentials.json');

const Agent = require('./agent.js');

const agent = new Agent(credentials);

mongoose.connect('mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true');
const { Schema } = mongoose;

const userSchema = new Schema({
  avatar: { type: String, required: false },
  pseudo: { type: String, required: false },
  name: { type: String, required: false },
  nb_followers: Number,
});

const User = mongoose.model('followers', userSchema);

User.remove({}, () => {
  console.log('collection removed');
});

agent.fetchAndProcessMostFollowedUsers((err, users) => {
  users.map((tab) => {
    if (tab.items !== undefined) {
      tab.items.map((user) => {
        if (user !== undefined) {
          agent.fetchAndProcessUserInformations(user.login, (err2, userInfos) => {
            if (!err2) {
              console.log(userInfos.avatar_url);
              const u = new User({
                avatar: userInfos.avatar_url,
                pseudo: userInfos.login,
                name: userInfos.name,
                nb_followers: userInfos.followers,
              });
              u.save().then(() => console.log('inscrit'));
            }
            return null;
          });
        }
        return null;
      });
    }
    return null;
  });
});

// mongoose.connection.close();

/*
const kitty2 = new Cat({ pseudo: 'Zildjian', followers: 23 });
kitty2.save().then(() => console.log('meow'));

const kitty3 = new Cat({ pseudo: 'Zildjian', followers: 23 });
kitty3.save().then(() => console.log('meow'));
*/
