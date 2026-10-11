// a declarator a computed key splits into a capture and its declarators moves the names it binds onto them, and only
// the writes the source performs move along: the moved name keeps the static it holds, so a later instance read of
// its result dispatches on that type - in a loop head, over a parameter or an initless var it redeclares. a var
// redeclared WITH a value is written twice and keeps the common dispatch
function key(name) { return name; }
function make() { return { w: Array, other: 1 }; }
for (let { w: { [key('from')]: fromLoop }, other } = make(); other; other = 0) log(fromLoop([1]).at(-1));
export function overParameter(fromParam) {
  var { w: { [key('from')]: fromParam }, other } = make();
  return [fromParam([1, 2]).includes(2), other];
}
var fromInitless;
var { w: { [key('from')]: fromInitless }, other: otherInitless } = make();
export const overInitless = [fromInitless([3, 4]).entries(), otherInitless];
export function overValue() {
  var fromValue = null;
  var { w: { [key('from')]: fromValue }, other } = make();
  return [fromValue([5, 6]).values(), other];
}
