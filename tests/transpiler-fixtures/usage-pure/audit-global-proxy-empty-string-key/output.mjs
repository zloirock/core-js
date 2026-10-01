import _globalThis from "@core-js/pure/actual/global-this";
// empty-string property key on global proxy: globalThis['']. the member-key lookup returns '' for
// this shape; the global-proxy member lookup then returns null (per `|| null` coalesce treating
// falsy '' as miss). no real global has empty name; the rewrite must not be triggered
const x = _globalThis[''];
x;