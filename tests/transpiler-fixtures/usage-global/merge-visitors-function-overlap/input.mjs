async function* gen(items: string[]) {
  for await (const item of items) {
    yield item.includes('x');
  }
}
