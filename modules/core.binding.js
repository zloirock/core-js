'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , $def   = require('./$.def')
  , invoke = require('./$.invoke')
  , hide   = $.hide
  , assertFunction = require('./$.assert').fn
  // IE8- dirty hack - redefined toLocaleString is not enumerable
  , _ = $.DESC ? require('./$.uid')('tie') : 'toLocaleString'
  , toLocaleString = {}.toLocaleString;

// Placeholder
$.core._ = $.path._ = $.path._ || {};

$def($def.P + $def.F, 'Function', {
  part: require('./$.partial'),
  only: function(numberArguments, that /* = @ */){
    var fn     = assertFunction(this)
      , n      = $.toLength(numberArguments)
      , isThat = arguments.length > 1;
    return function(/* ...args */){
      var length = Math.min(n, arguments.length)
        , args   = Array(length)
        , i      = 0;
      while(length > i)args[i] = arguments[i++];
      return invoke(fn, args, isThat ? that : this);
    };
  }
});

function tie(key){
  var that  = this
    , bound = {};
  return hide(that, _, function(key){ // eslint-disable-line no-shadow
    if(key === undefined || !(key in that))return toLocaleString.call(that);
    return $.has(bound, key) ? bound[key] : bound[key] = ctx(that[key], that, -1);
  })[_](key);
}

hide($.path._, 'toString', function(){
  return _;
});

hide(Object.prototype, _, tie);
$.DESC || hide(Array.prototype, _, tie);