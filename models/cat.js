const mongoose = require('mongoose');
const Cat = mongoose.model('Cat', { name: String });

module.exports = Cat;

