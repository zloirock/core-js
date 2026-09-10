import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a member's COMPUTED KEY is evaluated where the class (or the object literal) is defined, so the
// method frame it hangs in - parameters and body alike - covers nothing it reads. babel hangs the
// key off the FUNCTION node, which puts the body's hoisted `var` on the key's own var-scope owner
// and made this leg read a shadow the language never opens; estree hangs it off the member wrapper
// above the function and never saw one. a `var` further OUT really does cover the key, and the
// method's body read really is shadowed by its own - the last two members hold that line.
class C {
  [_Promise$resolve(1)]() {
    var Promise = 1;
    return Promise;
  }
  get [_Promise$resolve(2)]() {
    {
      var Promise = 2;
    }
    return Promise;
  }
}
const o = {
  [_Promise$resolve(3)]() {
    var Promise = 3;
    return Promise;
  }
};
function outerShadow() {
  var Promise = 4;
  class D {
    [Promise.resolve(5)]() {
      var Promise = 6;
    }
  }
  return D;
}
class BodyRead {
  m() {
    var Promise = 7;
    return Promise.resolve(8);
  }
}
export { C, o, outerShadow, BodyRead };