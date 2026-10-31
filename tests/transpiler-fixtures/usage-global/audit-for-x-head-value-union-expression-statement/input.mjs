async function fa() {
  let W = Object;
  for await (W of [Array]) { break; }
  W.of(3);
}
fa();
