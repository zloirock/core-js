var $       = require('./$')
  , defined = require('./$.defined');
module.exports = function(it){
  return $.ES5Object(defined(it));
};