var $documentAll = require('../internals/document-all');

var SPECIAL_DOCUMENT_ALL = $documentAll.special;
var documentAll = $documentAll.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = SPECIAL_DOCUMENT_ALL ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};
