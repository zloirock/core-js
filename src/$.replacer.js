'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = require('./$').isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}