'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  // TODO: use NewPromiseCapability logic
  return new this(function (resolve) {
    resolve(callbackfn());
  });
} });
