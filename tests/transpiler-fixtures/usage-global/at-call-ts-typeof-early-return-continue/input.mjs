function foo(items: (string | number)[]) {
  for (const x of items) {
    if (typeof x === 'number') continue;
    x.at(0);
  }
}
