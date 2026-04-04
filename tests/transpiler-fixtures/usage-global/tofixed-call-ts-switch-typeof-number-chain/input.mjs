function format(x: string | number) {
  switch (typeof x) {
    case 'number': return x.toFixed(2);
    case 'string': return x.at(-1);
  }
}
