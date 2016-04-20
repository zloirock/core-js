'use strict';
// Symbol.asyncIterator shim
var core    = require('./_core')
  , wks     = require('./_wks')
  , $Symbol = core.Symbol
  , KEY     = 'asyncIterator'
  , $DP     = require('./_object-dp')
  , dP      = $DP.f;

if(!(KEY in $Symbol))dP($Symbol, KEY, {value: wks(KEY)});
