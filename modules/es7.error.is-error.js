// https://github.com/ljharb/proposal-is-error
var $export = require('./$.export')
  , cof     = require('./$.cof');

$export($export.S, 'Error', {
  isError: function isError(it){
    return cof(it) === 'Error';
  }
});