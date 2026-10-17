import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
// The sequence prefix ahead of a claimed static is re-emitted VERBATIM, so what it reads keeps its own rewrite: a bare proxy
// global there must still come back polyfilled, not raw.
export const prefixGlobal = _nameMaybeFunction(_Map);