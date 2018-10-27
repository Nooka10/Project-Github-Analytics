const mongoose = require('mongoose');

const utilsSchema = new mongoose.Schema(
  {
    githubIdLastUserVisited: mongoose.Schema.Types.Number
  },
);

mongoose.model('Utils', utilsSchema);
