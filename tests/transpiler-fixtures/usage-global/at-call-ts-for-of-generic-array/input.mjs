function foo(items: Array<number>) {
  for (const item of items) {
    // @ts-expect-error the member read is the probe, and the right answer is a type without it
    item.at(-1);
  }
}
