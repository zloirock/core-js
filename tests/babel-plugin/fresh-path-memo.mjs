// Unit tests for `@core-js/babel-plugin/internals/detect-usage.js` path re-anchoring: the
// per-node memo must survive repeated lookups, but a LATER mutation can re-target the stored
// path (replaceWith swaps its node) or detach its ancestor chain (statement removal) - a memo
// hit re-validates both and falls back to a fresh traverse instead of returning the stale path.
// Missing bindings recover their actual declaration and writes without crossing lexical regions,
// a removed assignment-pattern slot keeps the binding it writes, and a write list follows the render
// that replaced its pattern write.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { createBabelAdapter, freshPathOfNode, rebuildLaggedScopeBinding } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { rangePreservingTypes, removePatternSlot } from '../../packages/core-js-babel-plugin/internals/babel-compat.js';
import ImportInjectorState from '../../packages/core-js-polyfill-provider/injector-base.js';
import { ancestorChainDetached, liveBindingWrites, ownerWritePathIndex, wrapScopeBindingLookup } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, traverse, types: t } = requireBabel('@babel/core');

const { check, checkDeep, checkTruthy, finish } = createChecker('fresh-path-memo');

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

// Asked in a scope above the use - an alias read, resolved where the alias is declared - the recovery
// answers only with a declaration at or above that scope.
{
  const programPath = await parseProgram(`
    const B = Array;
    function direct(c) {
      if (c) { var Array = 1; }
      return B.from(xs);
    }
  `);
  const [, functionPath] = programPath.get('body');
  const [ifPath, returnPath] = functionPath.get('body.body');
  const declarationPath = ifPath.get('consequent.body.0.declarations.0');
  const usePath = returnPath.get('argument.callee');
  checkTruthy('a use-scope recovery finds the block var', rebuildLaggedScopeBinding(usePath, 'Array')?.path === declarationPath);
  checkTruthy('the declaring function scope asked finds it too', rebuildLaggedScopeBinding(usePath, 'Array', functionPath.scope)?.path === declarationPath);
  checkTruthy('a scope above the declaring function finds none', rebuildLaggedScopeBinding(usePath, 'Array', programPath.scope) === null);
}

// A binding babel's scope no longer holds is served by the alias registry's NAME view alone. A
// registered conditional write or a read before a trusted write must never gain a static hint.
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
  check(`switch alias name view/${ guarded }: no binding without an alias source`, adapter.getBinding({ scope: priorPath.scope, name: 'S', path: priorPath }), null);
  injector.registerGlobalAlias('S', 'Map', {
    bindingNode: declarationPath.node,
    guarded,
    verified: !guarded,
    write: guarded ? null : writePath.node,
    declSpan: declarationPath.node,
    scopeSpan: switchPath.node,
  });
  const prior = adapter.getBinding({ scope: priorPath.scope, name: 'S', path: priorPath });
  const later = adapter.getBinding({ scope: laterPath.scope, name: 'S', path: laterPath });
  check(`switch alias name view/${ guarded }: prior read has no static hint`, prior?.polyfillHint, null);
  check(`switch alias name view/${ guarded }: prior read retains its runtime hint`, prior?.guardedAliasHint, 'Map');
  check(`switch alias name view/${ guarded }: conditional registry judgment is preserved`, later?.polyfillHint, guarded ? null : 'Map');
}

// A slot of an assignment pattern writes a binding declared elsewhere: removing the slot keeps that
// binding registered, while a declaring slot leaves with the binding it declares
{
  const programPath = await parseProgram('let S; ({ Map: S, Set: kept } = globalThis); const { Map: D, Set: more } = globalThis;');
  const [, assignment, declaration] = programPath.get('body');
  const written = programPath.scope.getBinding('S');
  const [writingSlot] = assignment.get('expression').get('left').get('properties');
  removePatternSlot(writingSlot);
  checkTruthy('a removed assignment-pattern slot keeps the binding it writes', programPath.scope.getBinding('S') === written);
  const [declaringSlot] = declaration.get('declarations')[0].get('id').get('properties');
  removePatternSlot(declaringSlot);
  check('a removed declaring slot takes its binding along', programPath.scope.getBinding('D'), undefined);
}

// The render REPLACES a pattern write it serves (`c && ({ Set: S } = g)` -> `c && (S = _Set, g)`), and
// a write list built before that keeps the replaced node, above which no climb finds the guard. The
// adapter hands the live write out instead, and so does the scope lookup, through one view of the binding
// it keeps across the render: the scope's own record stays as babel keeps it, for babel and its siblings
{
  const programPath = await parseProgram('let S; c && ({ Set: S } = g); use(S.size);');
  const [, writeStatement, useStatement] = programPath.get('body');
  const [usePath] = useStatement.get('expression').get('arguments');
  const writePath = writeStatement.get('expression').get('right');
  const original = writePath.node;
  const adapter = createBabelAdapter();
  const lookup = wrapScopeBindingLookup((scope, name) => scope.getBinding(name));
  const before = adapter.getBinding({ scope: usePath.scope, name: 'S', path: usePath });
  const viewBefore = lookup({ scope: usePath.scope, name: 'S', path: usePath });
  checkTruthy('the write list starts on the source pattern write', before?.constantViolations?.some(write => (write.node ?? write) === original));
  const rendered = t.assignmentExpression('=', t.identifier('S'), t.identifier('_Set'));
  writePath.replaceWith(t.sequenceExpression([rendered, t.identifier('g')]));
  const after = adapter.getBinding({ scope: usePath.scope, name: 'S', path: usePath });
  check('the write list holds the live write alone', after?.constantViolations?.map(write => write.node ?? write).filter(node => node === rendered || node === original).length, 1);
  checkTruthy('the live write is the rendered one', after?.constantViolations?.some(write => (write.node ?? write) === rendered));
  const viewAfter = lookup({ scope: usePath.scope, name: 'S', path: usePath });
  checkTruthy('the lookup keeps one view across the render', viewAfter === viewBefore);
  checkTruthy('the looked-up view follows the render', viewAfter?.constantViolations?.some(write => (write.node ?? write) === rendered));
  const record = programPath.scope.getBinding('S');
  checkTruthy('the scope record stays as babel keeps it', record.constantViolations.every(write => write.node !== rendered));
  checkTruthy('the scope record keeps its binding', adapter.getBinding({ scope: usePath.scope, name: 'S', path: usePath })?.declarationPath === record.path);
}

// A pattern write a render mints after the write index was built is live: the index is built again to
// find it, where taking it for a retired write would drop the scans again on every later lookup
{
  const programPath = await parseProgram('let S; ({ Set: S } = g); use(S.size);');
  const [, writeStatement, useStatement] = programPath.get('body');
  const [usePath] = useStatement.get('expression').get('arguments');
  const binding = programPath.scope.getBinding('S');
  function ask() {
    return liveBindingWrites({ binding, name: 'S', usePath });
  }
  ask();
  const pattern = t.objectPattern([t.objectProperty(t.identifier('Map'), t.identifier('S'))]);
  const [mintedStatement] = writeStatement.insertAfter(t.expressionStatement(t.assignmentExpression('=', pattern, t.identifier('h'))));
  const minted = mintedStatement.node.expression;
  writeStatement.get('expression').replaceWith(t.sequenceExpression([t.assignmentExpression('=', t.identifier('S'), t.identifier('_Set')), t.identifier('g')]));
  const live = ask();
  checkTruthy('the minted write is among the live writes', live.includes(minted));
  checkTruthy('a later lookup keeps the live writes it was handed', ask() === live);
}

// A render that replaced a pattern write is read again where it left its slot, not over the whole owner:
// a statement split into a run, a statement swapped for another shape under its path, the other writes a
// replaced statement held, a slot under a block shadowing one of the names, a write between two others,
// a run an insertion ahead has shifted, a slot in the head of the loop its binding is scoped to (the
// statements minted around the loop stand outside its scan), an owner a render moved since its scan, a
// write a render rewrote in place so it writes the name no more - a pattern turned a capture, a loop head
// turned a declaration, a write minted beside it with a span taken over from it, the rewritten write kept
// until what stands for it is minted, a loop whose head declared the binding rewritten in place - and the
// lookup's view of the scope record follows a write rewritten in place as it follows one replaced
function assign(name, value) {
  return t.expressionStatement(t.assignmentExpression('=', t.identifier(name), t.identifier(value)));
}
async function liveWritesAfter(code, render) {
  const programPath = await parseProgram(code);
  const statements = programPath.get('body');
  const [usePath] = statements.at(-1).get('expression').get('arguments');
  function ask(name) {
    return liveBindingWrites({ binding: programPath.scope.getBinding(name), name, usePath });
  }
  ask('S');
  render(statements, programPath);
  return ask;
}
{
  const ask = await liveWritesAfter('let S, T; ({ Map: S, Set: T } = g); use(S, T);', ([, write]) => {
    write.replaceWithMultiple([assign('S', '_Map'), assign('T', '_Set')]);
  });
  checkDeep('a statement split into a run: the first write', ask('S').map(node => node.right.name), ['_Map']);
  checkDeep('a statement split into a run: the second write', ask('T').map(node => node.right.name), ['_Set']);
}
{
  const ask = await liveWritesAfter('let S; ({ Set: S } = g); use(S);', ([, write]) => {
    write.replaceWith(t.ifStatement(t.identifier('c'), assign('S', '_Set')));
  });
  checkDeep('a statement swapped for another shape under its path', ask('S').map(node => node.right.name), ['_Set']);
}
{
  let rendered = null;
  const ask = await liveWritesAfter('let S, T; ({ Map: S } = g), T = a; use(S, T);', ([, write]) => {
    rendered = assign('T', 'a').expression;
    write.replaceWithMultiple([assign('S', '_Map'), t.expressionStatement(rendered)]);
  });
  ask('S');
  checkTruthy('a replaced statement takes the other writes it held along', ask('T').length === 1 && ask('T')[0] === rendered);
}
{
  const ask = await liveWritesAfter('let S, T; { let T; ({ Set: S, Map: T } = g); } use(S, T);', ([, block]) => {
    block.get('body')[1].replaceWithMultiple([assign('S', '_Set'), assign('T', '_Map')]);
  });
  checkDeep('a slot under a block: the outer name takes its write', ask('S').map(node => node.right.name), ['_Set']);
  checkDeep('a slot under a block: the name the block shadows takes none', ask('T'), []);
}
{
  const ask = await liveWritesAfter('let S; S = a; ({ Set: S } = g); S = b; use(S);', statements => {
    statements[2].replaceWith(assign('S', '_Set'));
  });
  checkDeep('a write between two others keeps its place', ask('S').map(node => node.right.name), ['a', '_Set', 'b']);
}
{
  const ask = await liveWritesAfter('let S, T; f(); ({ Map: S, Set: T } = g); use(S, T);', (statements, programPath) => {
    statements[2].replaceWithMultiple([assign('S', '_Map'), assign('T', '_Set')]);
    programPath.unshiftContainer('body', [t.expressionStatement(t.identifier('memo')), t.expressionStatement(t.identifier('memo'))]);
  });
  checkDeep('a run an insertion ahead has shifted', ask('T').map(node => node.right.name), ['_Set']);
}
{
  const programPath = await parseProgram('let S; for (let S = a; c; ({ Set: S } = g)) use(S);');
  const loop = programPath.get('body.1');
  const usePath = loop.get('body.expression.arguments.0');
  function ask() {
    return liveBindingWrites({ binding: loop.scope.getBinding('S'), name: 'S', usePath });
  }
  ask();
  loop.insertBefore(assign('S', 'memo'));
  loop.get('update').replaceWith(t.sequenceExpression([assign('S', '_Set').expression, t.identifier('g')]));
  checkDeep('a slot in the head of the loop its binding is scoped to', ask().map(node => node.right.name), ['_Set']);
}
{
  const programPath = await parseProgram('if (c) (function () { var S; ({ Set: S } = g); use(S); })();');
  function ask(owner) {
    return liveBindingWrites({ binding: owner.scope.getBinding('S'), name: 'S', usePath: owner.get('body.body.2.expression.arguments.0') });
  }
  ask(programPath.get('body.0.consequent.expression.callee'));
  const consequent = programPath.get('body.0.consequent');
  consequent.replaceWith(t.blockStatement([consequent.node]));
  const owner = programPath.get('body.0.consequent.body.0.expression.callee');
  owner.get('body.body.1.expression').replaceWith(t.sequenceExpression([assign('S', '_Set').expression, t.identifier('g')]));
  checkDeep('an owner a render moved since its scan', ask(owner).map(node => node.right.name), ['_Set']);
}
{
  const ask = await liveWritesAfter('let S; [{ Set: S }] = g; use(S);', ([, write]) => {
    write.get('expression.left').replaceWith(t.arrayPattern([t.identifier('_ref')]));
    write.insertAfter(assign('S', '_Set'));
  });
  checkDeep('a pattern write a render turned a capture in place', ask('S').map(node => node.right.name), ['_Set']);
}
{
  const ask = await liveWritesAfter('let S; for ({ ...S } of g); use(S);', ([, loop]) => {
    loop.get('left').replaceWith(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('_ref'))]));
    loop.get('body').replaceWith(t.blockStatement([assign('S', '_ref')]));
  });
  checkDeep('a loop head a render turned a declaration in place', ask('S').map(node => node.right.name), ['_ref']);
}
{
  const ask = await liveWritesAfter('let S; [{ Set: S }] = g; use(S);', ([, write]) => {
    const { start, end } = write.node.expression;
    write.get('expression.left').replaceWith(t.arrayPattern([t.identifier('_ref')]));
    write.insertAfter(Object.assign(assign('S', '_Set'), { start, end }));
  });
  checkDeep('a write minted with a span taken over from the one rewritten in place', ask('S').map(node => node.right.name), ['_Set']);
}
{
  const programPath = await parseProgram('let S; [{ Set: S }] = g; use(S);');
  const write = programPath.get('body.1');
  const usePath = programPath.get('body.2.expression.arguments.0');
  function ask() {
    return liveBindingWrites({ binding: programPath.scope.getBinding('S'), name: 'S', usePath }).map(node => node.right.name);
  }
  ask();
  write.get('expression.left').replaceWith(t.arrayPattern([t.identifier('_ref')]));
  checkDeep('a write rewritten in place marks its slot until what stands for it is minted', ask(), ['g']);
  write.insertAfter(assign('S', '_Set'));
  checkDeep('a write rewritten in place gives way to the write minted for it', ask(), ['_Set']);
}
{
  const programPath = await parseProgram('let T; T = a; for (const { Set: S } of g) use(S, T);');
  const loop = programPath.get('body.2');
  const binding = loop.scope.getBinding('S');
  const useS = loop.get('body.expression.arguments.0');
  const useT = loop.get('body.expression.arguments.1');
  function askT() {
    return liveBindingWrites({ binding: programPath.scope.getBinding('T'), name: 'T', usePath: useT });
  }
  const before = askT();
  liveBindingWrites({ binding, name: 'S', usePath: useS });
  loop.get('left').replaceWith(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('_ref'))]));
  checkDeep('a loop whose head declared the binding, rewritten in place, holds no write of it', liveBindingWrites({ binding, name: 'S', usePath: useS }), []);
  checkTruthy('a loop rewritten in place leaves the scans above it as they were', askT() === before);
}
async function lookedUpWritesAfter(code, render) {
  const programPath = await parseProgram(code);
  const statements = programPath.get('body');
  const usePath = statements.at(-1).get('expression.arguments.0');
  const lookup = wrapScopeBindingLookup((scope, name) => scope.getBinding(name));
  function view() {
    return lookup({ scope: usePath.scope, name: 'S', path: usePath }).constantViolations.map(write => (write.node ?? write).right.name);
  }
  view();
  render(statements);
  return view();
}
checkDeep('the looked-up view follows a pattern write rewritten in place', await lookedUpWritesAfter('let S; [{ Set: S }] = g; use(S);', ([, write]) => {
  write.get('expression.left').replaceWith(t.arrayPattern([t.identifier('_ref')]));
  write.insertAfter(assign('S', '_Set'));
}), ['_Set']);
checkDeep('the looked-up view follows a loop head rewritten in place', await lookedUpWritesAfter('let S; for ({ ...S } of g); use(S);', ([, loop]) => {
  loop.get('left').replaceWith(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('_ref'))]));
  loop.get('body').replaceWith(t.blockStatement([assign('S', '_ref')]));
}), ['_ref']);

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
  const binding = adapter.getBinding({ scope: usePath.scope, name: 'value', path: usePath });
  check(`parameter-property/${ label }: binding kind`, binding?.kind, expectedKind);
  check(`parameter-property/${ label }: declaration shape`, binding?.declarationPath?.node.type, expectedType);
  check(`parameter-property/${ label }: write list`, binding?.constantViolations?.length, writes);
  check(`parameter-property/${ label }: node-type query agrees`, adapter.getBindingNodeType({ scope: usePath.scope, name: 'value', path: usePath }), expectedType);
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
  const binding = adapter.getBinding({ scope: programPath.scope, name: 'value', path: usePath });
  check(`explicit lookup scope/${ label }: declaration`, binding?.node?.type, expectedType);
  check(`explicit lookup scope/${ label }: initializer`, binding?.node?.init?.name, expectedInit);
  checkTruthy(`explicit lookup scope/${ label }: actual outer scope`, binding?.scope === programPath.scope);
  check(`explicit lookup scope/${ label }: node-type query agrees`, adapter.getBindingNodeType({ scope: programPath.scope, name: 'value', path: usePath }), expectedType);
}

// A render that COPIES a source write to where it renders it leaves the source write out of the tree: the
// lookup's view takes the live copy in its place, so the reaching lanes read no detached write. A copy the
// source never had in that place - taken without retiring - keeps the source write answering for it, as the
// other leg reads it
for (const [label, copyMethod, retires] of [['retiring copy', 'cloneNode', true], ['copy without retiring', 'cloneWithoutRetiring', false]]) {
  const programPath = await parseProgram('let x = [1];\nf((x = [2], 0));\nuse(x.at(0));');
  const [, callStatement, useStatement] = programPath.get('body');
  const usePath = useStatement.get('expression.arguments.0.callee.object');
  const lookup = wrapScopeBindingLookup((scope, name) => scope.getBinding(name));
  lookup({ scope: usePath.scope, name: 'x', path: usePath });
  const argument = callStatement.get('expression.arguments.0');
  const copy = rangePreservingTypes(t)[copyMethod](argument.node);
  argument.replaceWith(t.sequenceExpression([t.identifier('render'), copy]));
  const writes = lookup({ scope: usePath.scope, name: 'x', path: usePath })?.constantViolations ?? [];
  check(`render copy/${ label }: the view reads the copy`, writes.some(write => write.node === copy.expressions[0]), retires);
  check(`render copy/${ label }: every write it reads is attached`, writes.every(write => !!write.node && !ancestorChainDetached(write)), retires);
}

// babel's visitor keys omit a parameter property's decorators, so its tracker never records a write one
// hosts: the lookup recovers it from the scan as an entry with no path to climb. the write index still
// finds it, and once the render replaces it, the lookup's view takes the live write in its place
{
  const programPath = await parseProgram('let M;\nclass C { constructor(@dec(({ Map: M } = g)) private x) {} }\nuse(M.groupBy);', ['typescript', 'decorators-legacy']);
  const [, classStatement, useStatement] = programPath.get('body');
  const usePath = useStatement.get('expression.arguments.0.object');
  const [property] = classStatement.get('body.body.0.params');
  const [decoratorPath] = property.get('decorators');
  const writePath = decoratorPath.get('expression.arguments.0');
  const original = writePath.node;
  const lookup = wrapScopeBindingLookup((scope, name) => scope.getBinding(name));
  function view() {
    return lookup({ scope: usePath.scope, name: 'M', path: usePath })?.constantViolations ?? [];
  }
  checkTruthy('parameter decorator write: the view starts on the source write', view().some(write => (write.node ?? write) === original));
  checkTruthy('parameter decorator write: the write index finds it', ownerWritePathIndex(programPath).get(original)?.node === original);
  const rendered = t.assignmentExpression('=', t.identifier('M'), t.identifier('_Map'));
  writePath.replaceWith(t.sequenceExpression([rendered, t.identifier('g')]));
  const writes = view();
  checkTruthy('parameter decorator write: the view drops the replaced write', writes.every(write => (write.node ?? write) !== original));
  checkTruthy('parameter decorator write: the view takes the rendered one', writes.some(write => write.node === rendered && !ancestorChainDetached(write)));
}

finish();
