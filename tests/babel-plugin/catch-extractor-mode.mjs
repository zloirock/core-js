// Unit tests for the babel-plugin catch-clause extractor's usage-pure-only gate
// (`withCatchExtractor` in index.js). transpiler fixtures run core-js in ISOLATION, so they
// cannot express a SIBLING plugin injecting a helper body whose `catch ({ at, ...rest })` the
// programExit helper-body re-traversal reaches. this suite drives a full @babel/core transform
// alongside such a sibling so the gate is exercised directly: usage-global must NOT restructure
// the catch param (it only adds side-effect imports), while usage-pure also leaves a rest-bearing level native.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync, template, types: t } = requireBabel('@babel/core');

const { check, checkTruthy, finish } = createChecker('catch-extractor-mode');

// sibling plugin: injects a helper function whose body holds a `catch ({ at, ...rest })` during
// the main traversal - AFTER core-js's pre() snapshot - so the node lands OUTSIDE the snapshotted
// `originalBodyNodes`. only then does the programExit helper-body re-traversal reach its catch
// clause, the single path that runs the extractor against a node the main traversal never saw
function makeSiblingHelperCatch() {
  return () => ({
    visitor: {
      Program: {
        enter(programPath) {
          programPath.unshiftContainer('body',
            template.statement('function _sib() { try {} catch ({ at, ...rest }) { return at; } }')());
        },
      },
    },
  });
}

async function transform(method) {
  return (await transformAsync("console.log('hi');", {
    configFile: false,
    babelrc: false,
    plugins: [
      ['@core-js', { method, version: '4.0', targets: { ie: 11 } }],
      makeSiblingHelperCatch(),
    ],
  })).code;
}

// usage-global only adds side-effect imports; it must leave a sibling-injected catch param intact.
// the body-extract rewrite (`catch (_ref) { let { at, ...rest } = _ref; }`) is usage-pure-only -
// emitting it here is needless churn the unplugin twin never produces
{
  const code = await transform('usage-global');
  checkTruthy('usage-global/sibling catch param left intact',
    /catch\s*\(\s*\{/.test(code) && !/catch\s*\(\s*_ref/.test(code));
  checkTruthy('usage-global/side-effect import still injected',
    code.includes('core-js/modules/es.array.at'));
}

// Rest-bearing catches stay native in usage-pure, including late sibling helper bodies.
{
  const code = await transform('usage-pure');
  checkTruthy('usage-pure/sibling rest catch param left intact',
    /catch\s*\(\s*\{/.test(code) && !/catch\s*\(\s*_ref/.test(code));
}

// A relocated catch binding and its later reads occupy distinct AST positions. A
// shared identifier makes a subsequent Babel traversal reuse the wrong NodePath.
for (const [pattern, body] of [
  ['{ at }', 'at;'],
  ['{ at, message }', 'at; message;'],
  ['{ at: read, message = "fallback" }', 'read; message;'],
]) {
  const { ast } = await transformAsync(`try { read(); } catch (${ pattern }) { ${ body } }`, {
    configFile: false, babelrc: false, ast: true,
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const clause = ast.program.body.find(node => node.type === 'TryStatement').handler;
  check(`relocated catch/${ pattern }/head extracted`, clause.param.type, 'Identifier');
  let shared = 0;
  t.traverseFast(clause.body, node => { if (node === clause.param) shared++; });
  check(`relocated catch/${ pattern }/no shared head identity`, shared, 0);
}

finish();
