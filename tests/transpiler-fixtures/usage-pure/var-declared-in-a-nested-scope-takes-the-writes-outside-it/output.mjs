import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a `var` a loop body, a block, a catch body, a switch case or a loop head declares is the function's
// binding, so a write to it outside that scope - here a closure's - reaches a read inside it: each read
// takes both values' families. the closure's constructions load the Set and Map families, and each read
// every family its member has; distinct member per line
export function f(c) {
  while (c) {
    var a = 'abc';
    w();
    use(_at(a).call(a, -1));
  }
  {
    var b = 'abc';
    w();
    use(_includes(b).call(b, 'a'));
  }
  try {
    g();
  } catch {
    var d = [1];
    w();
    use(_values(d).call(d));
  }
  switch (c) {
    case 1:
      var e = [1];
      w();
      use(_keys(e).call(e));
  }
  for (var h = [1]; c;) {
    w();
    use(_entries(h).call(h));
  }
  function w() {
    a = [1];
    b = [1];
    d = new _Set();
    e = new _Map();
    h = new _Set();
  }
}