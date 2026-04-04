function foo(items: string[]) {
  const [, ...rest] = items;
  rest.at(-1);
}
