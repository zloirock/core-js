import _Map from "@core-js/pure/actual/map";
// Every loop alternative receives the patch, including a lowercase loop head.
for (const c of [Array, _Map]) c.from = () => "patched";
export const result = Array.from([1]);