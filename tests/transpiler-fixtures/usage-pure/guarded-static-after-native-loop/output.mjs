import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A loop initializer retains the guard after the native slot before it.
// The earlier instance read keeps its own slot; global mode keeps the source form.
let M = _Map;
if (flag) M = {
  name: 'user',
  at: 8,
  groupBy: 7
};
for (const nm = _nameMaybeFunction(M), {
    at: other
  } = M, method = M === _Map ? _Map$groupBy : M.groupBy; test();) use(nm, other, method);