// `annotateCallReturnType` stamps `coreJSResolvedType` on the call node for downstream
// resolveNodeType. Here, `Promise.all([])` returns Promise<Array<T>>. The `.at(0)` chain
// downstream must still see the Array hint to pick `_atMaybeArray` over generic `_at`.
const r = (Promise.all([1, 2]) as any).then((a: number[]) => a.at(0));
