// Deferred receiver probes retain source effects through host lowering and re-entry.
// Both parser spellings ask the same source question before either pattern key is served.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { rangePreservingTypes } from '../../packages/core-js-babel-plugin/internals/babel-compat.js';
import createSynthSwapEmitter from '../../packages/core-js-babel-plugin/internals/synth-swap-emitter.js';
import { synthPropDedupKey } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, transformFromAstAsync } = requireBabel('@babel/core');
const { check, checkTruthy, finish } = createChecker('deferred-probe-sources');
const sources = [
  'function read({ of, from } = (before(), (globalThis.window?.self).Array)) { return [of(3), from([4])]; } read();',
  '(({ of, from }) => [of(3), from([4])])((before(), (globalThis.window?.self).Array));',
  'function read({ of, from } = ((() => { before(); return globalThis.window; })()?.self).Array) { return [of(3), from([4])]; } read();',
];
for (const [index, source] of sources.entries()) for (const createParenthesizedExpressions of [false, true]) {
  for (const lower of [false, true]) {
    const plugins = [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]];
    if (lower) plugins.push(...['parameters', 'optional-chaining', 'destructuring']
      .map(name => requireBabel(`@babel/plugin-transform-${ name }`)));
    const options = { configFile: false, babelrc: false, ast: true, plugins, parserOpts: { createParenthesizedExpressions } };
    const first = await transformAsync(source, options);
    for (const [pass, result] of [first, await transformAsync(first.code, options)].entries()) {
      const label = `${ index }/parens=${ createParenthesizedExpressions }/lower=${ lower }/pass=${ pass }`;
      const imports = result.ast.program.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value);
      checkTruthy(`${ label }/first key`, imports.some(name => name.endsWith('/array/of')));
      checkTruthy(`${ label }/second key`, imports.some(name => name.endsWith('/array/from')));
      let effects = 0;
      walkAstNodes({ root: result.ast.program, visit(node) {
        if (node.type === 'CallExpression' && node.callee?.name === 'before') effects++;
      } });
      check(`${ label }/source effect occurs once`, effects, 1);
    }
  }
}
// An unresolved pattern slot keeps the memo value rather than discarding its read.
for (const createParenthesizedExpressions of [false, true]) {
  const source = 'function read({ of, from } = ((() => { [7].at(0); return globalThis.window; })()?.self).Array) { return [of(3), from([4])]; } read();';
  const result = await transformAsync(source, {
    configFile: false, babelrc: false, ast: true, parserOpts: { createParenthesizedExpressions },
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 }, exclude: ['es.array.of'] }]],
  });
  const imports = result.ast.program.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value);
  checkTruthy('memo retains the navigation ponyfill', imports.some(name => name.endsWith('/self')));
  checkTruthy('memo retains its nested instance claim', imports.some(name => name.endsWith('/array/instance/at')));
  checkTruthy('memo serves the admitted sibling', imports.some(name => name.endsWith('/array/from')));
  check('memo keeps the excluded sibling native', imports.some(name => name.endsWith('/array/of')), false);
}
// An accepted queue entry reads the native child slot after another visitor replaces it.
// This isolates host application from the source-form admission decision.
{
  const source = 'function read({ of } = (effect(), globalThis.window?.self).Array) { return of(3); }';
  const { ast } = await transformAsync(source, { configFile: false, babelrc: false, ast: true, code: false });
  const traverse = requireBabel('@babel/traverse').default;
  const t = rangePreservingTypes(requireBabel('@babel/types'));
  const adapter = createBabelAdapter({ method: 'usage-pure' });
  let program, param, effect;
  traverse(ast, {
    Program(p) { program = p; },
    AssignmentPattern(p) { param = p; },
    CallExpression(p) { if (p.node.callee.name === 'effect') effect = p; },
  });
  const emitter = createSynthSwapEmitter({
    adapter, t, skippedNodes: new WeakSet(), injector: {},
    resolvePure: ({ name }) => ['globalThis', 'self'].includes(name) ? { entry: name, hintName: name } : null,
    injectPureImport: (entry, name) => t.identifier(`_${ name }`),
  });
  emitter.registerPolyfill({
    targetPath: param.get('right'), objectPatternPath: param.get('left'),
    key: synthPropDedupKey(param.node.left.properties[0], { scope: param.scope, path: param, adapter }),
    entry: 'array/of', hintName: 'of',
  });
  // A failed native replacement must not consume the pending source decision.
  const target = param.get('right');
  const replace = target.replaceWith;
  let rejected = false;
  target.replaceWith = () => { throw new Error('native replacement rejected'); };
  try { emitter.apply(program); } catch (error) {
    rejected = error.message === 'native replacement rejected';
  } finally { target.replaceWith = replace; }
  checkTruthy('native replacement failure is propagated', rejected);
  effect.replaceWith(t.callExpression(t.identifier('liveEffect'), []));
  emitter.apply(program);
  const first = JSON.stringify(ast);
  checkTruthy('queued read carries the replaced prefix effect', first.includes('liveEffect'));
  check('queued read leaves no stale prefix effect', first.includes('"name":"effect"'), false);
  const { code } = await transformFromAstAsync(ast, source, { configFile: false, babelrc: false });
  for (const present of [false, true]) {
    let effects = 0;
    const realm = present ? { window: {} } : {};
    const value = runInNewContext(`${ code }; try { JSON.stringify(read()); } catch (error) { error.name; }`, {
      _globalThis: realm, _self: realm, _of: item => [item], liveEffect: () => { effects++; },
    });
    check(`queued read preserves the sealed throw/window=${ present }`, value, present ? '[3]' : 'TypeError');
    check(`queued read runs the live prefix once/window=${ present }`, effects, 1);
  }
  emitter.apply(program);
  check('a repeated flush leaves the applied queue inert', JSON.stringify(ast), first);
}
finish();
