var $export = require('./$.export')
  , buffer  = require('./$.buffer');

$export($export.G + $export.W + $export.F * !buffer.USE_NATIVE, {DataView: buffer.DataView});