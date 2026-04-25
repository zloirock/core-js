function pull() {
  const list = Array.from(
    new Set([1, 2, 3, 4]),
    x => x * 2,
  );
  return list;
}
