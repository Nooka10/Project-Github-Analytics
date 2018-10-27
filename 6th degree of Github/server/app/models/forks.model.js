const mongoose = require('mongoose');

const mostForkedReposSchema = new mongoose.Schema(
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
    nb_forks   : {
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

mongoose.model('forked_repos', mostForkedReposSchema);
