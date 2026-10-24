const s1 = 'ab';
export function letInBody() {
  for (var i = s1.slice(-1); !i;) {
    let s1 = [3];
    i = s1;
  }
  return i;
}