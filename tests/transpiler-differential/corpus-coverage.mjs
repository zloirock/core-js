// Missing rows and disabled oracles cannot fail their own runtime checks. Lock their registration
// separately, using source-form expectations rather than the imports either emitter happens to add.
import { generate } from './generate.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';

function checkCorpusCoverage() {
  const { check, checkDeep, finish } = createChecker('differential-corpus-coverage');
  const families = new Map([
    ['wrapped-selecting-receiver', new Map()],
    ['nested-instance-surface', new Map()],
    ['sealed-key-claims', new Map()],
    ['decided-for-of-head-reads', new Map()],
    ['array-property-order', new Map()],
    ['sole-chain-computed-targets', new Map()],
  ]);
  for (const { name, strip } of generate()) {
    const slash = name.indexOf('/');
    const family = families.get(name.slice(0, slash));
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
  finish();
}

checkCorpusCoverage();
