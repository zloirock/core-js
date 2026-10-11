// A census write standing in an arm the build never takes is no write: the census answers a pair with no
// read at all - the entry a constructor resolves to, a realm recogniser - as unwritten where every write of it
// is such a patch, settled in the patch's own frame, whichever presence test spells the guard. A static install
// guarded by a static stays written: its own test cannot be decided ahead of it
import { createChecker } from './harness.mjs';
import { collectMutationPrePass, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, isPristineProxyGlobal } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, runBoth, finish } = createChecker('census-never-run-writes');

// every global and static the rows read is served by the build, as pure serves it
function resolvePure(meta) {
  return { kind: meta.kind === 'global' ? 'global' : 'static' };
}

function censusAdapter(parser, program) {
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  let mutated = null;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', resolvePure, getMutatedStatics: () => mutated,
  });
  mutated = (parser.name === 'babel'
    ? collectMutationPrePass(program, adapter, census)
    : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true })).mutated;
  return adapter;
}

for (const [label, source, asks] of [
  ['typeof test', "if (typeof Promise == 'undefined') globalThis.Promise = Shim;", [['globalThis', 'Promise', false], ['Promise', '*', false]]],
  ['unguarded write', 'globalThis.Promise = Shim;', [['globalThis', 'Promise', true], ['Promise', '*', true]]],
  [
    'patch in a function',
    "function polyfill() { if (typeof Promise == 'undefined') globalThis.Promise = Shim; } polyfill();",
    [['globalThis', 'Promise', false]],
  ],
  ['realm member test', 'if (!globalThis.Map) globalThis.Map = Shim;', [['globalThis', 'Map', false]]],
  ['environment probe test', 'if (!window.Set) window.Set = Shim;', [['globalThis', 'Set', false]]],
  ['realm alias test', 'const G = globalThis; if (!G.WeakMap) G.WeakMap = Shim;', [['globalThis', 'WeakMap', false]]],
  ['static install under a global test', "if (typeof Promise == 'undefined') Promise.allSettled = shim;", [['Promise', 'allSettled', false]]],
  ['static install under its own test', 'if (!Array.from) Array.from = shim;', [['Array', 'from', true]]],
]) runBoth(label, source, (parser, program, name) => {
  const adapter = censusAdapter(parser, program);
  for (const [object, key, expected] of asks) check(`${ name }: ${ object }.${ key }`, adapter.isMutatedStatic(object, key), expected);
});

// the realm's own install: the recognisers asking the name alone see the realm still
runBoth('realm install', "if (typeof globalThis == 'undefined') window.globalThis = window;", (parser, program, name) => {
  const adapter = censusAdapter(parser, program);
  check(`${ name }: pristine realm`, isPristineProxyGlobal(adapter, 'globalThis'), true);
  check(`${ name }: realm member`, adapter.isMutatedStatic('globalThis', 'Promise'), false);
});

finish();
