function process(x: string | number[]) {
  if (typeof x === 'string') {
    console.log(x);
  } else {
    return;
  }
  x.at(-1);
}
