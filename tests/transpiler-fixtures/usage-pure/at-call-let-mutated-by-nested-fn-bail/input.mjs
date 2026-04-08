let x = 'hello';
function mutate() { x = 42; }
function f() {
  if (typeof x === 'string') {
    mutate();
    x.at(0);
  }
}
