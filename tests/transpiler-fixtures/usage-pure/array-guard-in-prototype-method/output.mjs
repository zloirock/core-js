import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Installing a method on the local class leaves Array.isArray intact, even
// when the outer binding has the same name as the constructor it receives.
export var Parent = function () {
  function Parent() {}
  Parent.prototype.hasParent = function (parent) {
    var refs = this._parentage;
    return Array.isArray(refs) && _includesMaybeArray(refs).call(refs, parent);
  };
  return Parent;
}();