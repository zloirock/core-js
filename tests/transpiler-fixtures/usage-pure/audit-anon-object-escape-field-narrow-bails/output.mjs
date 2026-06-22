import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// An anonymous object literal whose method reads `this.<field>` is sound to narrow ONLY while the object
// stays module-local. Two positions hand a reference to external code, so the field could be reassigned
// from outside and the narrow must drop to generic: a call/new ARGUMENT (`reg({...})` - the callee may
// store + mutate it -> `_at`) and the module default export (`export default {...}` - importers get it
// -> `_includes`). An object consumed in place as a member-call receiver (`({...}).scan()`) cannot be
// reached externally, so its narrow stands (`_includesMaybeArray`)
declare function reg(o: any): void;
reg({
  data: ["x"],
  read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  }
});
({
  data: ["y"],
  scan() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.data).call(_ref2, "z");
  }
}).scan();
export default {
  items: [1, 2],
  pick() {
    var _ref3;
    return _includes(_ref3 = this.items).call(_ref3, 3);
  }
};