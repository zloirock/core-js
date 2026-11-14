// A census write standing in an arm the build never takes is no write: the census answers a pair with no
// read at all - the entry a constructor resolves to, a realm recogniser - as unwritten where every write of it
// is such a patch, settled in the patch's own frame, whichever presence test spells the guard. A static install
// guarded by a static stays written: its own test cannot be decided ahead of it
import { createChecker, resolvePure } from './harness.mjs';
import { collectPrePassSites as collectBabelPrePassSites, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, isPristineProxyGlobal, isReusableReceiver } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, runBoth, finish } = createChecker('census-never-run-writes');

function censusAdapter(parser, program) {
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  let mutated = null;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', resolvePure, getMutatedStatics: () => mutated,
  });
  mutated = (parser.name === 'babel'
    ? collectBabelPrePassSites(program, adapter, census)
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

for (const [name, code, expected] of [
  ['before realm write', 'self.at(0); if (flag) globalThis.self = other;', true],
  ['after realm write', 'if (flag) globalThis.self = other; self.at(0);', false],
  ['deferred realm read', 'function read() { self.at(0); } if (flag) globalThis.self = other; read();', false],
  ['write in getter', 'const box = { get x() { globalThis.self = other; } }; self.at(box.x);', false],
]) runBoth(`receiver/${ name }`, code, (parser, program, label) => {
  const adapter = censusAdapter(parser, program);
  const path = parser.pickPath(program, 'MemberExpression', item => item.node.object?.name === 'self');
  check(label, isReusableReceiver(path.node.object, { interveningEffects: true, ctx: { scope: path.scope, path, adapter } }), expected);
});

finish();
