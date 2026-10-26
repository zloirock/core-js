import { createBabelAdapter, createUsageVisitors as createBabelUsageVisitors } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter, createUsageVisitors as createEstreeUsageVisitors } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { handleMemberExpressionNode } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { resolve } from '../../packages/core-js-polyfill-provider/index.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { createUsageGlobalCallback } from '../../packages/core-js-polyfill-provider/plugin-options/usage-callback.js';
import {
  findNearestVarScopeOwner,
  findTSRuntimeBindingInPath,
  isForXWriteTarget,
  isTSTypeOnlyIdentifierPath,
  memberContextPath,
  nonEmittedExpressionAncestor,
  staticMemberKeyName,
  withTraversalCaches,
  withVarScopeOwners,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker, expectError } from './harness.mjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

const { check, checkTruthy, checkDeep, finish } = createChecker('member-context-paths');
// An ordinary identifier needs no global reference-position query, unless a live
// navigation hook consumes aliases too. Known names retain their normal detection.
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  const program = parser.parseAndScope('ordinary; Map;');
  const paths = parser.collectPaths(program, 'Identifier');
  const createAdapter = parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter;
  const createVisitors = parser.name === 'babel' ? createBabelUsageVisitors : createEstreeUsageVisitors;
  for (const hook of [false, true]) {
    const claims = [];
    const roots = [];
    const visitors = createVisitors({
      adapter: createAdapter({ method }),
      method,
      walkAnnotations: false,
      onUsage(meta) { claims.push(meta.name); },
      suppressKeptNavRoot: hook ? path => { roots.push(path.node.name); return true; } : null,
    });
    for (const path of paths) {
      const { parent } = path;
      let reads = 0;
      withTemporaryProperty(path, 'parent', undefined, () => {
        Object.defineProperty(path, 'parent', {
          configurable: true,
          get() {
            reads++;
            return parent;
          },
        });
        (visitors.ReferencedIdentifier ?? visitors.Identifier)(path);
      });
      const observed = hook || path.node.name === 'Map';
      check(`global name gate/${ parser.name }/${ method }/${ hook }/${ path.node.name }/reference query`, reads > 0, observed);
    }
    checkDeep(`global name gate/${ parser.name }/${ method }/${ hook }/claims`, claims, hook ? [] : ['Map']);
    checkDeep(`global name gate/${ parser.name }/${ method }/${ hook }/alias hook`, roots, hook ? ['ordinary', 'Map'] : []);
  }
}

const nav = `globalThis${ '.self'.repeat(16) }.Map`;
// the marker lines a generated row puts above the line `tsc` rejects on purpose
const COMPUTED_KEY = expectError('a computed key tsc refuses is the shape under test');
const ABSENT_RUN = expectError('a member run the value does not have is the shape under test');

// These are syntax-position questions, including type keys that TS rejects on type grounds.
// The parser accepts them; an erased interface key must not become a runtime reference.
const rows = [
  ['program', `${ nav };`, false, false, 'Program'],
  ['body', `function f() { enum Map { A } return ${ nav }; }`, false, true, 'FunctionDeclaration'],
  ['parameter', `function f(x = ${ nav }) { enum Map { A } }`, false, false, 'FunctionDeclaration'],
  ['computed field', `${ COMPUTED_KEY }class C { [${ nav }] = 1; }`, false, false, 'Program'],
  ['interface', `${ COMPUTED_KEY }interface I { [${ nav }]: number }`, true, false, 'Program'],
  ['type literal', `${ COMPUTED_KEY }type T = { [${ nav }]: number };`, true, false, 'Program'],
  ['static block', `class C { static { enum Map { A } ${ nav }; } }`, false, true, 'StaticBlock'],
  ['method key', `${ COMPUTED_KEY }class C { [${ nav }]() { enum Map { A } } }`, false, false],
  ['object key', `${ COMPUTED_KEY }const o = { [${ nav }]() { enum Map { A } } };`, false, false],
  ['method decorator', `class C { @dec(${ nav }) m() { enum Map { A } } }`, false, false],
  ['parameter property', `class C { constructor(private Map: number) { ${ nav }; } }`, false, true],
  ['computed function', `host[(() => { enum Map { A } return ${ nav }; })()].tail;`, false, true, 'ArrowFunctionExpression'],
  ['type cast', `const x = (${ nav } as any).self;`, false, false, 'Program'],
];

for (const parser of adapters) {
  // Rejected keys skip primary receiver analysis. Named and literal keys retain their
  // receiver fallback, including unsupported slots and metadata-only consumers.
  for (const [source, supported, fallbackReads = 0] of [
    ['source.unrelatedField', true],
    ['source?.unrelatedField', true],
    ['source["unrelatedField"]', true],
    ['source[index >> 2]', false],
    ['source[1n << shift]', false],
    ['source[-index]', false],
    ['source[unknownKey]', false, 3],
    ['source[chooseKey()]', false, 3],
    ['(effect(), source)[chooseKey()]', false, 3],
    ['source.prototype', false, 3],
    ['Map.unrelatedField', true],
    ['source[0]', true],
    ['source.at', true],
    ['Array.from', true],
    ['globalThis.Map', true],
    ['source["fr" + "om"]', true],
    ['(effect(), source)["at"]', true],
  ]) for (const method of ['usage-global', 'usage-pure']) {
    const program = parser.parseAndScope(`${ source };`);
    const path = parser.pickPath(program, 'MemberExpression') ?? parser.pickPath(program, 'OptionalMemberExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
    const receiver = path.node.object;
    const handledObjects = new Set();
    let reads = 0;
    let meta;
    try {
      Object.defineProperty(path.node, 'object', {
        configurable: true,
        get() { reads++; return receiver; },
      });
      meta = handleMemberExpressionNode({ node: path.node, path, scope: path.scope, adapter,
        handledObjects, suppressProxyGlobals: new Set(), resolveMeta: resolve, isEntryAvailable: () => true });
    } finally {
      Object.defineProperty(path.node, 'object', { configurable: true, enumerable: true, writable: true, value: receiver });
    }
    const label = `${ parser.name }/${ method }/key admission/${ source }`;
    if (supported) checkTruthy(`${ label }/positive receiver control`, reads > 0, `${ reads } reads`);
    else {
      // Import and guarded-receiver fallbacks still inspect the source after a key
      // rejection. Classification must add no receiver read to those three accesses.
      checkTruthy(`${ label }/receiver read budget`, reads <= fallbackReads, `${ reads } reads`);
      check(`${ label }/no claim`, meta, null);
      check(`${ label }/children stay visitable`, handledObjects.size, 0);
    }
  }

  for (const [name, source, erased, bound, owner] of rows) {
    const program = parser.parseAndScope(source, 'module', ['decorators']);
    const paths = parser.collectPaths(program, 'MemberExpression', path => path.node.property.name === 'Map');
    check(`${ parser.name }/${ name }/one probe`, paths.length, 1);
    const [path] = paths;
    for (let pass = 0; pass < 2; pass++) {
      check(`${ parser.name }/${ name }/${ pass }/type context`, isTSTypeOnlyIdentifierPath(path), erased);
      check(`${ parser.name }/${ name }/${ pass }/TS binding`, findTSRuntimeBindingInPath(path, 'Map'), bound);
      if (owner) check(`${ parser.name }/${ name }/${ pass }/var owner`, findNearestVarScopeOwner(path)?.node.type, owner);
      // Every inner member has the same surroundings, including computed keys.
      const inner = path.get('object');
      check(`${ parser.name }/${ name }/${ pass }/shared context`, memberContextPath(inner), path);
    }
  }

  // Declaration erasure and for-x dispatch must keep looking above the shared run.
  for (const [name, source, erased] of [
    ['runtime class', `${ COMPUTED_KEY }class C { [${ nav }] = 1; }`, false],
    ['ambient class', `${ COMPUTED_KEY }declare class C { [${ nav }]: number; }`, true],
    ['abstract field', `${ COMPUTED_KEY }abstract class C { abstract [${ nav }]: number; }`, true],
    ['declared field', `${ COMPUTED_KEY }class C { declare [${ nav }]: number; }`, true],
  ]) {
    const program = parser.parseAndScope(source);
    for (const path of parser.collectPaths(program, 'MemberExpression')) {
      check(`${ parser.name }/${ name }/emit context`, !!nonEmittedExpressionAncestor(path), erased);
    }
  }
  {
    const access = `obj${ '.self'.repeat(16) }.at`;
    const program = parser.parseAndScope(`for (${ access } of items) { ${ access }; }`);
    for (const path of parser.collectPaths(program, 'MemberExpression')) {
      check(`${ parser.name }/for-of write context`, isForXWriteTarget(path), path.node.property.name === 'at');
    }
  }

  {
    const program = parser.parseAndScope(`host[${ nav }].tail;`);
    const paths = parser.collectPaths(program, 'MemberExpression');
    const inner = paths.find(path => path.node.property.name === 'Map');
    check(`${ parser.name }/computed member context`, memberContextPath(inner), paths[0]);
    check(`${ parser.name }/computed member owner`, findNearestVarScopeOwner(inner).node.type, 'Program');
  }

  // Re-homing an inner run creates fresh live paths: a cached outer member must not
  // carry across the new call boundary, even when the moved nodes keep their identity.
  {
    const program = parser.parseAndScope('a.b.c.d.e.f;');
    const paths = parser.collectPaths(program, 'MemberExpression');
    for (const path of paths) check(`${ parser.name }/before move`, memberContextPath(path), paths[0]);
    const middle = paths[0].get('object');
    const moved = middle.node;
    middle.replaceWith({ type: 'CallExpression', callee: { type: 'Identifier', name: 'call' }, arguments: [moved], optional: false });
    const live = parser.collectPaths(program, 'MemberExpression');
    const inner = live.find(path => path.node.property.name === 'b');
    check(`${ parser.name }/after move`, memberContextPath(inner).node, moved);
  }

  // A replacement in the middle can keep the old descendant paths and both endpoints.
  // Read-only passes must release their ancestry before a later writer uses those paths.
  for (const throws of [false, true]) {
    const program = parser.parseAndScope('a.b.c.d.e.f.g.h;');
    const paths = parser.collectPaths(program, 'MemberExpression');
    const inner = paths.at(-1);
    const middle = paths.find(path => path.node.property.name === 'f');
    // Babel retargets the existing path; estree leaves its detached ancestry intact.
    const expected = parser.name === 'babel' ? middle.get('object') : paths[0];
    const failure = new Error('read-only visitor failed');
    let caught = null;
    try {
      withTraversalCaches(true, () => {
        check(`${ parser.name }/readonly cold`, memberContextPath(inner), paths[0]);
        check(`${ parser.name }/readonly warm`, memberContextPath(inner), paths[0]);
        if (throws) throw failure;
      });
    } catch (error) { caught = error; }
    check(`${ parser.name }/readonly error propagated`, caught === failure, throws);
    middle.replaceWith({
      type: 'ConditionalExpression', test: { type: 'Identifier', name: 'condition' },
      consequent: { type: 'Identifier', name: 'other' }, alternate: middle.node,
    });
    check(`${ parser.name }/interior replacement`, memberContextPath(inner) === expected, true);
    withTraversalCaches(true, () => {
      check(`${ parser.name }/new readonly pass`, memberContextPath(inner) === expected, true);
    });
  }

  {
    const program = parser.parseAndScope('a.b.c.d.e.f.g.h;');
    const paths = parser.collectPaths(program, 'MemberExpression');
    const inner = paths.at(-1);
    const middle = paths.find(path => path.node.property.name === 'f');
    const expected = parser.name === 'babel' ? middle.get('object') : paths[0];
    withTraversalCaches(false, () => {
      check(`${ parser.name }/mutable traversal before`, memberContextPath(inner), paths[0]);
      middle.replaceWith({
        type: 'ConditionalExpression', test: { type: 'Identifier', name: 'condition' },
        consequent: { type: 'Identifier', name: 'other' }, alternate: middle.node,
      });
      check(`${ parser.name }/mutable traversal after`, memberContextPath(inner) === expected, true);
    });
  }

  // The nearest var-scope owner is kept per path for a walk: a second ask climbs nothing, and a later
  // ask outside the walk climbs again. A read-only walk keeps it with its other caches, a rewriting
  // walk whose parser keys a path by its parent path keeps it alone (`withVarScopeOwners`)
  for (const scoped of ['read-only', 'rewriting']) {
    const program = parser.parseAndScope('function f() { use(value.self.at); }');
    const inner = parser.pickPath(program, 'Identifier', path => path.node.name === 'value');
    let climbs = 0;
    const { parentPath } = inner;
    Object.defineProperty(inner, 'parentPath', {
      configurable: true,
      get() {
        climbs++;
        return parentPath;
      },
    });
    const walk = scoped === 'read-only' ? visit => withTraversalCaches(true, visit) : withVarScopeOwners;
    let kept = 0;
    walk(() => {
      check(`${ parser.name }/${ scoped }/owner`, findNearestVarScopeOwner(inner)?.node.type, 'FunctionDeclaration');
      kept = climbs;
      checkTruthy(`${ parser.name }/${ scoped }/owner climbed`, kept > 0);
      check(`${ parser.name }/${ scoped }/owner kept`, findNearestVarScopeOwner(inner)?.node.type, 'FunctionDeclaration');
      check(`${ parser.name }/${ scoped }/no second climb`, climbs, kept);
    });
    findNearestVarScopeOwner(inner);
    checkTruthy(`${ parser.name }/${ scoped }/released with the walk`, climbs > kept);
  }

  // ... which holds while the walk rewrites: a render moving a subtree into a new activation (a memo
  // IIFE) puts a call in the position, and the moved subtree is reached through NEW paths - the old
  // path answers what a climb from it answers, the new one its activation
  {
    const program = parser.parseAndScope('function f() { use(value.self.at); }');
    const inner = parser.pickPath(program, 'Identifier', path => path.node.name === 'value');
    withVarScopeOwners(() => {
      check(`${ parser.name }/rewriting/owner before the move`, findNearestVarScopeOwner(inner)?.node.type, 'FunctionDeclaration');
      const call = parser.pickPath(program, 'CallExpression');
      call.replaceWith({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [],
          async: false,
          expression: false,
          generator: false,
          body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: call.node }], directives: [] },
        },
        arguments: [],
        optional: false,
      });
      const live = parser.pickPath(program, 'Identifier', path => path.node.name === 'value');
      check(`${ parser.name }/rewriting/moved node reached through a new path`, live !== inner, true);
      check(`${ parser.name }/rewriting/moved node owner`, findNearestVarScopeOwner(live)?.node.type, 'ArrowFunctionExpression');
      check(`${ parser.name }/rewriting/old path owner`, findNearestVarScopeOwner(inner)?.node.type, 'FunctionDeclaration');
    });
    check(`${ parser.name }/rewriting/old path climbed afresh`, findNearestVarScopeOwner(inner)?.node.type, 'FunctionDeclaration');
  }

  // Import-equals names share one statement index, including repeated misses.
  // Count yielded source statements after parsing so native scope setup is outside the budget.
  for (const size of [32, 128]) {
    const source = Array.from({ length: size }, (_, i) => `import g${ i } = require('m${ i }');`).join('\n');
    const program = parser.parseAndScope(`${ source }\n${ nav };`);
    const path = parser.pickPath(program, 'MemberExpression');
    const { body } = program.node;
    let reads = 0;
    body[Symbol.iterator] = function * () {
      for (let i = 0; i < this.length; i++) {
        reads++;
        yield this[i];
      }
    };
    const adapter = createEstreeAdapter({ method: 'usage-global' });
    for (let i = 0; i < size; i++) {
      check(`${ parser.name }/indexed import ${ i }`, adapter.getTSImportEqualsNode({ scope: path.scope, name: `g${ i }`, path })?.id.name, `g${ i }`);
      check(`${ parser.name }/indexed miss ${ i }`, adapter.getTSImportEqualsNode({ scope: path.scope, name: `missing${ i }`, path }), null);
    }
    checkTruthy(`${ parser.name }/${ size }/linear declaration reads`, reads > 0 && reads <= body.length, `${ reads } statements`);
  }

  // The ESTree fallback indexes declaration nodes, including type-only imports;
  // callers decide whether the returned declaration represents a runtime value.
  for (const [name, source, expected] of [
    ['import', `import g = require('outer'); ${ nav };`, 'outer'],
    ['export', `export import g = require('outer'); ${ nav };`, 'outer'],
    ['type import', `import type g = require('types'); ${ nav };`, 'types'],
    ['namespace', `import g = require('outer'); namespace Inner { export class Target {} } namespace N { import g = Inner.Target; ${ nav }; }`, 'Target'],
    ['unrelated', `import other = require('other'); ${ nav };`, null],
  ]) {
    const program = parser.parseAndScope(source);
    const path = parser.pickPath(program, 'MemberExpression', p => p.node.property.name === 'Map');
    const adapter = createEstreeAdapter({ method: 'usage-global' });
    for (let pass = 0; pass < 2; pass++) {
      check(`${ parser.name }/${ name }/${ pass }/missing import`, adapter.getTSImportEqualsNode({ scope: path.scope, name: 'missing', path }), null);
      const declaration = adapter.getTSImportEqualsNode({ scope: path.scope, name: 'g', path });
      const reference = declaration?.moduleReference;
      check(`${ parser.name }/${ name }/${ pass }/import source`, reference?.expression?.value ?? reference?.right?.name ?? null, expected);
    }
  }

  // Skipping a member run must preserve the actual nearest declaration and the
  // constructor's definition-time boundaries, in both read-only and live walks.
  const access = `value${ '.self'.repeat(16) }.at`;
  for (const [name, source, expected, outerLookup = false] of [
    ['constructor property', `const value = 'outer'; class C { constructor(public value: any) { ${ access }; } }`, 'property'],
    ['constructor default', `import value from 'outer'; class C { constructor(public value: any = []) { ${ access }; } }`, 'default'],
    ['computed member key', `const value = 'outer'; class C { constructor(public value: any) { host[${ access }].tail; } }`, 'property'],
    ['ordinary parameter', `const value = 'outer'; class C { constructor(public value: any) { function read(value) { ${ access }; } } }`, 'parameter'],
    ['nearest lexical', `${ ABSENT_RUN }const value = 'outer'; class C { constructor(public value: any) { { const value = []; ${ access }; } } }`, 'lexical'],
    ['method key', `${ ABSENT_RUN }const value = 'outer'; class C { [${ access }]() {} constructor(public value: any) {} }`, 'outer'],
    ['parameter decorator', `import value from 'outer'; class C { constructor(@dec(${ access }) public value: any) {} }`, 'import'],
    ['explicit outer lookup', `const value = 'outer'; class C { constructor(public value: any) { ${ access }; } }`, 'outer', true],
  ]) {
    for (const readOnly of [false, true]) {
      const program = parser.parseAndScope(source, 'module', ['decorators-legacy']);
      // Babel's parameter-property visitor omits its decorator children.
      const paths = name === 'parameter decorator'
        ? parser.pickPath(program, 'TSParameterProperty').get('decorators')[0].get('expression').get('arguments')
        : parser.collectPaths(program, 'MemberExpression', path => path.node.property.name === 'at');
      const [path] = paths;
      const label = `${ parser.name }/deep binding/${ name }/${ readOnly }`;
      check(`${ label }/one probe`, paths.length, 1);
      let declaration;
      switch (expected) {
        case 'property':
          declaration = parser.pickPath(program, 'TSParameterProperty').get('parameter');
          break;
        case 'default':
          declaration = parser.pickPath(program, 'AssignmentPattern', p => p.node.left.name === 'value');
          break;
        case 'parameter':
          [declaration] = parser.pickPath(program, 'FunctionDeclaration', p => p.node.id.name === 'read').get('params');
          break;
        case 'import':
          declaration = parser.pickPath(program, 'ImportDefaultSpecifier');
          break;
        default:
          declaration = parser.pickPath(program, 'VariableDeclarator', p => p.node.id.name === 'value'
            && (expected === 'lexical' ? p.node.init.type === 'ArrayExpression' : p.node.init.value === 'outer'));
      }
      checkTruthy(`${ label }/source declaration`, declaration);
      const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
      const scope = outerLookup ? program.scope : path.scope;
      withTraversalCaches(readOnly, () => {
        const binding = adapter.getBinding({ scope, name: 'value', path });
        check(`${ label }/nearest source node`, binding?.node, declaration.node);
        check(`${ label }/nearest declaration path`, binding?.declarationPath?.node, declaration.node);
        check(`${ label }/node type agrees`, adapter.getBindingNodeType({ scope, name: 'value', path }), declaration.node.type);
        if (expected === 'property' || expected === 'default' || expected === 'parameter') check(`${ label }/parameter kind`, binding?.kind, 'param');
      });
    }
  }

  // A chain wrapper changes short-circuiting, but not which static supplies its receiver.
  for (const [name, source, subsumed] of [
    ['plain static', 'globalThis.Number.MAX_SAFE_INTEGER;', true],
    ['sealed optional receiver', '(globalThis?.Number).MAX_SAFE_INTEGER;', true],
    ['optional static', '(globalThis?.Number)?.MAX_SAFE_INTEGER;', true],
    ['typed optional receiver', '((globalThis?.Number) as any).MAX_SAFE_INTEGER;', true],
    ['computed static', "(globalThis?.[(n++, 'Number')])[(n++, 'MAX_SAFE_INTEGER')];", true],
    ['generic member', '(globalThis?.Number).name;', false],
    ['dynamic member', '(globalThis?.Number)[key];', false],
    ['static write', '(globalThis?.Number).MAX_SAFE_INTEGER = value;', false],
    ['prototype read', '(globalThis?.Number).prototype;', false],
  ]) {
    const program = parser.parseAndScope(source);
    const types = parser.name === 'babel' ? ['MemberExpression', 'OptionalMemberExpression'] : ['MemberExpression'];
    const paths = types.flatMap(type => parser.collectPaths(program, type, candidate => staticMemberKeyName(candidate.node) === 'Number'));
    check(`${ parser.name }/${ name }/one receiver`, paths.length, 1);
    const [path] = paths;
    const resolved = [];
    const dispatch = createUsageGlobalCallback({
      isDisabled: () => false,
      isProposalEntry: () => false,
      resolveUsage(meta) { resolved.push(meta); return []; },
      injectModulesForModeEntry: () => undefined,
    });
    dispatch({ kind: 'property', placement: 'static', object: 'globalThis', key: 'Number' }, path);
    check(`${ parser.name }/${ name }/receiver subsumption`, resolved.length === 0, subsumed);
  }

  // Parent reads are counted only here, after parsing. The real handler must share its
  // context climbs across every live member; ordinary transforms carry no instrumentation.
  for (const depth of [32, 128, 256]) {
    const program = parser.parseAndScope(`globalThis${ '.self'.repeat(depth) }.Array.from([]);`);
    const paths = parser.collectPaths(program, 'MemberExpression');
    let reads = 0;
    for (const path of paths) {
      let { parentPath } = path;
      Object.defineProperty(path, 'parentPath', {
        configurable: true, enumerable: true,
        get() {
          reads++;
          return parentPath;
        },
        set(value) { parentPath = value; },
      });
    }
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-global' }) : createEstreeAdapter({ method: 'usage-global' });
    let claims = 0;
    const keys = new Set();
    const dispatch = createUsageGlobalCallback({
      adapter,
      isDisabled: () => false,
      isProposalEntry: () => false,
      resolveUsage(meta) {
        keys.add(meta.key);
        return [];
      },
      injectModulesForModeEntry: () => undefined,
    });
    const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage(meta, path) {
      check(`${ parser.name }/${ depth }/runtime claim`, isTSTypeOnlyIdentifierPath(path), false);
      dispatch(meta, path);
      claims++;
    } });
    withTraversalCaches(true, () => {
      for (const path of paths) core.emitMemberUsage(path);
    });
    check(`${ parser.name }/${ depth }/all claims retained`, claims, paths.length);
    checkTruthy(`${ parser.name }/${ depth }/static dispatch retained`, keys.has('from'));
    checkTruthy(`${ parser.name }/${ depth }/linear parent reads`, reads > 0 && reads <= paths.length * 160, `${ reads } parent reads`);
  }
}

finish();
