// Unit tests for the program-exit post-sweep over built-ins a SIBLING transform injects after
// core-js's pre-pass. two branches: a bare global (regenerator mutating a node in-place to `Promise`)
// and an inlined static (`Object.assign` from object spread under setSpreadProperties). transpiler
// fixtures run core-js in ISOLATION, so they cannot express such a sibling; and the real transforms
// that introduce a bare global land it either in a helper body (caught by the helper-body
// re-traversal) or beside instance methods that pull the constructor in transitively - so an ISOLATED
// reference is reachable only through a sibling here. this suite drives a full @babel/core transform
// alongside such a sibling so the post-sweep is exercised directly: BOTH methods must polyfill the
// introduced built-in - usage-global by INJECTING the side-effect import (the reference stays raw),
// usage-pure by SUBSTITUTING it with the pure import. it also locks `isKnownGlobalName`, the predicate
// the member branch leans on to keep the plugin's own synth proxy chains out of the sweep.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as nodePath from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { isKnownGlobalName } from '@core-js/polyfill-provider/detect-usage/globals';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ nodePath.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

const { checkTruthy, finish } = createChecker('post-sweep-introduced-global');

// sibling plugin, ordered BEFORE core-js so its Program.exit runs first: it renames a marker
// identifier to the bare global `Map` in-place at exit - AFTER core-js's main traversal already
// passed the marker (a non-global name it skipped), but BEFORE core-js's own Program.exit post-sweep.
// the same in-place-mutation shape a sibling transform uses to drop a raw global into existing code
function makeSiblingBareGlobal() {
  return () => ({
    visitor: {
      Program: {
        exit(programPath) {
          programPath.traverse({
            Identifier(idPath) { if (idPath.node.name === '__M__') idPath.node.name = 'Map'; },
          });
        },
      },
    },
  });
}

async function transform(method) {
  return (await transformAsync('var x = __M__;', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingBareGlobal(),
      ['@core-js', { method, version: '4.0', targets: { ie: 11 } }],
    ],
  })).code;
}

// usage-global must inject the side-effect import for the introduced `Map` and leave the reference
// raw. without the post-sweep covering usage-global, `Map` stays unpolyfilled - broken on ie:11
{
  const code = await transform('usage-global');
  checkTruthy('usage-global/introduced bare global side-effect import injected',
    code.includes('core-js/modules/es.map.constructor'));
  checkTruthy('usage-global/introduced global reference left raw',
    /\bvar x = Map;/.test(code) && !code.includes('@core-js/pure'));
}

// usage-pure must substitute the introduced `Map` with the pure import binding
{
  const code = await transform('usage-pure');
  checkTruthy('usage-pure/introduced bare global substituted with pure import',
    code.includes('@core-js/pure/actual/map/constructor') && /\bvar x = _Map\b/.test(code));
  checkTruthy('usage-pure/no global side-effect import emitted',
    !code.includes('core-js/modules/es.map'));
}

// sibling plugin that swaps a marker callee for a position-less `Object.assign` member at exit -
// the introduced-STATIC shape babel@8 emits inlining object spread under setSpreadProperties. drives
// the post-sweep's member branch (the bare-global cases above drive its identifier branch)
function makeSiblingIntroducedStatic() {
  return ({ types: t }) => ({
    visitor: {
      Program: {
        exit(programPath) {
          programPath.traverse({
            CallExpression(callPath) {
              if (callPath.node.callee?.type === 'Identifier' && callPath.node.callee.name === '__ASSIGN__') {
                callPath.node.callee = t.memberExpression(t.identifier('Object'), t.identifier('assign'));
              }
            },
          });
        },
      },
    },
  });
}

async function transformStatic(method) {
  return (await transformAsync('var x = __ASSIGN__({}, { a: 1 });', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method, version: '4.0', targets: { ie: 11 } }],
    ],
  })).code;
}

// usage-global injects the side-effect import and leaves `Object.assign` raw; usage-pure substitutes
// it with the pure import. without the post-sweep member branch the inlined static stays unpolyfilled
{
  const code = await transformStatic('usage-global');
  checkTruthy('usage-global/introduced static side-effect import injected',
    code.includes('core-js/modules/es.object.assign') && /\bObject\.assign\b/.test(code));
}
{
  const code = await transformStatic('usage-pure');
  checkTruthy('usage-pure/introduced static substituted with pure import',
    code.includes('@core-js/pure') && code.includes('assign') && !/\bObject\.assign\b/.test(code));
}

// a SHADOWED object must not be polyfilled: the gate's binding check excludes a sibling-introduced
// member whose object resolves to a local, even though the name `Object` is a known global
{
  const { code } = await transformAsync('function f() { const Object = { assign() {} }; return __ASSIGN__({}, { a: 1 }); } export { f };', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy('shadowed object: introduced static left unpolyfilled',
    !code.includes('core-js/modules/es.object.assign'));
}

// `core-js-disable-file` must suppress the introduced static too: programExit short-circuits before
// the post-sweep runs. no existing disable-file fixture carries a sibling-introduced static, so this
// guards the ordering (the skip gate sits ahead of the sweep, not behind it)
{
  const { code } = await transformAsync('// core-js-disable-file\nvar x = __ASSIGN__({}, { a: 1 });', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy('disable-file: introduced static left unpolyfilled',
    !code.includes('core-js/modules/es.object.assign') && /\bObject\.assign\b/.test(code));
}

// a MUTATED static (`Object.assign = ...` in source) must not be substituted to the pure import even
// when a sibling introduces it: the member sweep routes through the same mutation-aware handler the
// primary pass uses, it does not re-decide substitution itself
{
  const { code } = await transformAsync('Object.assign = function custom() {}; var x = __ASSIGN__({}, { a: 1 });', {
    configFile: false,
    babelrc: false,
    plugins: [
      makeSiblingIntroducedStatic(),
      ['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }],
    ],
  });
  checkTruthy('usage-pure/mutated static: introduced reference not substituted',
    !code.includes('_Object$assign') && !code.includes('@core-js/pure') && /\bObject\.assign\b/.test(code));
}

// the member branch gates the object on `isKnownGlobalName`, NOT shape alone: the plugin's own
// proxy chains (`_globalThis.Array`) and substitution wrappers (`_Array$from.call`) share the
// `<unbound Identifier>.<member>` shape, so the predicate is what keeps them out of the sweep.
// lock its contract: real globals classify in, the plugin's synth import names classify out
checkTruthy('isKnownGlobalName accepts real global objects',
  isKnownGlobalName('Object') && isKnownGlobalName('Array') && isKnownGlobalName('Math'));
checkTruthy('isKnownGlobalName rejects the plugin\'s synth import names',
  !isKnownGlobalName('_globalThis') && !isKnownGlobalName('_Array$from') && !isKnownGlobalName('_Object$assign'));

finish();
