function foo(x) {
  if (typeof x !== 'string') {
    return;
    console.log('unreachable');
  }
  x.at(-1);
}
