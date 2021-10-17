require('../../modules/es.date.to-string');
var uncurryThis = require('../../internals/function-uncurry-this');
var dateToString = Date.prototype.toString;

module.exports = uncurryThis(dateToString);
