// Missing rows and disabled oracles cannot fail their own runtime checks. Lock their registration
// separately, using source-form expectations rather than the imports either emitter happens to add.
import { generate } from './generate.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { importSet } from './import-sources.mjs';

function checkCorpusCoverage() {
  const { check, checkDeep, finish } = createChecker('differential-corpus-coverage');
  const first = '@core-js/pure/actual/global-this';
  const second = '@core-js/pure/actual/set';
  for (const [name, source, expected] of [
    ['same line', 'import R from \'@core-js/pure/actual/global-this\'; import C from \'@core-js/pure/actual/set\';', [first, second]],
    ['multiline', 'import {\n default as R\n} from\n\'@core-js/pure/actual/global-this\';', [first]],
    ['bare', 'import \'core-js/actual/set\';', ['core-js/actual/set']],
    ['requires', 'const R = require(\'core-js/actual/global-this\'); const C = require(\'core-js/actual/set\');', ['core-js/actual/global-this', 'core-js/actual/set']],
    ['comment', '// import \'core-js/actual/set\';\nimport R from \'@core-js/pure/actual/global-this\';', [first]],
    ['string beside import', 'import R from \'@core-js/pure/actual/global-this\'; const text = "require(\'core-js/actual/set\')";', [first]],
    ['export', 'export { default as C } from \'@core-js/pure/actual/set\';', [second]],
    ['dynamic', 'const R = import(\'@core-js/pure/actual/global-this\');', [first]],
    ['wrapper return', 'const C = require(\'core-js/actual/set\'); return C;', ['core-js/actual/set']],
    ['jsx', 'import C from \'@core-js/pure/actual/set\'; const element = <C/>;', [second]],
    ['both packages', "import '@core-js/pure/actual/set'; import 'core-js/actual/set';", [second, 'core-js/actual/set']],
    ['package roots', "import '@core-js/pure'; import 'core-js'; import '@core-js/compat';", ['@core-js/pure', 'core-js']],
    ['foreign', 'import C from "foreign/actual/set";', []],
    ['empty', '', []],
  ]) checkDeep(`import collection/${ name }`, [...importSet(source)], expected);
  // Fixed source matrices: runtime parity alone cannot notice an omitted row or strip flag.
  const matrices = {
    'destructure-grammar': [2122, 1093],
    'static-rest-host': [96, 74],
    'getter-realm-escape': [4, 4],
    'scoped-container-escape': [12, 12],
    'mutated-sibling': [3, 3],
    'mutated-narrow-chain': [2, 2],
    'mutated-wrapper-assign': [5, 5],
    'selecting-inner-default': [26, 21],
    'object-hop-pairing': [164, 84],
    'parameter-receiver': [126, 74],
    'captured-container-write': [80, 46],
    'destructure-matrix': [10032, 7776],
    'selection-container-reads': [15, 13],
    'decided-for-of-head-reads': [330, 324],
    'keyed-captures-beside-siblings': [148, 145],
    'retained-wrapper-order': [16, 7],
    'destructure-evaluation': [56, 50],
    'symbol-first-receiver-read': [62, 58],
    'literal-head': [23, 23],
    'nested-leaf-source-order': [90, 0],
    'nested-leaf-claim-read': [9, 9],
    'retained-wrapper-namespace': [16, 8],
    'alias-rings': [6, 3],
  };
  const families = new Map([
    ['wrapped-selecting-receiver', new Map()],
    ['nested-instance-surface', new Map()],
    ['sealed-key-claims', new Map()],
    ['array-property-order', new Map()],
    ['sole-chain-computed-targets', new Map()],
    ...Object.keys(matrices).map(name => [name, new Map()]),
  ]);
  for (const { name, strip, isolated } of generate()) {
    const slash = name.indexOf('/');
    const prefix = name.slice(0, slash);
    if (prefix === 'getter-realm-escape' || prefix === 'scoped-container-escape') {
      check(`${ name } starts with a fresh namespace`, isolated, true);
    }
    const family = families.get(prefix);
    if (!family) continue;
    const cell = name.slice(slash + 1);
    check(`${ name } is unique`, family.has(cell), false);
    family.set(cell, strip);
  }

  const hosts = [
    'element', 'element-default', 'element-prefix', 'double', 'param-default', 'iife-arg',
    'keyed', 'keyed-array', 'array-keyed', 'hop-default', 'index-key', 'assign',
    'spread-shift', 'spread-level', 'later-key',
  ];
  const wrapped = families.get('wrapped-selecting-receiver');
  check('wrapped selecting matrix', wrapped.size, 120);
  const served = hosts.flatMap(host => [`${ host }/ternary-user/false`, `${ host }/or-ctor/true`]);
  served.push('iife-arg/ternary-ctor/true', 'iife-arg/and-ctor/true', 'spread-level/ternary-ctor/true', 'spread-level/and-ctor/true');
  checkDeep('wrapped selecting stripped cells', [...wrapped].filter(([, strip]) => strip).map(([cell]) => cell).sort(), served.sort());

  const nested = families.get('nested-instance-surface');
  check('nested instance matrix', nested.size, 48);
  for (const receiver of ['ctor-entry', 'realm-slot', 'proxy-step-ctor']) {
    for (const host of ['decl', 'assign', 'for-of', 'bodyless-if']) {
      for (const leaf of ['plain', 'defaulted', 'symbol', 'symbol-defaulted']) {
        check(`nested instance parity row ${ receiver }/${ host }/${ leaf }`, nested.get(`${ receiver }/${ host }/${ leaf }`), false);
      }
    }
  }
  const sealed = families.get('sealed-key-claims');
  check('sealed key matrix', sealed.size, 20);
  for (const host of ['declaration', 'parameter-default']) {
    for (const effect of ['static', 'instance', 'destructure', 'for-of-left', 'for-in-left']) {
      for (const rig of ['', '-rigged']) {
        check(`sealed key native boundary ${ host }/${ effect }${ rig }`, sealed.get(`${ host }/${ effect }${ rig }`), false);
      }
    }
  }
  const heads = families.get('decided-for-of-head-reads');
  for (const selection of ['or', 'nullish', 'or-effect-right']) {
    for (const host of ['nested-level', 'array-sibling']) {
      check(`nullable Map head ${ selection }/${ host }`, heads.get(`map-null/const/${ selection }/${ host }`), true);
    }
  }
  for (const host of ['declaration', 'assignment']) {
    check(`array mirror ${ host }`, families.get('array-property-order').get(`array-mirror-neighbour-${ host }-true`), true);
  }
  check('computed target beside a sibling', families.get('sole-chain-computed-targets').get('beside-a-sibling'), true);
  for (const [name, [size, stripped]] of Object.entries(matrices)) {
    const family = families.get(name);
    check(`${ name } row count`, family.size, size);
    check(`${ name } requested strip count`, family.values().filter(Boolean).toArray().length, stripped);
  }
  // Host-local counts pin the larger matrix without copying its admission predicate.
  for (const [host, stripped] of Object.entries({
    const: 436, let: 436, var: 436, assign: 448, assignValue: 528, assignBodyless: 448,
    assignSeq: 452, wrapMulti: 424, wrapSoleDecl: 344, wrapMultiDecl: 344,
    forOfConst: 356, forOfAssign: 360, paramDefault: 340, paramArg: 340, arrowDefault: 340,
    exportConst: 436, exportLet: 436, exportVar: 436, exportMulti: 436,
  })) {
    const cells = [...families.get('destructure-matrix')].filter(([cell]) => cell.startsWith(`${ host }/`));
    check(`${ host } matrix size`, cells.length, 528);
    check(`${ host } matrix strip count`, cells.filter(([, strip]) => strip).length, stripped);
  }
  for (const host of ['unbraced-var', 'loop-head']) {
    check(`${ host } host claim order`, families.get('nested-leaf-source-order').get(`${ host }/host-claim-ahead`), false);
    check(`${ host } host claim injection`, families.get('nested-leaf-claim-read').get(host), true);
  }
  finish();
}

checkCorpusCoverage();
