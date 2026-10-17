import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  ancestorChainDetached,
  bindingLoopAnchor,
  classDefinitionTimePaths,
  classOwnThisMethodInfo,
  collectFileCensus,
  isASTNode,
  isForXWriteTarget,
  isTopLevelThisContext,
  mergeOwnThisMethodInfo,
  lookupReadPath,
  objectOwnThisMethodInfo,
  pathOfNode,
  walkAstNodes,
  writtenNames,
  withCanonQuestion,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { proxyGlobalRootName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { hasCtorAliasCandidateShapes } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('ast-input-context');

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

  // Runtime descriptor order owns the getter boundary; duplicate definitions deliberately
  // exercise JavaScript forms TypeScript rejects. Unknown keys retain explicitly named getters in the type model.
  for (const [name, properties, expected] of [
    ['getter', 'get value() { return []; }', ['value']],
    ['paired setter', 'get value() { return []; }, set value(v) {}', ['value']],
    ['getter after data', 'value: 0, get value() { return []; }', ['value']],
    ['data reset', 'get value() { return []; }, value: 0', []],
    ['method reset', 'get value() { return []; }, value() {}', []],
    ['setter only', 'set value(v) {}', []],
    ['setter after reset', 'get value() { return []; }, value: 0, set value(v) {}', []],
    ['getter after spread', '...other, get value() { return []; }', ['value']],
    ['spread after getter', 'get value() { return []; }, ...other', []],
    ['getter after unknown key', '[key]: 0, get value() { return []; }', ['value']],
    ['unknown key after getter', 'get value() { return []; }, [key]: 0', ['value']],
    ['unknown setter after getter', 'get value() { return []; }, set [key](v) {}', ['value']],
    ['computed getter', 'get ["value"]() { return []; }', ['value']],
  ]) {
    const tree = parser.parseAndScope(`const o = { ${ properties } };`);
    const info = objectOwnThisMethodInfo(parser.pickPath(tree, 'ObjectExpression').node);
    checkDeep(`${ parser.name }/${ name }/final getters`, [...info.getterKeys ?? []], expected);
  }
  check(`${ parser.name }/merged class has no literal getters`, merged.getterKeys, null);
}

// The indexed live slot is the fast path; a shifted list index still uses the physical parent.
for (const parser of adapters) {
  for (const edit of ['none', 'reverse list', 'replace list', 'remove slot', 'replace slot', 'replace keyed parent', 'remove keyed parent']) {
    const tree = parser.parseAndScope('export function read(probe = () => tail + 1, { at }, tail) { return at; }');
    const fn = parser.pickPath(tree, 'FunctionDeclaration');
    const arrow = parser.pickPath(tree, 'ArrowFunctionExpression');
    const reference = arrow.get('body').get('left');
    const params = fn.get('params');
    const trailing = params.at(-1);
    switch (edit) {
      case 'reverse list': fn.node.params.reverse(); break;
      case 'replace list': fn.node.params = [...fn.node.params].reverse(); break;
      case 'remove slot': fn.node.params.shift(); break;
      case 'replace slot': fn.node.params[0] = { type: 'Identifier', name: 'replacement' }; break;
      case 'replace keyed parent':
        arrow.get('body').replaceWith({ type: parser.name === 'babel' ? 'NumericLiteral' : 'Literal', value: 7 });
        break;
      case 'remove keyed parent': params[0].remove(); break;
    }
    check(`${ parser.name }/${ edit }/cached descendant attachment`, ancestorChainDetached(reference),
      !['none', 'reverse list', 'replace list'].includes(edit));
    check(`${ parser.name }/${ edit }/surviving sibling attachment`, ancestorChainDetached(trailing), false);
  }
  for (const size of [16, 32]) {
    const tree = parser.parseAndScope(`export function read(${ Array.from({ length: size }, (unused, index) => `v${ index }`).join(', ') }) {}`);
    const fn = parser.pickPath(tree, 'FunctionDeclaration');
    const last = fn.get('params').at(-1);
    let slots = 0;
    for (let index = 0; index < size; index++) {
      const value = fn.node.params[index];
      Object.defineProperty(fn.node.params, index, { configurable: true, get() {
        slots++;
        return value;
      } });
    }
    check(`${ parser.name }/${ size }/wide list stays attached`, ancestorChainDetached(last), false);
    check(`${ parser.name }/${ size }/live indexed slot avoids a list search`, slots, 1);
  }
}

// The identifier projection shares the existing target grammar and retains the actual source nodes.
for (const [source, kind, expected] of [
  ['let value; value = 1;', 'AssignmentExpression', ['value']],
  ['let value; value &&= 1;', 'AssignmentExpression', ['value']],
  ['let value; value++;', 'UpdateExpression', ['value']],
  ['let value; (value as any) = 1;', 'AssignmentExpression', ['value']],
  ['let value; value! = 1;', 'AssignmentExpression', ['value']],
  ['({ x: value, y: next = fallback } = source);', 'AssignmentExpression', ['value', 'next']],
  ['[value, ...rest] = source;', 'AssignmentExpression', ['value', 'rest']],
  ['object[key] = value;', 'AssignmentExpression', []],
  ['for (value of source) {}', 'ForOfStatement', ['value']],
  ['for ([value] of source) {}', 'ForOfStatement', ['value']],
  ['for (var { x: value } in source) {}', 'ForInStatement', ['value']],
  ['for (const value of source) {}', 'ForOfStatement', ['value']],
]) for (const parser of adapters) {
  const tree = parser.parseAndScope(source);
  const write = parser.pickPath(tree, kind).node;
  const ids = writtenNames(write, { identifierNodes: true });
  checkDeep(`${ parser.name }/${ source }/write names`, writtenNames(write), expected);
  checkDeep(`${ parser.name }/${ source }/target projection`, ids.map(node => node.name), expected);
  const sourceIds = new Set(parser.collectPaths(tree, 'Identifier').map(path => path.node));
  check(`${ parser.name }/${ source }/original target identity`, ids.every(node => sourceIds.has(node)), true);
}

// A shorthand's key and value share offsets but are distinct source nodes and write slots.
for (const parser of adapters) {
  const tree = parser.parseAndScope('function read(tail, other) { const o = { tail, named: other }; ({ tail } = source); return (tail as any); }');
  const fn = parser.pickPath(tree, 'FunctionDeclaration');
  const write = parser.pickPath(tree, 'AssignmentExpression');
  const [property] = write.node.left.properties;
  check(`${ parser.name }/shorthand shares the key start`, property.key.start, property.value.start);
  check(`${ parser.name }/shorthand shares the key end`, property.key.end, property.value.end);
  check(`${ parser.name }/key identity remains exact`, pathOfNode(write, property.key)?.node, property.key);
  const value = pathOfNode(write, property.value);
  check(`${ parser.name }/write value identity remains exact`, value?.node, property.value);
  const binding = value?.scope?.getBinding('tail');
  check(`${ parser.name }/write value keeps its actual binding`, binding?.identifier ?? binding?.identifierPath?.node, fn.node.params[0]);
  const literal = parser.pickPath(tree, 'ObjectExpression').node;
  for (const item of literal.properties) {
    check(`${ parser.name }/${ item.key.name }/literal key identity`, pathOfNode(tree, item.key)?.node, item.key);
    check(`${ parser.name }/${ item.key.name }/literal value identity`, pathOfNode(tree, item.value)?.node, item.value);
  }
}

// Native paths cached from one traversal must not carry its bindings into a new context.
for (const edit of ['rename parameter', 'move declaration']) runBoth(`source path current context/${ edit }`,
  'export function read(local) { const box = { first: globalThis, second: globalThis }; return box; } function other(globalThis) { return box; }',
  (parser, program, label) => {
    const fn = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'read');
    const other = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'other');
    const [declaration] = fn.node.body.body;
    const [first, second] = declaration.declarations[0].init.properties.map(property => property.value);
    const cold = pathOfNode(program, first);
    check(`${ label } begins at the original realm binding`, bindingLoopAnchor(cold.scope.getBinding('globalThis')).decl, null);
    if (edit === 'rename parameter') fn.node.params[0].name = 'globalThis';
    else {
      fn.node.body.body.shift();
      other.node.body.body.unshift(declaration);
    }
    program.scope.crawl();
    const current = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === (edit === 'rename parameter' ? 'read' : 'other'));
    const literal = current.get('body').get('body')[0].get('declarations')[0].get('init');
    const native = literal.get('properties')[0].get('value');
    const anchor = edit === 'move declaration' ? literal : current;
    const currentRoot = current.parentPath.node.type === 'ExportNamedDeclaration' ? current.parentPath.parentPath : current.parentPath;
    check(`${ label } keeps the original reference node`, native.node, first);
    check(`${ label } native scope sees the parameter`, bindingLoopAnchor(native.scope.getBinding('globalThis')).decl, current.node.params[0]);
    const known = pathOfNode(anchor, first);
    check(`${ label } cached source path sees the parameter`, bindingLoopAnchor(known?.scope.getBinding('globalThis')).decl, current.node.params[0]);
    check(`${ label } uncached sibling descends through current paths`,
      bindingLoopAnchor(pathOfNode(edit === 'move declaration' ? literal : currentRoot, second)?.scope.getBinding('globalThis')).decl, current.node.params[0]);
    const lookup = lookupReadPath(current.get('body').get('body')[1].get('argument'), first);
    check(`${ label } apart read uses the current frame`, bindingLoopAnchor(lookup.scope.getBinding('globalThis')).decl, current.node.params[0]);
  });

// Every delayed alias write resolves the value in its current frame in both usage modes.
for (const method of ['usage-global', 'usage-pure']) runBoth(`realm alias after source scope rebuild/${ method }`,
  'export function read(local) { let realm; realm = globalThis; return realm.Array; }', (parser, program, label) => {
    function makeAdapter() { return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method }); }
    function realm(path) {
      return withCanonQuestion(() => proxyGlobalRootName({ node: path.node, path, scope: path.scope, adapter: makeAdapter() }));
    }
    const fn = parser.pickPath(program, 'FunctionDeclaration');
    const before = fn.get('body').get('body')[2].get('argument').get('object');
    check(`${ label } initially reaches the realm`, realm(before), 'globalThis');
    check(`${ label } initial warm query reaches the realm`, realm(before), 'globalThis');
    fn.node.params[0].name = 'globalThis';
    program.scope.crawl();
    const current = parser.pickPath(program, 'FunctionDeclaration');
    const after = current.get('body').get('body')[2].get('argument').get('object');
    check(`${ label } native binding is the user parameter`, bindingLoopAnchor(after.scope.getBinding('globalThis')).decl, current.node.params[0]);
    check(`${ label } the rewritten frame no longer names the realm`, realm(after), null);
  });

// Live-path checks share a deep ancestor suffix only within the current read-only question.
for (const width of [16, 32]) runBoth(`source path shared ancestry/${ width }`, (() => {
  let source = `function nested(globalThis) { const box = { ${ Array.from({ length: width }, (unused, index) => `k${ index }: globalThis`).join(', ') } }; }`;
  for (let index = 0; index < 32; index++) source = `function outer${ index }() { ${ source } }`;
  return source;
})(), (parser, program, label) => {
  const fn = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'outer31');
  let nested = fn;
  for (let index = 0; index < 32; index++) [nested] = nested.get('body').get('body');
  const paths = nested.get('body').get('body')[0].get('declarations')[0].get('init').get('properties').map(property => property.get('value'));
  const { type } = fn.node;
  let reads = 0;
  Object.defineProperty(fn.node, 'type', { configurable: true, get() {
    reads++;
    return type;
  } });
  withCanonQuestion(() => {
    check(`${ label } cold paths stay live`, paths.every(path => !ancestorChainDetached(path)), true);
    const coldReads = reads;
    check(`${ label } validates the actual ancestor`, coldReads > 0, true);
    for (let round = 0; round < 4; round++) {
      check(`${ label } warm paths stay live`, paths.every(path => !ancestorChainDetached(path)), true);
    }
    check(`${ label } warm checks reuse the ancestor suffix`, reads, coldReads);
  });
  const previous = reads;
  check(`${ label } a new question validates again`, withCanonQuestion(() => ancestorChainDetached(paths[0])), false);
  check(`${ label } no ancestry answer survives the question`, reads > previous, true);
  fn.node.body.body.shift();
  check(`${ label } a later rewrite retires the cached ancestry`, withCanonQuestion(() => ancestorChainDetached(paths[0])), true);
});

// A native replacement can reuse its Path for another node; the old key owns no such answer.
runBoth('source path cache keeps exact payload identity', 'const value = globalThis;', (parser, program, label) => {
  const init = parser.pickPath(program, 'VariableDeclarator').get('init');
  const original = init.node;
  check(`${ label } initial source identity`, pathOfNode(init, original)?.node, original);
  const replacement = { ...original };
  init.replaceWith(replacement);
  const current = init.parentPath.get('init');
  check(`${ label } current native slot retains the replacement`, current.node, replacement);
  check(`${ label } replaced source node has no path`, pathOfNode(current, original) === null, true);
  check(`${ label } replacement gets its own path`, pathOfNode(current, replacement)?.node, replacement);
});

// A cold source-node lookup owns a read-only question even when its caller has none.
// Shared cached ancestors must not turn the next sibling's descent into a quadratic walk.
for (const depth of [16, 32]) for (const width of [16, 32]) runBoth(`source path cold outside question/${ depth }/${ width }`, (() => {
  let source = `function nested(globalThis) { const box = { ${ Array.from({ length: width }, (unused, index) => `k${ index }: globalThis`).join(', ') } }; }`;
  for (let index = 0; index < depth; index++) source = `function outer${ index }() { ${ source } }`;
  return source;
})(), (parser, program, label) => {
  const functions = parser.collectPaths(program, 'FunctionDeclaration');
  const root = functions.find(path => path.node.id.name === `outer${ depth - 1 }`);
  const nested = functions.find(path => path.node.id.name === 'nested');
  const literal = nested.get('body').get('body')[0].get('declarations')[0].get('init');
  const values = literal.node.properties.map(property => property.value);
  const descriptors = functions.map(path => Object.getOwnPropertyDescriptor(path.node, 'type'));
  let reads = 0;
  functions.forEach((path, index) => Object.defineProperty(path.node, 'type', {
    configurable: descriptors[index].configurable, enumerable: descriptors[index].enumerable,
    get() {
      reads++;
      return descriptors[index].value;
    },
  }));
  try {
    check(`${ label } live ancestry control`, ancestorChainDetached(literal), false);
    check(`${ label } positive counter sees the actual ancestry`, reads >= depth, true);
    reads = 0;
    check(`${ label } source identities remain exact`, values.every(value => pathOfNode(root, value)?.node === value), true);
    check(`${ label } cold lookup reads actual ancestors`, reads > 0, true);
    check(`${ label } cold source work is linear in width and depth`, reads <= 12 * width * (depth + 1), true);
    root.node.body.body.shift();
    check(`${ label } a new lookup observes the rewrite`, pathOfNode(root, values[0]) === null, true);
  } finally {
    functions.forEach((path, index) => Object.defineProperty(path.node, 'type', descriptors[index]));
  }
});

finish();
