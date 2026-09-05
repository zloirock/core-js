// one method per row, each polyfilled for SEVERAL families (array + string, array + iterator), so a
// row's injection is attributable to that row alone and a wrong family shows as its own module. the
// second value is a string or an array ITERATOR (`[3, 4].values()` - one shared `es.array.iterator`,
// no constructor whose own policy would flood the import list)
// a `var` redeclared in a NESTED BLOCK (`{ var a = 'xy' }`) is one hoisted binding with two values.
// a read from a function nested in the var's owner runs at a time position cannot order, so it
// dispatches on the UNION of the declarators' values: the string re-declaration reaches `a.at`
// beside the array init, and both modules inject (one tracker records the re-declaration as a
// write, the other block-scopes it - the canon reads every declarator of the owner instead)
function readAfterUse() {
  var a = [1, 2];
  function g() { return a.at(0); }
  { var a = 'xy'; }
  return g();
}
function readBeforeUse() {
  var a = [1, 2];
  { var a = 'xy'; }
  const g = () => a.includes(1);
  return g();
}
// ... and an AGREEING pair keeps the one type
function agreeing() {
  var a = [1, 2];
  function g() { return a.findLastIndex(Boolean); }
  { var a = [3, 4]; }
  return g();
}
// the straight-line read stays positional: the re-declaration before the read wins outright
function positional() {
  var a = [1, 2];
  { var a = [3, 4].values(); }
  return a.find(Boolean);
}
// a hoisted FUNCTION redeclared by a block `var` holds two values the same way - the index of an
// owner's writes reads its own body block as the owner's scope, where a top-level `function a` is
// the binding itself and casts no shadow over the `var` redeclaring it
function functionThenBlockVar() {
  function a() {}
  { var a = [3, 4].values(); }
  return a.flatMap(x => [x]);
}
function functionThenBlockVarNested() {
  function a() {}
  function g() { return a.some(Boolean); }
  { var a = [3, 4].values(); }
  return g();
}
// the nested function's OWN block `var` shadows the outer binding for its reads outside the block:
// the hoisted twin displaces a native `var` declared outside the twin's owner
function innerOwnBlockVar() {
  var a = [1, 2];
  function g() {
    { var a = [3, 4].values(); }
    return a.drop(1);
  }
  return g();
}
export const r = [readAfterUse(), readBeforeUse(), agreeing(), positional(), functionThenBlockVar(), functionThenBlockVarNested(), innerOwnBlockVar()];
