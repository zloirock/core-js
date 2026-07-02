// Three IIFEs whose bodies introduce local `const`, `function`, `class` bindings that
// shadow the global names `Map`, `Array`, `Object`. The receivers of `'groupBy' in`,
// `'from' in`, `'create' in` are the local shadows, so no static polyfills are emitted
// for those globals; only the explicit `WeakMap` reference becomes a polyfill.
'groupBy' in (() => { const Map = WeakMap; return Map; })();
'from' in (() => { function Array() { return []; } return Array; })();
'create' in (() => { class Object {} return Object; })();
