'use strict';
var $ = require('./$');
module.exports = function(regExp, replace, isStatic){
  var replacer = $.isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}