const mongoose = require('mongoose');

const mostStarredReposSchema = new mongoose.Schema(
  {
    repo_name  : {
      type    : String,
      required: true
    },
    owner      : {
      type    : String,
      required: true
    },
    language   : {
      type    : String,
      required: true
    },
    nb_stars   : {
      type    : Number,
      required: true
    },
    description: {
      type    : String,
      required: true
    },
    link       : {
      type    : String,
      required: true
    }
  }
);

mongoose.model('starred_repos', mostStarredReposSchema);
