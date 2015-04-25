var $        = require('./$')
  , document = $.g.document
  , is = $.isObject(document) && $.isFunction(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};