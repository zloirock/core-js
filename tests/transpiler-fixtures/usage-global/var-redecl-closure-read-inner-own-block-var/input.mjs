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
export const r = [innerOwnBlockVar()];
