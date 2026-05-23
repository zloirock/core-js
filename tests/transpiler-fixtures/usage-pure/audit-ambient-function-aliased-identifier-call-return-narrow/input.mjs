// `const f = getArr` aliases an ambient `declare function getArr(): string[]`. the
// Identifier callee `f` walks via resolvePath -> `getArr` Identifier; the first ambient
// probe in resolveCallReturnType keyed on the user-facing name `f` and missed (no
// ambient `f`). without a second probe against the walked Identifier, the call resolved
// to bare instance method dispatch and emitted generic `_at`. fix: retry ambient lookup
// for `resolved.node.name` when it differs from callee.node.name so `f().at(0)` narrows
// to `_atMaybeArray`
declare function getArr(): string[];
const f = getArr;
f().at(0);
