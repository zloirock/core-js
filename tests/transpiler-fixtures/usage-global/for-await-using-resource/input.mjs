async function g() {
  for await (await using r of items) {}
}
