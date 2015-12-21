var core = require('./_core');
module.exports = function(CONSTRUCTOR, METHOD){
  var C = core[CONSTRUCTOR];
  return (C.methods || C.prototype)[METHOD];
};