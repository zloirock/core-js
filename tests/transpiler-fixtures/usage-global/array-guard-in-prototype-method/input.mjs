// Installing a method on the local class leaves Array.isArray intact, even
// when the outer binding has the same name as the constructor it receives.
export var Parent = (function () {
  function Parent() {}

  Parent.prototype.hasParent = function (parent) {
    var refs = this._parentage;
    return Array.isArray(refs) && refs.includes(parent);
  };

  return Parent;
}());
