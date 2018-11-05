require('../models/user.model');
const mongoose = require('mongoose');

const GraphSchema = new mongoose.Schema(
  {
    json: {
      type    : mongoose.Schema.Types.String,
      required: true
    }
  }
);

mongoose.model('Graph', GraphSchema);
