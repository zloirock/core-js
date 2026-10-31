// Selecting extraction needs a source proof, not only a claimed constructor name.
import { planSelectingExtraction } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('selecting-extraction');

for (const [name, expression, options, expected, selected = null, parameters = 'flag, other'] of [
  ['plain receiver', 'Array', {}, null],
  ['truthy left', 'Array || other', {}, 'operand', 'left'],
  ['defined left', 'Array ?? other', {}, 'operand', 'left'],
  ['literal false uses mirror', 'false || Array', {}, 'mirror'],
  ['literal true uses mirror', 'true && Array', {}, 'mirror'],
  ['unknown left', 'other || Array', {}, 'mirror'],
  ['unknown nullish', 'other ?? Array', {}, 'mirror'],
  ['hint alone', 'other || flag', {}, 'mirror'],
  ['nested AND', 'other && Array', { nested: true }, 'native'],
  ['same arms', 'flag ? Array : Array', {}, 'operand', 'consequent'],
  ['foreign arm', 'flag ? Array : other', {}, 'mirror'],
  ['effectful test', 'effect() ? Array : Array', {}, 'mirror'],
  ['effectful left', '(effect(), Array) || other', { soleBinding: true }, 'operand', 'left'],
  ['partial effectful left', '(effect(), Array) || other', {}, 'operand', 'left'],
  ['instance whole', 'flag ? other : Array', { kind: 'instance', soleBinding: true }, 'receiver'],
  ['instance shared', 'flag ? other : Array', { kind: 'instance' }, 'memo'],
  ['instance nested', 'flag ? other : Array', { kind: 'instance', nested: true }, 'mirror'],
  ['instance ignores static hint', 'Array || other', { kind: 'instance', soleBinding: true }, 'receiver'],
  ['capture unknown OR', 'held = other || globalThis', {}, 'native'],
  ['capture unknown ternary', 'held = flag ? globalThis : other', {}, 'native'],
  ['capture same arms', 'held = flag ? Array : Array', {}, 'preserve'],
  ['capture all proxies', 'held = flag ? globalThis : self', { kind: 'instance' }, 'preserve'],
  ['capture decided operand', 'held = Array || other', {}, null],
  ['nested capture', 'held = saved = other || globalThis', {}, 'native'],
  ['effect around capture', '(effect(), held = other || globalThis)', {}, null],
  ['kept known logical', 'Array && Set', { keepsReceiver: true, kind: 'instance' }, 'preserve'],
  ['kept unknown logical', 'other || Array', { keepsReceiver: true }, 'native'],
  ['kept all proxies', 'flag ? globalThis : self', { keepsReceiver: true, kind: 'instance' }, 'preserve'],
  ['kept foreign ternary', 'flag ? globalThis : other', { keepsReceiver: true }, 'native'],
  ['kept effectful test', 'effect() ? globalThis : self', { keepsReceiver: true }, 'native'],
  ['shadowed global', 'globalThis || other', {}, 'mirror', null, 'globalThis, other'],
  ['shadowed known logical', 'Array && Set', { keepsReceiver: true }, 'native', null, 'Array'],
  ['shadowed proxy', 'flag ? globalThis : self', { keepsReceiver: true, kind: 'instance' }, 'native', null, 'flag, self'],
]) runBoth(name, `function read(${ parameters }) { let held, saved; const result = ${ expression }; }`, (parser, program, label) => {
  const declaration = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const path = declaration.get('init');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = {
    scope: path.scope, path, adapter,
    resolveGlobalPolyfill: global => ['Array', 'Set', 'globalThis', 'self'].includes(global) ? { entry: global } : null,
  };
  const input = { receiver: path.node, kind: 'static', object: 'Array', ...options };
  const before = JSON.stringify(program.node);
  const plan = planSelectingExtraction(input, ctx);
  check(`${ label }/decision`, plan?.kind ?? null, expected);
  checkDeep(`${ label }/repeat`, planSelectingExtraction(input, ctx), plan);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  if (expected === 'receiver') check(`${ label }/complete receiver`, plan.node, path.node);
  else if (expected === 'operand') check(`${ label }/written operand`, plan.node, path.node[selected]);
  if (name.startsWith('capture') || name === 'nested capture') {
    check(`${ label }/capture classification`, plan?.captured ?? false, expected !== null);
    check(`${ label }/capture is not replaced`, plan?.node, undefined);
  }
});

// A borrowed initializer is classified in its source frame, not a destination's shadow.
for (const [kind, expression, expected] of [
  ['static', 'flag ? Array : Array', 'operand'],
  ['instance', 'held = flag ? globalThis : self', 'preserve'],
  ['instance', 'Array && Set', 'preserve'],
]) runBoth(`borrowed ${ expression }`, `let held;
  const source = ${ expression };
  function read(Array, Set, globalThis, self) { const destination = other; }`, (parser, program, label) => {
  const source = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'source').get('init');
  const destination = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'destination').get('init');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const input = { receiver: source.node, kind, keepsReceiver: true };
  const ctx = {
    scope: destination.scope, path: destination, adapter,
    resolveGlobalPolyfill: name => ['Array', 'Set'].includes(name) ? { entry: name } : null,
  };
  check(`${ label }/wrong frame declines`, planSelectingExtraction(input, ctx)?.kind, 'native');
  check(`${ label }/source frame`, planSelectingExtraction(input, {
    ...ctx, readSite: () => ({ scope: source.scope, path: source }),
  })?.kind, expected);
});

finish();
