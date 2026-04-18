import _isIterable from "@core-js/pure/actual/is-iterable";
// mixed quasi+interpolation: `${'iter'}ator` folds first quasi '' + 'iter' + quasi 'ator'
// into 'iterator' via the resolveKey TemplateLiteral branch
_isIterable(obj);