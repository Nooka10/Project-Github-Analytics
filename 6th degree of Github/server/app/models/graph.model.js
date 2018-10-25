require('../models/user.model');
const mongoose = require('mongoose');

const GraphSchema = new mongoose.Schema(
  {
    json: mongoose.Schema.Types.String
  }
);

mongoose.model('Graph', GraphSchema);
