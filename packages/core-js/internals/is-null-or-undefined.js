'use strict';
// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-islooselyequal
module.exports = function (it) {
  return it === null || it === undefined;
};
