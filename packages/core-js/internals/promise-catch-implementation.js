// `Promise.prototype.catch` method implementation
// https://tc39.es/ecma262/#sec-promise.prototype.catch
module.exports = function (onRejected) {
  return this.then(undefined, onRejected);
};
