for (const S of [Symbol]) {
  const [S] = [pick()];
  use(S.for);
}
