// The residual value binding preserves source dialect, scope and the absent branch.
// Babel 7/8 and parser-preserved parentheses exercise the same provider decision.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import createASTHelpers, { rangePreservingTypes } from '../../packages/core-js-babel-plugin/internals/babel-compat.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, transformFromAstAsync } = requireBabel('@babel/core');
const traverse = requireBabel('@babel/traverse').default;
const t = rangePreservingTypes(requireBabel('@babel/types'));
const { check, checkTruthy, finish } = createChecker('guarded-values');
for (const [expression, accepted = true] of [
  ['globalThis.window?.self'],
  ['globalThis.window?.Array'],
  ['globalThis.window?.Map'],
  ['globalThis.window'],
  ['(globalThis.window?.self).Array'],
  ['globalThis.window?.[(effect(), "Array")]'],
  ['globalThis.window?.class', false],
  ['(globalThis.window?.class).name', false],
  ['globalThis.window?.await', false],
  ['globalThis.window?.static', false],
  ['globalThis.window?.["not-a-name"]', false],
]) for (const createParenthesizedExpressions of [false, true]) for (const cloned of [false, true]) {
  const options = { configFile: false, babelrc: false, ast: true, parserOpts: { createParenthesizedExpressions } };
  const source = `const value = ${ expression };`;
  const { ast } = await transformAsync(source, options);
  let anchor;
  traverse(ast, { VariableDeclarator(p) { if (p.node.id.name === 'value') anchor = p; } });
  const adapter = createBabelAdapter({ method: 'usage-pure' });
  const imports = [];
  const helpers = createASTHelpers(t, {
    getAdapter: () => adapter,
    resolvePureGlobalEntry: name => ['globalThis', 'self', 'Map'].includes(name) ? { entry: name, hintName: name } : null,
    injectPureGlobal(entry, name) { imports.push(entry); return t.identifier(`_${ name }`); },
  });
  const original = anchor.node.init;
  const before = JSON.stringify(original);
  const rendered = helpers.probedNavGuardValueNode(cloned ? t.cloneNode(original) : original, anchor);
  const label = `${ expression }/parens=${ createParenthesizedExpressions }/cloned=${ cloned }`;
  check(`${ label }/render`, !!rendered?.node, accepted);
  check(`${ label }/source remains pristine`, JSON.stringify(original), before);
  if (!accepted) {
    check(`${ label }/declined render has no imports`, imports.length, 0);
    continue;
  }
  checkTruthy(`${ label }/root import`, imports.includes('globalThis'));
  anchor.node.init = rendered.node;
  const { code } = await transformFromAstAsync(ast, source, options);
  // Parsing the print again also detects a canonical/host-node conversion mismatch.
  await transformAsync(code, options);
  for (const present of [false, true]) {
    function evaluate(body) {
      return runInNewContext(`this.self=this;this._self=this;this._globalThis=this;this._Map=Map;
        ${ present ? 'this.window=this;' : '' }
        let effects=0;function effect(){effects++;}
        (()=>{try{${ body };return JSON.stringify([typeof value,value===Array,value===Map,value===globalThis,effects]);}
        catch(error){return JSON.stringify([error.name,effects]);}})()`);
    }
    check(`${ label }/native/window=${ present }`, evaluate(code), evaluate(source));
  }
}
finish();
