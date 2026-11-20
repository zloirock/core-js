// A parser leg that makes no assertion must not count as a passing scenario.
import { createChecker, registeredSuiteImports } from './harness.mjs';

const { check, checkDeep, throwsWith, finish } = createChecker('harness-contracts');
const imports = registeredSuiteImports(`
  import './first.mjs'; // import './disabled.mjs';
  const label = "import './text.mjs'";
  if (false) await import('./skipped.mjs');
  await import('./gate.mjs');
`);
checkDeep('only the static suite and the awaited gate run', [...imports], ['./first.mjs', './gate.mjs']);
const originalEcho = globalThis.echo;
const lines = [];
globalThis.echo = (...parts) => lines.push(parts);
try {
  const empty = createChecker('empty-canary');
  throwsWith('an empty suite fails', () => empty.finish(), '1 failed');
  const oneLeg = createChecker('missing-leg-canary');
  oneLeg.runBoth('parser coverage', 'const x = 1;', adapter => {
    if (adapter.name === 'babel') oneLeg.check('babel assertion', true, true);
  });
  throwsWith('one silent parser leg fails', () => oneLeg.finish(), '1 failed');
  const both = createChecker('two-leg-control');
  both.runBoth('parser coverage', 'const x = 1;', adapter => both.check(adapter.name, true, true));
  both.finish();
} finally {
  globalThis.echo = originalEcho;
}
check('the negative controls produced diagnostics', lines.length > 0, true);
finish();
