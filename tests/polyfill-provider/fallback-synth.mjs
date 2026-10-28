// Both native cursor forms consume the same branch decisions. Registration precedes
// dead-right removal, while an existing whole swap and a rejected leaf keep the tree.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  buildDestructureLeafMeta, flattenFallbackBranches, visitFallbackSynthBranches,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  peelFallbackBranchInner, unwrapSafeSequenceTailPath,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { runBoth, check, checkDeep, finish } = createChecker('fallback-synth');
const rows = [
  ['conditional', 'flag ? Array : Iterator', ['Array', 'Iterator']],
  ['nested', 'flag ? (other ? Array : Iterator) : unknown', ['Array', 'Iterator']],
  ['prefix', '(effect(), flag ? (left(), Array) : (right(), Iterator))', ['Array', 'Iterator']],
  ['or', 'Array || Iterator', ['Array', 'drop:Array || Iterator']],
  ['nullish', 'Array ?? Iterator', ['Array', 'drop:Array ?? Iterator']],
  ['and', 'unknown && Array', ['Array']],
  ['partial', 'flag ? Array : Object', ['Array']],
  ['opaque', 'flag ? unknown : null', []],
  ['member', 'flag ? globalThis.Array : Iterator', ['globalThis.Array', 'Iterator']],
  ['backed constructor member', 'globalThis.Iterator ?? Array', ['globalThis.Iterator', 'Array']],
  ['call rescue', 'flag ? (() => { effect(); return Array; })() : Iterator', ['call:(() => { effect(); return Array; })()', 'Iterator']],
  ['undefined default', 'flag ? undefined : Iterator', ['default:Array', 'Iterator'], 'Array'],
  ['nested undefined default', '(flag ? undefined : Array) && Array', ['default:Iterator', 'Array', 'Array'], 'Iterator'],
  ['void default', 'flag ? void 0 : Iterator', ['default:Array', 'Iterator'], 'Array'],
  ['null ignores default', 'flag ? null : Iterator', ['Iterator'], 'Array'],
  ['effectful default', 'flag ? undefined : Iterator', ['Iterator'], '(effect(), Array)'],
  ['default keeps selector', 'undefined || Iterator', ['Iterator'], 'Array'],
  ['and delivers its undefined left', 'undefined && Array', ['default:Iterator', 'Array'], 'Iterator'],
  ['assignment boundary', 'flag ? (held = Array) : Iterator', ['Iterator']],
  ['typed wrappers', 'flag ? ((effect(), Array) as typeof Array) : Iterator!', ['Array', 'Iterator']],
];

for (const [name, expr, expected, fallback = null] of rows) {
  runBoth(name, `const chosen = ${ expr }; const fallback = ${ fallback };`, (parser, program, label) => {
    const init = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'chosen').get('init');
    const defaultNode = fallback ? parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'fallback').node.init : null;
    const source = `const chosen = ${ expr }; const fallback = ${ fallback };`;
    const original = JSON.stringify(program.node);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method: 'usage-pure', resolvePure,
      resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => adapter });
    function resolvePure(meta) {
      if (meta.kind !== 'property' || meta.placement !== 'static' || meta.key !== 'from') return null;
      return ['Array', 'Iterator'].includes(meta.object)
        ? { kind: 'static', entry: `${ meta.object.toLowerCase() }/from`, hintName: `${ meta.object }$from` } : null;
    }
    for (const cursor of ['path', 'node']) {
      for (const disposition of ['register', 'reject', 'owned']) {
        const events = [];
        const result = visitFallbackSynthBranches({
          branch: cursor === 'path' ? init : init.node, key: 'from', undefinedArmFallback: defaultNode,
          adapter, resolvePure,
          readBranch(target) {
            if (cursor === 'node') return { node: peelFallbackBranchInner(target) };
            const path = unwrapSafeSequenceTailPath(target);
            return { node: path.node, scope: path.scope, path };
          },
          childBranch: (branch, slot) => cursor === 'path' ? branch.path.get(slot) : branch.node[slot],
          contextFor: (node, branch) => cursor === 'path' ? branch : { scope: init.scope, path: init },
          register({ source: branch, pure, callBranch, rescueSe }) {
            check(`${ label }/${ cursor }/static`, pure.kind, 'static');
            check(`${ label }/${ cursor }/rescue`, !!rescueSe, callBranch);
            events.push(`${ branch.node === defaultNode ? 'default:' : callBranch ? 'call:' : '' }${ source.slice(branch.node.start, branch.node.end) }`);
            return disposition !== 'reject';
          },
          ownsReceiver: () => disposition === 'owned',
          dropDeadRight({ node }) { events.push(`drop:${ source.slice(node.start, node.end) }`); },
        });
        const wanted = disposition === 'register' ? expected : expected.filter(event => !event.startsWith('drop:'));
        checkDeep(`${ label }/${ cursor }/${ disposition }/order`, events, wanted);
        check(`${ label }/${ cursor }/${ disposition }/accepted`, result, disposition !== 'reject' && wanted.length > 0);
      }
    }
    check(`${ label }/source unchanged`, JSON.stringify(program.node), original);
  });
}

check('empty cursor', visitFallbackSynthBranches({ branch: null, readBranch: () => null }), false);

runBoth('shadowed undefined stays a caller value', `function read(undefined) {
  const chosen = flag ? undefined : Iterator;
}`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator').get('init');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const seen = [];
  visitFallbackSynthBranches({
    branch: path, key: 'from', undefinedArmFallback: { type: 'Identifier', name: 'Array' }, adapter,
    resolvePure: meta => meta.kind === 'property' && ['Array', 'Iterator'].includes(meta.object) ? { kind: 'static' } : null,
    readBranch: target => ({ node: target.node, path: target, scope: target.scope }),
    childBranch: (target, slot) => target.path.get(slot),
    register({ source }) { seen.push(source.node.name); return true; },
    ownsReceiver: () => false,
    dropDeadRight() { throw new Error('a conditional has no dead right'); },
  });
  checkDeep(label, seen, ['Iterator']);
});

for (const pick of [true, false]) runBoth(`decided caller ${ pick } still claims its fallback arms`, `
  function read(pick) {
    return (({ from, missing = 9 } = Array) => [from([7]), missing])(pick ? void 0 : globalThis.Array);
  }
  read(${ pick });
`, (parser, program, label) => {
  const pattern = parser.pickPath(program, 'AssignmentPattern', path => path.node.left.type === 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', resolvePure: meta => meta.object === 'Array' ? { kind: 'static' } : null,
    resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
  });
  const resolver = parser.makeResolver({ getDecisionAdapter: () => adapter });
  const meta = buildDestructureLeafMeta({
    descriptor: { host: 'param-default', pattern }, key: 'from', adapter,
    resolvePure: resolved => resolved.object === 'Array' ? { kind: 'static' } : null,
  });
  check(`${ label }/owner`, meta.object, 'Array');
  check(`${ label }/per-arm`, meta.fromFallback, true);
});

runBoth('the default and argument keep their own scopes', `
  (({ from } = Array, Array) => from)(flag ? void 0 : globalThis.Array);
`, (parser, program, label) => {
  const call = parser.pickPath(program, 'CallExpression');
  const fallback = parser.pickPath(program, 'AssignmentPattern').get('right');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const seen = [];
  visitFallbackSynthBranches({
    branch: call.get('arguments')[0], key: 'from', undefinedArmFallback: fallback.node, adapter,
    resolvePure: meta => meta.kind === 'property' && meta.object === 'Array' ? { kind: 'static' } : null,
    readBranch(target) { const path = unwrapSafeSequenceTailPath(target); return { node: path.node, scope: path.scope, path }; },
    childBranch: (target, slot) => target.path.get(slot),
    contextFor: (node, source) => node === source.node ? source : { scope: fallback.scope, path: fallback },
    register({ source }) { seen.push(source.node.type); return true; },
    ownsReceiver: () => false,
    dropDeadRight() { throw new Error('a conditional has no dead right'); },
  });
  checkDeep(label, seen, ['MemberExpression']);
});

// The global union conservatively retains an AND's right; only a delivered
// undefined contributes the default, while null must never contribute it.
for (const [expr, expected] of [
  ['undefined && Array', ['Iterator', 'Array']],
  ['flag ? undefined : Array', ['Iterator', 'Array']],
  ['(flag ? undefined : Array) && Array', ['Iterator', 'Array']],
  ['undefined || Array', ['Array']],
  ['undefined ?? Array', ['Array']],
  ['false || undefined', ['Iterator']],
  ['true && undefined', ['Iterator']],
  ['null ?? undefined', ['Iterator']],
  ['null && Array', ['Array']],
]) runBoth(`global delivered default: ${ expr }`, `const chosen = ${ expr }; const fallback = Iterator;`, (parser, program, label) => {
  const init = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'chosen').get('init');
  const fallback = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'fallback').get('init');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-global', resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
  });
  const resolver = parser.makeResolver({ getDecisionAdapter: () => adapter });
  const metas = flattenFallbackBranches({
    node: init.node, key: 'from', scope: init.scope, path: init, adapter,
    paramDefault: { node: fallback.node, scope: fallback.scope, path: fallback },
  });
  checkDeep(label, metas.map(meta => meta.object), expected);
});

finish();
