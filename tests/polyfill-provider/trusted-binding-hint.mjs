import { trustedBindingHint } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, runBoth, finish } = createChecker('trusted-binding-hint');

// Each provenance route still requires a usable registration and a completed write.
const routes = [
  ['alias', { isAliasBindingShape: true }],
  ['import', { isImportBinding: true }],
  ['require', { isRequireBinding: true }],
  ['minted', {}],
];
for (const [route, facts] of routes) {
  const info = { hint: 'Array', minted: route === 'minted', aliasWrite: { start: 10, end: 20 } };
  for (const [position, useStart, expected] of [
    ['before', 9, null],
    ['inside', 15, null],
    ['end', 20, null],
    ['after', 21, 'Array'],
    ['unknown', null, 'Array'],
    ['missing', undefined, null],
  ]) {
    check(`${ route }/${ position }`, trustedBindingHint({ ...facts, info, useStart }), expected);
    check(`${ route }/${ position }/guarded`, trustedBindingHint({
      ...facts, info: { ...info, aliasGuarded: true }, useStart,
    }), null);
  }
  check(`${ route }/declaration span`, trustedBindingHint({
    ...facts, info: { ...info, aliasWrite: null, aliasDeclSpan: { start: 10, end: 20 } }, useStart: 15,
  }), null);
  check(`${ route }/no positional restriction`, trustedBindingHint({ ...facts, info: { ...info, aliasWrite: null } }), 'Array');
  check(`${ route }/missing record`, trustedBindingHint({ ...facts, info: null }), null);
}
check('an ordinary shadow cannot inherit a name-table hint', trustedBindingHint({ info: { hint: 'Array' } }), null);
check('a blind-trusted record is not proof for a live binding', trustedBindingHint({
  info: { hint: 'Array', aliasTrusted: true },
}), null);
check('a verified name-table record is not an identity proof', trustedBindingHint({
  info: { hint: 'Array', aliasVerified: true },
}), null);
check('an accepted missing hint is preserved', trustedBindingHint({ info: {}, isImportBinding: true }), undefined);
check('an undefined record is absent', trustedBindingHint({ isImportBinding: true }), null);
for (const aliasGuarded of [false, true]) {
  const info = { hint: 'Array', aliasGuarded, get aliasWrite() { throw new Error('an inadmissible record was inspected'); } };
  check(`a rejected record does not ask dominance/${ aliasGuarded }`, trustedBindingHint({ info, isImportBinding: aliasGuarded }), null);
}

// Registration updates and a new use site must not inherit the preceding answer.
{
  const info = { hint: 'Array', aliasGuarded: true, aliasWrite: { start: 10, end: 20 } };
  const input = { info, isImportBinding: true, useStart: 21 };
  check('current guarded record', trustedBindingHint(input), null);
  info.aliasGuarded = false;
  check('current unguarded record', trustedBindingHint(input), 'Array');
  info.hint = 'Symbol';
  check('current hint value', trustedBindingHint(input), 'Symbol');
  input.useStart = 15;
  check('earlier query does not reuse later proof', trustedBindingHint(input), null);
  input.useStart = 21;
  Object.freeze(info.aliasWrite);
  Object.freeze(info);
  Object.freeze(input);
  check('the accepted query does not mutate its facts', trustedBindingHint(input), 'Symbol');
}

// Both native scope adapters must feed the shared gate the same proven provenance.
for (const row of [
  { name: 'real import', code: 'import held from "@core-js/pure/full/array"; held.from([]);', source: '@core-js/pure/full/array', want: ['Array'] },
  { name: 'real require', code: 'const held = require("@core-js/pure/full/array"); held.from([]);', source: '@core-js/pure/full/array', want: ['Array'] },
  {
    name: 'shadowed require',
    code: 'function run(require) { const held = require("@core-js/pure/full/array"); held.from([]); }',
    source: '@core-js/pure/full/array',
    want: [null],
  },
  {
    name: 'shadowed import',
    code: 'import held from "@core-js/pure/full/array"; function run() { function held() {} held.from([]); } held.from([]);',
    source: '@core-js/pure/full/array',
    want: [null, 'Array'],
  },
  { name: 'clean pattern alias', code: 'const { Array: held } = globalThis; held.from([]);', want: ['Array'] },
  { name: 'written pattern alias', code: 'let { Array: held } = globalThis; held = own; held.from([]);', want: [null] },
  { name: 'verified identity after rewrite', code: 'const held = own; held.from([]);', identity: true, extra: { aliasVerified: true }, want: ['Array'] },
  { name: 'verified name cannot bless a shadow', code: 'const held = own; held.from([]);', extra: { aliasVerified: true }, want: [null] },
  { name: 'minted live binding', code: 'var held; held.from([]);', extra: { minted: true }, want: ['Array'] },
  { name: 'guarded identity', code: 'const held = own; held.from([]);', identity: true, extra: { aliasVerified: true, aliasGuarded: true }, want: [null] },
  { name: 'guarded mint', code: 'var held; held.from([]);', identity: true, extra: { minted: true, aliasGuarded: true }, want: [null] },
  {
    name: 'write dominates only the later read',
    code: 'let held; held.from([]); ({ Array: held } = globalThis); held.from([]);',
    identity: true,
    write: 'AssignmentExpression',
    extra: { aliasVerified: true },
    want: [null, 'Array'],
  },
  {
    name: 'for-of source executes before its pattern',
    code: 'for (var { Array: held } of [held.from([])]) {}',
    identity: true,
    write: 'VariableDeclarator',
    extra: { aliasVerified: true },
    want: [null],
  },
]) runBoth(row.name, row.code, (parser, program, label) => {
  const declaration = parser.collectPaths(program, 'VariableDeclarator')[0]?.node;
  const info = { source: row.source ?? null, hint: 'Array', ...row.extra };
  if (row.write) info.aliasWrite = parser.pickPath(program, row.write).node;
  const injector = {
    getBindingInfo: name => name === 'held' ? info : null,
    getBindingAliasInfo: node => row.identity && node === declaration ? info : null,
    getPureImport: () => null,
  };
  const host = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getInjector: () => injector,
  });
  const reads = parser.collectPaths(program, 'MemberExpression');
  check(`${ label }/all reads observed`, reads.length, row.want.length);
  for (const [index, path] of reads.entries()) {
    const binding = host.getBinding({ scope: path.scope, name: 'held', path, read: path.node.object });
    checkTruthy(`${ label }/${ index }/native declaration`, binding?.node);
    check(`${ label }/${ index }/hint`, binding?.polyfillHint, row.want[index]);
    if (row.identity && row.want[index] === null) {
      check(`${ label }/${ index }/runtime guard hint survives refusal`, binding.guardedAliasHint, 'Array');
    }
  }
});

// Native binding provenance is not the scope-lag contract: Babel alone accepts this blind alias.
runBoth('blind fallback stays distinct', 'held.from([]);', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression');
  const host = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', getInjector: () => ({ getBindingInfo: () => ({ source: null, hint: 'Array', aliasTrusted: true }) }),
  });
  const binding = host.getBinding({ scope: path.scope, name: 'held', path });
  check(`${ label }/host provenance`, binding?.polyfillHint ?? null, parser.name === 'babel' ? 'Array' : null);
});

finish();
