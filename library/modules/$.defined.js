module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};