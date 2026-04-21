import _Array$from from "@core-js/pure/actual/array/from";
// resolveObjectName.computed=true branch: globalThis['Array'].from via resolveComputedProxyName
// walks `object` through chained proxies. outer MemberExpression is non-computed `.from`,
// but inner is computed - buildMemberMeta uses resolveObjectName(obj) which sees MemberExpression
// and dispatches to resolveComputedProxyName (`globalThis['Array']` -> 'Array')
_Array$from([1, 2, 3]);
// nested computed form via proxy chain: globalThis['self']['Array'].from
_Array$from([1, 2, 3]);