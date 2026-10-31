// a case-consequent lexical binding keeps its own assigned Array receiver
switch (globalThis.k) {
  case 1:
    let S;
    ({ Map: S } = globalThis);
    S = [4];
    globalThis.r7 = S.with(0, 'w');
}
