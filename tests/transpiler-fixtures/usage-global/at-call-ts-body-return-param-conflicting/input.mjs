function getData(x) {
  if (x) return x;
  return 'fallback';
}
getData([1, 2, 3]).at(-1);
