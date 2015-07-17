var isFunction = require('./$').isFunction;
module.exports = function(it){
  if(!isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};