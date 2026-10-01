// `declare const Map: any` - ambient TS value declaration; tsc elides it at runtime so it
// does NOT shadow the Map polyfill. complement to the runtime-shadow fixtures (enum,
// import = require, function-scope enum): adapter hasBinding must keep the ambient form
// falsy via the `parent.declare === true` gate in the ambient binding filter so the polyfill
// emission survives for the downstream type annotation
declare const Map: any;
let x: Map<string>;
export { x };
