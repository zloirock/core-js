// flatten on decl[0] + sibling decl[1] class expression named `globalThis`. inside the
// class body, references to `globalThis` resolve to the CLASS (not the global). previously
// `polyfillSiblingReceiverRefs.pushScope` didn't treat ClassExpression / ClassDeclaration
// as scope owners - the class id wasn't added to the locals set, so inner method refs
// to `globalThis` got substituted to `_globalThis` (wrong: changes semantics from
// "return class self" to "return polyfilled global"). fix: register both class shapes as
// scope owners and add `node.id?.name` to their locals
const { Array: { from } } = globalThis, klass = class globalThis { method() { return globalThis; } };
console.log(from, klass);
