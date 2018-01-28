// Thank's IE8 for his funny defineProperty
module.exports = !require('./descriptors') && !require('./fails')(function () {
  return Object.defineProperty(require('./document-create-element')('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});
