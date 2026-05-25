// ES2019 catch-binding-omission: `try {} catch {}` has no `node.param`. the binding
// collector must not register any name, so `new Map()` outside / inside the catch body
// both polyfill normally.
@(function () {
  try {} catch {}
  return new Map();
})
class C {}
[C];
