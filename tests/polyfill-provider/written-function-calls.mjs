// Slot calls fold the returns of their writers, separately from the function values.
// Argument-dependent returns belong to the invocation, not only to the property.
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, runBoth, finish } = createChecker('written-function-calls');
const cases = [
  ['missing arrow', 'const box = {}; box.fn = () => [8, 9];', 'Array'],
  ['missing function expression', 'const box = {}; box.fn = function () { return "ab"; };', 'string'],
  ['named function', 'function make() { return [8, 9]; } const box = {}; box.fn = make;', 'Array'],
  ['function alias', 'const make = () => "ab"; const alias = make; const box = {}; box.fn = alias;', 'string'],
  ['receiver alias', 'const box = {}; const alias = box; alias.fn = () => [8, 9];', 'Array'],
  ['wrapped writer', 'function effect() {} const box = {}; box.fn = (effect(), (() => [8, 9]));', 'Array'],
  ['computed slot', 'const box = {}; box["fn"] = () => [8, 9];', 'Array'],
  ['replaced arrow', 'const box = { fn: () => [1] }; box.fn = () => [8, 9];', 'Array'],
  ['replaced method', 'const box = { fn() { return [1]; } }; box.fn = () => [8, 9];', 'Array'],
  ['named initializer', 'function make() { return [8, 9]; } const box = { fn: make };', 'Array'],
  ['this writer', 'const box = { install() { this.fn = () => [8, 9]; } }; box.install();', 'Array'],
  ['own this call', 'const box = { fn() { return [1]; }, run() { return this.fn(); } }; box.fn = () => [8, 9];', 'Array', 'box.run()'],
  ['different returns', 'const box = { fn: () => [1] }; box.fn = () => "ab";', null],
  ['missing different returns', 'const box = {}; box.fn = () => [1]; if (flag) box.fn = () => "ab";', null],
  ['unknown writer', 'const box = {}; box.fn = foreign;', null],
  ['unknown replacement', 'const box = { fn: () => [1] }; box.fn = foreign;', null],
  ['destructured write', 'const box = { fn: () => [1] }; ({ fn: box.fn } = { fn: () => "ab" });', null],
  ['iteration write', 'const box = {}; for (box.fn of foreign) {}', null],
  ['escaped receiver', 'const box = {}; box.fn = () => [1]; foreign(box);', null],
  ['exported receiver', 'export const box = {}; box.fn = () => [1];', null],
  ['rebound function alias', 'let make = () => [1]; make = foreign; const box = {}; box.fn = make;', null],
  ['non-callable replacement', 'const box = { fn: () => [1] }; box.fn = [8, 9];', null],
  ['unknown return', 'const box = {}; box.fn = () => foreign;', null],
  ['written receiver escape', 'function make() { foreign(this); return [1]; } const box = {}; box.fn = make; box.fn();', null],
  ['named writer replaces its callable slot', 'function make() { this.fn = () => "ab"; return [1]; } const box = {}; box.fn = make; box.fn();', null],
  ['inline writer replaces its callable slot', 'const box = {}; box.fn = function () { this.fn = () => "ab"; return [1]; }; box.fn();', null],
  ['named writer installs a prototype', 'function make() { this.__proto__ = foreign; return [1]; } const box = {}; box.fn = make;', null],
  ['undefined return', 'const box = {}; box.fn = () => undefined;', 'undefined'],
  ['literal undefined return', 'const box = { fn: () => undefined };', 'undefined'],
  ['null return', 'const box = {}; box.fn = () => null;', 'null'],
  ['nullable return alternatives', 'const box = { fn: /** @returns {number[] | null} */ () => null }; box.fn = () => [1];', 'Array'],
  ['async return', 'const box = {}; box.fn = async () => [1];', 'Promise'],
  ['generator return', 'const box = {}; box.fn = function * () { yield 1; };', 'Iterator'],
  ['accessor replacement', 'const box = { get fn() { return () => [1]; }, set fn(value) {} }; box.fn = () => "ab";', null],
  ['setter-only call', 'const box = { set fn(value) {} };', null],
  ['missing inherited call', 'const box = {};', 'string', 'box.toString()'],
  ['inherited override', 'const box = {}; box.toString = () => [1];', null, 'box.toString()'],
];

// Some negative inputs intentionally call a non-callable or use an opaque writer:
// their contract is to decline narrowing, not to claim a valid TypeScript program.
for (const [name, setup, expected, call = 'box.fn()'] of cases) runBoth(
  name,
  `${ setup } const result = ${ call };`,
  (adapter, program, label) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const resolver = adapter.makeResolver();
    for (let pass = 0; pass < 3; pass++) {
      if (pass === 2) resolver.reset();
      const type = resolver.resolveNodeType(path);
      check(`${ label }/${ pass }`, type?.primitive ? type.type : type?.constructor ?? null, expected);
    }
  },
);

// Defaulted JavaScript functions may receive other families even when TypeScript
// infers the parameter solely from its default and rejects those calls.
for (const [name, setup] of [
  ['missing', 'const box = {}; box.fn = value => value;'],
  ['replaced', 'const box = { fn: value => value }; box.fn = value => value;'],
  ['named', 'function identity(value) { return value; } const box = {}; box.fn = identity;'],
  ['default', 'const box = {}; box.fn = (value = [1]) => value;'],
  ['generic', 'const box: { fn?: <T>(value: T) => T } = {}; box.fn = <T>(value: T): T => value;'],
  ['parameterless generic', 'const box = { fn: <T>(): T => null as T }; box.fn = <T>(): T => null as T;'],
]) for (const reverse of [false, true]) runBoth(
  `arguments ${ name }/${ reverse }`,
  `${ setup } const arrayResult = ${ name === 'parameterless generic' ? 'box.fn<number[]>()' : 'box.fn([8, 9])' };
    const stringResult = ${ name === 'parameterless generic' ? 'box.fn<string>()' : 'box.fn("ab")' };`,
  (adapter, program, label) => {
    const paths = adapter.collectPaths(program, 'VariableDeclarator', p => p.node.id?.name?.endsWith('Result'));
    if (reverse) paths.reverse();
    const resolver = adapter.makeResolver();
    for (let pass = 0; pass < 3; pass++) {
      if (pass === 2) resolver.reset();
      for (const path of paths) {
        const type = resolver.resolveNodeType(path.get('init'));
        check(`${ label }/${ pass }/${ path.node.id.name }`, type?.primitive ? type.type : type?.constructor ?? null,
          path.node.id.name === 'arrayResult' ? 'Array' : 'string');
      }
    }
  },
  ['typescript'],
);

for (const callFirst of [false, true]) runBoth(
  `value and call caches/${ callFirst }`,
  'const box = {}; box.fn = () => [8, 9]; void box.fn; box.fn();',
  (adapter, program, label) => {
    const paths = adapter.collectPaths(program, 'MemberExpression', p => p.node.property?.name === 'fn');
    const value = paths.find(p => p.parentPath.node.type === 'UnaryExpression');
    const call = paths.find(p => p.parentPath.node.type === 'CallExpression').parentPath;
    const queries = [[value, 'Function'], [call, 'Array']];
    if (callFirst) queries.reverse();
    const resolver = adapter.makeResolver();
    for (const [path, expected] of queries) {
      check(label, resolver.resolveNodeType(path)?.constructor ?? null, expected);
    }
  },
);

for (const reverse of [false, true]) runBoth('separate parameterless call slots',
  'const box = {}; box.array = () => [1]; box.string = () => "ab"; const arrayResult = box.array(); const stringResult = box.string();',
  (adapter, program, label) => {
    const paths = adapter.collectPaths(program, 'VariableDeclarator', p => p.node.id?.name?.endsWith('Result'));
    if (reverse) paths.reverse();
    const resolver = adapter.makeResolver();
    for (const path of paths) {
      const type = resolver.resolveNodeType(path.get('init'));
      check(`${ label }/${ path.node.id.name }`, type?.primitive ? type.type : type?.constructor ?? null,
        path.node.id.name === 'arrayResult' ? 'Array' : 'string');
    }
  },
);

runBoth('nullable return fold keeps its marker',
  'const box = { fn: /** @returns {number[] | null} */ () => null }; box.fn = () => [1]; const result = box.fn();',
  (adapter, program, label) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const type = adapter.makeResolver().resolveNodeType(path);
    check(`${ label } family`, type?.constructor, 'Array');
    check(`${ label } optionality`, type?.mayBeNullish, true);
  },
);

for (const [name, call, expected] of [
  ['absent', 'box.fn()', 'Array'],
  ['undefined', 'box.fn(undefined)', 'Array'],
  ['void', 'box.fn(void 0)', 'Array'],
  ['opaque spread', 'box.fn(...foreign)', null],
]) runBoth(`default argument ${ name }`,
  `const box = {}; box.fn = (value = [8, 9]) => value; const result = ${ call };`,
  (adapter, program, label) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    check(label, adapter.makeResolver().resolveNodeType(path)?.constructor ?? null, expected);
  },
);

const NULLABLE_BOX = 'const box: { fn?: (value?: number[] | null) => number[] | null } = {};';

// JavaScript defaults admit foreign argument families; those calls intentionally
// exceed TypeScript's default-derived parameter annotation.
for (const [name, setup, call, expected] of [
  ['nullable default', 'const box = {}; box.fn = (value = [1]) => value; const arg = flag ? undefined : "ab";', 'box.fn(arg)', 'array,string'],
  ['reversed nullable default', 'const box = {}; box.fn = (value = "ab") => value; const arg = flag ? undefined : [1];', 'box.fn(arg)', 'array,string'],
  ['argument union', 'const box = {}; box.fn = value => value; const arg = flag ? [1] : "ab";', 'box.fn(arg)', 'array,string'],
  [
    'declared return union',
    'const box: { fn?: (value: string[] | string) => string[] | string } = {}; box.fn = (value: string[] | string): string[] | string => value;',
    'box.fn("ab")',
    'array,string',
  ],
  ['replacement union', 'const box = { fn: () => [1] }; box.fn = () => "ab";', 'box.fn()', 'array,string'],
  ['iterator return remains admitted', 'const box = { fn: () => [1] }; box.fn = function * () { yield 1; };', 'box.fn()', 'array,iterator'],
  ['body union', 'const box = {}; box.fn = () => flag ? [1] : "ab";', 'box.fn()', 'array,string'],
  ['optional body union', 'const box = {}; box.map = () => flag ? [1] : "ab";', 'box.map?.()', 'array,string'],
  ['default body union omitted', 'const box = {}; box.fn = (value = flag ? [1] : "ab") => value;', 'box.fn()', 'array,string'],
  ['default body union undefined', 'const box = {}; box.fn = (value = flag ? [1] : "ab") => value;', 'box.fn(undefined)', 'array,string'],
  ['opaque default omitted', 'const box = {}; box.fn = (value = foreign) => value;', 'box.fn()', null],
  ['pattern default union', 'const box = {}; box.fn = ({ rows } = { rows: flag ? [1] : "ab" }) => rows;', 'box.fn()', 'array,string'],
  ['pattern undefined union', 'const box = {}; box.fn = ({ rows } = { rows: flag ? [1] : "ab" }) => rows;', 'box.fn(undefined)', 'array,string'],
  ['pattern argument union', 'const box = {}; box.fn = ({ rows } = { rows: [1] }) => rows;', 'box.fn({ rows: flag ? [1] : "ab" })', 'array,string'],
  ['pattern argument alias leaf', 'const box = {}; box.fn = ({ rows: items } = { rows: [1] }) => items;', 'box.fn({ rows: flag ? [1] : "ab" })', 'array,string'],
  [
    'pattern argument wrapped',
    'const box = {}; box.fn = ({ rows } = { rows: [1] }) => rows;',
    'box.fn(({ rows: flag ? [1] : "ab" } as { rows: number[] | string }))',
    'array,string',
  ],
  ['pattern computed key', 'const box = {}; box.fn = ({ ["rows"]: rows } = { rows: [1] }) => rows;', 'box.fn({ rows: flag ? [1] : "ab" })', null],
  [
    'pattern key replaces argument field',
    'const box = {}; box.fn = function ({ [(arguments[0].rows = [1].values(), "rows")]: rows } = {}) { return rows; };',
    'box.fn({ rows: flag ? [1] : "ab" })',
    null,
  ],
  ['pattern leaf default', 'const box = {}; box.fn = ({ rows = [1] } = {}) => rows;', 'box.fn({ rows: flag ? [1] : "ab" })', null],
  ['pattern sibling getter', 'const box = {}; box.fn = ({ before, rows } = {}) => rows;', 'box.fn({ get before() { return 1; }, rows: flag ? [1] : "ab" })', null],
  ['pattern argument getter', 'const box = {}; box.fn = ({ rows } = {}) => rows;', 'box.fn({ get rows() { return flag ? [1] : "ab"; } })', null],
  ['pattern argument spread', 'const box = {}; box.fn = ({ rows } = {}) => rows;', 'box.fn({ ...foreign, rows: flag ? [1] : "ab" })', null],
  ['pattern argument wrong slot', 'const box = {}; box.fn = ({ rows } = {}) => rows;', 'box.fn({ other: flag ? [1] : "ab" })', null],
  ['pattern opaque override', 'const box = {}; box.fn = ({ rows } = { rows: [1] }) => rows;', 'box.fn({ rows: foreign })', null],
  ['pattern opaque argument', 'const box = {}; box.fn = ({ rows } = { rows: [1] }) => rows;', 'box.fn(foreign)', null],
  ['pattern container union', 'const box = {}; box.fn = ({ rows } = flag ? { rows: [1] } : { rows: "ab" }) => rows;', 'box.fn()', null],
  ['block returns', 'const box = { fn() { if (flag) return [1]; return "ab"; } };', 'box.fn()', 'array,string'],
  ['optional array call', 'const arr = [[[1]]]; const box = { fn: i => arr[i] };', 'box.fn?.(0)', 'array'],
  ['bare return', 'const box = { fn() { if (flag) return; return flag ? [1] : "ab"; } };', 'box.fn()', 'array,string'],
  ['conditional finalizer', 'const box = { fn() { try { return [1]; } finally { if (flag) return "ab"; } } };', 'box.fn()', 'array,string'],
  ['named writer', 'function make() { return flag ? [1] : "ab"; } const box = {}; box.fn = make;', 'box.fn()', 'array,string'],
  ['receiver alias', 'const box = {}; const alias = box; alias.fn = () => flag ? [1] : "ab";', 'box.fn()', 'array,string'],
  ['retained call', 'const box = {}; box.fn = (value = [1]) => value; const arg = flag ? undefined : "ab"; const result = box.fn(arg);', 'result', 'array,string'],
  ['unknown argument', 'const box = {}; box.fn = (value = [1]) => value;', 'box.fn(foreign)', null],
  ['unknown writer', 'const box = { fn: () => [1] }; box.fn = foreign;', 'box.fn()', null],
  ['non-callable writer', 'const box = { fn: () => [1] }; box.fn = "ab";', 'box.fn()', null],
  ['receiver handout', 'const box = {}; box.fn = () => flag ? [1] : "ab"; foreign(box);', 'box.fn()', null],
  ['unknown return', 'const box = {}; box.fn = () => flag ? [1] : foreign;', 'box.fn()', null],
  ['recursive return', 'const box = { fn() { return flag ? [1] : this.fn(); } };', 'box.fn()', null],
  ['opaque spread', 'const box = {}; box.fn = (value = [1]) => value;', 'box.fn(...foreign)', null],
]) for (const hintsFirst of [false, true]) runBoth(`return hints ${ name }/${ hintsFirst }`,
  `${ setup } ${ call }.includes(1);`,
  (adapter, program, label) => {
    const path = adapter.pickPath(program, 'MemberExpression', p => p.node.property?.name === 'includes')
      ?? (adapter.name === 'babel' ? adapter.pickPath(program, 'OptionalMemberExpression', p => p.node.property?.name === 'includes') : null);
    const resolver = adapter.makeResolver();
    for (let pass = 0; pass < 3; pass++) {
      if (pass === 2) resolver.reset();
      if (!hintsFirst) resolver.resolveNodeType(path.get('object'));
      const hints = resolver.resolvePropertyUnionHints(path);
      check(`${ label }/${ pass }`, hints ? [...hints].sort().join(',') : null, expected);
      if (hintsFirst) resolver.resolveNodeType(path.get('object'));
    }
  },
);

for (const [name, setup, call, expected, holder = 'const box = {};'] of [
  ['aliased undefined', 'const empty = undefined; box.fn = (value = [8, 9]) => value;', 'box.fn(empty)', 'Array'],
  ['shadowed undefined', 'const undefined = "ab"; box.fn = (value = [8, 9]) => value;', 'box.fn(undefined)', 'string'],
  ['pattern default', 'box.fn = ({ rows } = { rows: [8, 9] }) => rows;', 'box.fn(undefined)', 'Array'],
  ['nullable different family', 'box.fn = (value = [8, 9]) => value; const arg = flag ? undefined : "ab";', 'box.fn(arg)', null],
  ['nullable same family', 'box.fn = (value = [8, 9]) => value; const arg = flag ? undefined : [1];', 'box.fn(arg)', 'Array'],
  ['nullable pattern different family', 'box.fn = ({ rows } = { rows: [8, 9] }) => rows; const arg = flag ? undefined : { rows: "ab" };', 'box.fn(arg)', null],
  // Runtime object alternatives have no shared member proof; their result stays unknown.
  ['nullable pattern same family', 'box.fn = ({ rows } = { rows: [8, 9] }) => rows; const arg = flag ? undefined : { rows: [1] };', 'box.fn(arg)', null],
  ['definite null stays null', 'box.fn = (value = [8, 9]) => value;', 'box.fn(null)', 'null'],
  ['typed nullish union', 'box.fn = (value: number[] | null = [8, 9]) => value; const arg: null | undefined = undefined;', 'box.fn(arg)', 'Array', NULLABLE_BOX],
  ['reversed typed nullish union', 'box.fn = (value: number[] | null = [8, 9]) => value; const arg: undefined | null = undefined;', 'box.fn(arg)', 'Array', NULLABLE_BOX],
]) runBoth(`default argument ${ name }`,
  `${ holder } ${ setup } const result = ${ call };`,
  (adapter, program, label) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const type = adapter.makeResolver().resolveNodeType(path);
    check(label, type?.primitive ? type.type : type?.constructor ?? null, expected);
  },
);

for (const union of ['null | undefined', 'undefined | null', 'never | null | undefined']) runBoth(`nullish default marker ${ union }`,
  `const flag = true; ${ NULLABLE_BOX } box.fn = (value: number[] | null = [8, 9]) => value;
    const arg: ${ union } = flag ? null : undefined; const result = box.fn(arg);`,
  (adapter, program, label) => {
    const path = adapter.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const type = adapter.makeResolver().resolveNodeType(path);
    check(`${ label } family`, type?.constructor, 'Array');
    check(`${ label } nullable return`, type?.mayBeNullish, true);
  },
  ['typescript'],
);

// Parameterless writers need one body fold per slot, independent of the number of calls.
// Count actual body reads so a cached writer census cannot hide repeated return analysis.
for (const adapter of adapters) for (const size of [16, 64]) for (const unionHints of [false, true]) for (const tail of ['', '0', 'foreign']) {
  const writes = Array.from({ length: size }, (_, i) => `box.fn = () => ${ unionHints && i % 2 ? '"ab"' : `[${ i }]` };`).join('\n');
  const calls = Array.from({ length: size }, (_, i) => `box.fn().includes(${ i });`).join('\n');
  // An argument-dependent writer must not mask a later opaque candidate.
  const prefix = tail === 'foreign' ? 'box.fn = value => value;' : '';
  const program = adapter.parseAndScope(`const box = {}; ${ prefix } ${ writes } ${ tail ? `box.fn = ${ tail };` : '' } ${ calls }`);
  let reads = 0;
  program.traverse({
    ArrowFunctionExpression(path) {
      const { body } = path.node;
      Object.defineProperty(path.node, 'body', {
        configurable: true, enumerable: true, get() { reads++; return body; },
      });
    },
  });
  const paths = adapter.collectPaths(program, 'MemberExpression', p => p.node.property?.name === 'includes');
  const resolver = adapter.makeResolver();
  const label = `${ adapter.name }/${ size }/${ unionHints ? 'families' : 'Type' }/${ tail || 'callable' }`;
  function query(path) {
    if (!unionHints) return resolver.resolveNodeType(path.get('object'))?.constructor ?? null;
    const hints = resolver.resolvePropertyUnionHints(path);
    return hints ? [...hints].sort().join(',') : null;
  }
  const expected = tail ? null : unionHints ? 'array,string' : 'Array';
  reads = 0;
  check(`${ label } cold`, query(paths[0]), expected);
  const coldReads = reads;
  checkTruthy(`${ label } live body counter`, coldReads > 0);
  for (const path of paths) check(`${ label } warm`, query(path), expected);
  check(`${ label } shared return fold`, reads - coldReads, 0);
  resolver.reset();
  check(`${ label } reset`, query(paths[0]), expected);
  checkTruthy(`${ label } reset body counter`, reads > coldReads);
}

// Instrument source RHS reads, not wall time: distinct calls share one writer census.
for (const adapter of adapters) for (const size of [16, 64]) {
  const writes = Array.from({ length: size }, (_, i) => `box.fn = () => [${ i }];`).join('\n');
  const calls = Array.from({ length: size }, (_, i) => `const result${ i } = box.fn();`).join('\n');
  const program = adapter.parseAndScope(`const box = {}; ${ writes } ${ calls }`);
  let reads = 0;
  program.traverse({
    AssignmentExpression(path) {
      const { right } = path.node;
      Object.defineProperty(path.node, 'right', {
        configurable: true, enumerable: true, get() { reads++; return right; },
      });
    },
  });
  const paths = adapter.collectPaths(program, 'VariableDeclarator', p => p.node.id?.name?.startsWith('result'));
  const resolver = adapter.makeResolver();
  check(`${ adapter.name }/${ size } first return`, resolver.resolveNodeType(paths[0].get('init'))?.constructor, 'Array');
  const coldReads = reads;
  checkTruthy(`${ adapter.name }/${ size } linear census`, reads > 0 && reads <= size * 24, `${ reads } RHS reads`);
  for (const path of paths) check(`${ adapter.name }/${ size } return`, resolver.resolveNodeType(path.get('init'))?.constructor, 'Array');
  check(`${ adapter.name }/${ size } cached census`, reads - coldReads, 0);
}

finish();
