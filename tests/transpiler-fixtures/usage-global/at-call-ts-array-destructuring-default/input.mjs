function foo(items: string[]) {
  const [a = ''] = items;
  a.at(-1);
}
