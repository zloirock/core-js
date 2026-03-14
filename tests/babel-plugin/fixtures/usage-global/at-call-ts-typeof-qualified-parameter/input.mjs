function foo(config: { items: string[] }) {
  const x: typeof config.items = config.items;
  x.at(-1);
}
