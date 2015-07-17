'use strict';
var toLength = require('./$').toLength
  , defined  = require('./$.defined')
  , cof      = require('./$.cof')
  , $def     = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError("String#startsWith doesn't accept regex!");
    var that  = String(defined(this))
      , index = toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});