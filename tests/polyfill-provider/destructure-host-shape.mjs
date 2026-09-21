// Cross-parser tests for `destructure-host-shape`. The classifier operates on raw
// AST nodes - parent + host pair for `isBodylessStatementSlot`, declaration +
// declarationParent for `classifyVariableDeclarationHost`. Both parsers must produce
// the same booleans because the strategy planner is shared between babel-plugin and
// unplugin (decision tree is plugin-specific, the underlying facts are not).
import {
  capturedRealmCtorPure,
  classifyVariableDeclarationHost,
  isBodylessStatementSlot,
  isForInitDeclaration,
  isLoopStatement,
  peelLabeledStatements,
  planArrayWrapperCapture,
  planMinifierSequenceSplit,
  planNestedKeyedPatternCapture,
  planRetainedObjectCapture,
  renderArrayWrapperCapture,
  renderNestedKeyedPatternCapture,
  renderRetainedObjectCapture,
} from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { createChecker } from './harness.mjs';
import { hasObjectRestAncestor, isCapturedKeyedPattern } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { buildDestructuringInitMeta, destructureKeyReadPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { resolvePolyfillableStaticProp } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { hostSlot, identifier, renderInstanceDefaultGuard } from '../../packages/core-js-polyfill-provider/render.js';

import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { handleMemberExpressionNode } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { hasConstructorEntry, resolve } from '../../packages/core-js-polyfill-provider/index.js';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-host-shape');

for (const [name, pure, global] of [
  ['Promise', true, true], ['Map', true, true], ['ArrayBuffer', false, true],
  ['Array', false, false], ['Object', false, false], ['Reflect', false, false],
]) {
  check(`${ name } pure constructor availability`, hasConstructorEntry(name), pure);
  check(`${ name } global constructor availability`, hasConstructorEntry(name, 'global'), global);
}

for (const method of ['usage-global', 'usage-pure']) for (const [source, claimed] of [
  ['import P from "@core-js/pure/actual/promise"; P.all;', false],
  ['const P = require("@core-js/pure/actual/promise"); P.all;', false],
  ['import P from "@core-js/pure/actual/promise"; Promise.all;', true],
  ['import P from "@core-js/pure/actual/promise"; let R = P; R = Promise; R.all;', true],
  ['import P from "@core-js/pure/actual/promise"; const R = (effect(), P); R.all;', false],
  ['import P from "@core-js/pure/actual/promise/constructor"; P.all;', method === 'usage-pure'],
  ['import P from "@core-js/pure/actual/promise"; function f(P) { P.all; }', false],
]) runBoth(`constructor index already supplies its statics/${ method }`, source, (parser, program, label) => {
  const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'all');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  const meta = handleMemberExpressionNode({ node: usage.node, scope: usage.scope, path: usage, adapter,
    handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(), resolvePure: resolve });
  check(label, meta?.placement === 'static' && meta.object === 'Promise', claimed);
});

for (const method of ['usage-global', 'usage-pure']) for (const [source, claimed] of [
  ['import P from "@core-js/pure/actual/promise"; const { all } = P;', false],
  ['const P = require("@core-js/pure/actual/promise"); const { all } = P;', false],
  ['import P from "@core-js/pure/actual/promise"; const R = (effect(), P); const { all } = R;', false],
  ['import P from "@core-js/pure/actual/promise/constructor"; const { all } = P;', method === 'usage-pure'],
  ['import P from "@core-js/pure/actual/promise"; const { all } = Promise;', true],
]) runBoth(`constructor index supplies destructured statics/${ method }`, source, (parser, program, label) => {
  const usage = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  const meta = buildDestructuringInitMeta({ initNode: usage.node.init, key: 'all', scope: usage.scope, path: usage, adapter });
  check(label, meta?.placement === 'static' && meta.object === 'Promise', claimed);
});

for (const method of ['usage-global', 'usage-pure']) {
  for (const entry of ['promise', 'promise/constructor']) for (const receiver of ['P', 'R', 'f()', 'box.P', 'list[0]', 'g().P']) {
    runBoth(`pure import receiver provenance/${ method }/${ entry }/${ receiver }`,
      `import P from "@core-js/pure/actual/${ entry }";
       const R = P, box = { P }, list = [P]; function f() { return P; } function g() { return { P }; } ${ receiver }.all;`,
      (parser, program, label) => {
        const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'all');
        const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
        const meta = handleMemberExpressionNode({ node: usage.node, scope: usage.scope, path: usage, adapter,
          handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(), resolvePure: resolve });
        check(label, meta?.placement === 'static' && meta.object === 'Promise',
          method === 'usage-pure' && entry === 'promise/constructor');
      });
  }
}

for (const method of ['usage-global', 'usage-pure']) for (const key of ['at', 'name']) {
  runBoth(`pure constructor keeps function instance typing/${ method }/${ key }`,
    `import P from "@core-js/pure/actual/promise/constructor"; const box = { P }; box.P.${ key };`,
    (parser, program, label) => {
      const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === key);
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
      const meta = handleMemberExpressionNode({ node: usage.node, scope: usage.scope, path: usage, adapter,
        handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(), resolvePure: resolve });
      check(label, meta?.receiverHint, 'function');
    });
}

for (const [source, retained] of [['Promise', false], ['Source', true]]) {
  runBoth(`constructor rest keeps its local source/${ source }`, `const Source = Promise; const { all, ...rest } = ${ source };`,
    (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const plan = planRetainedObjectCapture({
        pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], hostPath: host, adapter,
        kind: 'static', meta: { object: 'Promise', key: 'all', placement: 'static' },
        resolvePure: () => ({ entry: 'promise', hintName: 'Promise' }),
      });
      check(`${ label } constructor index`, plan?.restPure?.entry, 'promise');
      check(`${ label } local source`, !!plan?.restSource, retained);
    });
}

for (const source of [
  'const { w: { entries } } = { w: flag ? Object : user };',
  'const [{ w: { entries } }] = [{ w: flag ? Object : user }];',
  'const { w: [{ entries }] } = { w: [flag ? Object : user] };',
]) runBoth('retained mixed-key capture crosses object and array levels', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator');
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => p.node.key.name === 'entries').node;
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, prop, meta: { key: 'entries', guardedAliasHint: 'Object' },
    resolvePure: () => ({}), planGuardedNarrow: () => ({ instanceFallback: { kind: 'instance' } }),
  });
  let leaf = plan;
  while (leaf?.innerPlan || leaf?.elementPlan) leaf = leaf.innerPlan ?? leaf.elementPlan;
  check(label, leaf?.narrow?.instanceFallback.kind, 'instance');
});

for (const claimed of [false, true]) runBoth('queued consumption retires a quiet sibling hop',
  'const { w: { values }, y: { at } } = receiver;', (adapter, program, label) => {
    const host = adapter.pickPath(program, 'VariableDeclarator');
    const [first, second] = host.node.id.properties;
    const [consumed] = first.value.properties;
    const plan = planRetainedObjectCapture({
      pattern: host.node.id, init: host.node.init, prop: second.value.properties[0],
      isConsumedProp: item => claimed && item === consumed,
    });
    check(label, !!plan, !claimed);
  });

for (const [name, entry, anchored] of [
  ['Promise', 'promise', true], ['Map', 'map', true],
  ['Array', 'array', false], ['Object', 'object', false],
  ['Reflect', 'reflect/namespace', false], ['ArrayBuffer', 'array-buffer/constructor', false],
]) for (const rest of ['', ', ...rest']) {
  runBoth('captured rest requires a pure constructor entry',
    `const { ${ name }: { method${ rest } } } = globalThis;`, (adapter, program, label) => {
      const host = adapter.pickPath(program, 'VariableDeclarator');
      const capture = planNestedKeyedPatternCapture({ pattern: host.node.id, init: host.node.init, force: !rest });
      const pure = { entry, hintName: name };
      const anchorPure = capturedRealmCtorPure({
        capture, scope: host.scope, path: host,
        adapter: { hasBinding: () => false, getBinding: () => null, isMutatedStatic: () => false },
        resolveGlobalPolyfill: () => pure,
      });
      check(`${ label }: ${ name }`, anchorPure, !rest || anchored ? pure : null);
      const rendered = renderNestedKeyedPatternCapture(capture, {
        mintRef: () => '_held', anchorPure, injectImport: () => '_Constructor',
      });
      checkDeep(`${ label }: ${ name } source`, rendered.capture.init,
        anchorPure ? identifier('_Constructor') : host.node.init);
    });
}

for (const [source, expected, mutated = false] of [
  ['const { from, of, ...rest } = Array;', true],
  ['const { "from": from, "of": of, ...rest } = Array;', true],
  ['const { [(effect(), "from")]: from, [(effect(), "isArray")]: check, ...rest } = Array;', true],
  ['const { from, unknown, ...rest } = Array;', false],
  ['const { from, isArray, ...rest } = Array;', false, true],
  ['const { from, ...rest } = custom;', false],
]) runBoth('static rest capture admission', source, (adapter, program, label) => {
  const host = adapter.pickPath(program, 'VariableDeclarator');
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], hostPath: host,
    kind: 'static', adapter: {
      hasBinding: () => false, getBinding: () => null, isMutatedStatic: () => mutated,
      isStringLiteral: node => node.type === 'StringLiteral' || node.type === 'Literal' && typeof node.value === 'string',
      getStringValue: node => node.value,
    },
    resolvePure: meta => meta.object === 'Array' && ['from', 'of'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
    resolveStaticProp: resolvePolyfillableStaticProp,
  });
  check(label, !!plan, expected);
  if (!plan) return;
  const rendered = renderRetainedObjectCapture(plan, {
    mintRef: () => 'memo', injectImport: entry => entry.replace('/', '$'),
  });
  const exclusions = rendered.declarations.at(-1).id.properties.slice(0, -1);
  for (const [index, exclusion] of exclusions.entries()) {
    const sourceProp = host.node.id.properties[index];
    check(`${ label }/exclusion is not computed`, exclusion.computed, false);
    if (sourceProp.computed) {
      check(`${ label }/computed exclusion uses the folded key`, exclusion.key.type, 'Literal');
    } else {
      checkDeep(`${ label }/plain exclusion preserves key spelling`, exclusion.key, sourceProp.key);
      check(`${ label }/plain exclusion owns its key`, exclusion.key === sourceProp.key, false);
    }
  }
});

for (const [source, expected, kind = 'static'] of [
  ['const { [Symbol.iterator]: iter, Map: { custom }, ...rest } = globalThis;', false, 'instance'],
  ['const { Array: { from }, [Symbol.iterator]: iter, ...rest } = globalThis;', false],
  ['const { from, [Symbol.iterator]: iter, ...rest } = Array;', false],
  ['const { [Symbol.iterator]: iter, from, ...rest } = Array;', false],
  ['const { from, [Symbol.iterator]: iter } = Array;', false],
  ['const key = Symbol.iterator; const { Array: { from }, [key]: iter, ...rest } = globalThis;', false],
  ['const { Array: { from }, other, ...rest } = globalThis;', false],
  ['const { Array: { from }, [Symbol.iterator]: iter } = globalThis;', false],
  ['const Symbol = { iterator: "x" }; const { Array: { from }, [Symbol.iterator]: iter, ...rest } = globalThis;', false],
]) runBoth('retained static and iterator/rest bail', source, (adapter, program, label) => {
  const host = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
  const bindingAdapter = {
    isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
    getStringValue: node => node.value,
    hasBinding: (scope, name) => !!scope?.getBinding(name),
    getBinding: (scope, name) => scope?.getBinding(name),
    method: 'usage-pure',
  };
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, hostPath: host, adapter: bindingAdapter,
    resolveNodeType: adapter.makeResolver().resolveNodeType, kind,
  });
  check(label, !!plan, expected);
});

runBoth('retained static capture through an array element path',
  'const [{ from, [Symbol.iterator]: iter, ...rest }] = [Array];', (adapter, program, label) => {
    const host = adapter.pickPath(program, 'VariableDeclarator');
    const [pattern] = host.get('id').get('elements');
    const bindingAdapter = {
      isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
      getStringValue: node => node.value,
      hasBinding: (scope, name) => !!scope?.getBinding(name),
      getBinding: (scope, name) => scope?.getBinding(name),
      method: 'usage-pure',
    };
    const plan = planRetainedObjectCapture({
      pattern: pattern.node, patternPath: pattern, init: host.node.init.elements[0], hostPath: host,
      adapter: bindingAdapter, resolveNodeType: adapter.makeResolver().resolveNodeType, kind: 'static',
    });
    check(label, !!plan, false);
  });

for (const [key, kind] of [['of', 'static'], ['Set', 'global']]) {
  runBoth(`static beside iterator pattern/${ kind }`, `const { ${ key }, [Symbol.iterator]: { name } } = source;`,
    (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator');
      const plan = planRetainedObjectCapture({
        pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], hostPath: host, kind,
        adapter: {
          isStringLiteral: node => node.type === 'StringLiteral' || node.type === 'Literal' && typeof node.value === 'string',
          getStringValue: node => node.value,
          hasBinding: (scope, name) => !!scope?.getBinding(name),
          getBinding: (scope, name) => scope?.getBinding(name),
          method: 'usage-pure',
        },
        resolveNodeType: parser.makeResolver().resolveNodeType,
      });
      check(`${ label }: import is a value, not an instance dispatcher`, plan?.retainedStatic, true);
    });
}

for (const [pattern, expected] of [
  ['{ w: { at }, ...rest }', false],
  ['{ w: { at, other }, ...rest }', false],
  ['{ w: { at = fallback }, ...rest }', false],
]) runBoth('nested instance assignment/rest capture', `(${ pattern } = source);`, (adapter, program, label) => {
  const host = adapter.pickPath(program, 'AssignmentExpression').node;
  const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key.name === 'at').node;
  const plan = planRetainedObjectCapture({ pattern: host.left, init: host.right, assignment: true, prop });
  check(label, !!plan?.nested, expected);
});

for (const [label, source, expected] of [
  ['direct declaration', 'const { at: method, ...rest } = source;', true],
  ['assignment', '({ at: method, ...rest } = source);', true],
  ['nested leaf', 'const { w: { at: method, ...rest }, after } = source;', true],
  ['outer rest', 'const { w: { at: method }, ...rest } = source;', true],
  ['array wrapper', 'const [{ at: method, ...rest }, other] = source;', true],
  ['defaulted wrapper', 'const { w: { at: method } = fallback, ...rest } = source;', true],
  ['parameter', 'function read({ at: method, ...rest } = source) {}', true],
  ['catch', 'try {} catch ({ at: method, ...rest }) {}', true],
  ['loop', 'for (const { at: method, ...rest } of source) {}', true],
  ['nested rest sibling', 'const { at: method, w: { ...rest } } = source;', false],
  ['array rest', 'const [{ at: method }, ...rest] = source;', false],
  ['rest parameter', 'function read(...args) { const { at: method } = args; }', false],
  ['computed-key expression', 'const { [(() => { const { at: method } = xs; return method; })()]: value, ...rest } = source;', false],
  ['default expression', 'const { value = (() => { const { at: method } = xs; return method; })(), ...rest } = source;', false],
]) runBoth(`object-rest extraction boundary/${ label }`, source, (adapter, program, parser) => {
  const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.node.value?.name === 'method');
  check(parser, hasObjectRestAncestor(prop), expected);
});

for (const [key, entry, expected] of [
  ['"at"', 'actual/instance/at', true],
  ['Symbol.iterator', 'get-iterator-method', false],
]) runBoth(`nested assignment capture/${ entry }`, `({ w: { [(effect(), ${ key })]: method } } = source);`,
  (adapter, program, label) => {
    const host = adapter.pickPath(program, 'AssignmentExpression').node;
    const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.value?.name === 'method').node;
    const plan = planRetainedObjectCapture({ pattern: host.left, init: host.right, assignment: true, prop, entry });
    check(`${ label }: ordinary instance capture`, !!plan?.capture, expected);
  });

for (const [source, expected] of [
  ['const { [(key(), "at")]: method = fallback, after } = input;', true],
  ['const { [(key(), "at")]: method = fallback, ...rest } = input;', false],
  ['const { [(key(), "at")]: method, after } = input;', false],
  ['const { w: { [(key(), "at")]: method = fallback }, after } = input;', false],
]) runBoth('keyed default/single read boundary', source, (adapter, program, label) => {
  const path = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property', node => node.node.computed);
  check(label, destructureKeyReadPlan(path)?.consumeKey, expected);
});

for (const [source, named] of [
  ['function () {}', true], ['() => 1', true], ['function* () {}', true], ['class {}', true],
  ['function own() {}', false], ['eval("local")', false],
]) runBoth('default guard/inferred binding name', `const method = ${ source };`, (adapter, program, label) => {
  const { init } = adapter.pickPath(program, 'VariableDeclarator').node;
  const guard = renderInstanceDefaultGuard({
    assignedRef: identifier('memo'), call: identifier('read'), reread: identifier('memo'),
    defaultValue: hostSlot(init), defaultName: 'method',
  });
  check(`${ label }/name preservation`, guard.consequent.type === 'MemberExpression', named);
  if (named) check(`${ label }/source binding name`, guard.consequent.property.value, 'method');
});

// --- isBodylessStatementSlot ---

// IfStatement consequent slot (unbraced single-statement body)
runBoth('isBodylessStatementSlot/IfStatement consequent', 'if (cond) call();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.consequent), true);
});

// IfStatement alternate slot (unbraced else body)
runBoth('isBodylessStatementSlot/IfStatement alternate', 'if (cond) a(); else b();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.alternate), true);
});

// IfStatement with braced consequent: BlockStatement is in the slot but classifier
// returns TRUE because slot membership is by identity, not by node type
runBoth('isBodylessStatementSlot/IfStatement braced consequent (still slot)', 'if (cond) { call(); }', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.consequent), true);
});

// WhileStatement body slot
runBoth('isBodylessStatementSlot/WhileStatement body', 'while (cond) call();', (adapter, prog, lbl) => {
  const whilePath = adapter.pickPath(prog, 'WhileStatement');
  check(lbl, isBodylessStatementSlot(whilePath.node, whilePath.node.body), true);
});

// DoWhileStatement body slot
runBoth('isBodylessStatementSlot/DoWhileStatement body', 'do call(); while (cond);', (adapter, prog, lbl) => {
  const doPath = adapter.pickPath(prog, 'DoWhileStatement');
  check(lbl, isBodylessStatementSlot(doPath.node, doPath.node.body), true);
});

// ForStatement body slot
runBoth('isBodylessStatementSlot/ForStatement body', 'for (;;) call();', (adapter, prog, lbl) => {
  const forPath = adapter.pickPath(prog, 'ForStatement');
  check(lbl, isBodylessStatementSlot(forPath.node, forPath.node.body), true);
});

// ForInStatement body slot
runBoth('isBodylessStatementSlot/ForInStatement body', 'for (const k in obj) call();', (adapter, prog, lbl) => {
  const forIn = adapter.pickPath(prog, 'ForInStatement');
  check(lbl, isBodylessStatementSlot(forIn.node, forIn.node.body), true);
});

// ForOfStatement body slot
runBoth('isBodylessStatementSlot/ForOfStatement body', 'for (const x of arr) call();', (adapter, prog, lbl) => {
  const forOf = adapter.pickPath(prog, 'ForOfStatement');
  check(lbl, isBodylessStatementSlot(forOf.node, forOf.node.body), true);
});

// LabeledStatement body slot
runBoth('isBodylessStatementSlot/LabeledStatement body', 'lbl: call();', (adapter, prog, lbl) => {
  const labeled = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, isBodylessStatementSlot(labeled.node, labeled.node.body), true);
});

// ArrowFunctionExpression body slot (single-expression body)
runBoth('isBodylessStatementSlot/ArrowFunctionExpression body', 'const f = () => call();', (adapter, prog, lbl) => {
  const arrow = adapter.pickPath(prog, 'ArrowFunctionExpression');
  check(lbl, isBodylessStatementSlot(arrow.node, arrow.node.body), true);
});

// non-host parent: BlockStatement is NOT a body-slot host type, returns false
runBoth('isBodylessStatementSlot/BlockStatement parent returns false', 'if (cond) { foo(); }', (adapter, prog, lbl) => {
  const block = adapter.pickPath(prog, 'BlockStatement');
  check(lbl, isBodylessStatementSlot(block.node, block.node.body[0]), false);
});

// non-matching position: IfStatement test slot (not consequent/alternate)
runBoth('isBodylessStatementSlot/IfStatement test (not slot)', 'if (cond) call();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.test), false);
});

// no parent: null returns false (defensive)
check('isBodylessStatementSlot/null parent', isBodylessStatementSlot(null, { type: 'CallExpression' }), false);

// --- classifyVariableDeclarationHost ---

// plain top-level declaration: no special flags
runBoth('classifyVariableDeclarationHost/top-level single decl', 'const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// multi-declarator: isMultiDecl=true
runBoth('classifyVariableDeclarationHost/multi-decl', 'let a, b, c;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: true });
});

// export wrapper: isExport=true, isBodyless suppressed even though export hosts decl
runBoth('classifyVariableDeclarationHost/export named', 'export const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: true, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// for-init slot: isForInit=true, isBodyless suppressed (different shape concern)
runBoth('classifyVariableDeclarationHost/for-init', 'for (let i = 0; i < n; i++) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: false });
});

// bodyless host: declaration in unbraced if body
runBoth('classifyVariableDeclarationHost/bodyless if', 'if (cond) var x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: false });
});

// bodyless + multi-decl
runBoth('classifyVariableDeclarationHost/bodyless multi-decl', 'while (cond) var a = 1, b = 2;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: true });
});

// for-init multi-decl: isMultiDecl + isForInit
runBoth('classifyVariableDeclarationHost/for-init multi-decl', 'for (let i = 0, j = 1; i < n; i++) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: true });
});

// `for-in` init: classifier returns isForInit=false because parent.type is ForInStatement,
// not ForStatement - the helper specifically checks ForStatement.init slot
runBoth('classifyVariableDeclarationHost/for-in init not isForInit', 'for (var k in obj) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// --- isLoopStatement (element-wise over the closed loop-type domain, both parsers) ---

const LOOP_SOURCES = [
  ['ForStatement', 'for (;;) call();'],
  ['ForInStatement', 'for (const k in obj) call();'],
  ['ForOfStatement', 'for (const x of arr) call();'],
  ['WhileStatement', 'while (cond) call();'],
  ['DoWhileStatement', 'do call(); while (cond);'],
];
for (const [type, src] of LOOP_SOURCES) {
  runBoth(`isLoopStatement/${ type }`, src, (adapter, prog, lbl) => {
    check(lbl, isLoopStatement(adapter.pickPath(prog, type).node), true);
  });
}

// negatives: non-loop statements, a label WRAPPING a loop (the wrapper is not the loop),
// and null-safety
runBoth('isLoopStatement/IfStatement negative', 'if (cond) call();', (adapter, prog, lbl) => {
  check(lbl, isLoopStatement(adapter.pickPath(prog, 'IfStatement').node), false);
});
runBoth('isLoopStatement/LabeledStatement wrapper negative', 'outer: for (;;) call();', (adapter, prog, lbl) => {
  const label = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, isLoopStatement(label.node), false);
  check(lbl, isLoopStatement(label.node.body), true);
  check(lbl, isLoopStatement(null), false);
});

// --- peelLabeledStatements ---

// a stacked label chain peels to the innermost hosted statement - the loop three labels down
runBoth('peelLabeledStatements/stacked labels reach the loop', 'a: b: c: for (;;) call();', (adapter, prog, lbl) => {
  const outer = adapter.pickPath(prog, 'LabeledStatement');
  const peeled = peelLabeledStatements(outer.node);
  check(lbl, isLoopStatement(peeled), true);
  check(lbl, peeled.type === 'ForStatement', true);
});

// a non-labeled node is identity; a single label peels one level
runBoth('peelLabeledStatements/identity and single level', 'x: call();', (adapter, prog, lbl) => {
  const label = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, peelLabeledStatements(label.node).type === 'ExpressionStatement', true);
  check(lbl, peelLabeledStatements(label.node.body) === label.node.body, true);
});

// --- classifyVariableDeclarationHost: the three shapes are mutually exclusive ---

// the classifier used to gate `isBodyless` on `!isExport && !isForInit`. that gate is subsumed by
// the slot test itself: an export wrapper hosts no statement slot, and a for-INIT declaration sits
// in `init`, never in `body`. enumerate the three hosts plus a plain block so a future slot-table
// widening cannot silently make two of them true at once
for (const [label, code, pick, expected] of [
  ['export wrapper', 'export const { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: true, isForInit: false, isBodyless: false }],
  ['for-init slot', 'for (const { from } = Array; ; ) call();',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: true, isBodyless: false }],
  ['unbraced if consequent', 'if (cond) var { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: true }],
  ['plain block statement', '{ var { from } = Array; }',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: false }],
  ['unbraced for body', 'for (;;) var { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: true }],
]) {
  runBoth(`classifyVariableDeclarationHost/${ label }`, code, (adapter, prog, lbl) => {
    const declPath = pick(adapter, prog);
    const shape = classifyVariableDeclarationHost({
      declaration: declPath.node, declarationParent: declPath.parentPath.node,
    });
    check(`${ lbl }/isExport`, shape.isExport, expected.isExport);
    check(`${ lbl }/isForInit`, shape.isForInit, expected.isForInit);
    check(`${ lbl }/isBodyless`, shape.isBodyless, expected.isBodyless);
    check(`${ lbl }/at most one shape`,
      [shape.isExport, shape.isForInit, shape.isBodyless].filter(Boolean).length <= 1, true);
  });
}

// the standalone for-init canon answers the same question the classifier reports, so the emitters
// can consult either without drifting - and the for-BODY slot is NOT the init slot
runBoth('isForInitDeclaration/init vs body slot', 'for (var { from } = Array; ;) var { of } = Array;',
  (adapter, prog, lbl) => {
    const [head, body] = adapter.collectPaths(prog, 'VariableDeclaration', () => true);
    check(`${ lbl }/init`, isForInitDeclaration(head.parentPath.node, head.node), true);
    check(`${ lbl }/body`, isForInitDeclaration(body.parentPath.node, body.node), false);
  });

for (const source of [
  'const [{ inner: { [(key(), "flat")]: method } }] = [box];',
  'const [{ y: { at, ...rest } }] = source;',
]) {
  runBoth('array wrapper capture/retained key or rest keeps native iteration', source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const restPattern = pattern.elements[0].properties[0].value;
    const plan = planArrayWrapperCapture({ pattern, init, force: true, restPattern });
    check(`${ lbl }/capture selected`, !!plan, true);
    if (!plan) return;
    const rendered = renderArrayWrapperCapture(plan, { mintRef: () => 'memo' });
    check(`${ lbl }/initializer is evaluated once`, rendered.capture.init === init, true);
    check(`${ lbl }/iteration remains native`, rendered.capture.id.type, 'ArrayPattern');
    check(`${ lbl }/nested pattern retains its keys and rest`, rendered.elements[0].declarator.id === pattern.elements[0], true);
  });
}

runBoth('retained assignment capture/one computed slot keeps its read in order',
  '({ [(key(), "at")]: method } = source);', (adapter, prog, lbl) => {
    const { left: pattern, right: init } = adapter.pickPath(prog, 'AssignmentExpression').node;
    const plan = planRetainedObjectCapture({ pattern, init, assignment: true, prop: pattern.properties[0] });
    check(`${ lbl }/a sole computed slot needs capture`, !!plan, true);
  });

for (const source of [
  'const held = ({ of } = Array);',
  'const held = (before(), ({ of } = Array));',
  'if (yes) ({ of } = Array);',
  'label: ({ of } = Array);',
]) runBoth('ordered assignment capture/preserves the RHS identity', source, (adapter, prog, lbl) => {
  const host = adapter.pickPath(prog, 'AssignmentExpression');
  const { left: pattern, right: init } = host.node;
  const plan = planRetainedObjectCapture({ pattern, init, assignment: true, prop: pattern.properties[0],
    hostPath: host, kind: 'static', adapter: { hasBinding: () => false },
    resolveStaticProp: () => ({ pure: { kind: 'static', entry: 'actual/array/of', hintName: 'Array$of' } }) });
  check(`${ lbl }/plans`, !!plan, true);
  const rendered = renderRetainedObjectCapture(plan, {
    mintDeclaredRef: () => 'memo', injectImport: () => 'ofImport',
  });
  const { expressions } = rendered.expression;
  check(`${ lbl }/RHS evaluates first`, expressions[0].right === init, true);
  check(`${ lbl }/the claim follows`, expressions[1].right.name, 'ofImport');
  check(`${ lbl }/the result is the captured receiver`, expressions.at(-1).name, 'memo');
});

runBoth('array wrapper capture/effects before a nested pattern and its sibling',
  'for (let [, [{ w: { values }, y: { at } }], { z }] = [eff(), [r], other]; ;) {}',
  (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planArrayWrapperCapture({ pattern, init });
    checkDeep(`${ lbl }/source positions`, plan.elements.map(element => element.path), [[1, 0], [2]]);
    let refs = 0;
    const rendered = renderArrayWrapperCapture(plan, { mintRef: () => `memo${ ++refs }` });
    check(`${ lbl }/initializer evaluates once in the capture`, rendered.capture.init === init, true);
    check(`${ lbl }/leading elision survives`, rendered.capture.id.elements[0], null);
    check(`${ lbl }/nested iteration survives`, rendered.capture.id.elements[1].elements[0].name, 'memo1');
    check(`${ lbl }/sibling position survives`, rendered.capture.id.elements[2].name, 'memo2');
    checkDeep(`${ lbl }/source order`, rendered.elements.map(element => element.declarator.init.name), ['memo1', 'memo2']);
    check(`${ lbl }/first pattern keeps its source identity`, rendered.elements[0].declarator.id === pattern.elements[1].elements[0], true);
    check(`${ lbl }/sibling pattern keeps its source identity`, rendered.elements[1].declarator.id === pattern.elements[2], true);
    check(`${ lbl }/source pattern is untouched`, pattern.elements[1].elements[0].type, 'ObjectPattern');
  });

for (const [label, source] of [
  ['opaque nested element', 'const [{ data: { at: method } }] = [make()];'],
  ['quiet sibling patterns', 'const [{ values }, { at }] = [left, right];'],
  ['trailing effect', 'const [{ values }] = [left, eff()];'],
  ['parenthesized literal', 'const [{ values }] = ([left, eff()]);'],
]) {
  runBoth(`array wrapper capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planArrayWrapperCapture({ pattern, init });
    check(`${ lbl }/capture is required`, !!plan, true);
    let refs = 0;
    const rendered = renderArrayWrapperCapture(plan, {
      mintRef: () => `memo${ ++refs }`,
      embed: node => ({ type: 'Wrapped', node }),
    });
    check(`${ lbl }/initializer crosses the host boundary`, rendered.capture.init.node === init, true);
    check(`${ lbl }/pattern crosses the host boundary`, rendered.elements[0].declarator.id.node === pattern.elements[0], true);
  });
}

for (const [source, expected] of [
  ['const [{ data: { at: method } }] = [make()];', true],
  ['const [{ data: { at: method }, Object: { is } }] = [make()];', false],
  ['const [{ data: { at: method } }] = [{ data: make() }];', false],
  ['const [{ data: { at: method } }] = [{ data: make() } as any];', false],
  ['const [{ data: { at: method } }] = [make(), effect()];', false],
  ['const [{ at: method }] = [make()];', false],
]) runBoth('array wrapper capture/one nested declaration claim', source, (adapter, program, label) => {
  const { id: pattern, init } = adapter.pickPath(program, 'VariableDeclarator').node;
  check(label, !!planArrayWrapperCapture({ pattern, init, nestedOnly: true }), expected);
});

for (const [label, source] of [
  ['quiet sole element', 'const [{ values }] = [left];'],
  ['nonliteral initializer', 'const [{ values }, { at }] = source;'],
  ['rest position', 'const [{ values }, ...rest] = [left, eff()];'],
  ['spread position', 'const [{ values }, { at }] = [left, ...source];'],
  ['nested rest position', 'const [[{ values }, ...rest]] = [[left, right], eff()];'],
  ['nested spread position', 'const [[{ values }]] = [[...source], eff()];'],
  ['defaulted element', 'const [{ values } = fallback] = [left, eff()];'],
]) {
  runBoth(`array wrapper capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    check(lbl, planArrayWrapperCapture({ pattern, init }), null);
  });
}

runBoth('array wrapper capture/leaves realm rest to the receiver mirror',
  'const [{ [Symbol.iterator]: iterator, Array: { from }, ...rest }] = [globalThis];',
  (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    check(lbl, planArrayWrapperCapture({ pattern, init, force: true, restPattern: pattern.elements[0], adapter: {} }), null);
  });

runBoth('nested keyed capture/outer keys and source leaf survive',
  'const { [(outer(), "w")]: { middle: { [(inner(), "at")]: method } } } = make();',
  (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    check(`${ lbl }/every outer hop is retained`, plan.ancestors.length, 2);
    check(`${ lbl }/source leaf has not moved`, isCapturedKeyedPattern(plan.leafPattern), false);
    let refs = 0;
    const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => `memo${ ++refs }` });
    check(`${ lbl }/moved leaf retains its coercion obligation`, isCapturedKeyedPattern(plan.leafPattern), true);
    check(`${ lbl }/initializer evaluates once in the capture`, rendered.capture.init === init, true);
    check(`${ lbl }/outer key is retained`, rendered.elements[0].declarator.id.properties[0].key === pattern.properties[0].key, true);
    const guardedInit = rendered.elements[0].declarator.init;
    check(`${ lbl }/null rejection precedes the key`, guardedInit.type, 'ConditionalExpression');
    check(`${ lbl }/guard checks the captured source`, guardedInit.test.right.name, rendered.capture.id.name);
    check(`${ lbl }/inner hop binds the capture`, rendered.elements[1].declarator.id.properties[0].value.name, 'memo1');
    check(`${ lbl }/leaf preserves its source identity`, rendered.elements.at(-1).declarator.id === plan.leafPattern, true);
    check(`${ lbl }/leaf reads the captured receiver`, rendered.elements.at(-1).declarator.init.name, 'memo1');
    check(`${ lbl }/source chain is untouched`, pattern.properties[0].value.properties[0].value.type, 'ObjectPattern');
  });

for (const [label, source] of [
  ['leaf default', 'const { [(outer(), "w")]: { at: method = fallback } } = input;'],
  ['outer key only', 'const { [(outer(), "w")]: { at: method } } = input;'],
  ['leaf key only', 'const { w: { [(inner(), "at")]: method } } = input;'],
  ['outer default', 'const { [(outer(), "w")]: { at: method } = fallback } = input;'],
  ['default under computed key', 'const { before, w: { [(key(), "at")]: method = fallback(), ...rest }, after } = source;'],
  ['leaf rest', 'const { [(outer(), "w")]: { at: method, ...rest } } = input;'],
  ['outer sibling', 'const { [(outer(), "w")]: { at: method }, other } = input;'],
  ['leaf sibling', 'const { [(outer(), "w")]: { at: method, other } } = input;'],
  ['leaf key with inner siblings', 'const { q, p: { [(key(), "flat")]: method, other } } = source;'],
  ['leaf key with outer siblings', 'const { before, w: { [(inner(), "at")]: method }, after } = input;'],
]) {
  runBoth(`nested keyed capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    check(`${ lbl }/capture is required`, !!plan, true);
    const rendered = renderNestedKeyedPatternCapture(plan, {
      mintRef: () => 'memo',
      embed: node => ({ type: 'Wrapped', node }),
    });
    check(`${ lbl }/initializer crosses the host boundary`, rendered.capture.init.node === init, true);
    check(`${ lbl }/leaf crosses the host boundary once`,
      rendered.elements.filter(element => element.declarator.id.node === plan.leafPattern).length, 1);
  });
}

runBoth('nested keyed capture/outer siblings surround the leaf',
  'const { before, w: { [(inner(), "at")]: method }, after } = input;', (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    let refs = 0;
    const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => `memo${ ++refs }` });
    const order = rendered.elements.map(({ declarator }) => declarator.id === plan.leafPattern
      ? 'method' : declarator.id.properties[0].key.name);
    checkDeep(`${ lbl }/binding order`, order, ['before', 'w', 'method', 'after']);
  });

for (const [label, source] of [
  ['direct leaf', 'const { [(inner(), "at")]: method } = input;'],
  ['effect-free keys', 'const { w: { ["at"]: method } } = input;'],
  ['two nested branches', 'const { w: { [(inner(), "at")]: method }, x: { other } } = input;'],
  ['outer rest', 'const { [(outer(), "w")]: { at: method }, ...rest } = input;'],
]) {
  runBoth(`nested keyed capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    check(lbl, planNestedKeyedPatternCapture({ pattern, init }), null);
  });
}

runBoth('nested guarded capture/one receiver supplies the identity test and fallback',
  'const { Q: { of: method } } = source;', (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init, force: true });
    const rendered = renderNestedKeyedPatternCapture(plan, {
      mintRef: () => 'memo',
      narrow: { branches: [{ ctorName: 'Array', staticPure: { kind: 'static', entry: 'array/of', hintName: 'of' } }] },
      injectImport: () => 'pureOf',
    });
    const leaf = rendered.elements[0].declarator;
    check(`${ lbl }/native outer read`, rendered.capture.id.properties[0].value.name, 'memo');
    check(`${ lbl }/source binding`, leaf.id.name, 'method');
    check(`${ lbl }/same receiver in test`, leaf.init.test.left.name, 'memo');
    check(`${ lbl }/same receiver in fallback`, leaf.init.alternate.object.name, 'memo');
    check(`${ lbl }/static import`, leaf.init.consequent.name, 'pureOf');
  });

for (const source of [
  'const { Q: { of: method }, other } = source;',
  'const { Q: { of: method = fallback } } = source;',
  'const { Q: { of: method }, ...rest } = source;',
]) runBoth('nested guarded capture/force keeps the structural exclusions', source, (adapter, prog, lbl) => {
  const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
  check(lbl, planNestedKeyedPatternCapture({ pattern, init, force: true }), null);
});

// --- planMinifierSequenceSplit ---
// the plan both bindings apply: one entry per minifier-sequence statement, one product per
// operand, each product carrying its operand's span. the two parsers differ in what reaches the
// tree (oxc keeps the parens, babel drops them), so the plan is held to the same shape on both

// a statement list: one entry with the list, the statement and its products in operand order,
// every product an ExpressionStatement over the very operand node, spanned like it
runBoth('planMinifierSequenceSplit/list entry', 'const src = [1];\n(eff(), ({ at } = src), use(at));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const [entry] = plan;
  check(`${ lbl }: the entry names the list`, entry.statements, prog.node.body);
  check(`${ lbl }: the entry names the statement`, entry.statement, prog.node.body[1]);
  check(`${ lbl }: one product per operand`, entry.products.length, 3);
  // oxc keeps the statement's parens as a node, babel drops them - the sequence sits under either
  const sequence = entry.statement.expression.type === 'ParenthesizedExpression' ? entry.statement.expression.expression : entry.statement.expression;
  check(`${ lbl }: products are expression statements`, entry.products.every(product => product.type === 'ExpressionStatement'), true);
  check(`${ lbl }: products embed the operands themselves`,
    entry.products.every((product, index) => product.expression === sequence.expressions[index]), true);
  check(`${ lbl }: products carry their operands' spans`,
    entry.products.every(product => product.start === product.expression.start && product.end === product.expression.end), true);
  check(`${ lbl }: no host in a list entry`, entry.host, undefined);
});

// an un-braced control-flow slot: the entry names the host and the key, never a list
runBoth('planMinifierSequenceSplit/slot entry', 'const src = [1];\nif (c) (eff(), ({ at } = src));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const [entry] = plan;
  check(`${ lbl }: the entry names the host`, entry.host, prog.node.body[1]);
  check(`${ lbl }: the entry names the key`, entry.key, 'consequent');
  check(`${ lbl }: the entry names the slot statement`, entry.statement, prog.node.body[1].consequent);
  check(`${ lbl }: no list in a slot entry`, entry.statements, undefined);
  check(`${ lbl }: two products`, entry.products.length, 2);
});

// a nested minifier sequence flattens in the same plan - no second pass over the tree
runBoth('planMinifierSequenceSplit/nested operand flattens', 'const src = [1];\n(a(), (b(), ({ at } = src)), ({ flat } = src));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const spelled = plan[0].products.map(product => {
    const expression = product.expression.type === 'ParenthesizedExpression' ? product.expression.expression : product.expression;
    return expression.type === 'CallExpression' ? expression.callee.name : expression.left.properties[0].key.name;
  });
  check(`${ lbl }: four products in source order`, spelled.join(','), 'a,b,at,flat');
});

// a quiet LITERAL operand leaves no product: the minifier's `0`, a string in any slot (so a
// leading one never reaches the Directive Prologue - cast-wrapped or not, the cast vanishes at
// type-strip). a name may throw and a function carries the author's code: both stay, in order
runBoth('planMinifierSequenceSplit/quiet operands', [
  'const src = [1];',
  '("use strict" as any, 0, null, true, 1n, /re/, ({ at } = src), "later", name, function () {}, use(at));',
].join('\n'), (adapter, prog, lbl) => {
  const [entry] = planMinifierSequenceSplit(prog.node);
  const spelled = entry.products.map(product => {
    const expression = product.expression.type === 'ParenthesizedExpression' ? product.expression.expression : product.expression;
    if (expression.type === 'CallExpression') return expression.callee.name;
    if (expression.type === 'AssignmentExpression') return expression.left.properties[0].key.name;
    return expression.type === 'Identifier' ? expression.name : expression.type;
  });
  check(`${ lbl }: every operand but the literals, in order`, spelled.join(','), 'at,name,FunctionExpression,use');
});

// `embed` wraps every operand for the binding's dialect
runBoth('planMinifierSequenceSplit/embed wraps the operands', 'const src = [1];\n(eff(), ({ at } = src));\n', (adapter, prog, lbl) => {
  const [entry] = planMinifierSequenceSplit(prog.node, { embed: node => ({ type: 'Wrapped', node }) });
  check(`${ lbl }: every operand is wrapped`, entry.products.every(product => product.expression.type === 'Wrapped'), true);
});

// a `require(...)` slot is the destructure's twin: the minifier joins an entry statement with its
// neighbours the same way, in any slot, and the split is what lets entry detection read the call
// on its own line and keep the neighbours as statements. the entry canon reads the slot, so the
// indirect and optional spellings split too; a sequence with neither shape is not a plan entry
runBoth('planMinifierSequenceSplit/require slot', [
  "(a(), require('core-js/x'), b());",
  "(require('core-js/y'), c());",
  "((0, require)('core-js/z'), d());",
  "(require?.('core-js/w'), e());",
  '(f(), g());',
].join('\n'), (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry per statement with a require slot`, plan.length, 4);
  check(`${ lbl }: middle slot splits into three`, plan[0].products.length, 3);
  check(`${ lbl }: head slot splits into two`, plan[1].products.length, 2);
  check(`${ lbl }: a plain call sequence is not planned`, plan.some(entry => entry.statement === prog.node.body[4]), false);
});

// a statement list nested inside an operand is planned too, with its own list
runBoth('planMinifierSequenceSplit/list inside an operand', 'const src = [1];\n(a(), ({ at } = src), () => { (b(), ({ flat } = src)); });\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: two entries`, plan.length, 2);
  check(`${ lbl }: the inner entry names the arrow body`, plan[1].statements !== prog.node.body && Array.isArray(plan[1].statements), true);
});

// an un-braced slot nested inside an operand is planned too: the entries hold nodes, so the slot's
// host stays reachable whatever the outer list's splice does around it
runBoth('planMinifierSequenceSplit/slot inside an operand', 'const src = [1];\n(a(), ({ at } = src), () => { if (c) (b(), ({ flat } = src)); });\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: two entries`, plan.length, 2);
  check(`${ lbl }: the inner entry is a slot of the if inside the arrow`, plan[1].host?.type === 'IfStatement' && plan[1].key === 'consequent', true);
});

// a statement without the shape plans nothing: a bare destructure, a sequence without one
runBoth('planMinifierSequenceSplit/no shape, no entry', 'const src = [1];\n({ at } = src);\n(a(), b());\n', (adapter, prog, lbl) => {
  check(lbl, planMinifierSequenceSplit(prog.node).length, 0);
});

for (const siblings of ['', ', tail']) runBoth('retained wrapper computed key shares one call result',
  `let method, tail; [{ [(key(), "at")]: method }${ siblings }] = [source(), 7];`, (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression');
    const [prop] = host.node.left.elements[0].properties;
    const plan = planRetainedObjectCapture({ pattern: host.node.left, init: host.node.right, assignment: true, prop });
    check(`${ label }/keeps native iteration`, !!plan?.arrayCapture, true);
    check(`${ label }/owns the keyed element`, plan?.elementPattern, host.node.left.elements[0]);
    check(`${ label }/keeps sibling positions`, plan?.arrayCapture.elements.length, siblings ? 2 : 1);
  });

finish();
