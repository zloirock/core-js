import _Array$of from "@core-js/pure/actual/array/of";
// a for-init host cannot take a preceding extraction statement (the loop header forbids it -
// the extraction insert crashed babel and emitted two `const` statements on unplugin), so the
// array-wrapped + rest shape routes to the cascade flatten: the polyfill rides a SIBLING
// declarator in the same header declaration and the residual destructure keeps rest exclusion.
// a multi-element wrapper in a loop header stays the conservative native bail
for (const of = _Array$of, [{
    of: _unused,
    ...r
  }] = [Array];;) {
  of(1);
  break;
}
for (const [{
  from
}, extra] = [Array, 1];;) {
  from([2, extra]);
  break;
}
// a multi-declarator header takes the sibling polyfill mid-list
for (let i = 0, [{
    isArray,
    ...more
  }] = [Array]; i < 1; i++) {
  isArray([i]);
}