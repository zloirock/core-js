module.exports = !require('../internals/fails')(function () {
  return Object.isExtensible(Object.preventExtensions({}));
});
