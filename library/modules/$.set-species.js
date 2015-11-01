'use strict';
var core    = require('./$.core')
  , $       = require('./$')
  , DESC    = require('./$.support-desc')
  , SPECIES = require('./$.wks')('species');

module.exports = function(KEY){
  var C = core[KEY];
  if(DESC && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};