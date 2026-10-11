// a `var` a loop body, a block, a catch body, a switch case or a loop head declares is the function's
// binding, so a write to it outside that scope - here a closure's - reaches a read inside it: each read
// takes both values' families. the closure's constructions load the Set and Map families, and each read
// every family its member has; distinct member per line
export function f(c) {
  while (c) {
    var a = 'abc';
    w();
    use(a.at(-1));
  }
  {
    var b = 'abc';
    w();
    use(b.includes('a'));
  }
  try { g(); } catch {
    var d = [1];
    w();
    use(d.values());
  }
  switch (c) {
    case 1:
      var e = [1];
      w();
      use(e.keys());
  }
  for (var h = [1]; c; ) {
    w();
    use(h.entries());
  }
  function w() { a = [1]; b = [1]; d = new Set(); e = new Map(); h = new Set(); }
}
