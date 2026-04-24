// `getStatementSiblings` has two paths: `listKey === 'body'` (BlockStatement / Program) and
// `listKey === 'consequent'` (SwitchCase). the block-body path is covered by
// `audit-decorator-early-exit-guard-narrow`; this fixture exercises the SwitchCase branch.
// early-exit in `case`-consequent narrows `x: number | string` -> `string`, routing `.at(0)`
// to `_atMaybeString` via synth-path `listKey` / numeric `key` parity with babel NodePath
function dec(fn: (x: number | string, k: 'a' | 'b') => void) { return (_: any) => _; }

@dec((x, k) => {
  switch (k) {
    case 'a':
      if (typeof x !== 'string') return;
      x.at(0);
      break;
  }
})
class A {}
