import "core-js/modules/es.array.includes";
// Extending Array.prototype does not replace the constructor's isArray predicate.
const proto = Array.prototype;
proto.hasParent = function (parent) {
  const refs = this._parentage;
  return Array.isArray(refs) && refs.includes(parent);
};