import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A member's COMPUTED KEY is evaluated where the class (or the object literal) is defined, so the method frame it hangs in -
// parameters and body alike - covers nothing it reads.
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
export { C };