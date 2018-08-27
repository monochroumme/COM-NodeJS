const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({}, // empty because the only thing I need is the id which is created automatically
{
  versionKey: false, // don't need _v thing
  collection: 'sessions'
});

const Session = module.exports = mongoose.model('Session', sessionSchema);
