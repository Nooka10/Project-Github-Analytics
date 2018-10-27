const mongoose = require('mongoose');

const utilsSchema = new mongoose.Schema(
  {
    githubIdLastUserVisited: {
      type    : mongoose.Schema.Types.Number,
      required: true
    }
  }
);

mongoose.model('Utils', utilsSchema);
