import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A selected realm alias keeps the constructor namespace for its retained static read.
var root = typeof window !== 'undefined' ? window : undefined;
(root === _globalThis ? _Promise : root.Promise).resolve(1);