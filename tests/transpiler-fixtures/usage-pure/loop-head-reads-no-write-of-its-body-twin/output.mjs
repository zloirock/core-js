import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a loop head's binding takes no declaration or write of the namesake its body declares: a read of the
// head - here in a closure its initializer makes - keeps the head's own value
for (let s = 'abc', f = () => _atMaybeString(s).call(s, -1); c;) {
  let s = [1];
  s = [2];
  use(f(), s);
  break;
}