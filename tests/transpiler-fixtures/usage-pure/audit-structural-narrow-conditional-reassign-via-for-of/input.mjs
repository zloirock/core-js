export function viaForOf(c, items) {
  for (let x of items) {
    if (c) x = 'hello';
    return x.includes(2);
  }
}
