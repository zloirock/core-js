// Early-exit `if (typeof x !== 'string') return;` inside a decorator-arg arrow narrows
// `x` to `string` for subsequent statements. `getStatementSiblings` relies on synth-path
// `key`=index + `listKey='body'` to walk the containing block - unplugin's `makeSynthPath`
// now sets both in babel-compatible shape
function dec(fn: (x: number | string) => void) { return (_: any) => _; }

@dec((x) => {
  if (typeof x !== 'string') return;
  x.at(0);
})
class A {}
