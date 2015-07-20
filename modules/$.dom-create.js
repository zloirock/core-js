var $        = require('./$')
  , isObject = require('./$.is-object')
  , document = $.g.document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};