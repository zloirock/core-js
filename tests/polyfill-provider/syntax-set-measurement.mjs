// The syntax table in `detect-syntax.js` says what each downgrade's RUNTIME reads, and its comments
// say that was "measured by lowering the form and reading the emitted code". Nothing re-measured
// it: the sets were read off babel once by hand, and the fixtures lock whatever they say, right or
// wrong. This suite performs that measurement on every run.
//
// The method: lower a form with the real babel transform that owns it, subtract the reads the raw
// source already made, and collect what is LEFT that is rooted at an unbound global name. That last
// restriction is what keeps the answer honest - it is what the emitted code calls, not what an
// over-injecting detector would claim about it - and it is also this suite's blind spot: a read off
// a VALUE (`r.slice(...)`) has no global root, so an entry covering one is listed as unseeable with
// its reason rather than silently counted as measured.
//
// A babel upgrade that changes a helper turns one of the three per-form lists red. That is the
// point: the declared set then needs a human, not a snapshot refresh.
import { transformSync } from '@babel/core';
import { get as babelHelper, getDependencies as babelHelperDependencies } from '@babel/helpers';
import generatePackage from '@babel/generator';
import { parseSync } from 'oxc-parser';
import { createSyntaxRules, SYNTAX_DOWNGRADE_ENTRIES } from '../../packages/core-js-polyfill-provider/detect-syntax.js';
import { resolve } from '../../packages/core-js-polyfill-provider/index.js';
import compatEntries from '../../packages/core-js-compat/entries.json' with { type: 'json' };
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish } = createChecker('syntax-set-measurement');

// the names a lowering can root a built-in read at. a closed list on purpose: anything else is a
// value the emitted code received, and a read off it is nobody's global
const GLOBAL_ROOTS = new Set([
  'Array',
  'Date',
  'Error',
  'Function',
  'JSON',
  'Map',
  'Math',
  'Number',
  'Object',
  'Promise',
  'Reflect',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'TypeError',
  'WeakMap',
  'WeakSet',
  'globalThis',
]);

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (typeof node.type === 'string') visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key !== 'type') walk(value, visit);
  }
}

// every built-in read the program makes, as `Global` or `Global.member`. a name the program BINDS
// itself is the author's own object and never a global read
function builtInReads(code) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program } = parseSync('/p.js', code, { lang: 'jsx', sourceType: 'module' });
  const bound = new Set();
  walk(program.body, node => {
    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier') bound.add(node.id.name);
    if (node.type === 'FunctionDeclaration' && node.id) bound.add(node.id.name);
    for (const param of node.params ?? []) if (param.type === 'Identifier') bound.add(param.name);
  });
  const reads = new Set();
  walk(program.body, node => {
    if (node.type === 'MemberExpression' && node.object?.type === 'Identifier'
      && GLOBAL_ROOTS.has(node.object.name) && !bound.has(node.object.name)
      && !node.computed && node.property?.name) {
      reads.add(`${ node.object.name }.${ node.property.name }`);
    }
    if ((node.type === 'NewExpression' || node.type === 'CallExpression')
      && node.callee?.type === 'Identifier' && GLOBAL_ROOTS.has(node.callee.name)
      && !bound.has(node.callee.name)) {
      reads.add(node.callee.name);
    }
  });
  return reads;
}

// the entry a read names, through the registry rather than a table of our own
function readToEntry(read) {
  const dot = read.indexOf('.');
  const resolved = dot === -1
    ? resolve({ kind: 'global', name: read })
    : resolve({ kind: 'property', object: read.slice(0, dot), key: read.slice(dot + 1), placement: 'static' });
  return resolved?.desc?.global?.dependencies?.[0] ?? resolved?.desc?.pure?.dependencies?.[0] ?? null;
}

// an entry that yields no module at any layer costs nothing and injects nothing, so it is noise in
// this comparison rather than a finding
function entryYieldsModules(entry) {
  return ['es', 'stable', 'actual', 'full'].some(mode => (compatEntries[`${ mode }/${ entry }`]?.length ?? 0) > 0);
}

// the helper SOURCES, for a form whose lowering plugin this workspace does not carry: they are what
// `@babel/plugin-transform-runtime` imports, so measuring them measures the same runtime the sets
// are about. Transitively - `wrapRegExp` reaches `Object.setPrototypeOf` through a helper it depends
// on, and a measurement that stops at the first body under-reads
const generate = generatePackage.default ?? generatePackage;
function helperClosure(roots) {
  const seen = new Set();
  const work = [...roots];
  while (work.length) {
    const name = work.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    for (const dependency of babelHelperDependencies(name) ?? []) work.push(dependency);
  }
  return [...seen];
}

function helperSource(roots) {
  return helperClosure(roots)
    .map(name => babelHelper(name).nodes.map(node => generate(node).code).join('\n'))
    .join('\n');
}

function lower(source, plugins, assumptions) {
  // eslint-disable-next-line node/no-sync -- the measurement is synchronous, and so is the compare
  return transformSync(source, {
    filename: '/p.js', babelrc: false, configFile: false, sourceType: 'module', plugins, assumptions,
  })?.code ?? '';
}

// `configurations` are the lowerings the set claims to cover - a set that names the union of what
// several of them read is measured against that same union.
// `unseeable`: declared, and correct, but out of this method's reach - with the reason.
// `accepted`: read by the lowering and deliberately NOT carried - with the reason, because an
// unexplained extra is exactly the drift this suite exists to catch
const FORMS = {
  ITERABLE_SPREAD_ENTRIES: {
    configurations: [
      ['default', 'export const a = [...b];', ['@babel/plugin-transform-spread']],
      // under `iterableIsArray` the lowering emits `[].concat(b)` and reads nothing at all
      ['iterableIsArray', 'export const a = [...b];', ['@babel/plugin-transform-spread'], { iterableIsArray: true }],
    ],
    unseeable: {
      'symbol/constructor': 'the helper guards with `typeof Symbol`, a bare name read this method does not record',
    },
    accepted: {
      'error/constructor': 'a helper `throw new TypeError` needs no polyfill - the entry is `es.error.cause`',
    },
  },
  ARRAY_REST_ENTRIES: {
    configurations: [
      ['default', 'export const [a, ...rest] = b;', ['@babel/plugin-transform-destructuring']],
      [
        'iterableIsArray',
        'export const [a, ...rest] = b;',
        ['@babel/plugin-transform-destructuring'],
        { iterableIsArray: true, objectRestNoSymbols: true },
      ],
    ],
    unseeable: {
      'symbol/constructor': 'as above - the `typeof Symbol` guard',
      'array/slice': 'the helper slices the array it materialised (`r.slice(...)`), a read off a VALUE',
    },
    accepted: {
      'error/constructor': 'as above',
    },
  },
  OBJECT_SPREAD_ENTRIES: {
    configurations: [
      ['default', 'export const a = { ...b };', ['@babel/plugin-transform-object-rest-spread']],
      // `setSpreadProperties` is where `Object.assign` comes from - the set covers both paths
      [
        'setSpreadProperties',
        'export const a = { ...b };',
        ['@babel/plugin-transform-object-rest-spread'],
        { setSpreadProperties: true },
      ],
      ['useBuiltIns', 'export const a = { ...b };', [['@babel/plugin-transform-object-rest-spread', { useBuiltIns: true }]]],
      ['rest', 'export const { a, ...rest } = b;', ['@babel/plugin-transform-object-rest-spread']],
    ],
    unseeable: {
      'symbol/constructor': 'the helper reaches symbols through `Object.getOwnPropertySymbols`, never through the name',
    },
    accepted: {
      'error/constructor': 'as above',
      // the helper prefers it and falls back to copying each descriptor with the ES5 pair, which
      // does the same thing - a read behind an EQUIVALENT fallback is not a polyfill obligation
      'object/get-own-property-descriptors': 'the helper falls back to the ES5 descriptor pair, which does the same',
      // `Object.keys` / `Object.getOwnPropertyDescriptor` are called on an object the helper just
      // built; what core-js fixes in them is primitive coercion, which cannot arrive here
      'object/keys': 'core-js fixes primitive coercion in it, and the helper only passes objects',
      'object/get-own-property-descriptor': 'the same coercion fix, on an object the helper owns',
      // `_toPrimitive` reads `Symbol.toPrimitive`, and without the module that key is undefined -
      // but so is any user object`s, because defining one needs the very module. the fall-back to
      // `valueOf` is then what native does too
      'symbol/to-primitive': 'no object can carry the key unless the module that defines it is present',
    },
  },
  PRIVATE_FIELD_ENTRIES: {
    configurations: [
      ['default', 'export class C { #x = 1; m() { return this.#x; } }', ['@babel/plugin-transform-class-properties']],
    ],
    unseeable: {},
    accepted: { 'error/constructor': 'as above' },
  },
  PRIVATE_METHOD_ENTRIES: {
    configurations: [
      ['default', 'export class C { #m() {} n() { return this.#m(); } }', ['@babel/plugin-transform-private-methods']],
    ],
    unseeable: {},
    accepted: { 'error/constructor': 'as above' },
  },
  DECORATOR_RUNTIME_ENTRIES: {
    configurations: [
      [
        '2023-11',
        '@dec export class C { @dec m() {} @dec accessor a = 1; }',
        [
          ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
          '@babel/plugin-transform-class-static-block',
          '@babel/plugin-transform-class-properties',
          '@babel/plugin-transform-private-methods',
        ],
      ],
    ],
    // the set is the UNION over every decorator lowering that exists, and this babel accepts two of
    // the seven `version` values; the rest are named here rather than dropped
    unseeable: {
      'object/assign': 'read by a decorator version this babel does not accept (`.version` takes only legacy / 2023-11)',
      'object/get-own-property-symbols': 'the same',
      'map/constructor': 'the same',
    },
    accepted: {
      'error/constructor': 'as above',
      'symbol/to-primitive': 'as in the object spread',
      'object/get-own-property-descriptor': 'as in the object spread',
      // the arm injects the two modules that entry expands to DIRECTLY, mode-independently, so the
      // read is covered better than by carrying the entry - the assertion below pins that
      'symbol/metadata': 'its modules are injected by the arm itself, outside the mode ladder',
    },
  },
};

// A form whose lowering plugin this workspace does not carry is measured from its HELPERS instead,
// named here because that mapping is the one thing the lowering would have derived by itself. The
// closure of each root is what the form's runtime is, and the reads are compared exactly as above.
// This is a FALLBACK, not a peer of the lowering: a lowering also emits code outside the helpers -
// a private field mints its `new WeakMap()` in the transformed CLASS - which no helper body shows.
// The three forms below emit nothing of the kind: the call sites they leave behind are a generator
// wrapped in a call and a regexp wrapped beside an object literal
const BY_HELPER = {
  ASYNC_ENTRIES: {
    roots: ['asyncToGenerator'],
    unseeable: {},
    accepted: {},
  },
  ASYNC_ITERATION_ENTRIES: {
    // the union over the async-iteration lowerings: the generator wrapper, the `yield*` delegate and
    // the `for await` iterator. The arm fires on the FUNCTION and cannot know which of them the body
    // will need, so the set covers all three - `promise/reject` is the for-await half's
    roots: ['wrapAsyncGenerator', 'awaitAsyncGenerator', 'asyncGeneratorDelegate', 'asyncIterator'],
    unseeable: {},
    accepted: {
      'error/constructor': 'a helper `throw new TypeError` needs no polyfill - the entry is `es.error.cause`',
      // the delegate and the for-await iterator fall back to the SYNC iterator, and both arms that
      // reach them pair this set with the iterable one, which carries it
      'symbol/iterator': 'read by the `yield*` and `for await` halves, whose arms add the iterable set',
    },
  },
  NAMED_GROUP_ENTRIES: {
    roots: ['wrapRegExp'],
    unseeable: {
      'symbol/constructor': 'reaching `Symbol.replace` needs `Symbol`, which the replace entry pulls',
      'regexp/exec': 'the wrapper calls `RegExp.prototype.exec` through a captured reference, off a global root',
      'string/replace': 'the CONSUMER side: `str.replace(re, ...)` is what dispatches to `Symbol.replace`',
    },
    accepted: {
      'error/constructor': 'as above',
      // babel's own `setPrototypeOf` helper prefers it and falls back to `__proto__`, which every
      // engine core-js targets has - the same equivalent-fallback rule as the object spread's
      'object/set-prototype-of': 'the `setPrototypeOf` helper falls back to `__proto__`',
      'object/keys': 'core-js fixes primitive coercion in it, and the helper only passes objects',
      // `BabelRegExp` calls `RegExp(source, undefined)`, which even ES5 accepts for a regexp first
      // argument as long as the flags are undefined - what `es.regexp.constructor` fixes is the
      // spelling that passes both
      'regexp/constructor': 'the wrapper never passes flags beside a regexp, the case the fix is for',
    },
  },
};

// every declared set is either measured here or named as unmeasured - a new set with neither is the
// silent gap this check exists to refuse
checkDeep('measurement/every declared set is accounted for',
  Object.keys(SYNTAX_DOWNGRADE_ENTRIES).sort(),
  [...Object.keys(FORMS), ...Object.keys(BY_HELPER)].sort());

// the two tables answer the same three questions; only where the reads come from differs
function auditSet(name, form, measured) {
  const declared = new Set(SYNTAX_DOWNGRADE_ENTRIES[name]);
  checkTruthy(`measurement/${ name } reads at least one built-in`, measured.size > 0);
  checkDeep(`measurement/${ name } reads nothing undeclared`,
    [...measured].filter(entry => !declared.has(entry) && !(entry in form.accepted)).sort(), []);
  checkDeep(`measurement/${ name } declares nothing unread`,
    [...declared].filter(entry => !measured.has(entry) && !(entry in form.unseeable)).sort(), []);
  checkDeep(`measurement/${ name } has no stale unseeable`,
    Object.keys(form.unseeable).filter(entry => !declared.has(entry)).sort(), []);
  checkDeep(`measurement/${ name } has no stale accepted`,
    Object.keys(form.accepted).filter(entry => declared.has(entry)).sort(), []);
}

for (const [name, form] of Object.entries(BY_HELPER)) {
  const measured = new Set();
  for (const read of builtInReads(helperSource(form.roots))) {
    const entry = readToEntry(read);
    if (entry && entryYieldsModules(entry)) measured.add(entry);
  }
  auditSet(name, form, measured);
}

for (const [name, form] of Object.entries(FORMS)) {
  const measured = new Set();
  for (const [label, source, plugins, assumptions = {}] of form.configurations) {
    let lowered;
    try {
      lowered = lower(source, plugins, assumptions);
    } catch (error) {
      check(`measurement/${ name }/${ label } lowers`, String(error.message).split('\n', 1)[0], '');
      continue;
    }
    const own = builtInReads(source);
    for (const read of builtInReads(lowered)) {
      if (own.has(read)) continue;
      const entry = readToEntry(read);
      if (entry && entryYieldsModules(entry)) measured.add(entry);
    }
  }
  auditSet(name, form, measured);
}

// The decorator arm covers `Symbol.metadata` outside the entry sets: decorator metadata is stage
// 2.7, so its modules sit outside `actual/` and the arm asks for them by module name instead. That
// is why the measurement above accepts the read rather than demanding the entry - and it holds only
// while the two spellings name the same modules.
{
  const captured = { mode: [], plain: [] };
  const rules = createSyntaxRules({
    injectModulesForModeEntry: name => captured.mode.push(name),
    injectModulesForEntry: name => captured.plain.push(name),
    isDisabled: () => false,
  });
  rules.onClass({ decorators: [{}], body: { body: [] } });
  const direct = captured.plain.map(name => name.replace(/^modules\//u, ''));
  checkDeep('measurement/the decorator arm injects the metadata modules itself',
    direct.sort(), [...compatEntries['full/symbol/metadata']].sort());
}

finish();
