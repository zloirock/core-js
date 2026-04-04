function process(items: string[]) {
  const copy: typeof items = [...items];
  copy.at(-1);
}
