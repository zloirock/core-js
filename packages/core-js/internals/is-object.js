var isCallable = require('../internals/is-callable');
var $documentAll = require('../internals/document-all');

var SPECIAL_DOCUMENT_ALL = $documentAll.special;
var documentAll = $documentAll.all;

module.exports = SPECIAL_DOCUMENT_ALL ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};
