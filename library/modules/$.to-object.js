var ES5Object = require('./$.es5-object')
  , defined   = require('./$.defined');
module.exports = function(it){
  return ES5Object(defined(it));
};