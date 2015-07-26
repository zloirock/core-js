// fallback for not array-like ES3 strings
var cof     = require('./$.cof')
  , $Object = Object;
module.exports = 0 in $Object('z') ? $Object : function(it){
  return cof(it) == 'String' ? it.split('') : $Object(it);
};