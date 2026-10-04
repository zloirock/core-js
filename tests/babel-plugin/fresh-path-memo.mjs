// Unit tests for `@core-js/babel-plugin/internals/detect-usage.js` path re-anchoring: the
// per-node memo must survive repeated lookups, but a LATER mutation can re-target the stored
// path (replaceWith swaps its node) or detach its ancestor chain (statement removal) - a memo
// hit re-validates both and falls back to a fresh traverse instead of returning the stale path.
// Missing bindings recover their actual declaration and writes without crossing lexical regions.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { createBabelAdapter, freshPathOfNode, rebuildLaggedScopeBinding } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import ImportInjectorState from '../../packages/core-js-polyfill-provider/injector-base.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, traverse, types: t } = requireBabel('@babel/core');

const { check, checkTruthy, finish } = createChecker('fresh-path-memo');

async function parseProgram(code, parserPlugins = []) {
  const ast = await parseAsync(code, { configFile: false, babelrc: false, parserOpts: { plugins: parserPlugins } });
  let programPath = null;
  traverse(ast, {
    Program(p) {
      programPath = p;
      p.stop();
    },
  });
  return programPath;
}

// live node: lookup finds its path, a repeated lookup reuses it
{
  const programPath = await parseProgram('const a = 1;\nconst b = 2;');
  const [, targetNode] = programPath.node.body;
  const first = freshPathOfNode(programPath, targetNode);
  checkTruthy('live lookup finds the path', first?.node === targetNode);
  checkTruthy('repeated lookup reuses the memo', freshPathOfNode(programPath, targetNode) === first);
}

// re-targeted arm: replaceWith points the stored path at a DIFFERENT node - the memo hit must
// not hand back a path whose `.node` is no longer the requested one
{
  const programPath = await parseProgram('const a = 1;\nconst b = 2;');
  const [, targetNode] = programPath.node.body;
  const stored = freshPathOfNode(programPath, targetNode);
  stored.replaceWith(t.emptyStatement());
  checkTruthy('re-targeted memo is not returned', freshPathOfNode(programPath, targetNode) === null);
}

// detached arm: removing the host statement leaves the stored path with a dead ancestor chain -
// the memo hit must fall through to a fresh traverse (which no longer finds the node)
{
  const programPath = await parseProgram('const a = 1;\nconst b = 2;');
  const hostPath = freshPathOfNode(programPath, programPath.node.body[1]);
  const [targetNode] = hostPath.node.declarations;
  const stored = freshPathOfNode(programPath, targetNode);
  checkTruthy('declarator lookup finds the path', stored?.node === targetNode);
  hostPath.remove();
  checkTruthy('detached memo is not returned', freshPathOfNode(programPath, targetNode) === null);
}

// A switch has one lexical case-block scope. Recovery must include sibling cases and
// exclude its discriminant plus writes to a nested block's own binding.
{
  const programPath = await parseProgram(`
    switch (S = outer) {
      case 0:
        let S;
        S = [1];
        { let S; S = inner; }
        use(S.with(0, 'held'));
      case 1:
        S = [2];
        function writer() { S = later; }
    }
  `);
  const [switchPath] = programPath.get('body');
  const [firstCase] = switchPath.get('cases');
  const statements = firstCase.get('consequent');
  const [declarationStatement] = statements;
  const [useStatement] = statements.slice(3);
  const [declarationPath] = declarationStatement.get('declarations');
  const [usePath] = useStatement.get('expression').get('arguments');
  switchPath.scope.removeBinding('S');
  check('switch recovery starts from a native miss', usePath.scope.getBinding('S'), undefined);
  const rebuilt = rebuildLaggedScopeBinding(usePath, 'S');
  checkTruthy('switch recovery returns the live declaration', rebuilt?.path === declarationPath);
  checkTruthy('switch recovery uses the case-block owner', rebuilt?.scope === switchPath.scope);
  check('switch recovery keeps same-case, sibling-case and closure writes', rebuilt?.constantViolations.length, 3);
  checkTruthy('switch recovery excludes discriminant and nested-shadow writes', rebuilt?.constantViolations.every(write => {
    return write.node.right?.name !== 'outer' && write.node.right?.name !== 'inner';
  }));
  checkTruthy('switch owner anchor sees its own declaration', rebuilt && rebuildLaggedScopeBinding(switchPath, 'S') === rebuilt);
  check('switch discriminant cannot see its case declaration', rebuildLaggedScopeBinding(switchPath.get('discriminant'), 'S'), null);
  check('outside lookup cannot see the case declaration', rebuildLaggedScopeBinding(programPath, 'S'), null);
}

// The nearest lexical declaration wins over a hoisted outer variable, including when
// the declaration lives in another case and the lookup happens before initialization.
{
  const programPath = await parseProgram(`
    var S = outer;
    switch (S) {
      case S:
        use(S.with(0, 'prior'));
        break;
      case 1:
        let S;
        if (flag) S = [1];
    }
    use(S);
  `);
  const [outerPath, switchPath, outsidePath] = programPath.get('body');
  const [firstCase, secondCase] = switchPath.get('cases');
  const [declarationStatement] = secondCase.get('consequent');
  const [declarationPath] = declarationStatement.get('declarations');
  const [useStatement] = firstCase.get('consequent');
  const [usePath] = useStatement.get('expression').get('arguments');
  switchPath.scope.removeBinding('S');
  const rebuilt = rebuildLaggedScopeBinding(usePath, 'S');
  checkTruthy('case lexical shadow wins over outer var', rebuilt?.path === declarationPath);
  checkTruthy('case test sees the case-block declaration', rebuilt && rebuildLaggedScopeBinding(firstCase.get('test'), 'S') === rebuilt);
  check('conditional later write remains a violation', rebuilt?.constantViolations.length, 1);
  checkTruthy('discriminant resolves the outer var', rebuildLaggedScopeBinding(switchPath.get('discriminant'), 'S')?.path.node === outerPath.node.declarations[0]);
  checkTruthy('outside use resolves the outer var', rebuildLaggedScopeBinding(outsidePath, 'S')?.path.node === outerPath.node.declarations[0]);
}

// Adapter recovery needs declaration identity in the alias registry. A registered
// conditional write or a read before a trusted write must never gain a static hint.
for (const guarded of [false, true]) {
  const programPath = await parseProgram(`
    switch (flag) {
      case 0:
        let S;
        use(S.with(0, 'prior'));
        ${ guarded ? 'if (flag) ' : '' }({ Map: S } = globalThis);
        use(S.with(0, 'later'));
    }
  `);
  const [switchPath] = programPath.get('body');
  const [firstCase] = switchPath.get('cases');
  const statements = firstCase.get('consequent');
  const [declarationPath] = statements[0].get('declarations');
  const [priorPath] = statements[1].get('expression').get('arguments');
  const writePath = (guarded ? statements[2].get('consequent') : statements[2]).get('expression');
  const [laterPath] = statements[3].get('expression').get('arguments');
  switchPath.scope.removeBinding('S');
  const injector = new ImportInjectorState({ mode: 'actual', pkg: '@core-js/pure', importStyle: 'esm' });
  const adapter = createBabelAdapter({ getInjector: () => injector });
  check(`switch alias recovery/${ guarded }: no binding without an alias source`, adapter.getBinding(priorPath.scope, 'S', priorPath), null);
  injector.registerGlobalAlias('S', 'Map', {
    bindingNode: declarationPath.node,
    guarded,
    verified: !guarded,
    write: guarded ? null : writePath.node,
    declSpan: declarationPath.node,
    scopeSpan: switchPath.node,
  });
  const prior = adapter.getBinding(priorPath.scope, 'S', priorPath);
  const later = adapter.getBinding(laterPath.scope, 'S', laterPath);
  checkTruthy(`switch alias recovery/${ guarded }: prior read has a declaration`, prior?.declarationPath === declarationPath);
  check(`switch alias recovery/${ guarded }: prior read has no static hint`, prior?.polyfillHint, null);
  check(`switch alias recovery/${ guarded }: prior read retains its runtime hint`, prior?.guardedAliasHint, 'Map');
  check(`switch alias recovery/${ guarded }: conditional registry judgment is preserved`, later?.polyfillHint, guarded ? null : 'Map');
  check(`switch alias recovery/${ guarded }: complete write list survives`, later?.constantViolations?.length, 1);
}

// Parameter properties have runtime constructor bindings even when Babel returns an
// outer binding. Native nearer shadows and definition-time readers keep their own binding.
for (const [label, outer, parameter, body, key, decorator, expectedKind, expectedType, writes] of [
  ['defaulted miss', '', 'public value: number[] = []', 'value.at(0);', '', '', 'param', 'AssignmentPattern', 0],
  ['bare shadows const', 'const value = [9];', 'public value: number[]', 'value.at(0);', '', '', 'param', 'Identifier', 0],
  ['defaulted shadows import', "import value from 'other';", 'private value: number[] = []', 'value.at(0);', '', '', 'param', 'AssignmentPattern', 0],
  ['written parameter', 'const value = [9];', 'private value: number[] = []', "value = 's'; value.at(0);", '', '', 'param', 'AssignmentPattern', 1],
  ['nearer lexical shadow', 'const value = [9];', 'public value: number[]', '{ const value = [2]; value.at(0); }', '', '', 'const', 'VariableDeclarator', 0],
  ['nearer ordinary parameter', 'const value = [9];', 'public value: number[]', 'function inner(value: number[]) { value.at(0); }', '', '', 'param', 'Identifier', 0],
  ['class computed key', 'const value = [9];', 'public value: number[]', '', '[value.at(0)]() {}', '', 'const', 'VariableDeclarator', 0],
  ['parameter decorator', 'const value = [9];', 'public value: number[]', '', '', '@dec(value.at(0)) ', 'const', 'VariableDeclarator', 0],
]) {
  const programPath = await parseProgram(`
    ${ outer }
    class Holder {
      ${ key }
      constructor(${ decorator }${ parameter }) { ${ body } }
    }
  `, ['typescript', 'decorators-legacy']);
  let usePath = null;
  programPath.traverse({
    MemberExpression(p) {
      if (p.node.object?.name === 'value' && p.node.property?.name === 'at') usePath = p;
    },
  });
  if (decorator) {
    const [holder] = programPath.get('body').slice(-1);
    const [constructor] = holder.get('body').get('body');
    const [property] = constructor.get('params');
    const [decoratorPath] = property.get('decorators');
    const [argumentPath] = decoratorPath.get('expression').get('arguments');
    usePath = argumentPath.get('callee');
  }
  checkTruthy(`parameter-property/${ label }: source reader exists`, usePath);
  const adapter = createBabelAdapter();
  const binding = adapter.getBinding(usePath.scope, 'value', usePath);
  check(`parameter-property/${ label }: binding kind`, binding?.kind, expectedKind);
  check(`parameter-property/${ label }: declaration shape`, binding?.declarationPath?.node.type, expectedType);
  check(`parameter-property/${ label }: write list`, binding?.constantViolations?.length, writes);
  check(`parameter-property/${ label }: node-type query agrees`, adapter.getBindingNodeType(usePath.scope, 'value', usePath), expectedType);
  if (expectedKind === 'param' && label !== 'nearer ordinary parameter') {
    checkTruthy(`parameter-property/${ label }: actual constructor declaration`, binding?.declarationPath?.parentPath?.node.type === 'TSParameterProperty');
  } else {
    checkTruthy(`parameter-property/${ label }: actual native declaration`, binding?.declarationPath === usePath.scope.getBinding('value')?.path);
  }
}

// Alias walks keep the deeper consumer path while explicitly looking up names in
// the alias's declaration scope. An inner var or parameter property is invisible there.
for (const [label, source, expectedType, expectedInit] of [
  ['outer user receiver', 'var value = userLibrary; function read() { var value = globalThis; value.at(0); }', 'VariableDeclarator', 'userLibrary'],
  ['outer global receiver', 'var value = globalThis; function read() { var value = userLibrary; value.at(0); }', 'VariableDeclarator', 'globalThis'],
  ['outer const and constructor parameter', 'const value = userLibrary; class C { constructor(public value: any) { value.at(0); } }', 'VariableDeclarator', 'userLibrary'],
]) {
  const programPath = await parseProgram(source, ['typescript']);
  let usePath = null;
  programPath.traverse({ MemberExpression(p) { if (p.node.property?.name === 'at') usePath = p; } });
  const adapter = createBabelAdapter();
  const binding = adapter.getBinding(programPath.scope, 'value', usePath);
  check(`explicit lookup scope/${ label }: declaration`, binding?.node?.type, expectedType);
  check(`explicit lookup scope/${ label }: initializer`, binding?.node?.init?.name, expectedInit);
  checkTruthy(`explicit lookup scope/${ label }: actual outer scope`, binding?.scope === programPath.scope);
  check(`explicit lookup scope/${ label }: node-type query agrees`, adapter.getBindingNodeType(programPath.scope, 'value', usePath), expectedType);
}

finish();
