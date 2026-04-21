import _Promise$all from "@core-js/pure/actual/promise/all";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `annotateCallReturnType` stamps `coreJSResolvedType` on the call node for downstream
// resolveNodeType. Here, `Promise.all([])` returns Promise<Array<T>>. The `.at(0)` chain
// downstream must still see the Array hint to pick `_atMaybeArray` over generic `_at`.
const r = (_Promise$all([1, 2]) as any).then((a: number[]) => _atMaybeArray(a).call(a, 0));