// namespace import of a pure global-this entry: bundler CJS interop hangs the global on the
// namespace's `.default`, so a slot write through it must taint like the default-import form
import * as g from "@core-js/pure/actual/global-this";
g.default.Map = Shim;
new Map([[1, 2]]);