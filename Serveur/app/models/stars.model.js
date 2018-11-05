const mongoose = require('mongoose');

const mostStarredReposSchema = new mongoose.Schema(
  {
    repo_name  : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    owner      : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    language   : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    nb_stars   : {
      type    : mongoose.Schema.Types.Number,
      required: true
    },
    description: {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    link       : {
      type    : mongoose.Schema.Types.String,
      required: true
    }
  }
);

mongoose.model('starred_repos', mostStarredReposSchema);
