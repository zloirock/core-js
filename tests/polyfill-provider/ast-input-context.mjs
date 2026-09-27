import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  classDefinitionTimePaths,
  classOwnThisMethodInfo,
  collectFileCensus,
  isASTNode,
  isForXWriteTarget,
  isTopLevelThisContext,
  mergeOwnThisMethodInfo,
  objectOwnThisMethodInfo,
  walkAstNodes,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { hasCtorAliasCandidateShapes } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('ast-input-context');

for (const type of ['CommentBlock', 'CommentLine', 'Block', 'Line']) {
  check(`comment ${ type } is not syntax`, isASTNode({ type, value: 'text' }), false);
}

for (const parser of adapters) {
  check(`${ parser.name }/constructor census positive`, hasCtorAliasCandidateShapes(parser.parseAndScope('/* note */ const { Map } = source;').node), true);
  check(`${ parser.name }/constructor census negative`, hasCtorAliasCandidateShapes(parser.parseAndScope('/* const { Map } = source; */ const x = 1;').node), false);
  // Host paths may expose scope only on ancestors, including paths reached from a binding.
  const scopeTree = parser.parseAndScope('const inner = { get value() { return []; } }, box = { inner }; box.inner.value;');
  const scopeRead = parser.pickPath(scopeTree, 'MemberExpression', path => path.node.property.name === 'value');
  const bindingViews = new WeakMap();
  function ancestorScopedPath(path) {
    if (Array.isArray(path)) return path.map(ancestorScopedPath);
    return path?.node && Object.create(path, {
      scope: { value: undefined },
      get: { value: key => ancestorScopedPath(path.get(key)) },
    });
  }
  const scopedResolver = parser.makeResolver({
    getScopeBinding(scope, name) {
      const binding = scope?.getBinding(name);
      if (!binding) return binding;
      if (!bindingViews.has(binding)) bindingViews.set(binding, Object.create(binding, {
        path: { value: Object.create(binding.path, { get: { value: key => ancestorScopedPath(binding.path.get(key)) } }) },
      }));
      return bindingViews.get(binding);
    },
  });
  check(`${ parser.name }/binding initializer inherits declaration scope`, scopedResolver.resolveNodeType(scopeRead)?.constructor, 'Array');

  const comments = parser.parseAndScope('/* heading */ const x = 1; // trailing\n// leading\nx;');
  const visited = [];
  collectFileCensus(comments.node, [{
    visit(node) { visited.push(node.type); },
    result() { return {}; },
  }]);
  walkAstNodes({ root: comments.node, visit(node) { visited.push(node.type); } });
  check(`${ parser.name }/walks exclude comments`, visited.some(type => ['CommentBlock', 'CommentLine', 'Block', 'Line'].includes(type)), false);

  // These are evaluation-context questions, including TS shapes with no typechecked this.
  for (const [name, source, expected] of [
    ['program', 'this.x;', true],
    ['arrow', '(() => this.x)();', true],
    ['function', 'function f() { this.x; }', false],
    ['object key', 'const o = { [this.x]() {} };', true],
    ['object body', 'const o = { m() { this.x; } };', false],
    ['heritage', 'class C extends this.x {}', true],
    ['class key', 'class C { [this.x]() {} }', true],
    ['field key', 'class C { [this.x] = 1; }', true],
    ['static key', 'class C { static [this.x] = 1; }', true],
    ['field value', 'class C { x = this.x; }', false],
    ['static value', 'class C { static x = this.x; }', false],
    ['static block', 'class C { static { this.x; } }', false],
    ['method default', 'class C { m(x = this.x) {} }', false],
    ['method decorator', 'class C { @dec(this.x) m() {} }', true],
    ['class decorator', '@dec(this.x) class C {}', true],
    ['nested definition', 'function f() { class C { [this.x]() {} } }', false],
    ['key function', 'class C { [(function () { return this.x; })()]() {} }', false],
    ['namespace', 'namespace N { this.x; }', false],
    ['enum', 'enum E { A = this.x }', false],
  ]) {
    const program = parser.parseAndScope(source, 'module', ['decorators']);
    const paths = parser.collectPaths(program, 'ThisExpression');
    check(`${ parser.name }/${ name }/one this`, paths.length, 1);
    check(`${ parser.name }/${ name }/path`, isTopLevelThisContext(paths[0]), expected);
    const census = [];
    collectFileCensus(program.node, [{
      visit(node, frame) { if (node.type === 'ThisExpression') census.push(frame.atThisTopLevel); },
      result() { return {}; },
    }]);
    checkDeep(`${ parser.name }/${ name }/census`, census, [expected]);
  }

  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  for (const [name, source, expected] of [
    ['body', 'const o = []; for (o.at of xs) { o.at(0); }', true],
    ['rhs', 'const o = []; for (o.at of o.at(0)) {}', false],
    ['head key', 'const o = []; for ({ [o.at(0)]: o.at } of xs) {}', false],
    ['head default', 'const o = []; for ([o.at = o.at(0)] of xs) {}', false],
    ['block binding', 'const o = []; for (o.at of xs) { const o = "abc"; o.at(0); }', false],
    ['catch binding', 'const o = []; for (o.at of xs) { try {} catch (o) { o.at(0); } }', false],
    ['function binding', 'const o = []; for (o.at of xs) { function f(o) { o.at(0); } }', false],
    ['closure binding', 'const o = []; for (o.at of xs) { function f() { o.at(0); } }', true],
    ['boolean receiver key', 'const o = { true: [] }; for (o[true].at of xs) { o[true].at(0); }', true],
    ['null receiver key', 'const o = { null: [] }; for (o[null].at of xs) { o[null].at(0); }', true],
    ['stable key', 'const o = [[]], k = 0; for (o[k].at of xs) { o[k].at(0); }', true],
    ['shadowed key', 'const o = {}, k = 0; for (o[k].at of xs) { const k = 1; o[k].at(0); }', false],
    ['changed key', 'const o = {}; let k = 0; for (o[k].at of xs) { k = 1; o[k].at(0); }', false],
    ['reassigned receiver', 'let o = []; for (o.at of xs) { o = "abc"; o.at(0); }', false],
    ['coercible key', 'const o = {}, k = { toString() { return name; } }; for (o[k].at of xs) { o[k].at(0); }', false],
    ['property key', 'const o = {}, k = { x: 0 }; for (o[k.x].at of xs) { k.x = 1; o[k.x].at(0); }', false],
    ['unknown symbol receiver', 'const o = {}; for (o[Symbol.iterator].at of xs) { o[Symbol.iterator].at(0); }', false],
    ['shadowed symbol key', 'const Symbol = { iterator: 0 }, o = {}; for (o[Symbol.iterator].at of xs) { Symbol.iterator = 1; o[Symbol.iterator].at(0); }', false],
    ['realm hop', 'for (globalThis.self[Symbol.iterator] of xs) { globalThis.self[Symbol.iterator](); }', true],
    ['shadowed realm hop', 'function run(globalThis) { for (globalThis.self[Symbol.iterator] of xs) { globalThis.self[Symbol.iterator](); } }', false],
    ['this arrow', 'for (this.at of xs) { (() => this.at(0))(); }', true],
    ['this function', 'for (this.at of xs) { (function () { this.at(0); })(); }', false],
    ['this field', 'for (this.at of xs) { class C { x = this.at(0); } }', false],
    ['this static block', 'for (this.at of xs) { class C { static { this.at(0); } } }', false],
  ]) {
    for (const operator of ['of', 'in']) {
      const program = parser.parseAndScope(source.replace(' of ', ` ${ operator } `));
      const path = parser.pickPath(program, 'MemberExpression', p => p.parentPath.node.type === 'CallExpression');
      check(`${ parser.name }/for-${ operator }/${ name }`, isForXWriteTarget(path, adapter), expected);
    }
  }

  for (const method of ['usage-global', 'usage-pure']) {
    for (const [name, source, expected] of [
      ['conservative boolean write', 'const o = { true: [] }; for (o[true].at of xs) o[true].at(0);', false],
      ['conservative null write', 'const o = { null: [] }; for (o[null].at of xs) o[null].at(0);', false],
      ['stored alias', 'const inner = { value: [] }, box = { inner }; for (box.inner.value.at of xs) box.inner.value.at(0);', true],
      ['written alias', 'const inner = { value: [] }, box = { inner }; for (box.inner.value.at of xs) { inner.value = "abc"; box.inner.value.at(0); }', false],
      ['captured getter', 'function read() { const inner = { value: [] }; for (box.inner.value.at of xs) box.inner.value.at(0); }'
        + ' const inner = { get value() { return []; } }, box = { inner };', false],
      ['fresh getter', 'const box = { get value() { return []; } }; for (box.value.at of xs) box.value.at(0);', false],
      ['unknown receiver', 'function read(box) { for (box.value.at of xs) box.value.at(0); }', false],
    ]) {
      const tree = parser.parseAndScope(source);
      const census = collectFileCensus(tree.node, [mutationShapesReducer()]);
      const options = {
        method,
        getWrittenContainerSlots: () => census.writtenContainerSlots,
        getContainerSlotIndex: () => census.containerSlotIndex,
      };
      const reader = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)(options);
      const path = parser.pickPath(tree, 'MemberExpression', p => p.parentPath.node.type === 'CallExpression');
      check(`${ parser.name }/${ method }/receiver identity/${ name }`, isForXWriteTarget(path, reader), expected);
    }
  }

  const decorated = parser.parseAndScope('class C { method(@dec(this.x) value) {} }', 'module', ['decorators-legacy']);
  // The ESTree visitor omits parameter decorators; their real paths remain accessible by slot.
  const [decorator] = classDefinitionTimePaths(parser.pickPath(decorated, 'ClassDeclaration'));
  const decoratedThis = decorator.get('expression').get('arguments')[0].get('object');
  check(`${ parser.name }/parameter decorator/path`, isTopLevelThisContext(decoratedThis), true);
  collectFileCensus(decorated.node, [{
    visit(node, frame) {
      if (node.type === 'ThisExpression') check(`${ parser.name }/parameter decorator/census`, frame.atThisTopLevel, true);
    },
    result() { return {}; },
  }]);

  for (const [name, body, expected] of [
    ['object key receiver', 'const o = { [this.groupBy]() {} };', true],
    ['class key receiver', 'class C { [this.groupBy]() {} }', true],
    ['field key receiver', 'class C { [this.groupBy] = 1; }', true],
    ['class heritage receiver', 'class C extends this.groupBy {}', true],
    ['parameter decorator receiver', 'class C { method(@dec(this.groupBy) value) {} }', true],
    ['object body receiver', 'const o = { m() { return this; } };', false],
    ['field value receiver', 'class C { value = this; }', false],
    ['static value receiver', 'class C { static value = this; }', false],
    ['static block receiver', 'class C { static { consume(this); } }', false],
  ]) {
    const tree = parser.parseAndScope(`function read() { ${ body } } read.call(Map);`, 'module', ['decorators-legacy']);
    const { escapedCtorNames } = collectFileCensus(tree.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
    check(`${ parser.name }/${ name }/escape`, escapedCtorNames.has('Map', true), expected);
  }

  for (const [name, body, expected] of [
    ['object key write', 'const o = { [this.x = 1]() {} };', true],
    ['class key write', 'class C { [this.x = 1]() {} }', true],
    ['field key write', 'class C { [this.x = 1] = 0; }', true],
    ['parameter decorator write', 'class C { method(@dec(this.x = 1) value) {} }', true],
    ['instance method write', 'class C { method() { this.x = 1; } }', false],
    ['instance field write', 'class C { field = this.x = 1; }', false],
    ['static method write', 'class C { static method() { this.x = 1; } }', true],
    ['static field write', 'class C { static field = this.x = 1; }', true],
    ['nested function write', 'class C { method() { function write() { this.x = 1; } } }', true],
    ['nested arrow write', 'class C { method() { (() => { this.x = 1; })(); } }', false],
  ]) {
    const tree = parser.parseAndScope(`function run() { ${ body } }`, 'module', ['decorators-legacy']);
    const { containerSlotIndex } = collectFileCensus(tree.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
    check(`${ parser.name }/${ name }/unrooted write`, containerSlotIndex.unrootedKeys.has('x'), expected);
  }

  // Parameter decorators are outside the method's receiver even when a host omits them from traversal.
  for (const value of ['this', '(() => { const self = this; return self; })()']) {
    const tree = parser.parseAndScope(`const h = { rows: [], m() { class C { m(@dec(${ value }) value) {} } return C; } }; h.m(); h.rows;`,
      'module', ['decorators-legacy']);
    const read = parser.pickPath(tree, 'MemberExpression', path => path.node.object.name === 'h' && path.node.property.name === 'rows');
    check(`${ parser.name }/parameter decorator exposes holder: ${ value }`, parser.makeResolver().resolveNodeType(read)?.constructor, undefined);
  }

  const program = parser.parseAndScope('class A { static a() {} } class B extends A { static b() {} } const o = { m() {} };');
  const classes = parser.collectPaths(program, 'ClassDeclaration');
  const infos = classes.map(path => classOwnThisMethodInfo(path.node, true));
  const merged = mergeOwnThisMethodInfo(...infos);
  const object = objectOwnThisMethodInfo(parser.pickPath(program, 'ObjectExpression').node);
  checkDeep(`${ parser.name }/summary schema`, Object.keys(merged).sort(), Object.keys(infos[0]).sort());
  checkDeep(`${ parser.name }/object schema`, Object.keys(object).sort(), Object.keys(merged).sort());
  check(`${ parser.name }/class has no literal keys`, merged.declaredKeys, null);
  checkDeep(`${ parser.name }/merged methods`, [...merged.methodKeys].sort(), ['a', 'b']);
}

finish();
