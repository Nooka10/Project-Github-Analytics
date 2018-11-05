const mongoose = require('mongoose');

const utilsSchema = new mongoose.Schema(
  {
    numberPageToFetch: {
      type    : mongoose.Schema.Types.Number,
      required: true
    }
  }
);

mongoose.model('Utils', utilsSchema);
