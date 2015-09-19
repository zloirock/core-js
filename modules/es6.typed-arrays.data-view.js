var $def   = require('./$.def')
  , buffer = require('./$.buffer');

$def($def.G + $def.W + $def.F * !buffer.useNative, {DataView: buffer.DataView});