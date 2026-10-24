export function functionInBody() {
  for (var i = f().includes(5); !i;) {
    function f() { return [5]; }
    i = f;
  }
  return i;
}
