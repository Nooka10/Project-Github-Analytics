const mongoose = require('mongoose');

const utilsSchema = new mongoose.Schema(
  {
    numberFirstTovisit: mongoose.Schema.Types.Number
  },
);

mongoose.model('Utils', utilsSchema);
