import _Map from "@core-js/pure/actual/map/constructor";
// ES2019 catch-binding-omission: `try {} catch {}` has no `node.param`. the binding
// collector must not register any name, so `new Map()` outside / inside the catch body
// both polyfill normally.
@(function () {
  try {} catch {}
  return new _Map();
})
class C {}
[C];