module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('core-js-internals/document-create-element')('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});
