// Transpiler-fuzz runner: a differential parity check over GENERATED inputs. Each generated
// snippet is one check: it passes when babel-plugin and unplugin agree on the injected import-set
// AND on runtime behaviour (native == babel == unplugin),
// and when neither plugin throws during transform. Body-shape (AST codegen vs text rewrite) is NOT
// compared - that divergence is the architectural sidecar, not a bug. A runtime divergence where
// babel != unplugin is a plugin bug; babel == unplugin but != native is a polyfill-vs-native diff.
import { generate } from './generate.mjs';
import { checkSnippet } from './harness.mjs';

const { cyan, green, red } = chalk;
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const counts = { passed: 0, failed: 0 };

for (const snippet of generate()) {
  const verdict = await checkSnippet(snippet.code, OPTIONS, snippet.ts);
  if (!(verdict.transformCrash || verdict.importMismatch || verdict.runtimeMismatch)) {
    counts.passed++;
    continue;
  }
  counts.failed++;
  const details = [];
  if (verdict.babelError) details.push(`babel threw: ${ verdict.babelError }`);
  if (verdict.unpluginError) details.push(`unplugin threw: ${ verdict.unpluginError }`);
  if (verdict.importMismatch) {
    details.push(`import-set babel={ ${ [...verdict.babelImports].join(', ') } } unplugin={ ${ [...verdict.unpluginImports].join(', ') } }`);
  }
  if (verdict.runtimeMismatch) {
    const kind = verdict.pluginRuntimeDiverge ? 'PLUGIN DIVERGENCE' : 'polyfill vs native';
    details.push(`runtime [${ kind }] native=${ verdict.native } babel=${ verdict.babelRun } unplugin=${ verdict.unpluginRun }`);
  }
  echo`${ red('FAIL') } ${ cyan(snippet.name) } :: ${ details.join('; ') }`;
}

const { passed, failed } = counts;
echo`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`;
if (failed) throw new Error('Some tests have failed');
