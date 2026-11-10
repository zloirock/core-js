// A synthesized receiver replaces one live source slot. Argument and default proofs
// use their own frames; deciding the slot must preserve its identity and its effects.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { findSynthSwapReceiver } from '../../packages/core-js-unplugin/internals/destructure-emit-utils.js';
import { cloneStamped, nodeSite } from '../../packages/core-js-unplugin/internals/nav-spine.js';
import { resolveFallbackReceiver, resolveFallbackReceiverPath } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { findSynthSwapReceiverPath } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { runBoth, check, checkDeep, finish } = createChecker('synth-receiver');

function resolvePure(meta) {
  return meta?.kind === 'property' && meta.object === 'Array' && meta.key === 'from'
    ? { kind: 'static', entry: 'array/from', hintName: 'Array$from' } : null;
}

const cases = [
  ['var argument before dead default', 'var list = Array; (({ from } = Object) => from)(list);', 'list', 'argument'],
  ['assigned argument before dead default', 'let list; list = Array; (({ from } = Object) => from)(list);', 'list', 'argument'],
  ['observed argument declines dead default', '(function ({ from } = Object) { return arguments[0]; })(Array);', null, null],
  ['observed argument without default', '(function ({ from }) { return arguments[0]; })(Array);', null, null],
  ['observed missing argument keeps default', '(function ({ from } = Array) { return arguments[0]; })();', 'Array', 'default'],
  ['observed undefined keeps default', '(function ({ from } = Array) { return arguments[0]; })(undefined);', 'Array', 'default'],
  ['observed sequence keeps default', '(function ({ from } = Array) { return arguments[0]; })(void effect());', 'Array', 'default'],
  ['observed arrow still replaces', 'function outer() { return (({ from }) => arguments[0])(Array); }', 'Array', 'argument'],
  ['constructed argument', 'function make() { return Array; } (({ from }) => from)(new make());', 'new make()', 'argument'],
  ['constructed argument before dead default', 'function make() { return Array; } (({ from } = Object) => from)(new make());', 'new make()', 'argument'],
  ['tagged argument', 'function make() { return Array; } (({ from }) => from)(make`tag`);', 'make`tag`', 'argument'],
  ['tagged argument before dead default', 'function make() { return Array; } (({ from } = Object) => from)(make`tag`);', 'make`tag`', 'argument'],
  ['plain default', 'function f({ from } = Array) {}', 'Array', 'default'],
  ['argument before opaque default', '(({ from } = []) => from)(Array);', 'Array', 'argument'],
  ['undefined uses default', '(({ from } = Array) => from)(undefined);', 'Array', 'default'],
  ['void keeps default', '(({ from } = Array) => from)(void effect());', 'Array', 'default'],
  ['opaque argument keeps default', '(({ from } = Array) => from)(other());', 'Array', 'default'],
  ['member replaces dead default', '(({ from } = Object) => from)(globalThis.Array);', 'globalThis.Array', 'argument'],
  ['live default survives member', '(({ from } = Array) => from)(globalThis.Array);', 'Array', 'default'],
  ['optional default', 'function f({ from } = globalThis?.Array) {}', 'globalThis?.Array', 'default'],
  ['optional argument', '(({ from } = Object) => from)(globalThis?.Array);', 'globalThis?.Array', 'argument'],
  ['default has its own frame', '(({ from } = Array, Array) => from)(globalThis.Array);', 'globalThis.Array', 'argument'],
  ['call replaces dead default', '(({ from } = Object) => from)((() => Array)());', '(() => Array)()', 'argument'],
  ['bare member argument', '(({ from }) => from)(globalThis.Array);', 'globalThis.Array', 'argument'],
  ['bare opaque argument', '(({ from }) => from)(other());', null, null],
  ['no argument or default', '(({ from }) => from)();', null, null],
  ['literal argument', '(({ from }) => from)({ from: custom });', null, null],
  ['rest keeps receiver', '(({ from, ...rest } = Array) => from)(Array);', null, null],
  ['or replaces whole fallback', 'function f({ from } = Array || Iterator) {}', 'Array || Iterator', 'default'],
  ['nullish replaces whole fallback', 'function f({ from } = Array ?? Iterator) {}', 'Array ?? Iterator', 'default'],
  ['call-left fallback stays whole', 'function f({ from } = read() || Array) {}', 'read() || Array', 'default'],
  ['decided default conditional', 'function f({ from } = true ? Array : Object) {}', 'Array', 'default'],
  ['decided default and', 'function f({ from } = true && Array) {}', 'Array', 'default'],
  ['unresolved conditional declines', 'function f({ from } = flag ? Array : Object) {}', null, null],
  ['decided argument conditional', '(({ from } = Object) => from)(true ? Array : Object);', 'Array', 'argument'],
  ['indirect call keeps default', '(function ({ from } = Object) {}).call(null, globalThis.Array);', 'Object', 'default'],
  ['indirect apply keeps default', '(function ({ from } = Object) {}).apply(null, [globalThis.Array]);', 'Object', 'default'],
  ['default sequence prefix survives', 'function f({ from } = (effect(), (0, Array))) {}', 'Array', 'default'],
  ['typed default wrapper', 'function f({ from } = (Array as typeof Array)) {}', 'Array', 'default'],
  ['argument sequence prefix survives', '(({ from }) => from)((effect(), (0, Array)));', 'Array', 'argument'],
  ['inline spread coordinates', '(({ from }) => from)(...[0, Array].slice(1));', null, null],
  ['inline spread argument', '((unused, { from }) => from)(...[0, Array]);', 'Array', 'argument'],
  ['opaque spread position', '((unused, { from }) => from)(...values, Array);', null, null],
  ['this default', 'class C extends Array { static f({ from } = this) {} }', 'this', 'default'],
];

for (const [name, source, spelling, owner] of cases) {
  runBoth(name, source, (parser, program, label) => {
    const pattern = parser.pickPath(program, 'ObjectPattern');
    const wrapper = pattern.parentPath;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method: 'usage-pure', resolvePure,
      resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => adapter });
    const original = JSON.stringify(program.node);
    const target = findSynthSwapReceiverPath(wrapper, pattern.node, adapter, resolvePure);
    check(`${ label }/source`, target ? source.slice(target.node.start, target.node.end) : null, spelling);
    let fromDefault = false;
    for (let path = target; path; path = path.parentPath) if (path === wrapper) fromDefault = true;
    check(`${ label }/owner`, target ? fromDefault ? 'default' : 'argument' : null, owner);
    check(`${ label }/identity`, findSynthSwapReceiverPath(wrapper, pattern.node, adapter, resolvePure)?.node, target?.node);
    if (parser.name === 'oxc') {
      const receiver = findSynthSwapReceiver(wrapper, pattern.node, adapter, resolvePure);
      check(`${ label }/native binding`, receiver, target?.node ?? null);
      if (receiver) {
        check(`${ label }/native scope`, nodeSite(receiver, wrapper).scope, target.scope);
        check(`${ label }/cloned scope`, nodeSite(cloneStamped(receiver), wrapper).scope, target.scope);
      }
    }
    checkDeep(`${ label }/read only`, JSON.stringify(program.node), original);
  });
}

// Detection may inspect an observed argument; replacing any branch of it may not.
for (const [name, source, expected, replaceable] of [
  ['direct', '(({ from }) => from)(pick ? Array : Iterator);', 'pick ? Array : Iterator', true],
  ['observed', '(function ({ from }) { return arguments[0]; })(pick ? Array : Iterator);', 'pick ? Array : Iterator', false],
  ['observed identity', 'const rows = [1]; (function ({ at } = []) { return arguments[0] === rows; })(rows);', 'rows', false],
  ['observed length', '(function ({ from }) { return arguments.length; })(Array);', 'Array', false],
  ['observed default', '(function ({ from } = Object) { return arguments[0]; })(pick ? Array : Iterator);', 'pick ? Array : Iterator', false],
  ['observed spread', '(function ({ from }) { return arguments[0]; })(...[pick ? Array : Iterator]);', 'pick ? Array : Iterator', false],
  ['observed default runs', '(function ({ from } = Array) { return arguments[0]; })(undefined);', 'Array', true],
  ['observed wrapped', '(function ([{ from }]) { return arguments[0]; })([pick ? Array : Iterator]);', 'pick ? Array : Iterator', false],
  ['wrapped direct', '(([{ from }]) => from)([pick ? Array : Iterator]);', 'pick ? Array : Iterator', true],
  ['declaration', 'const { from } = pick ? Array : Iterator;', 'pick ? Array : Iterator', true],
  ['loop', 'for (const { from } of [pick ? Array : Iterator]) use(from);', 'pick ? Array : Iterator', true],
]) runBoth(`fallback ${ name }`, source, (parser, program, label) => {
  const pattern = parser.pickPath(program, 'ObjectPattern');
  const wrapper = pattern.parentPath;
  const detected = resolveFallbackReceiver(wrapper, pattern.node);
  check(`${ label }/read`, source.slice(detected.rhsNode.start, detected.rhsNode.end), expected);
  const replacement = resolveFallbackReceiver(wrapper, pattern.node, null, true);
  check(`${ label }/replace`, replacement?.rhsNode ?? null, replaceable ? detected.rhsNode : null);
  const target = resolveFallbackReceiverPath(wrapper, pattern.node);
  check(`${ label }/path`, target?.node ?? null, replacement?.rhsNode ?? null);
});

finish();
