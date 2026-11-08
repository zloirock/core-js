// A file-level mutation trigger does not make every local write a scoped-analysis candidate.
// Compare the indexed pass with the unrestricted collector, including all recorded keys.
import { adapters, createChecker, resolvePure } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, withOverlappingWriteScans } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { beginMutationPrePass, mutationShapesReducer, mutationSiteVisitors } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { checkDeep, checkTruthy, finish } = createChecker('mutation-site-candidates', {
  tsc: 'Runtime wrappers deliberately surround dynamic write targets and opaque values.',
});

function collect(parser, source, indexed, sourceType = 'module', plugins = [], prepare = null) {
  const program = parser.parseAndScope(source, sourceType, plugins);
  prepare?.(program);
  const census = collectFileCensus(program.node, [mutationShapesReducer(null, indexed)]);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  const { getBinding } = adapter;
  let lookups = 0;
  let keyQueries = 0;
  let bufferLookups = 0;
  adapter.getBinding = function (...args) {
    lookups++;
    if (args[0].name === 'buffer') bufferLookups++;
    return getBinding.apply(this, args);
  };
  const { mutated, handleSite, finalize } = beginMutationPrePass({
    rootNode: program.node, adapter, census,
    resolveStaticKey(node) {
      if (node.type === 'MemberExpression' && node.property.name === 'unknownKey') keyQueries++;
      return null;
    },
  });
  if (handleSite) withOverlappingWriteScans(() => program.traverse(mutationSiteVisitors(handleSite,
    census.needsMemberMutationVisitor !== false, parser.name === 'babel')));
  finalize?.();
  return { keys: [...mutated], lookups, keyQueries, bufferLookups };
}

const rows = [
  ['fresh receiver', 'let H = new Int32Array(1); H[0] = replacement; H = new Int32Array(2); H[1] = replacement;'],
  ['constructor return', 'function Factory() { return Array; } const H = new Factory(); H.from = replacement;'],
  ['inert name with free twin', 'function local() { const H = new Int32Array(1); } H.from = replacement;'],
  ['inert name with imported twin', 'import H from "@core-js/pure/actual/map"; function local() { const H = new Int32Array(1); } H.groupBy = replacement;'],
  ['inert alias with live write', 'let H = new Int32Array(1); H = Array; H.from = replacement;'],
  ['inert alias with class twin', 'function local() { const H = new Int32Array(1); } class H extends Map {} H.groupBy = replacement;'],
  ['inert alias with container twin', 'function local() { const H = new Int32Array(1); } const H = { C: Array }; H.C.from = replacement;'],
  ['inert alias with default twin', 'function local() { const H = new Int32Array(1); } function f(H = Array) { H.from = replacement; }'],
  ['read skipped callee', 'function get() { let C; C = Array; return C; } get().from = replacement;'],
  ['read skipped conditional callee', 'function get() { let C = Array; if (flag) C = Map; return C; } get().from = replacement;'],
  ['nested live function', 'function outer(local) { local.x = 1; function middle() { return () => { Array.from = replacement; }; } }'],
  ['nested key write', 'function outer() { class C { [Array.from = replacement]() {} } }'],
  ['sibling local functions', 'function local(value) { value.x = 1; } function live() { Array.from = replacement; }'],
  ['decorated parameter write', 'class C { method(@decorate(Array.from = replacement) parameter) {} }', 'module', ['decorators-legacy']],
  ['receiver-only deopt', 'let box = Array; box[unknown].from = replacement;'],
  ['logical receiver-only deopt', 'let box = Array; box[unknown][keyHolder.unknownKey] ||= replacement;'],
  ['direct', 'Array.from = replacement;'],
  ['late alias', 'function write() { C.from = replacement; } const C = Array; write();'],
  ['reassigned alias', 'let C = Array; if (unknown) C = Map; C.from = replacement;'],
  ['parameter', 'function write(C) { C.from = replacement; }'],
  ['defaulted parameter', 'function write(C = Array) { C.from = replacement; }'],
  ['pattern parameter', 'function write({ C = Array } = {}) { C.from = replacement; }'],
  ['shadow', 'function write(Array) { Array.from = replacement; }'],
  ['late local', 'function write() { C.from = replacement; var C = Array; }'],
  ['realm alias', 'const realm = globalThis; realm.Array.from = replacement;'],
  ['container', 'const holder = { C: Array }; holder.C.from = replacement;'],
  ['array', 'const holder = [Array]; holder[0].from = replacement;'],
  ['selected container', 'const holder = flag ? { C: Array } : { C: Map }; holder.C.from = replacement;'],
  ['nested container', 'const holder = { child: { C: Array } }; holder.child.C.from = replacement;'],
  ['later container store', 'const holder = {}; holder.C = Array; holder.C.from = replacement;'],
  ['data container', 'const holder = {}; holder.value = 1;'],
  ['free lowercase', 'document.title = replacement; process.exitCode = 1;'],
  ['free namesake', 'function other(document) {} document.title = replacement;'],
  ['local lowercase', 'const doc = document; doc.title = replacement;'],
  ['bare slots', 'Promise = replacement; [Map] = source; ({ C: Set } = source);'],
  ['identity slots', 'Promise = self.Promise; self = replacement;'],
  ['identity pattern', '({ Promise, Map } = self); self = replacement;'],
  ['updates', 'Array.from++; ++Array.from; Promise++;'],
  ['delete', 'delete Array.from; delete globalThis.Map;'],
  ['for heads', 'for (Array.from of values) {} for (Map.groupBy in values) {}'],
  ['pattern heads', 'for ([Array.from] of values) {} for ({ a: Map.groupBy } of values) {}'],
  ['iterated constructors', 'for (const C of [Array, Map]) C.from = replacement;'],
  ['iterated containers', 'for (const { C } of [{ C: Array }, { C: Map }]) C.from = replacement;'],
  ['iterated alias', 'const values = [Array, Map]; for (const C of values) C.from = replacement;'],
  ['caught constructor', 'try { throw Array; } catch (C) { C.from = replacement; }'],
  ['late binding write', 'function write() { C.from = replacement; } let C; C = Array; write();'],
  ['pattern leaves', '({ a: [Array.from = replacement], ...globalThis.rest } = source);'],
  ['nested default', '([local = (Array.from = replacement)] = source);'],
  ['computed key', 'const key = "from"; Array[key] = replacement;'],
  ['effectful key', 'Array[effect(), "from"] = replacement;'],
  ['opaque key', 'Array[key] = replacement;'],
  ['wrapped write', '((Array.from as any)) = replacement;'],
  ['wrapped update', '((Array.from as any))++; delete ((Array.from as any));'],
  ['wrapped head', 'for ((Array.from as any) of values) {}'],
  ['direct mutator', 'Object.defineProperty(Array, "from", { value: replacement });'],
  ['detached mutator', '(0, Object.assign)(Array, { from: replacement });'],
  ['aliased mutator', 'const dp = Object.defineProperty; dp(Array, "from", { value: replacement });'],
  ['pattern mutator', 'const { defineProperty: dp } = Object; dp(Array, "from", { value: replacement });'],
  ['computed mutator', 'const key = "defineProperty"; Object[key](Array, "from", { value: replacement });'],
  ['optional mutator', 'Object?.defineProperty?.(Array, "from", { value: replacement });'],
  ['opaque mutator', 'Object[key](Array, "from", replacement, Map);'],
  ['reflect receiver', 'Reflect.set(holder, "from", replacement, Array);'],
  ['imported mutator', 'import dp from "@core-js/pure/actual/object/define-property"; dp(Array, "from", { value: replacement });'],
  ['imported receiver', 'import ctor from "@core-js/pure/actual/map"; ctor.groupBy = replacement;'],
  ['returned receiver', 'function get() { return Array; } get().from = replacement;'],
  ['forwarded receiver', '(value => value)(Array).from = replacement;'],
  ['returned container', 'function get() { return { C: Array }; } get().C.from = replacement;'],
  ['class sites', 'class C { static x = (Array.from = replacement); method(x = (Map.groupBy = replacement)) {} }'],
  ['catch shadow', 'try { Array.from = replacement; } catch (Array) { Array.from = other; }'],
  ['method key outside parameters', 'class C { [process.exitCode = 1](process) {} }'],
  ['object key outside parameters', 'const object = { [process.exitCode = 1](process) {} };'],
  ['parameter outside body var', 'function f(value = (process.exitCode = 1)) { var process; }'],
  ['parameter outside body let', 'function f(value = (process.exitCode = 1)) { let process; }'],
  ['parameter outside initialized body var', 'function f(value = (process.exitCode = 1)) { var process = {}; }'],
  ['parameter closure outside body var', 'function f(value = () => (process.exitCode = 1)) { var process; }'],
  ['concise arrow body', 'const f = process => (process.exitCode = 1);'],
  ['class field outside method parameters', 'class C { field = (process.exitCode = 1); method(process) {} }'],
  ['namespace', 'namespace N { export const C = Array; C.from = replacement; }'],
  ['decorator', 'class C { @decorate(Array.from = replacement) method() {} }', 'module', ['decorators']],
  ['script this', 'this.Array.from = replacement; this.other = replacement;', 'script'],
  ['module this', 'this.Array.from = replacement; this.other = replacement;'],
];

for (const parser of adapters) {
  const program = parser.parseAndScope('Array.from = replacement;');
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  checkDeep(`${ parser.name }/unused site index`, census.mutationCandidateNodes, null);
}

for (const parser of adapters) {
  const program = parser.parseAndScope('Array.from = replacement;');
  const census = collectFileCensus(program.node, [mutationShapesReducer(null, true)]);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  checkTruthy(`${ parser.name }/live site index`, census.mutationCandidateNodes.size > 0);
  for (let pass = 0; pass < 2; pass++) {
    const { mutated, handleSite, finalize } = beginMutationPrePass({ rootNode: program.node, adapter, census });
    withOverlappingWriteScans(() => program.traverse(mutationSiteVisitors(handleSite, true, parser.name === 'babel')));
    finalize();
    checkDeep(`${ parser.name }/pass ${ pass }/released index`, census.mutationCandidateNodes.size, 0);
    checkDeep(`${ parser.name }/pass ${ pass }/complete result`, [...mutated], ['Array.from', 'Array.+']);
  }
}

for (const parser of adapters) {
  const program = parser.parseAndScope('document.title = replacement;');
  const census = collectFileCensus(program.node, [mutationShapesReducer(null, true)]);
  checkTruthy(`${ parser.name }/closed gate has free targets`, census.mutationCandidateNodes.size > 0);
  const { handleSite } = beginMutationPrePass({ rootNode: program.node, adapter: {}, census });
  checkDeep(`${ parser.name }/closed gate skips collection`, handleSite, null);
  checkDeep(`${ parser.name }/closed gate releases index`, census.mutationCandidateNodes.size, 0);
}

for (const parser of adapters) {
  const program = parser.parseAndScope('Promise = self.Promise; self = replacement;');
  const census = collectFileCensus(program.node, [mutationShapesReducer(null, true)]);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  const { mutated, handleSite, finalize } = beginMutationPrePass({ rootNode: program.node, adapter, census });
  withOverlappingWriteScans(() => program.traverse(mutationSiteVisitors(handleSite, true, parser.name === 'babel')));
  const failure = new Error('finalize');
  mutated.has = () => { throw failure; };
  let caught;
  try {
    finalize();
  } catch (error) {
    caught = error;
  }
  checkTruthy(`${ parser.name }/finalize error propagates`, caught === failure);
  checkDeep(`${ parser.name }/finalize error releases index`, census.mutationCandidateNodes.size, 0);
}

for (const parser of adapters) for (const [label, source, sourceType, plugins] of rows) {
  // An independent live patch opens the file gate, so a dropped sibling cannot hide behind it.
  const code = `Array.of = other;\n${ source }`;
  const original = collect(parser, code, false, sourceType, plugins);
  const indexed = collect(parser, code, true, sourceType, plugins);
  checkDeep(`${ parser.name }/${ label }`, indexed.keys, original.keys);
}

for (const parser of adapters) for (const size of [16, 64]) {
  const source = `Array.from = replacement; function write(local) { ${ 'local.value = 1;'.repeat(size) } }`;
  const original = collect(parser, source, false);
  const indexed = collect(parser, source, true);
  const label = `${ parser.name }/${ size }`;
  checkDeep(`${ label }/complete mutation set`, indexed.keys, ['Array.from', 'Array.+']);
  checkTruthy(`${ label }/observer sees local resolution`, original.lookups >= size);
  checkTruthy(`${ label }/local writes need no scoped resolution`, indexed.lookups < original.lookups / 4,
    `${ original.lookups } -> ${ indexed.lookups } lookups`);
}

// An unknown computed key must still be resolved on a live global target, but not on
// the thousands of local buffer writes beside it. Logical installs retain their early gate.
for (const parser of adapters) for (const size of [16, 64]) {
  const deopt = collect(parser, 'let box = Array; box[unknown].from = replacement;', true);
  checkDeep(`${ parser.name }/${ size }/receiver-only deopt survives`, deopt.keys, ['Array.*']);
  const prefix = 'Array[keyHolder.unknownKey] = replacement; let buffer = new Int32Array(1);';
  const normal = collect(parser, prefix + 'buffer[keyHolder.unknownKey] = 1;'.repeat(size), true);
  checkDeep(`${ parser.name }/${ size }/live unknown-key mutation`, normal.keys, ['Array.*']);
  checkDeep(`${ parser.name }/${ size }/only live key query`, normal.keyQueries, 1);
  checkDeep(`${ parser.name }/${ size }/one binding lookup per buffer receiver`, normal.bufferLookups, size);
  const logical = collect(parser, prefix + 'buffer[keyHolder.unknownKey] ||= 1;'.repeat(size), true);
  checkDeep(`${ parser.name }/${ size }/logical unknown-key mutation`, logical.keys, ['Array.*']);
  checkDeep(`${ parser.name }/${ size }/logical key gate precedes receiver`, logical.bufferLookups, 0);
}

// The alias fan has already named its leaf. Keep the separate initializer-read proof,
// but do not repeat it when visiting that same leaf's binding and reachable writes.
for (const parser of adapters) for (const [label, source, keys, lookups = 3] of [
  ['constant', 'const buffer = Array; const alias = buffer; alias.from = replacement;', ['Array.from', 'Array.+']],
  ['later write', 'let buffer = Array; const alias = buffer; buffer = Map; alias.from = replacement;',
    ['Array.from', 'Array.+', 'Map.from', 'Map.+']],
  ['live shadow', 'const buffer = Array; { const buffer = Map; const alias = buffer; alias.groupBy = replacement; }',
    ['Map.groupBy', 'Map.+']],
  ['import', 'Array.of = other; import buffer from "@core-js/pure/actual/map"; buffer.groupBy = replacement;',
    ['Array.of', 'Array.+', 'Map.groupBy', 'Map.+'], 1],
]) {
  const result = collect(parser, source, true);
  checkDeep(`${ parser.name }/alias ${ label }/mutation set`, result.keys, keys);
  checkDeep(`${ parser.name }/alias ${ label }/binding questions`, result.bufferLookups, lookups);
}

// A retained read with an earlier source span resolves there, past a TS shadow at the
// consumer. Its binding must not be replaced by the consumer's previously found binding.
for (const parser of adapters) {
  const source = 'const H = Array; const held = H; { namespace H { export const from = 1; } H.from = replacement; }';
  const result = collect(parser, source, true, 'module', [], program => {
    const captured = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'held').node.init;
    const member = parser.pickPath(program, 'MemberExpression', path => path.node.object.name === 'H');
    member.node.object = { ...captured };
  });
  checkDeep(`${ parser.name }/separate receiver read`, result.keys, ['Array.from', 'Array.+']);
}

finish();
