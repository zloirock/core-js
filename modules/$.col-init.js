var $iter = require('./$.iter');
module.exports = function(that, isMap, key, iterable){
  if(iterable != undefined)$iter.forOf(iterable, isMap, that[key], that);
  return that;
};