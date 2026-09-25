// Transpiler performance gates: REAL large single-scope bundles (three.js builds, pinned in
// THIS directory's package.json - zxi installs it) plus a synthetic reassignment-heavy
// stress, through BOTH emitters in
// usage-global mode. The bounds are complexity-CLASS discriminators with wide headroom - a
// quadratic scope / flow-analysis regression overshoots them on any machine, ordinary machine
// variance does not. The synthetic deliberately maximizes WRITTEN top-level names: real
// bundles rarely reassign at that density, and quadratic roots in the reassignment / flow
// machinery are invisible on three.js yet catastrophic on this shape. Each transform also
// asserts an injection happened, so a detection-dead run cannot pass vacuously fast.
//
// A case's `source()` may also return an ARRAY of module sources, transformed one-by-one the way
// a bundler feeds them. Those cases gate the PER-CALL axis: everything above pays setup once on a
// huge input, so a regression in per-file work (a cache that stops being reused across calls, say)
// is invisible there and shows up only when the same bytes arrive as hundreds of separate calls.
import { fileURLToPath } from 'node:url';
import { transformAsync } from '@babel/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import unplugin from '../../packages/core-js-unplugin/index.js';
import { censusWalkTruncations } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { cyan, green, red } = chalk;
const { readdir, readFile } = fs;
const { dirname, join } = path;

const HERE = dirname(fileURLToPath(import.meta.url));
const MODES = ['usage-global', 'usage-pure'];
const SAMPLES = argv.samples ?? 3;
if (!Number.isSafeInteger(SAMPLES) || SAMPLES < 1) {
  throw new Error('--samples must be a positive integer');
}
const WARMUP = argv.warmup ?? true;
if (typeof WARMUP !== 'boolean') {
  throw new Error('--warmup must be a boolean; use --no-warmup to disable it');
}

function syntheticSingleScope(names) {
  const pad = Array.from({ length: 100 }, (unused, k) => k).join(', ');
  const parts = [];
  for (let i = 0; i < names; i++) {
    parts.push(`var v${ i } = [${ i }]; v${ i } = [${ i }, 1]; v${ i }.at(0);`,
      `function pad${ i }(a) { return [${ pad }].length + a; }`);
  }
  return parts.join('\n');
}

// every use in the reassignment synthetic asks the preceding-sibling guard scan too, but a
// guard-DENSE list additionally pays the guard extraction per statement - a quadratic in
// either the scan or the extraction overshoots this shape first
function syntheticGuardDense(names) {
  const parts = [];
  for (let i = 0; i < names; i++) {
    parts.push(`var g${ i } = [${ i }]; if (typeof g${ i } !== 'object') throw new Error('x'); g${ i } = [${ i }, 1]; g${ i }.at(0);`);
  }
  return parts.join('\n');
}

// the guard-dense case spreads its writes over as many BINDINGS as there are statements, so every
// use asks the preceding-sibling machinery about a single write. put the same density on ONE binding
// and the write set grows with the statement list those scans walk: a per-write walk of the
// preceding siblings, or a per-use re-derivation of the write set, is CUBIC in the statement count
// on this shape while staying flat on every other case here. real bundles carry the shape as a
// long-lived reassigned accumulator read throughout a module
function syntheticWriteDenseBinding(uses) {
  const parts = ['let w = [0];', "if (typeof w !== 'object') throw new Error('x');"];
  for (let i = 0; i < uses; i++) parts.push(`w.at(${ i });`);
  for (let i = 0; i < uses; i++) parts.push(`w = [${ i }];`);
  return parts.join('\n');
}

// discriminated-union receivers walk the discriminant sibling scan per member use - a
// quadratic there needs union-annotated bindings, which no other synthetic carries
function syntheticDiscriminantDense(names) {
  const parts = ["type U = { kind: 'a', v: string } | { kind: 'b', v: string[] };"];
  for (let i = 0; i < names; i++) {
    parts.push(`declare const u${ i }: U;`, `if (u${ i }.kind !== 'a') throw new Error('x');`, `u${ i }.v.at(${ i });`);
  }
  return parts.join('\n');
}

// assignment-form ctor aliases make babel drop the binding from its scope registry, so every
// member use walks the lagged-binding recovery - a quadratic there is invisible on the
// reassignment synthetic above (its bindings never lag) yet catastrophic on this shape
function syntheticLaggedAliases(names) {
  const parts = [`let ${ Array.from({ length: names }, (unused, i) => `g${ i }`).join(', ') };`];
  for (let i = 0; i < names; i++) {
    parts.push(`({ Map: g${ i } } = globalThis);`, `g${ i } = [${ i }];`, `g${ i }.at(0);`);
  }
  return parts.join('\n');
}

// member resolution materializes the class-body member list per query unless it goes through the
// container-path cache - a quadratic in (members x uses) that no other case carries: the shapes
// above are flat scopes, and real bundles never put member density and use density on one class
function syntheticMemberDenseClass(members) {
  const methods = Array.from({ length: members }, (unused, k) => `  m${ k }() { return [${ k }]; }`).join('\n');
  const parts = [`class C {\n${ methods }\n}`, 'const c = new C();'];
  for (let i = 0; i < members; i++) parts.push(`c.m${ i }().at(0);`, `c.m${ i }().at(1);`);
  return parts.join('\n');
}

// `var { Global: local } = globalThis` registers an alias entry that has to be keyed under every
// same-name declarator of the var scope. resolving those per registration by walking the scope
// subtree is quadratic in (pairs x scope size); no other case here destructures the global at
// density, and real bundles never do, so the class stays invisible everywhere else
function syntheticVarDestructuredGlobals(pairs) {
  const pad = Array.from({ length: 100 }, (unused, k) => k).join(', ');
  const parts = [];
  for (let i = 0; i < pairs; i++) {
    parts.push(`var { Map: M${ i } } = globalThis;`, `M${ i }.groupBy([${ i }], x => x);`,
      `function pad${ i }(a) { return [${ pad }].length + a; }`);
  }
  return parts.join('\n');
}

// Depth is independent of the number of reads: re-walking every receiver prefix makes
// doubling this chain quadratic even though the number of claimed leaves stays fixed.
function syntheticDeepProxyReads(depth, reads) {
  const receiver = `globalThis${ '.self'.repeat(depth) }.Array`;
  return Array.from({ length: reads }, () => `${ receiver }.from([1]);`).join('\n');
}

// The body scan and the caller scan grow together. A memo must remain sensitive to the
// parameter write; the runtime fixtures own that answer, this case owns the work budget.
function syntheticParameterBodyCalls(size) {
  return `function read(p) { ${ 'void p;'.repeat(size) } p = [1]; return p; }\n${
    'read([0]).at(0);\n'.repeat(size) }`;
}

// Repeated positional reads share one binding's large reference set.
function syntheticArraySlotReads(size) {
  return `const rows = [[1]];\n${ 'rows[0].at(0);\n'.repeat(size) }`;
}

// Hold source length and use count steady while the number of distinct entries grows.
// Repeating one method cannot expose a prune pass that scans the body once per entry.
const STATIC_READS = [
  'Array.from', 'Array.of', 'Object.assign', 'Object.entries', 'Object.values',
  'Object.fromEntries', 'Object.hasOwn', 'Object.groupBy', 'Map.groupBy', 'String.raw',
  'String.fromCodePoint', 'Number.isFinite', 'Number.isInteger', 'Number.isNaN',
  'Number.isSafeInteger', 'Number.parseFloat', 'Number.parseInt', 'Math.acosh',
  'Math.asinh', 'Math.atanh', 'Math.cbrt', 'Math.clz32', 'Math.cosh', 'Math.expm1',
  'Math.fround', 'Math.hypot', 'Math.imul', 'Math.log10', 'Math.log1p', 'Math.log2',
  'Math.sign', 'Math.sinh',
];
function syntheticImportWidth(width) {
  return Array.from({ length: 4096 }, (unused, index) => `${ STATIC_READS[index % width] };`).join('\n');
}

function syntheticUnionWidth(width) {
  const variants = Array.from({ length: width }, (unused, index) => `{ kind: ${ index }, value: ${ index % 2 ? 'string' : 'string[]' } }`);
  return `type U = ${ variants.join(' | ') };\n${ Array.from({ length: 200 }, (unused, index) => `declare const u${ index }: U; if (u${ index }.kind === ${ index % width }) u${ index }.value.at(0);`).join('\n') }`;
}

// bare-name callees on a LONG top level: pairing a call asks whether its callee's name is a minted
// pure import - a fact of the whole program.
// re-deriving it per call by scanning the top-level statements is quadratic in (calls x top-level
// statements) and invisible on every other shape here: the guard and reassignment synthetics keep
// their call density low, the real bundles keep their top levels short
function syntheticCallDenseTopLevel(sites) {
  const parts = ['function make(n) { return [n]; }'];
  for (let i = 0; i < sites; i++) parts.push(`var c${ i } = make(${ i });`, `c${ i }.at(0);`);
  return parts.join('\n');
}

// Both axes grow: repeated parameter reads must share the body and all-callers proof. Rechecking
// the body or the supplied sources at every read makes this quadratic despite a tiny key set.
function syntheticNamespaceParameterReads(sites) {
  return `function read(ns) { ${ 'ns.ownKeys({});'.repeat(sites) } } ${ 'read(Reflect);'.repeat(sites) }`;
}

// A wide literal handed to a writer that returns it: no store through the parameter may rescan the
// literal it lands in.
function syntheticReturnedContainerWrites(slots) {
  const keys = Array.from({ length: slots }, (_, index) => `k${ index }`);
  return `function install(box) { ${ keys.map(key => `box.${ key } = Map;`).join('') } return box; }
    install({ ${ keys.map(key => `${ key }: Object`).join(',') } }).k0.groupBy([1], x => x);`;
}

// an opt-out directive per statement on a long top level: the directive scan spans each `-next-line`
// over the statement it covers, and a scan that re-reads the whole top level per directive is
// quadratic in (directives x statements) - the esrap leg pays it again in the channel that re-anchors
// every honoured directive on the pass's output. no other case here carries a directive at all
function syntheticDirectiveDense(optOuts) {
  const parts = [];
  for (let i = 0; i < optOuts; i++) parts.push('// core-js-disable-next-line', `var g${ i } = [${ i }];`, `g${ i }.at(0);`);
  return parts.join('\n');
}

// every writer here writes through a parameter spelled `t`, which the scope-blind gate names as one
// alias: a parameter takes no value from the calls there, so its closure stays one name however many
// writers share it - pairing each write with every caller's arguments would make this quadratic
function syntheticSharedParamWrites(installers) {
  const parts = [];
  for (let i = 0; i < installers; i++) {
    parts.push(`function install${ i }(t, v) { t.k${ i } = v; }`,
      `install${ i }(box${ i }, ${ i });`, `Map.groupBy([${ i }], x => x);`);
  }
  return parts.join('\n');
}

// Reassigning a local alias must not scan writes to every namesake in unrelated functions.
function syntheticNamesakeWrites(functions) {
  const parts = [];
  for (let i = 0; i < functions; i++) {
    parts.push(`function n${ i }(o) { var x = o.p, y = o.r, a = x; a = y; a.at(0); }`);
  }
  return parts.join('\n');
}

// Namesake methods share the key their calls are recorded under: an analysis that pairs every
// namesake with every call under that key is quadratic in a bundle of classes, where one host per
// key, or a resolved callee, stays linear
function syntheticNamesakeMethods(classes) {
  const parts = [];
  for (let i = 0; i < classes; i++) {
    parts.push(`class C${ i } { set(v) { this.v = v; return this; } put(t) { t.v = this.v; return t; } }`,
      `new C${ i }().set(${ i }).put({ v: Map });`);
  }
  parts.push('Array.from([1]);');
  return parts.join('\n');
}

// the synthetic lines `line(i)` spells for every i below `count`, one per line
function syntheticLines(count, line) {
  return Array.from({ length: count }, (_, i) => line(i)).join('\n');
}

// A pattern read of every slot a file wrote: each guard the reads render attaches a subtree, and the
// positional proofs that meet it must not re-index the whole program per render
function syntheticWrittenSlotReads(slots) {
  return [
    `const box = { ${ syntheticLines(slots, i => `a${ i }: Math,`) } };`,
    syntheticLines(slots, i => `box.a${ i } = Array;`),
    syntheticLines(slots, i => `const { a${ i }: X${ i } } = box; X${ i }.of(${ i });`),
  ].join('\n');
}

// Writes under unknown keys against patches pending on named slots: each chain fires once per value
// a slot can hold, never once per write, and an unknown slot keeps each candidate once. the patched
// static stays native in pure, so an unrelated static carries the injection floor
function syntheticUnknownKeyWrites(writes) {
  return [
    'const box = {};',
    syntheticLines(writes, i => `box[k${ i }] = Array;`),
    syntheticLines(writes, i => `box.p${ i }.from = patch;`),
    'Array.from([1]);',
    'Object.groupBy([], x => x);',
  ].join('\n');
}

// One slot written through many aliases and read many times: a write's definiteness and the name its
// value hands on are the write's own facts, proved once however many reads ask. pure keeps the member
// read of a written slot native, so an unrelated static carries the injection floor
function syntheticAliasedSlotWrites(aliases) {
  return [
    'const box = { a: Math };',
    syntheticLines(aliases, i => `const h${ i } = box; h${ i }.a = Array;`),
    syntheticLines(aliases, i => `box.a.of(${ i });`),
    'Object.groupBy([], x => x);',
  ].join('\n');
}

// Many destructures of one factory's calls, in every call spelling: a slot the factory fills from a
// parameter holds each call's own argument - paired against the parameter, every pattern read every
// caller's argument, quadratic in the calls
function syntheticFactoryPatterns(calls) {
  const reads = [
    i => `const { a: A${ i } } = pick(Array);`,
    i => `const { a: A${ i } } = pick.call(null, Array);`,
    i => `const { a: A${ i } } = tag\`\${ Array }\`;`,
  ];
  return [
    'function pick(x) { return { a: x }; }',
    'function tag(s, x) { return { a: x }; }',
    syntheticLines(calls, i => `${ reads[i % reads.length](i) } A${ i }.of(${ i });`),
  ].join('\n');
}

// Many handouts of a slot of one helper's calls where the helper returns something other than one
// literal: what it returns to every call is read once, never once per call - pushed per call, the
// values every caller's arguments hold are walked again for each of them
function syntheticSharedReturnHandouts(calls) {
  return ['const kept = []; function keep(value) { kept.push(value); }',
    'function interop(object) { return object && object.__esModule ? object : { default: object }; }',
    syntheticLines(calls, i => `const m${ i } = interop({ default: Map }); keep(m${ i }.default);`)].join('\n');
}

// Every reference to one object-literal binding types through its single initializer: walking the
// binding's references for a prototype install once per reference is quadratic in the references
function syntheticLiteralStores(stores) {
  const parts = ['const box = {};'];
  for (let i = 0; i < stores; i++) parts.push(`Object.assign(box, { k${ i }: ${ i } });`);
  return parts.join('\n');
}

// Repeated calls supply the same small source set: merging it must not rescan all prior calls.
function syntheticSharedParamCalls(calls) {
  const parts = ['var p = [0], q = [1], r = [2], s = [3];', 'function f(a) { return a.at(0); }'];
  for (let i = 0; i < calls; i++) parts.push('f(p||q||r||s);');
  return parts.join('\n');
}

// the census keys its container records by DECLARATION, and a name-only question about a slot
// unions every declaration of that name in the file: asked per member read, over a file whose
// functions all spell their locals alike (`r`, `a`, `t` - ordinary code), that union walks every
// namesake per read and the pre-pass goes quadratic in (functions x reads). The extracted `values`
// binding also repeats in every scope, gating the injector's same-name span index. No other case here
// declares both container and extracted names in many scopes, and real bundles routinely reuse them
function syntheticSharedContainerNames(functions) {
  const parts = [];
  for (let i = 0; i < functions; i++) {
    parts.push(`function f${ i }(t) { const r = { w: Object }; const a = r.w; const { values } = a; return values(t); }`);
  }
  return parts.join('\n');
}

// Pairing each binding with all same-name container candidates must not resolve its siblings
// against those candidates too. Width in both the pattern and literal exposes that extra factor.
function syntheticWideContainerPatterns(width, functions) {
  const keys = Array.from({ length: width }, (unused, i) => `p${ i }`);
  const literal = keys.map(key => `${ key }: Map`).join(', ');
  const names = keys.join(', ');
  return Array.from({ length: functions }, (unused, i) => `export function wide${ i }() {
    const data = { ${ literal } };
    const { ${ names } } = data;
    return [${ names }];
  }`).join('\n');
}

function threeBuild(file) {
  return readFile(join(HERE, `node_modules/three/build/${ file }`), 'utf8');
}

// a framework runtime whose factories return 30-to-50-slot object literals, and whose bundle then
// reads those slots back through member chains everywhere: the shape that makes the container
// census pay a PRODUCT - chains naming the container, times slots in it, times the alias fan-out
// per slot - instead of a sum over size. The other real bundles here are dense in scope and flow
// and stayed inside their bounds through a 25x blowup in exactly this axis
function vueRuntimeCore() {
  return readFile(join(HERE, 'node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js'), 'utf8');
}

// a published package carries a long tail of re-export stubs and one-line constant modules; below
// this size a module is pure call overhead with no work to measure, which would let a bloated tail
// drown the signal the case is meant to carry
const TRIVIAL_MODULE_BYTES = 200;

// every `.js` under the given package directories, as separate module sources
async function packageModules(...directories) {
  const sources = [];
  for (const directory of directories) {
    const base = join(HERE, 'node_modules', directory);
    for (const file of await readdir(base, { recursive: true })) {
      if (!file.endsWith('.js')) continue;
      const code = await readFile(join(base, file), 'utf8');
      if (code.length > TRIVIAL_MODULE_BYTES) sources.push(code);
    }
  }
  return sources;
}

// the view-independent CodeMirror stack: editor state plus the Lezer runtime and one grammar
const CODEMIRROR_DIRECTORIES = ['@codemirror/state/dist', '@lezer/common/dist', '@lezer/lr/dist',
  '@lezer/highlight/dist', '@lezer/javascript/dist'];

// bounds are per (mode, emitter), set at ~3x the measured wall time of a healthy run on the reference
// machine, rounded UP to a whole second (re-derive the same way after intentional perf work)
// CI runners can be several times slower than the reference machine, and a 1s bound leaves their healthy
// runs no variance headroom, while a quadratic regression overshoots 1s on any machine just as surely.
// usage-pure REWRITES every detected use, so its budgets run higher than the injection-only usage-global ones.
// `injections` is the vacuous-run floor - how many modules must inject. Single-source cases need their one;
// multi-module ones cannot demand every module (a package always holds files with nothing to polyfill) but
// must not settle for one either, or detection could die everywhere but a single module and still pass - faster,
// and so further inside the bound
const CASES = [
  ...['three.core.js', 'three.module.js'].map(file => ({
    name: `entry-global ${ file }`, source: async () => `import 'core-js/actual';\n${ await threeBuild(file) }`,
    modes: ['entry-global'], bounds: { 'entry-global': { babel: 1, unplugin: 1 } },
  })),
  { name: 'rxjs pre+post, shared snapshot lifecycle', source: () => packageModules('rxjs/dist/esm'),
    emitters: ['unplugin'], phase: 'pre+post', injections: { 'usage-global': 65, 'usage-pure': 47 },
    bounds: { 'usage-global': { unplugin: 2 }, 'usage-pure': { unplugin: 2 } } },
  { name: 'three.core.js', source: () => threeBuild('three.core.js'), bounds: {
    'usage-global': { babel: 4, unplugin: 4 }, 'usage-pure': { babel: 4, unplugin: 4 },
  } },
  { name: 'three.module.js', source: () => threeBuild('three.module.js'), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 3, unplugin: 2 },
  } },
  { name: 'vue runtime-core, container-dense bundle', source: () => vueRuntimeCore(), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  { name: 'synthetic wide container patterns, 256 slots in 8 scopes', source: () => syntheticWideContainerPatterns(256, 8), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } },
  { name: 'synthetic single-scope, 2000 reassigned names', source: () => syntheticSingleScope(2000), bounds: {
    'usage-global': { babel: 4, unplugin: 2 }, 'usage-pure': { babel: 4, unplugin: 3 },
  } },
  // under @babel/generator's 500kb styling-deopt threshold, so the NORMAL codegen path is
  // gated too - the big twin above always runs the deoptimised one
  { name: 'synthetic single-scope, 640 reassigned names', source: () => syntheticSingleScope(640), bounds: {
    'usage-global': { babel: 2, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 1 },
  } },
  { name: 'synthetic shared-param writes, 1200 installers', source: () => syntheticSharedParamWrites(1200), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } },
  { name: 'synthetic returned container writes, 3000 slots', source: () => syntheticReturnedContainerWrites(3000), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } },
  { name: 'synthetic namesake writes, 4000 functions', source: () => syntheticNamesakeWrites(4000), bounds: {
    'usage-global': { babel: 4, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 5 },
  } },
  { name: 'synthetic namesake methods, 3000 classes', source: () => syntheticNamesakeMethods(3000), bounds: {
    'usage-global': { babel: 3, unplugin: 2 }, 'usage-pure': { babel: 3, unplugin: 2 },
  } },
  { name: 'synthetic written slot reads, 2000 slots', source: () => syntheticWrittenSlotReads(2000), bounds: {
    'usage-global': { babel: 3, unplugin: 2 }, 'usage-pure': { babel: 6, unplugin: 5 },
  } },
  { name: 'synthetic unknown-key writes, 2000 pending chains', source: () => syntheticUnknownKeyWrites(2000), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } },
  { name: 'synthetic aliased slot writes, 2000 aliases', source: () => syntheticAliasedSlotWrites(2000), bounds: {
    'usage-global': { babel: 4, unplugin: 4 }, 'usage-pure': { babel: 4, unplugin: 4 },
  } },
  { name: 'synthetic factory patterns, 6000 calls', source: () => syntheticFactoryPatterns(6000), bounds: {
    'usage-global': { babel: 4, unplugin: 3 }, 'usage-pure': { babel: 5, unplugin: 4 },
  } },
  { name: 'synthetic shared return handouts, 4000 calls', source: () => syntheticSharedReturnHandouts(4000), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  { name: 'synthetic literal stores, 4000 calls', source: () => syntheticLiteralStores(4000), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 1 },
  } },
  { name: 'synthetic shared-param calls, 40000 calls', source: () => syntheticSharedParamCalls(40000), bounds: {
    'usage-global': { babel: 10, unplugin: 6 }, 'usage-pure': { babel: 10, unplugin: 6 },
  } },
  { name: 'synthetic shared container names, 2000 functions', source: () => syntheticSharedContainerNames(2000), bounds: {
    'usage-global': { babel: 2, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  { name: 'synthetic namespace parameter, 1200 reads and callers', source: () => syntheticNamespaceParameterReads(1200), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } },
  { name: 'synthetic call-dense top level, 12000 sites', source: () => syntheticCallDenseTopLevel(12000), bounds: {
    'usage-global': { babel: 4, unplugin: 4 }, 'usage-pure': { babel: 6, unplugin: 5 },
  } },
  { name: 'synthetic directive-dense, 8000 opt-outs', source: () => syntheticDirectiveDense(8000), bounds: {
    'usage-global': { babel: 3, unplugin: 2 }, 'usage-pure': { babel: 4, unplugin: 3 },
  } },
  { name: 'synthetic lagged aliases, 1000 names', source: () => syntheticLaggedAliases(1000), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } },
  { name: 'synthetic guard-dense, 1500 names', source: () => syntheticGuardDense(1500), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 1 },
  } },
  { name: 'synthetic write-dense binding, 600 uses', source: () => syntheticWriteDenseBinding(600), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  { name: 'synthetic discriminant-dense, 1600 names', source: () => syntheticDiscriminantDense(1600), ts: true, bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  { name: 'synthetic member-dense class, 2400 members', source: () => syntheticMemberDenseClass(2400), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 3, unplugin: 3 },
  } },
  // stays under the 500kb codegen-deopt threshold, so the normal babel print path is the one measured
  { name: 'synthetic var-destructured globals, 800 pairs', source: () => syntheticVarDestructuredGlobals(800), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  ...[64, 128].map(depth => ({ name: `synthetic proxy depth ${ depth }, 120 reads`, source: () => syntheticDeepProxyReads(depth, 120), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 3 },
  } })),
  { name: 'synthetic parameter body and callers, 400 each', source: () => syntheticParameterBodyCalls(400), bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 1 },
  } },
  { name: 'synthetic positional array reads, 1200 references', source: () => syntheticArraySlotReads(1200), bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  ...[8, 32].map(width => ({
    name: `synthetic import width ${ width }, 4096 reads`, source: () => syntheticImportWidth(width), entries: width - 1,
    bounds: { 'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 } },
  })),
  ...[32, 128].map(width => ({ name: `synthetic union width ${ width }, 200 reads`, source: () => syntheticUnionWidth(width), ts: true, bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 },
  } })),
  // per-call axis, two granularities: rxjs spreads 233kb over ~210 tiny modules so call overhead
  // dominates, the codemirror set puts 402kb in 6 mid-sized ones so per-file work and bytes both show
  { name: 'rxjs esm, tiny modules', source: () => packageModules('rxjs/dist/esm'), injections: { 'usage-global': 65, 'usage-pure': 47 }, bounds: {
    'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 2, unplugin: 1 },
  } },
  { name: 'codemirror + lezer, mid-sized modules', source: () => packageModules(...CODEMIRROR_DIRECTORIES), injections: 4, bounds: {
    'usage-global': { babel: 2, unplugin: 2 }, 'usage-pure': { babel: 2, unplugin: 2 },
  } },
  // Two opaque member arguments used to branch recursively through the same wildcard write.
  // These tiny inputs discriminate exponential work; push also proves detection stayed live.
  ...['namesake-container-member-arguments', 'block-local-container-member-arguments'].map(name => ({
    name,
    source: () => readFile(join(HERE, '../transpiler-fixtures/usage-global', name, 'input.mjs'), 'utf8'),
    bounds: { 'usage-global': { babel: 1, unplugin: 1 }, 'usage-pure': { babel: 1, unplugin: 1 } },
  })),
];

// usage-pure rewrites sites to `@core-js/pure` imports; usage-global prepends `core-js/modules`
const INJECTION_MARK = {
  'entry-global': 'core-js/modules/',
  'usage-global': 'core-js/modules/',
  'usage-pure': '@core-js/pure',
};

function emittedSources(code) {
  return Array.from(code.matchAll(/(?:from|import) ["'](?<source>[^"']+)["']/g), match => match.groups.source);
}

// One instance per lane, as in a bundler. Both emitters keep their option identity across
// modules and samples, so the per-call cases exercise their cross-file caches too.
function createTransform(emitter, mode, ts, phase = 'pre') {
  const options = { method: mode, version: '4.0', targets: { ie: 11 } };
  const filename = ts ? 'input.ts' : 'input.mjs';
  if (emitter === 'babel') {
    const config = {
      plugins: [[babelPlugin, options]],
      filename,
      sourceType: 'module',
      parserOpts: ts ? { plugins: ['typescript'] } : undefined,
      configFile: false,
      babelrc: false,
    };
    return async source => (await transformAsync(source, config)).code;
  }
  const stages = unplugin.raw({ ...options, phase }, { framework: 'vite' });
  return source => {
    let code = source;
    for (const stage of stages) {
      if (!stage.transformInclude(filename)) throw new Error(`Public stage rejected ${ filename }`);
      code = stage.transform(code, filename)?.code ?? code;
    }
    return code;
  };
}

let failed = 0;
for (const { name, source, ts = false, injections = 1, entries = 0, bounds,
  modes = MODES, emitters = ['babel', 'unplugin'], phase } of CASES) {
  const input = await source();
  // single-source cases are just a one-module list; multi-module ones gate the per-call axis
  const modules = Array.isArray(input) ? input : [input];
  const bytes = modules.reduce((total, module) => total + Buffer.byteLength(module), 0);
  const size = bytes < 1024 ? `${ cyan(bytes) } B` : `${ cyan((bytes / 1024).toFixed(1)) } KiB`;
  for (const mode of modes) {
    for (const emitter of emitters) {
      const transform = createTransform(emitter, mode, ts, phase);
      const samples = [];
      let injected = Infinity;
      let distinctEntries = Infinity;
      // The optional first pass warms parsing, code generation and the instance caches. Every
      // measured pass still checks detection: a fast empty sample cannot hide in the median.
      for (let sample = WARMUP ? -1 : 0; sample < SAMPLES; sample++) {
        const start = performance.now();
        let detectedModules = 0;
        const sources = new Set();
        for (const module of modules) {
          const code = await transform(module);
          detectedModules += Number(!!code && code.includes(INJECTION_MARK[mode]));
          (entries ? emittedSources(code) : []).forEach(entry => sources.add(entry));
        }
        if (sample >= 0) {
          samples.push((performance.now() - start) / 1000);
          injected = Math.min(injected, detectedModules);
          distinctEntries = Math.min(distinctEntries, sources.size);
        }
      }
      const sorted = samples.toSorted((a, b) => a - b);
      const middle = Math.floor(SAMPLES / 2);
      const seconds = SAMPLES % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
      const injectionFloor = typeof injections === 'number' ? injections : injections[mode];
      const detected = injected >= injectionFloor && distinctEntries >= entries;
      const bound = bounds[mode][emitter] ?? bounds[mode].unplugin;
      const ok = detected && seconds < bound;
      if (!ok) failed++;
      // Highlight the failing datum: the verdict alone does not identify an over-bound time
      // or a missed detection floor.
      const status = ok ? green : red;
      const time = (seconds < bound ? cyan : red)(`${ seconds.toFixed(2) } s`);
      const injectionCount = (injected >= injectionFloor ? cyan : red)(injected);
      const entryCount = (distinctEntries >= entries ? cyan : red)(distinctEntries);
      echo(status(`${ ok ? 'PASS' : 'FAIL' } ${ cyan(name) } (${ size }${ modules.length > 1 ? `, ${ cyan(modules.length) } modules` : '' }) | ${ cyan(mode) } ${ cyan(emitter) }: median ${ time } (limit ${ cyan(`${ bound.toFixed(2) } s`) }) | samples [${ cyan(samples.map(n => n.toFixed(2)).join(', ')) }] s | injected ${ injectionCount } (min ${ cyan(injectionFloor) })${ entries ? ` | entries ${ entryCount } (min ${ cyan(entries) })` : '' }`));
    }
  }
}
// the deterministic half of the same gate: the escape census truncates a walk that stops converging
// at its own step ceiling, and a truncated walk answers from less than it was given. no output diff
// shows it and no wall clock has to be trusted for it - on this corpus the count is zero, so any
// reading above zero names the complexity class directly
const truncated = censusWalkTruncations();
if (truncated) throw new Error(`the escape census truncated ${ truncated } walk(s) at its step ceiling`);
if (failed) throw new Error('Some transpiler performance gates have failed');
