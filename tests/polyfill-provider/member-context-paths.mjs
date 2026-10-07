import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { createUsageGlobalCallback } from '../../packages/core-js-polyfill-provider/plugin-options/usage-callback.js';
import {
  enclosingParameterListOwner,
  findNearestVarScopeOwner,
  findTSRuntimeBindingInPath,
  isForXWriteTarget,
  isTSTypeOnlyIdentifierPath,
  memberContextPath,
  nonEmittedExpressionAncestor,
  staticMemberKeyName,
  withTraversalCaches,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('member-context-paths');
const nav = `globalThis${ '.self'.repeat(16) }.Map`;

// These are syntax-position questions, including type keys that TS rejects on type grounds.
// The parser accepts them; an erased interface key must not become a runtime reference.
const rows = [
  ['program', `${ nav };`, false, false, false, 'Program'],
  ['body', `function f() { enum Map { A } return ${ nav }; }`, false, true, false, 'FunctionDeclaration'],
  ['parameter', `function f(x = ${ nav }) { enum Map { A } }`, false, false, true, 'FunctionDeclaration'],
  ['computed field', `class C { [${ nav }] = 1; }`, false, false, false, 'Program'],
  ['interface', `interface I { [${ nav }]: number }`, true, false, false, 'Program'],
  ['type literal', `type T = { [${ nav }]: number };`, true, false, false, 'Program'],
  ['static block', `class C { static { enum Map { A } ${ nav }; } }`, false, true, false, 'StaticBlock'],
  ['method key', `class C { [${ nav }]() { enum Map { A } } }`, false, false, false],
  ['object key', `const o = { [${ nav }]() { enum Map { A } } };`, false, false, false],
  ['method decorator', `class C { @dec(${ nav }) m() { enum Map { A } } }`, false, false, false],
  ['parameter property', `class C { constructor(private Map: number) { ${ nav }; } }`, false, true, false],
  ['computed function', `host[(() => { enum Map { A } return ${ nav }; })()].tail;`, false, true, false, 'ArrowFunctionExpression'],
  ['type cast', `const x = (${ nav } as any).self;`, false, false, false, 'Program'],
];

for (const parser of adapters) {
  for (const [name, source, erased, bound, parameter, owner] of rows) {
    const program = parser.parseAndScope(source, 'module', ['decorators']);
    const paths = parser.collectPaths(program, 'MemberExpression', path => path.node.property.name === 'Map');
    check(`${ parser.name }/${ name }/one probe`, paths.length, 1);
    const [path] = paths;
    for (let pass = 0; pass < 2; pass++) {
      check(`${ parser.name }/${ name }/${ pass }/type context`, isTSTypeOnlyIdentifierPath(path), erased);
      check(`${ parser.name }/${ name }/${ pass }/TS binding`, findTSRuntimeBindingInPath(path, 'Map'), bound);
      check(`${ parser.name }/${ name }/${ pass }/parameter`, !!enclosingParameterListOwner(path), parameter);
      if (owner) check(`${ parser.name }/${ name }/${ pass }/var owner`, findNearestVarScopeOwner(path)?.node.type, owner);
      // Every inner member has the same surroundings, including computed keys.
      const inner = path.get('object');
      check(`${ parser.name }/${ name }/${ pass }/shared context`, memberContextPath(inner), path);
    }
  }

  // Declaration erasure and for-x dispatch must keep looking above the shared run.
  for (const [name, source, erased] of [
    ['runtime class', `class C { [${ nav }] = 1; }`, false],
    ['ambient class', `declare class C { [${ nav }]: number; }`, true],
    ['abstract field', `abstract class C { abstract [${ nav }]: number; }`, true],
    ['declared field', `class C { declare [${ nav }]: number; }`, true],
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
      check(`${ parser.name }/indexed import ${ i }`, adapter.getTSImportEqualsNode(path.scope, `g${ i }`, path)?.id.name, `g${ i }`);
      check(`${ parser.name }/indexed miss ${ i }`, adapter.getTSImportEqualsNode(path.scope, `missing${ i }`, path), null);
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
      check(`${ parser.name }/${ name }/${ pass }/missing import`, adapter.getTSImportEqualsNode(path.scope, 'missing', path), null);
      const declaration = adapter.getTSImportEqualsNode(path.scope, 'g', path);
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
    ['nearest lexical', `const value = 'outer'; class C { constructor(public value: any) { { const value = []; ${ access }; } } }`, 'lexical'],
    ['method key', `const value = 'outer'; class C { [${ access }]() {} constructor(public value: any) {} }`, 'outer'],
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
        const binding = adapter.getBinding(scope, 'value', path);
        check(`${ label }/nearest source node`, binding?.node, declaration.node);
        check(`${ label }/nearest declaration path`, binding?.declarationPath?.node, declaration.node);
        check(`${ label }/node type agrees`, adapter.getBindingNodeType(scope, 'value', path), declaration.node.type);
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
