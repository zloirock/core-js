function process(items: string[]) {
  return (copy: typeof items) => copy.at(-1);
}
