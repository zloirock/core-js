module.exports = function(it, Constructor, name, field){
  if(!(it instanceof Constructor) || (field !== undefined && field in it)){
    throw TypeError(name + ": use the 'new' operator!");
  } return it;
};