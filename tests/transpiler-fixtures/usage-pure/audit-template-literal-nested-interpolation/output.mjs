import _isIterable from "@core-js/pure/actual/is-iterable";
// recursion through nested TemplateLiteral: outer interp is itself a template with a literal
// interp - every leaf resolves to a string literal, so the whole chain folds to 'iterator'
_isIterable(obj);