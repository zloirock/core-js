for (const t of ['abc']) {
  use(() => t.includes('b'));
  let t = pick();
}
