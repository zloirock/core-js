'use strict';
var global  = require('./$.global')
  , $       = require('./$')
  , DESC    = require('./$.support-desc')
  , SPECIES = require('./$.wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESC && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};