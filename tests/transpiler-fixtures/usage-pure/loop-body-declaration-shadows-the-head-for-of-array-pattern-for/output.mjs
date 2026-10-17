import _Symbol from "@core-js/pure/actual/symbol/constructor";
for (const S of [_Symbol]) {
  const [S] = [pick()];
  use(S.for);
}