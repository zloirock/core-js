// a loop head's binding takes no declaration or write of the namesake its body declares: a read of the
// head - here in a closure its initializer makes - keeps the head's own value
for (let s = 'abc', f = () => s.at(-1); c; ) {
  let s = [1];
  s = [2];
  use(f(), s);
  break;
}
