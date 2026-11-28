function foo(config: { items: string[] }) {
  return (x: typeof config.items) => x.at(-1);
}
