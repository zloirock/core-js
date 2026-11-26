// a case-consequent lexical binding keeps its own assigned Array receiver
switch (globalThis.k) {
  case 1:
    let S;
    ({ Map: S } = globalThis);
    S = [4];
    S.at(0);
    globalThis.r7 = S.with(0, 'w');
}
