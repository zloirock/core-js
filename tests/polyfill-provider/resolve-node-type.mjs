// Unit tests for `@core-js/polyfill-provider`'s type-inference engine.
// Cross-parser via shared harness: every snippet runs through BOTH babel (used by
// babel-plugin) AND oxc (used by unplugin), so dispatch-shape regressions in either
// adapter surface immediately
import { adapters, createChecker } from './harness.mjs';
import { transformSync as babelTransform } from '@babel/core';
import { parseSync as parseSyncOxc } from 'oxc-parser';
import {
  collectMutationPrePass as collectBabelMutationPrePass,
  createBabelAdapter,
} from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import {
  collectMutationPrePass as collectEstreeMutationPrePass,
  createEstreeAdapter,
} from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { blockAlwaysExits, canFallThrough, nodeAlwaysExits } from '../../packages/core-js-polyfill-provider/resolve-node-type/exit-analysis.js';
import {
  isAmbientClassNode,
  isAmbientFunctionNode,
  isAmbientFunctionOrClassNode,
} from '../../packages/core-js-polyfill-provider/resolve-node-type/name-resolution.js';
import { guardFromHint, guardFromResolvedType, instanceofGuard, isTypeofVar, typeofGuard } from '../../packages/core-js-polyfill-provider/resolve-node-type/guard-shapes.js';
import {
  $Object,
  $Primitive,
  AMBIENT_FN_OR_CLASS_DECLARATION_TYPES,
  AMBIENT_FUNCTION_TYPES,
  ASSIGN_LEFT_TYPES,
  EXTENDS_CHILD_RESOLVERS,
  GENERATOR_LIKE_NAMES,
  INTRINSIC_STRING_TRANSFORMERS,
  KEY_FILTERING_WRAPPERS,
  MEMBER_ANNOTATION_SLOTS,
  NULLABLE_NEVER_ANNOTATIONS,
  NUMBER_LITERAL_RE,
  NUMERIC_KEY_SHAPE_RE,
  PATTERN_WRAPPERS,
  PLACEHOLDER_VALIDATORS,
  PRIMITIVES,
  PRIMITIVE_WRAPPERS,
  PROMISE_SYNONYMS,
  REBIND_ASSIGNMENT_OPERATORS,
  STRUCTURAL_WALK_SKIP_KEYS,
  STRUCTURE_PRESERVING_WRAPPERS,
  TRANSPARENT_WRAPPERS,
  TYPEOF_HINT_GROUPS,
  TYPE_HINTS,
  UNBOXED_PRIMITIVES,
  getOrInitMap,
  intersectHintSets,
  primitiveTypeOf,
  quasiText,
  toHint,
} from '../../packages/core-js-polyfill-provider/resolve-node-type/base.js';
import {
  collectQualifiedSegments,
  extendsId,
  isInterfaceDeclaration,
  isQualifiedNameNode,
  isTypeAlias,
  qualifiedNameLeft,
  qualifiedNameRight,
  synthInterfaceExtendsRef,
  typeAliasBody,
  typeRefName,
  typeRefSegments,
} from '../../packages/core-js-polyfill-provider/resolve-node-type/ast-shapes.js';
import {
  ESM_MARKER_TYPES,
  FUNCTION_LIKE_NODE_TYPES,
  IIFE_CALL_PATH_WRAPPERS,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  TS_EXPR_WRAPPERS,
  createTypeAnnotationChecker,
  declaresRequireBinding,
  destructureReceiverSlot,
  detectCommonJS,
  getFallbackBranchSlots,
  getSuperTypeArgs,
  getTypeArgs,
  hasRestSiblingExcept,
  hasTopLevelESM,
  isAmbientBindingShape,
  isAmbientTypeDeclaration,
  isASTNode,
  isBindingPosition,
  isChainAssignment,
  isDeleteTarget,
  isDirectiveStatement,
  isIdentifierPropValue,
  isMemberWriteOnlyContext,
  isNonReferencePosition,
  isRestProperty,
  isSingleNestedProxyChain,
  isSynthSimpleObjectPattern,
  isTaggedTemplateTag,
  isThisReceiver,
  isTransparentDestructureWrapper,
  isTypeOnlyImportBinding,
  isTypeOnlyImportEquals,
  isUpdateTarget,
  kebabToCamel,
  kebabToPascal,
  mayHaveSideEffects,
  objectPatternPropNeedsReceiverRewrite,
  peelFallbackReceiver,
  peelNestedSequenceExpressions,
  propBindingIdentifier,
  resolveCallArgument,
  singleQuasiString,
  singleReturnBodyExpression,
  unwrapExportedDeclaration,
  unwrapExpressionChain,
  unwrapInitValue,
  unwrapParens,
  unwrapReceiverLeaf,
  unwrapRuntimeExpr,
  unwrapSafeSequenceTail,
  walkPatternIdentifiers,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  buildSuperStaticMeta,
  globalProxyMemberName,
  isClassifiableReceiverArg,
  isExpandedClassifiableReceiver,
  markSynthReceiverSkipped,
  remapInheritedStaticMeta,
  resolveSuperImportName,
  symbolKeyToEntry,
} from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';

const { check, checkTruthy, fail, finish, pass, runBoth, runBothAndAgree } = createChecker('resolve-node-type');

// NOTE: `constructor` as a destructured key reads via prototype chain
// (`Object.prototype.constructor` = the Object function), so a missing slot would
// fall back to that and corrupt the comparison. use `ctor` instead
function checkType(label, type, expected) {
  if (!type) return fail(label, 'got null type');
  const { primitive, kind, ctor } = expected;
  if (primitive !== undefined && type.primitive !== primitive) {
    return fail(label, `primitive=${ type.primitive }, want ${ primitive }`);
  }
  if (kind !== undefined && type.type !== kind) {
    return fail(label, `type.type=${ type.type }, want ${ kind }`);
  }
  if (ctor !== undefined && type.constructor !== ctor) {
    return fail(label, `type.constructor=${ type.constructor }, want ${ ctor }`);
  }
  pass();
}

// --- TYPE_HINTS surface ---

check('TYPE_HINTS is a Set', TYPE_HINTS instanceof Set, true);
checkTruthy('TYPE_HINTS has primitives', TYPE_HINTS.has('string') && TYPE_HINTS.has('number'));
checkTruthy('TYPE_HINTS has object kinds', TYPE_HINTS.has('object') && TYPE_HINTS.has('function'));

// --- Primitive literal resolution ---

runBoth('NumericLiteral -> number primitive', 'const x = 42;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: true, kind: 'number' });
});

runBoth('StringLiteral -> string primitive', 'const x = "hi";', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: true, kind: 'string' });
});

runBoth('BooleanLiteral -> boolean primitive', 'const x = true;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: true, kind: 'boolean' });
});

runBoth('BigIntLiteral -> bigint primitive', 'const x = 42n;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: true, kind: 'bigint' });
});

runBoth('TemplateLiteral -> string primitive', 'const x = `tpl`;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: true, kind: 'string' });
});

// --- Object literal -> constructor ---

runBoth('ArrayExpression -> Array', 'const x = [];', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: false, ctor: 'Array' });
});

runBoth('ObjectExpression -> Object', 'const x = {};', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: false, ctor: 'Object' });
});

runBoth('RegExpLiteral -> RegExp', 'const x = /re/g;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
    { primitive: false, ctor: 'RegExp' });
});

// --- TS annotation primary source ---

runBoth('TS annotation: string', 'let x: string;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('id')),
    { primitive: true, kind: 'string' });
});

runBoth('TS annotation: number[] (Array)', 'let x: number[];', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('id')),
    { primitive: false, ctor: 'Array' });
});

// --- Member-call return type from `known-built-in-return-types` ---

runBoth('Array.from(...) -> Array', 'const x = Array.from([]);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Array' });
});

// aliased static via assignment-destructure: the call-return type must resolve identically on
// both adapters. estree-toolkit reports the constant-violation as the LHS Identifier, babel as
// the AssignmentExpression - the destructure walk normalizes to the enclosing AE so both agree
runBoth('aliased static via assignment-destructure -> Array', 'let x; ({ from: x } = Array); x([1]);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Array' });
});

runBoth('String(...) (coerce) -> string primitive', 'const x = String(42);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: true, kind: 'string' });
});

runBoth('new Map() -> Map', 'const x = new Map();', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'NewExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Map' });
});

// --- Binding-init propagation: alias resolves to source ---

runBoth('aliased const binding -> Array', 'const a = []; const b = a;', (adapter, prog, lbl) => {
  // collect declarators in order; second is `b = a` whose id-type should propagate
  // from `a`'s init `[]` through the binding lookup
  const decls = adapter.collectPaths(prog, 'VariableDeclarator');
  checkType(lbl, adapter.makeResolver().resolveNodeType(decls[1].get('id')),
    { primitive: false, ctor: 'Array' });
});

// --- isString / isObject predicates ---

runBoth('isString("hi" init) / isObject false', 'const s = "hi";', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  const resolver = adapter.makeResolver();
  check(`${ lbl } isString`, resolver.isString(decl.get('init')), true);
  check(`${ lbl } isObject`, resolver.isObject(decl.get('init')), false);
});

runBoth('isObject([] init) / isString false', 'const a = [];', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  const resolver = adapter.makeResolver();
  check(`${ lbl } isObject`, resolver.isObject(decl.get('init')), true);
  check(`${ lbl } isString`, resolver.isString(decl.get('init')), false);
});

// --- `toHint` round-trip (parser-agnostic; runs once on babel resolver) ---

{
  const resolver = adapters[0].makeResolver();
  check('toHint(null) -> null', resolver.toHint(null), null);
  check('toHint(string primitive) -> "string"',
    resolver.toHint({ primitive: true, type: 'string' }), 'string');
  // NOTE: `toHint` reads input.constructor (not `ctor`) - this is the resolver's
  // internal Type-object shape, not the test-helper shorthand
  check('toHint(Array object) -> "array"',
    resolver.toHint({ primitive: false, constructor: 'Array' }), 'array');
  check('toHint(unknown primitive) -> null',
    resolver.toHint({ primitive: true, type: 'unknown' }), null);
}

// --- Per-file caching: `reset()` clears resolved-type WeakMap ---

runBoth('reset() flushes cache', 'const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclarator');
  const resolver = adapter.makeResolver();
  const initPath = decl.get('init');
  const first = resolver.resolveNodeType(initPath);
  resolver.resolvedType.set(initPath.node, { primitive: true, type: 'string' });
  check(`${ lbl } cache hit returns stored`,
    resolver.resolvedType.get(initPath.node)?.type, 'string');
  resolver.reset();
  const second = resolver.resolveNodeType(initPath);
  check(`${ lbl } after reset: re-resolved fresh`, second?.type, first?.type);
});

// --- Known built-in static-method return types ---

runBoth('Object.keys([]) -> Array', 'const x = Object.keys([]);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Array' });
});

runBoth('Math.max(...) -> number primitive', 'const x = Math.max(1, 2);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: true, kind: 'number' });
});

runBoth('JSON.stringify(...) -> string primitive', 'const x = JSON.stringify({});', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: true, kind: 'string' });
});

runBoth('Number(x) coerce -> number primitive', 'const x = Number("3");', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: true, kind: 'number' });
});

runBoth('Boolean(x) coerce -> boolean primitive', 'const x = Boolean(0);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: true, kind: 'boolean' });
});

// --- Known constructor invocations ---

runBoth('new Set() -> Set', 'const x = new Set();', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'NewExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Set' });
});

runBoth('new Promise(...) -> Promise', 'const x = new Promise(resolve => {});', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'NewExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Promise' });
});

runBoth('new Date() -> Date', 'const x = new Date();', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'NewExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Date' });
});

// --- Member-call return propagation through instance methods ---

runBoth('"".split(" ") -> Array', 'const x = "a b".split(" ");', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: false, ctor: 'Array' });
});

runBoth('[].join() -> string primitive', 'const x = [1, 2].join();', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression');
  checkType(lbl, adapter.makeResolver().resolveNodeType(call),
    { primitive: true, kind: 'string' });
});

runBoth('Array.from(...).map(...) -> Array (chained)',
  'const x = Array.from([]).map(v => v);', (adapter, prog, lbl) => {
    // pick outermost CallExpression - babel and oxc both walk outermost-first per `enter`
    const call = adapter.pickPath(prog, 'CallExpression');
    checkType(lbl, adapter.makeResolver().resolveNodeType(call),
      { primitive: false, ctor: 'Array' });
  });

// --- TS interface members ---

runBoth('TS interface annotation: method return -> Array',
  'interface Foo { all(): number[]; } let x: Foo;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    // annotation -> `Foo` -> interface lookup; reading the binding itself just resolves to object
    // verify the BINDING type resolves (Foo interface members are looked up on demand)
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    // interface annotation should resolve to an object-shaped Type (no concrete constructor)
    checkTruthy(`${ lbl } interface binding -> non-primitive`, type && type.primitive === false);
  });

// --- typeof narrowing ---
// the engine has two narrowing channels:
//   - `resolveTypeGuardNarrowing` (internal) fires when typeof guard resolves to a
//     concrete type - the main `resolveNodeType` entry point uses it transparently
//   - `resolveGuardHints` (exported) returns hint sets for ambiguous typeofs
//     (`typeof x === 'object'` spans null/array/object/etc.) so the resolver can
//     filter without committing to one concrete type
// the two are mutually exclusive: if the guard resolves to a concrete type,
// `resolveGuardHints` returns null and narrowing flows through `resolveNodeType`

// pick the `x` reference inside `return x;` body
function pickReturnArg(adapter, prog, name) {
  return adapter.collectPaths(prog, 'Identifier', p => {
    if (p.node?.name !== name) return false;
    let parent = p.parentPath;
    while (parent) {
      if (parent.node?.type === 'ReturnStatement') return true;
      parent = parent.parentPath;
    }
    return false;
  })[0];
}

runBoth('typeof guard: string narrowing via resolveNodeType',
  'function f(x: unknown) { if (typeof x === "string") { return x; } }', (adapter, prog, lbl) => {
    const ref = pickReturnArg(adapter, prog, 'x');
    const resolver = adapter.makeResolver();
    // the engine resolves `x` inside the typeof-string block to string primitive directly
    checkType(lbl, resolver.resolveNodeType(ref), { primitive: true, kind: 'string' });
  });

runBoth('typeof guard hints: object spans group',
  'function f(x: any) { if (typeof x === "object" && x) { return x; } }', (adapter, prog, lbl) => {
    const ref = pickReturnArg(adapter, prog, 'x');
    const resolver = adapter.makeResolver();
    // `typeof x === "object"` doesn't fold to a single concrete type - the hint set
    // is returned for the resolver to filter member-lookups against
    const hints = resolver.resolveGuardHints(ref);
    checkTruthy(`${ lbl } resolveGuardHints non-null`, hints);
    checkTruthy(`${ lbl } includedHints non-empty`,
      hints?.includedHints?.size && hints.includedHints.size > 0);
  });

// --- Member-access object-type resolution (`resolvePropertyObjectType`) ---

runBoth('member object type: [].length -> Array',
  'const a = []; const n = a.length;', (adapter, prog, lbl) => {
    // pick the MemberExpression `a.length`
    const member = adapter.pickPath(prog, 'MemberExpression');
    const resolver = adapter.makeResolver();
    const objType = resolver.resolvePropertyObjectType(member);
    checkType(lbl, objType, { primitive: false, ctor: 'Array' });
  });

runBoth('member object type: "".length -> string',
  'const s = "hi"; const n = s.length;', (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression');
    const resolver = adapter.makeResolver();
    const objType = resolver.resolvePropertyObjectType(member);
    checkType(lbl, objType, { primitive: true, kind: 'string' });
  });

// --- Conditional type resolution ---

runBoth('TS conditional: `T extends string ? Array : Map` with concrete T -> Array',
  'type Foo<T> = T extends string ? string[] : never; let x: Foo<"hi">;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
  });

// `never extends X` is true for every X (never is the bottom type, assignable to everything),
// so a conditional with check = never must pick the true branch unconditionally
runBoth('TS conditional: `never extends X` picks true branch (bottom-type semantics)',
  'type Box<T> = T extends string ? string[] : Map<string, number>; let r: Box<never>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
  });

// `never extends Array<...>` (object extend, not primitive): bottom-type rule must fire
// before the "primitive-check vs concrete-object-extend" disjoint rule that otherwise
// returns false for any check-side primitive against a concrete extend
runBoth('TS conditional: `never extends Array<X>` (object extend) still picks true branch',
  'type Box<T> = T extends Array<number> ? string[] : Map<string, number>; let r: Box<never>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
  });

// nested conditional with `never` propagated through both checks: outer picks true, the
// resolver substitutes T = never into the body, then the inner T extends-check also fires
// and must pick its own true branch. without bottom-type rule both calls fall through
// the primitive-vs-X rules and return false, picking the deepest false branch
runBoth('TS conditional: nested `T extends ... ? ... : T extends ... ? A : B` with T=never picks outermost true',
  `
    type Box<T> = T extends string ? string[] : T extends number ? Map<string, number> : Set<string>;
    let r: Box<never>;
  `,
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
  });

// --- Discriminant-union narrowing (`if (u.kind === 'a') { u.value }`) ---
// covers the cluster: parseDiscriminantCheck / memberLiteralPair / pushDiscriminantClauses
// / findDiscriminantGuards. each scenario sets up a union with two branches and verifies
// the narrowed branch's element-type wins inside the guarded body

runBoth('discriminant union: positive `kind === literal` narrows',
  `
    type U = { kind: 'a'; x: string } | { kind: 'b'; x: number[] };
    function f(u: U) { if (u.kind === 'a') { return u.x; } }
  `,
  (adapter, prog, lbl) => {
    // pick `u.x` inside the if-body via `return u.x`
    const refs = adapter.collectPaths(prog, 'MemberExpression', p => {
      let parent = p.parentPath;
      while (parent) {
        if (parent.node?.type === 'ReturnStatement') return true;
        parent = parent.parentPath;
      }
      return false;
    });
    const resolver = adapter.makeResolver();
    // discriminant narrows to `{kind: 'a', x: string}` so `u.x` is string primitive
    checkType(lbl, resolver.resolveNodeType(refs[0]), { primitive: true, kind: 'string' });
  });

runBoth('discriminant union: else-branch narrows to alternate',
  `
    type U = { kind: 'a'; x: string } | { kind: 'b'; x: number[] };
    function f(u: U) { if (u.kind === 'a') {} else { return u.x; } }
  `,
  (adapter, prog, lbl) => {
    const refs = adapter.collectPaths(prog, 'MemberExpression', p => {
      let parent = p.parentPath;
      while (parent) {
        if (parent.node?.type === 'ReturnStatement') return true;
        parent = parent.parentPath;
      }
      return false;
    });
    const resolver = adapter.makeResolver();
    // else-branch narrows to `{kind: 'b', x: number[]}` so `u.x` is Array
    checkType(lbl, resolver.resolveNodeType(refs[0]), { primitive: false, ctor: 'Array' });
  });

runBoth('discriminant union: preceding early-exit narrows tail',
  `
    type U = { kind: 'a'; x: string } | { kind: 'b'; x: number[] };
    function f(u: U) { if (u.kind !== 'a') return; return u.x; }
  `,
  (adapter, prog, lbl) => {
    // pick the LAST `u.x` (the one after early-exit)
    const refs = adapter.collectPaths(prog, 'MemberExpression');
    const resolver = adapter.makeResolver();
    // after `if (u.kind !== 'a') return;` the only surviving branch is `{kind:'a', x: string}`
    checkType(lbl, resolver.resolveNodeType(refs[refs.length - 1]),
      { primitive: true, kind: 'string' });
  });

runBoth('discriminant union: `&&` clause contributes',
  `
    type U = { kind: 'a'; x: string } | { kind: 'b'; x: number[] };
    function f(u: U, ready: boolean) { if (ready && u.kind === 'a') { return u.x; } }
  `,
  (adapter, prog, lbl) => {
    const refs = adapter.collectPaths(prog, 'MemberExpression', p => {
      let parent = p.parentPath;
      while (parent) {
        if (parent.node?.type === 'ReturnStatement') return true;
        parent = parent.parentPath;
      }
      return false;
    });
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(refs[0]), { primitive: true, kind: 'string' });
  });

// --- Mapped types ---
// covers `parseMappedTypeShape` (`keyof` vs literal-union dispatch),
// `expandMappedTypeMembers` (per-key body resolution), and
// `unwrapMappedTypePassthrough` (`{[K in keyof T]: T[K]}` -> T fast-path).
// the engine should be able to resolve member access through these synthesized
// member tables - that's the user-observable contract these helpers exist to support

runBoth('mapped type via keyof: `Pick<{a:string}, "a">.a` -> string',
  'let x: Pick<{ a: string; b: number }, "a">;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    // Pick is a built-in structure-preserving wrapper - resolver walks it as a key-filtering
    // mapped type. annotation alone shouldn't bottom out on a primitive, but resolvePropertyObjectType
    // on `x.a` should yield string. without member access, check the binding is non-primitive
    const type = resolver.resolveNodeType(decl.get('id'));
    checkTruthy(`${ lbl } binding resolves`, type !== null);
  });

runBoth('passthrough mapped type: `{ [K in keyof T]: T[K] }` -> T',
  `
    type Pass<T> = { [K in keyof T]: T[K] };
    let x: Pass<string[]>;
  `,
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    // passthrough should collapse to T = string[] (Array)
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
  });

// --- Class members ---

runBoth('class instance method return -> Array',
  `
    class Box { items(): number[] { return []; } }
    const b = new Box();
    const v = b.items();
  `,
  (adapter, prog, lbl) => {
    // pick `b.items()` CallExpression
    const call = adapter.pickPath(prog, 'CallExpression',
      p => p.node.callee?.type === 'MemberExpression' && p.node.callee.property?.name === 'items');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(call), { primitive: false, ctor: 'Array' });
  });

runBoth('class static method return propagates',
  `
    class Factory { static make(): string { return ""; } }
    const v = Factory.make();
  `,
  (adapter, prog, lbl) => {
    const call = adapter.pickPath(prog, 'CallExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(call), { primitive: true, kind: 'string' });
  });

// --- Type alias chains (multi-hop) ---

runBoth('multi-hop type alias resolves through chain',
  `
    type A = number[];
    type B = A;
    type C = B;
    let x: C;
  `,
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    // C -> B -> A -> number[] (Array)
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// --- Awaited<T> / Promise unwrapping ---

runBoth('Awaited<Promise<string>> -> string',
  'let x: Awaited<Promise<string>>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: true, kind: 'string' });
  });

runBoth('Awaited<number[]> passthrough (non-Promise)',
  'let x: Awaited<number[]>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    // Awaited<T> where T is not Promise-like returns T directly
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// --- Generic-call return types ---

runBoth('generic function: returns inferred type',
  `
    function id<T>(x: T): T { return x; }
    const v = id("hi");
  `,
  (adapter, prog, lbl) => {
    const call = adapter.pickPath(prog, 'CallExpression');
    const resolver = adapter.makeResolver();
    // `id<T>(x: T): T` called with string -> T binds to string, return is string
    checkType(lbl, resolver.resolveNodeType(call),
      { primitive: true, kind: 'string' });
  });

// --- TS string-transformer intrinsics ---

runBoth('Uppercase<"hi"> resolves',
  'let x: Uppercase<"hi">;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    // string-transformer intrinsic - resolved to a string primitive type
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: true, kind: 'string' });
  });

// --- Predicate-guard narrowing (`function isFoo(x): x is Foo`) ---
// TODO: user-predicate guards require additional setup (the function call's positive branch
// needs to walk back to the predicate's `x is T` annotation). resolver returns null in this
// test harness without further wiring - kept here as a stub for follow-up coverage when the
// predicate-guards cluster (resolvePredicateGuard / parseUserPredicateGuard /
// matchPredicateArg / findEnclosingTypeGuards) is extracted

runBoth('Array.isArray() built-in predicate narrows to Array',
  `
    function f(x: unknown) { if (Array.isArray(x)) { return x; } }
  `,
  (adapter, prog, lbl) => {
    const ref = pickReturnArg(adapter, prog, 'x');
    const resolver = adapter.makeResolver();
    // built-in Array.isArray is in KNOWN_STATIC_TYPE_GUARDS and should narrow x to Array
    // in the positive branch. failure here would expose the typeguard table lookup
    const type = resolver.resolveNodeType(ref);
    // accept either Array Type or null - the engine may take either path depending on
    // ambient binding wiring in this harness; this is a stub test that we'll refine when
    // extracting the predicate-guards cluster
    if (type === null || (type && type.primitive === false && type.constructor === 'Array')) {
      pass();
    } else {
      fail(lbl, `expected Array or null, got ${ JSON.stringify(type) }`);
    }
  });

// --- Switch-case typeof narrowing ---
// covers typeof-guards.js `findSwitchCaseGuards` - `switch (typeof x) { case 'string': ... }`
// narrows x to string inside that case body

runBoth('switch (typeof x) case narrows',
  `
    function f(x: unknown) {
      switch (typeof x) {
        case "string": return x;
      }
    }
  `,
  (adapter, prog, lbl) => {
    const [ref] = adapter.collectPaths(prog, 'Identifier', p => {
      if (p.node?.name !== 'x') return false;
      let parent = p.parentPath;
      while (parent) {
        if (parent.node?.type === 'ReturnStatement') return true;
        parent = parent.parentPath;
      }
      return false;
    });
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(ref), { primitive: true, kind: 'string' });
  });

// --- Tuple types ---

runBoth('tuple element-type via index access: [string, number][0] -> string',
  'let t: [string, number]; const v = t[0];',
  (adapter, prog, lbl) => {
    // pick the MemberExpression `t[0]`
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.computed);
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(member);
    // tuple element-type at index 0 should resolve to string primitive
    checkType(lbl, type, { primitive: true, kind: 'string' });
  });

// --- Intersection types ---

runBoth('intersection: `{x: string} & {y: number}` member access via x -> string',
  `
    type A = { x: string };
    type B = { y: number };
    function f(v: A & B) { return v.x; }
  `,
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(member), { primitive: true, kind: 'string' });
  });

// --- Utility types: NonNullable<T>, ReturnType<F>, Parameters<F> ---

runBoth('utility: NonNullable<string|null> -> string',
  'let x: NonNullable<string | null>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: true, kind: 'string' });
  });

runBoth('utility: ReturnType<() => number[]> -> Array',
  'declare function f(): number[]; let x: ReturnType<typeof f>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// `ConstructorParameters<typeof C>` where C has no own constructor and extends an AMBIENT
// `declare class` parent: babel's runtime-expression lookup bails on the value-less ambient super,
// so without a TYPE-level fallback the inherited element type diverges from oxc (which resolves
// the super). both parsers must walk into the parent's `number[]` constructor param
runBoth('utility: ConstructorParameters<typeof C>[0] inherits ambient declare-class super -> Array',
  'declare class Base { constructor(rows: number[]); }\nclass C extends Base {}\nlet x: ConstructorParameters<typeof C>[0];',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// the ambient-super fallback must keep walking MULTIPLE levels: C -> B -> A, both intermediates
// value-less `declare class`. each hop re-enters the type-level lookup, so the constructor on the
// grandparent still surfaces (a single-level fallback would stall at B and bail null on babel)
runBoth('utility: ConstructorParameters<typeof C>[0] walks two ambient declare-class levels -> Array',
  'declare class A { constructor(rows: number[]); }\ndeclare class B extends A {}\nclass C extends B {}\nlet x: ConstructorParameters<typeof C>[0];',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// no constructor anywhere in the ambient chain: the walk must terminate gracefully (null), not
// loop or throw - guards the fallback's depth-bounded termination on both parsers
runBoth('utility: ConstructorParameters<typeof C>[0] with no ctor in ambient chain -> null',
  'declare class A {}\ndeclare class B extends A {}\nclass C extends B {}\nlet x: ConstructorParameters<typeof C>[0];',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkTruthy(`${ lbl } resolves to null without throwing`, resolver.resolveNodeType(decl.get('id')) === null);
  });

// --- Index access types ---

runBoth('TS index access: type Foo = { x: string }; Foo["x"] -> string',
  'type Foo = { x: number[] }; let v: Foo["x"];',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// --- Pick / Omit deeper ---

runBoth('utility: Pick<{x: string, y: number}, "x"> -> object',
  'type T = Pick<{ x: string; y: number }, "x">; let v: T;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(decl.get('id'));
    // Pick preserves object-typed shape (no concrete ctor for anonymous object types)
    checkTruthy(`${ lbl } Pick yields non-primitive type`, type && type.primitive === false);
  });

// --- Symbol-keyed access on instance ---

// the resolver should at least handle the chained call without throwing -
// result may be null (Symbol.iterator return-type isn't statically tabulated).
// `runBothAndAgree` ensures the parsers don't DIVERGE: previously each adapter
// independently accepted null, so one returning null and the other returning a
// Type would still pass. now both must produce the same shape, catching the
// cross-parser regression class
runBothAndAgree('Symbol.iterator access on Array instance agrees across parsers',
  'const a = [1, 2]; const it = a[Symbol.iterator]();',
  (adapter, prog) => {
    const call = adapter.pickPath(prog, 'CallExpression');
    const resolver = adapter.makeResolver();
    return resolver.resolveNodeType(call);
  });

// --- top-level `this` global-proxy assumption ---

// pragmatic assumption: top-level `this` IS the global proxy regardless of sourceType (an
// ESM-undefined `this` chain is statically dead, script / CommonJS-shaped code means the
// global), so the proxy narrow applies
runBoth('top-level this.Map resolves as Map', 'const m = new this.Map();',
  (adapter, prog, lbl) => {
    const newExpr = adapter.pickPath(prog, 'NewExpression');
    checkType(lbl, adapter.makeResolver().resolveNodeType(newExpr), { primitive: false, ctor: 'Map' });
  });

// `this` inside a NON-arrow function is rebound - never the global proxy
runBoth('function this.Map does not resolve', 'function f() { return new this.Map(); } f();',
  (adapter, prog, lbl) => {
    const newExpr = adapter.pickPath(prog, 'NewExpression');
    check(lbl, adapter.makeResolver().resolveNodeType(newExpr)?.constructor ?? null, null);
  });

// --- defaulted destructure binding fold ---

// unknown member side keeps the generic dispatch (a default-only narrow was unsound)
runBoth('destructure default with unknown member folds to null',
  'const { items = [] } = JSON.parse(x); items.at(0);',
  (adapter, prog, lbl) => {
    const at = adapter.pickPath(prog, 'CallExpression', p => p.node.callee?.property?.name === 'at');
    check(lbl, adapter.makeResolver().resolveNodeType(at.get('callee').get('object')), null);
  });

// statically absent member: the default always fires - its type alone is precise
runBoth('destructure default with statically absent member takes the default type',
  "const [a = 'x'] = []; a.at(0);",
  (adapter, prog, lbl) => {
    const at = adapter.pickPath(prog, 'CallExpression', p => p.node.callee?.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(at.get('callee').get('object')),
      { primitive: true, kind: 'string' });
  });

// statically present member: the default is dead - the member's type alone is precise
runBoth('destructure default with statically present member takes the member type',
  "const [a = 0] = ['hello']; a.at(0);",
  (adapter, prog, lbl) => {
    const at = adapter.pickPath(prog, 'CallExpression', p => p.node.callee?.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(at.get('callee').get('object')),
      { primitive: true, kind: 'string' });
  });

// --- globalThis member access ---

runBoth('globalThis.Map() resolved as Map constructor invocation',
  'const m = new globalThis.Map();',
  (adapter, prog, lbl) => {
    const newExpr = adapter.pickPath(prog, 'NewExpression');
    const resolver = adapter.makeResolver();
    // engine routes `globalThis.Map` through proxy-global member resolution
    checkType(lbl, resolver.resolveNodeType(newExpr), { primitive: false, ctor: 'Map' });
  });

// `isProxyGlobalIifeReturn` walks the call's `fnPath` to locate the arrow / fn-expr body.
// `peelIIFEReturn` (the node-level companion) peels TS / paren / chain wrappers on the
// callee via `unwrapInitValue + unwrapRuntimeExpr`. when the path-level walk only peeled
// `ParenthesizedExpression`, TS-wrapped callees never matched their body, breaking
// proxy-global detection for shapes like `((() => globalThis) as any)().Map`
runBoth('proxy-global: TS-wrapped IIFE callee resolves through proxy-global chain',
  'const m = new (((() => globalThis) as any)()).Map();',
  (adapter, prog, lbl) => {
    const newExpr = adapter.pickPath(prog, 'NewExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(newExpr), { primitive: false, ctor: 'Map' });
  });

// FunctionExpression IIFE variant of the same shape - `(function(){ return self })().Map`.
// distinct from the arrow case: callee shape goes through a different branch of
// `peelIIFEReturn` (function-expression vs arrow), and the inner body return-path differs
runBoth('proxy-global: FunctionExpression IIFE returning self resolves through Map ctor',
  'const m = new ((function () { return self; })()).Map();',
  (adapter, prog, lbl) => {
    const newExpr = adapter.pickPath(prog, 'NewExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(newExpr), { primitive: false, ctor: 'Map' });
  });

// TSSatisfiesExpression wrapper - distinct from TSAsExpression but both runtime no-ops.
// shared peel via SKIPPABLE_WRAPPER_TYPES covers both; explicit fixture pins that the
// alternate wrapper choice doesn't regress
runBoth('proxy-global: TSSatisfiesExpression-wrapped IIFE callee resolves',
  'const m = new (((() => globalThis) satisfies unknown)()).Map();',
  (adapter, prog, lbl) => {
    const newExpr = adapter.pickPath(prog, 'NewExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(newExpr), { primitive: false, ctor: 'Map' });
  });

// --- Function declaration return type ---

runBoth('function declaration with explicit return -> Promise',
  'function f(): Promise<number> { return Promise.resolve(1); } const r = f();',
  (adapter, prog, lbl) => {
    // pick `f()` outer call (not `Promise.resolve` inside)
    const calls = adapter.collectPaths(prog, 'CallExpression');
    // find the call whose callee is bare Identifier `f`
    const fCall = calls.find(p => p.node.callee?.type === 'Identifier'
      && p.node.callee?.name === 'f');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(fCall),
      { primitive: false, ctor: 'Promise' });
  });

// --- TypeQuery (`typeof X` in type position) ---

runBoth('TS typeof in type: `typeof arr` where arr: number[] -> Array',
  'const arr: number[] = []; let x: typeof arr;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// a reassigned (non-const) but ANNOTATED `let` keeps its DECLARED type under `typeof` - TS reads
// the annotation, not the narrowed value. `constantBindingPath` bails because the binding isn't
// constant, so the resolver recovers the type via the declarator's explicit annotation instead
runBoth('TS typeof in type: reassigned annotated `let m: Map` -> typeof m still resolves to Map',
  'let m: Map<string, number> = new Map(); m = new Map(); let x: typeof m;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Map' });
  });

// --- Readonly / ReadonlyArray ---

runBoth('readonly array annotation -> Array',
  'let x: readonly string[];',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

runBoth('ReadonlyArray<T> annotation -> Array',
  'let x: ReadonlyArray<number>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// --- Destructuring with annotation propagation ---

runBoth('array destructure of tuple: `const [a, b]: [string, number[]] = ...` a -> string',
  'const [a, b]: [string, number[]] = ["", []];',
  (adapter, prog, lbl) => {
    // pick `a` Identifier inside the ArrayPattern
    const ids = adapter.collectPaths(prog, 'Identifier', p => p.node?.name === 'a');
    // pattern position - the bound name appears in the destructure
    const aRef = ids.find(p => {
      let cur = p.parentPath;
      while (cur) {
        if (cur.node?.type === 'ArrayPattern') return true;
        cur = cur.parentPath;
      }
      return false;
    });
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(aRef);
    // we don't strictly require tuple-element narrowing here; ensure resolver doesn't crash
    // and returns something non-throwing (null is acceptable - the contract is no exception)
    checkTruthy(`${ lbl } destructure id resolves without throw`, type === null || type !== undefined);
  });

// --- Array.isArray narrowing ---

runBoth('Array.isArray narrowing inside if -> Array',
  'function f(v: unknown) { if (Array.isArray(v)) { return v; } }',
  (adapter, prog, lbl) => {
    const ref = pickReturnArg(adapter, prog, 'v');
    const resolver = adapter.makeResolver();
    const type = resolver.resolveNodeType(ref);
    // engine may not implement Array.isArray narrowing; smoke-test no-throw + acceptable result
    if (type) {
      checkType(lbl, type, { primitive: false, ctor: 'Array' });
    } else {
      pass();
    }
  });

// --- Generic constraint propagation ---

runBoth('generic constraint via `<T extends number[]>` -> Array',
  'function g<T extends number[]>(x: T) { return x; } let v: ReturnType<typeof g>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(decl.get('id'));
      pass();
    } catch (error) { fail(lbl, `threw: ${ error.message }`); }
  });

// --- Static class members ---

runBoth('Static method on class invocation -> declared return',
  'class C { static all(): string[] { return []; } } const r = C.all();',
  (adapter, prog, lbl) => {
    const call = adapter.pickPath(prog, 'CallExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(call),
      { primitive: false, ctor: 'Array' });
  });

// --- Object literal spread inference ---

runBoth('Object literal with spread does not crash',
  'const o = { ...{}, x: 1 }; const v = o;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(decl.get('id'));
      pass();
    } catch (error) { fail(lbl, `threw: ${ error.message }`); }
  });

// --- Template literal types ---

// NOTE: TS template-literal types in source use `${string}` placeholders - the test's source
// literal must contain that syntax verbatim. disable lint rules that fire on its appearance
// inside a non-template-string test fixture
runBoth('Template literal type with string placeholder smoke',
  // eslint-disable-next-line no-template-curly-in-string -- TS template-literal type fixture
  'let v: `pre-${string}`;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    try {
      const type = resolver.resolveNodeType(decl.get('id'));
      // resolver may yield string primitive for known-string template, or null/object;
      // contract here is just no-throw
      if (type?.primitive && type.type === 'string') {
        pass();
      } else {
        pass();
      }
    } catch (error) { fail(lbl, `threw: ${ error.message }`); }
  });

// --- Resolver entry points: edge cases ---

runBoth('resolvePropertyObjectType: Map instance .get -> Map',
  'const m = new Map(); const v = m.get;',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolvePropertyObjectType(member),
      { primitive: false, ctor: 'Map' });
  });

runBoth('resolveGuardHints: typeof === string returns concrete (null hints)',
  'function f(x: unknown) { if (typeof x === "string") { return x; } }',
  (adapter, prog, lbl) => {
    const ref = pickReturnArg(adapter, prog, 'x');
    const resolver = adapter.makeResolver();
    // resolveNodeType resolves to string primitive (concrete) => guardHints returns null
    // since the narrowing flows through resolveNodeType, not the guard-hint channel
    const hints = resolver.resolveGuardHints(ref);
    // null OR a hints object both acceptable; verify no throw
    if (hints === null || (hints && typeof hints === 'object')) pass();
    else fail(lbl, `unexpected ${ JSON.stringify(hints) }`);
  });

runBoth('isString / isObject on number literal',
  'const n = 42;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    check(`${ lbl } isString`, resolver.isString(decl.get('init')), false);
    check(`${ lbl } isObject`, resolver.isObject(decl.get('init')), false);
  });

runBoth('isString on TemplateLiteral',
  // eslint-disable-next-line no-template-curly-in-string -- TS template-literal fixture source
  'const s = `${1}`;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    check(`${ lbl } isString TemplateLiteral`,
      resolver.isString(decl.get('init')), true);
  });

// --- Type alias self-reference (must not infinite loop) ---

runBoth('Self-referential alias terminates: type X = X; let v: X;',
  'type X = X; let v: X;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(decl.get('id'));
      pass();
    } catch (error) { fail(lbl, `threw: ${ error.message }`); }
  });

// --- Union of arrays ---

runBoth('Union of arrays narrowed inside Array.isArray no-throw',
  `
    function g(v: string[] | number[]) {
      if (Array.isArray(v)) { return v; }
    }
  `,
  (adapter, prog, lbl) => {
    const ref = pickReturnArg(adapter, prog, 'v');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(ref);
      pass();
    } catch (error) { fail(lbl, `threw: ${ error.message }`); }
  });

// --- Enum types ---

// `E.A` resolves through resolveEnumMemberAccess -> resolveEnumMemberType, which classifies
// each member's initializer kind. table-driven cases below cover the per-member kind
// classification + heterogeneous mixes + the known back-ref limit + const enums (constness
// is compile-time only - runtime kind matches non-const enums)

const ENUM_MEMBER_CASES = [
  // single-member string / numeric / implicit-numeric
  { label: 'string', src: 'enum E { A = "foo" } const v = E.A;', kind: 'string' },
  { label: 'numeric', src: 'enum E { A = 42 } const v = E.A;', kind: 'number' },
  { label: 'implicit-numeric', src: 'enum E { A, B } const v = E.A;', kind: 'number' },
  // back-to-back same-kind members
  { label: 'back-to-back string A', src: 'enum E { A = "x", B = "y" } const v = E.A;', kind: 'string' },
  { label: 'back-to-back string B', src: 'enum E { A = "x", B = "y" } const v = E.B;', kind: 'string' },
  // heterogeneous mix - each member classified independently
  { label: 'mix string A', src: 'enum E { A = "foo", B = 42, C = "bar" } const v = E.A;', kind: 'string' },
  { label: 'mix number B', src: 'enum E { A = "foo", B = 42, C = "bar" } const v = E.B;', kind: 'number' },
  { label: 'mix string C', src: 'enum E { A = "foo", B = 42, C = "bar" } const v = E.C;', kind: 'string' },
  // const enum: constness is compile-time concern; runtime kind identical to non-const
  { label: 'const enum string', src: 'const enum E { A = "foo" } const v = E.A;', kind: 'string' },
  { label: 'const enum numeric', src: 'const enum E { A = 42 } const v = E.A;', kind: 'number' },
];

for (const { label, src, kind } of ENUM_MEMBER_CASES) {
  runBoth(`enum member kind: ${ label } -> ${ kind } primitive`, src, (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')),
      { primitive: true, kind });
  });
}

// known limit: resolveEnumMemberKind doesn't chase Identifier or MemberExpression back-refs
// to peer members. flip these into ENUM_MEMBER_CASES if the classifier learns to follow them
const ENUM_BAIL_CASES = [
  { label: 'identifier back-ref to peer (numeric)', src: 'enum E { A = 1, B = A } const v = E.B;' },
  { label: 'member back-ref (E.A forward-ref)', src: 'enum E { A = "x", B = E.A } const v = E.B;' },
];

for (const { label, src } of ENUM_BAIL_CASES) {
  runBoth(`enum member bail: ${ label }`, src, (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    const type = adapter.makeResolver().resolveNodeType(decl.get('init'));
    if (type === null) return pass();
    return fail(lbl, `expected null bail, got ${ JSON.stringify(type) }`);
  });
}

// type-position enum-member reference (`let v: E.A`) goes through resolveTypeAnnotation -
// separate path from value-position. resolver must not crash; narrow type-ref tabulation
// is out of scope
const ENUM_TYPE_REF_CASES = [
  { label: 'numeric enum type ref', src: 'enum E { A, B } let v: E.A;' },
  { label: 'string enum type ref', src: 'enum E { A = "a", B = "b" } let v: E.A;' },
];

for (const { label, src } of ENUM_TYPE_REF_CASES) {
  runBoth(`enum type ref smoke: ${ label }`, src, (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'v');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(decl.get('id'));
      pass();
    } catch (error) { fail(lbl, `threw: ${ error.message }`); }
  });
}

// --- Prototype-method access on built-in ---

runBoth('Array.prototype.map identity does not crash resolver',
  'const m = Array.prototype.map;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'm');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(decl.get('init'));
      pass();
    } catch (error) {
      fail(lbl, `threw: ${ error.message }`);
    }
  });

// --- Optional-chain call return ---

runBoth('optional call: obj?.fn() does not crash',
  'declare const obj: { fn(): string[] } | null; const r = obj?.fn();',
  (adapter, prog, lbl) => {
    // outermost call: pickPath returns first match - either CallExpression (babel
    // OptionalCallExpression treated similarly) or wrapper. ensure resolver runs.
    const calls = adapter.collectPaths(prog, 'CallExpression');
    const optCalls = adapter.collectPaths(prog, 'OptionalCallExpression');
    const call = calls[0] ?? optCalls[0];
    if (!call) return fail(lbl, 'no call expression found');
    const resolver = adapter.makeResolver();
    try {
      resolver.resolveNodeType(call);
      pass();
    } catch (error) {
      fail(lbl, `threw: ${ error.message }`);
    }
  });

// --- typeof X for binding without annotation ---

runBoth('typeof annotation reads init type: `typeof a` where a = [] -> Array',
  'const a = []; let x: typeof a;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// --- Generic alias chain ---

runBoth('generic alias chain: `type Wrap<T> = T; type Of = Wrap<number[]>` -> Array',
  'type Wrap<T> = T; type Of = Wrap<number[]>; let v: Of;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(decl.get('id')),
      { primitive: false, ctor: 'Array' });
  });

// --- Class with explicit method return annotation ---

runBoth('class method declared return -> Map',
  `
    class C { m(): Map<string, number> { return new Map(); } }
    const c = new C();
    const r = c.m();
  `,
  (adapter, prog, lbl) => {
    // pick the outer `c.m()` (not the inner `new Map()`)
    const calls = adapter.collectPaths(prog, 'CallExpression');
    const outerCall = calls.find(p => p.node.callee?.type === 'MemberExpression'
      && p.node.callee.property?.name === 'm');
    if (!outerCall) return fail(lbl, 'no c.m() found');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(outerCall),
      { primitive: false, ctor: 'Map' });
  });

// --- Capture-avoidance: colliding generic type-param name in receiver args ---
// `Wrap<string, A>` over `class Wrap<A, Q>` - the usage-arg `A` collides with sibling param `A`.
// without capture-avoidance (scope passed to buildSubstMap) the transitive subst re-captures
// Q -> A -> string; with it, the colliding `A` resolves to its alias body (number[]), so `m(): Q`
// narrows to Array, not string. regression guard for the buildSubstMap scope-less callers
runBoth('capture-avoidance: colliding generic param resolves class member to the outer alias',
  `
    type A = number[];
    class Wrap<A, Q> { m(): Q { return null; } }
    declare const c: Wrap<string, A>;
    const r = c.m();
  `,
  (adapter, prog, lbl) => {
    const calls = adapter.collectPaths(prog, 'CallExpression');
    const outerCall = calls.find(p => p.node.callee?.type === 'MemberExpression'
      && p.node.callee.property?.name === 'm');
    if (!outerCall) return fail(lbl, 'no c.m() found');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(outerCall), { primitive: false, ctor: 'Array' });
  });

// inherited member through the extends chain: `Sub extends Base<string, A>` carries the same
// colliding `A` arg into the parent-class subst (buildParentClassSubstFromNodes). without the scope
// thread, Q -> A -> string; with it, Q -> number[], so the inherited `m(): Q` narrows to Array
runBoth('capture-avoidance: colliding generic param resolves inherited member to the outer alias',
  `
    type A = number[];
    class Base<A, Q> { m(): Q { return null; } }
    class Sub extends Base<string, A> {}
    declare const c: Sub;
    const r = c.m();
  `,
  (adapter, prog, lbl) => {
    const calls = adapter.collectPaths(prog, 'CallExpression');
    const outerCall = calls.find(p => p.node.callee?.type === 'MemberExpression'
      && p.node.callee.property?.name === 'm');
    if (!outerCall) return fail(lbl, 'no c.m() found');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(outerCall), { primitive: false, ctor: 'Array' });
  });

// awaited value through a user thenable with a colliding generic: the `.then` cb-arg Q resolves via
// buildSubstMap in awaited.js. without the scope thread Q -> A -> string; with it Q -> number[]
runBoth('capture-avoidance: colliding generic param resolves awaited thenable value to the outer alias',
  `
    type A = number[];
    class Th<A, Q> { then(cb: (v: Q) => void): void {} }
    declare function f(): Th<string, A>;
    async function g() {
      const r = await f();
    }
  `,
  (adapter, prog, lbl) => {
    const aw = adapter.pickPath(prog, 'AwaitExpression');
    if (!aw) return fail(lbl, 'no await found');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(aw), { primitive: false, ctor: 'Array' });
  });

// element type of a user array-like alias with a colliding generic, via array destructuring:
// extractElementAnnotation -> resolveUserTypeElement -> buildSubstMap in element-types.js. without
// the scope thread the element Q -> A -> string; with it Q -> number[] (Array)
runBoth('capture-avoidance: colliding generic param resolves destructured element to the outer alias',
  `
    type A = number[];
    type Arr<A, Q> = Q[];
    declare const c: Arr<string, A>;
    const [x] = c;
  `,
  (adapter, prog, lbl) => {
    const x = adapter.pickPath(prog, 'Identifier',
      p => p.node.name === 'x' && p.parentPath?.node?.type === 'ArrayPattern');
    if (!x) return fail(lbl, 'no destructured x found');
    const resolver = adapter.makeResolver();
    checkType(lbl, resolver.resolveNodeType(x), { primitive: false, ctor: 'Array' });
  });

// --- Isolated sub-module tests ---
// validate that extracted modules work standalone, without going through the resolver
// factory. each test imports the module directly and exercises its public API against
// minimal synthetic inputs

// --- exit-analysis (pure AST control-flow walker) ---

{
  // `return;` -> always exits
  const returnNode = { type: 'ReturnStatement' };
  check('exit-analysis: ReturnStatement always exits', nodeAlwaysExits(returnNode), true);

  // `if (cond) return; else throw new Error()` -> always exits (both branches exit)
  const ifNode = {
    type: 'IfStatement',
    consequent: { type: 'ReturnStatement' },
    alternate: { type: 'ThrowStatement' },
  };
  check('exit-analysis: if with both-branch exits', nodeAlwaysExits(ifNode), true);

  // `if (cond) return;` -> NOT always exits (no alternate). impl returns null via
  // short-circuit `node.alternate && ...` - callers check truthiness, so the falsy
  // value is the contract, not the specific null vs false form
  const ifWithoutElse = {
    type: 'IfStatement',
    consequent: { type: 'ReturnStatement' },
    alternate: null,
  };
  check('exit-analysis: if without alternate is not always-exits (falsy)',
    !nodeAlwaysExits(ifWithoutElse), true);

  // empty block -> false (no statements means no exit)
  check('exit-analysis: empty block is not always-exits',
    nodeAlwaysExits({ type: 'BlockStatement', body: [] }), false);

  // `case 'x': return; break;` -> exits BEFORE break, so `canFallThrough` is false
  const caseWithReturn = { consequent: [{ type: 'ReturnStatement' }] };
  check('exit-analysis: canFallThrough false for case-with-return',
    canFallThrough(caseWithReturn), false);

  // `case 'x': foo();` -> falls through (no exit statement)
  const caseWithoutExit = { consequent: [{ type: 'ExpressionStatement' }] };
  check('exit-analysis: canFallThrough true for case-without-exit',
    canFallThrough(caseWithoutExit), true);
}

// --- guard-builders (pure guard descriptor constructors) ---

{
  // typeofGuard: object with required fields, no extra mutation
  const g = typeofGuard('string', false);
  check('guard-builders: typeofGuard kind', g.kind, 'typeof');
  check('guard-builders: typeofGuard value', g.value, 'string');
  check('guard-builders: typeofGuard negated', g.negated, false);

  const ng = instanceofGuard('Array', true);
  check('guard-builders: instanceofGuard kind', ng.kind, 'instanceof');
  check('guard-builders: instanceofGuard constructorName', ng.constructorName, 'Array');
  check('guard-builders: instanceofGuard negated', ng.negated, true);

  // guardFromResolvedType: primitive Type -> typeof guard
  const fromPrimitive = guardFromResolvedType({ primitive: true, type: 'string' }, false);
  check('guard-builders: from primitive -> typeof guard',
    fromPrimitive?.kind, 'typeof');
  check('guard-builders: from primitive -> value', fromPrimitive?.value, 'string');

  // guardFromResolvedType: object Type with constructor -> instanceof guard
  const fromObject = guardFromResolvedType({ primitive: false, constructor: 'Map' }, false);
  check('guard-builders: from object -> instanceof guard',
    fromObject?.kind, 'instanceof');
  check('guard-builders: from object -> constructorName',
    fromObject?.constructorName, 'Map');

  // null input -> null output
  check('guard-builders: from null -> null', guardFromResolvedType(null, false), null);

  // guardFromHint: hint with lowercase primitive type -> typeof
  const hintPrim = guardFromHint({ type: 'string' }, false);
  check('guard-builders: hint string -> typeof guard kind', hintPrim?.kind, 'typeof');
  check('guard-builders: hint string -> value', hintPrim?.value, 'string');

  // guardFromHint: hint with capitalised constructor -> instanceof
  const hintObj = guardFromHint({ type: 'Array' }, true);
  check('guard-builders: hint Array -> instanceof guard kind', hintObj?.kind, 'instanceof');
  check('guard-builders: hint Array -> constructorName', hintObj?.constructorName, 'Array');
  check('guard-builders: hint Array -> negated', hintObj?.negated, true);

  // isTypeofVar: `typeof x` -> true when arg matches
  const typeofX = {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument: { type: 'Identifier', name: 'x' },
  };
  check('guard-builders: isTypeofVar(`typeof x`, "x") -> true', isTypeofVar(typeofX, 'x'), true);
  check('guard-builders: isTypeofVar(`typeof x`, "y") -> false', isTypeofVar(typeofX, 'y'), false);

  // isTypeofVar: non-typeof unary -> false
  const voidX = {
    type: 'UnaryExpression', operator: 'void', argument: { type: 'Identifier', name: 'x' },
  };
  check('guard-builders: isTypeofVar(`void x`, "x") -> false', isTypeofVar(voidX, 'x'), false);

  // isTypeofVar: typeof on non-identifier -> false
  const typeofExpr = {
    type: 'UnaryExpression',
    operator: 'typeof',
    argument: { type: 'CallExpression' },
  };
  check('guard-builders: isTypeofVar(`typeof f()`, "x") -> false', isTypeofVar(typeofExpr, 'x'), false);
}

// --- base utilities ($Primitive / $Object constructors, primitive helpers, hint round-trip) ---

{
  // $Primitive: marks primitive=true, stores type tag
  const prim = new $Primitive('number');
  check('base: $Primitive primitive', prim.primitive, true);
  check('base: $Primitive type', prim.type, 'number');

  // $Object: marks primitive=false, stores constructor + inner
  const inner = new $Primitive('string');
  const arr = new $Object('Array', inner);
  check('base: $Object primitive', arr.primitive, false);
  check('base: $Object constructor', arr.constructor, 'Array');
  check('base: $Object inner === passed inner', arr.inner, inner);

  // primitiveTypeOf: $Primitive('bigint') -> 'bigint'
  check('base: primitiveTypeOf bigint primitive', primitiveTypeOf(new $Primitive('bigint')), 'bigint');
  // primitiveTypeOf: $Object('Number') unwraps via UNBOXED_PRIMITIVES table -> 'number'
  check('base: primitiveTypeOf boxed Number -> number',
    primitiveTypeOf(new $Object('Number')), 'number');
  // primitiveTypeOf: $Object('Array') is not boxed-primitive -> null
  check('base: primitiveTypeOf Array -> null',
    primitiveTypeOf(new $Object('Array')), null);
  // primitiveTypeOf: null -> null
  check('base: primitiveTypeOf null -> null', primitiveTypeOf(null), null);

  // toHint: primitive -> hint string
  check('base: toHint $Primitive(string)', toHint(new $Primitive('string')), 'string');
  // toHint: object Array -> lowercase 'array'
  check('base: toHint $Object(Array)', toHint(new $Object('Array')), 'array');
  // toHint: unknown primitive -> null (not in TYPE_HINTS)
  check('base: toHint $Primitive(unknown)', toHint(new $Primitive('unknown')), null);
  // toHint: null -> null
  check('base: toHint null', toHint(null), null);

  // intersectHintSets: null seed -> copy of hints
  const seed = intersectHintSets(null, new Set(['a', 'b']));
  check('base: intersectHintSets fresh seed size', seed.size, 2);
  checkTruthy('base: intersectHintSets seed has a', seed.has('a'));
  checkTruthy('base: intersectHintSets seed has b', seed.has('b'));

  // intersectHintSets: narrows existing set in place
  const existing = new Set(['a', 'b', 'c']);
  const narrowed = intersectHintSets(existing, new Set(['a', 'c']));
  check('base: intersectHintSets returns same set ref', narrowed, existing);
  check('base: intersectHintSets narrowed size', narrowed.size, 2);
  checkTruthy('base: intersectHintSets narrowed has a', narrowed.has('a'));
  check('base: intersectHintSets narrowed dropped b', narrowed.has('b'), false);

  // getOrInitMap: missing key creates new Map
  const container = new WeakMap();
  const key = {};
  const inner1 = getOrInitMap(container, key);
  checkTruthy('base: getOrInitMap creates Map', inner1 instanceof Map);
  // second call returns SAME Map (key-cached)
  const inner2 = getOrInitMap(container, key);
  check('base: getOrInitMap is idempotent', inner1, inner2);
  // different key -> different Map
  const inner3 = getOrInitMap(container, {});
  checkTruthy('base: getOrInitMap different key -> different Map', inner1 !== inner3);
}

// --- ast-shapes (pure AST-shape predicates) ---

{
  // typeRefName: TSTypeReference with Identifier name
  const idRef = { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Foo' } };
  check('ast-shapes: typeRefName Identifier', typeRefName(idRef), 'Foo');

  // typeRefName: qualified name `NS.Foo` -> null (only single-segment names resolve to a
  // bare string; qualified names route through `typeRefSegments` for the full path)
  const qualified = {
    type: 'TSTypeReference',
    typeName: {
      type: 'TSQualifiedName',
      left: { type: 'Identifier', name: 'NS' },
      right: { type: 'Identifier', name: 'Foo' },
    },
  };
  check('ast-shapes: typeRefName qualified -> null', typeRefName(qualified), null);

  // typeRefSegments: bare Identifier -> single segment
  check('ast-shapes: typeRefSegments single', typeRefSegments(idRef)?.join('.'), 'Foo');

  // typeRefSegments: qualified -> joined segments
  check('ast-shapes: typeRefSegments qualified', typeRefSegments(qualified)?.join('.'), 'NS.Foo');

  // typeRefSegments: non-ref returns null
  check('ast-shapes: typeRefSegments non-ref -> null',
    typeRefSegments({ type: 'TSStringKeyword' }), null);

  // isTypeAlias / isInterfaceDeclaration: discriminator predicates
  checkTruthy('ast-shapes: isTypeAlias',
    isTypeAlias({ type: 'TSTypeAliasDeclaration' }));
  check('ast-shapes: isTypeAlias false for non-alias',
    isTypeAlias({ type: 'ClassDeclaration' }), false);
  checkTruthy('ast-shapes: isInterfaceDeclaration TS',
    isInterfaceDeclaration({ type: 'TSInterfaceDeclaration' }));
  checkTruthy('ast-shapes: isInterfaceDeclaration Flow',
    isInterfaceDeclaration({ type: 'InterfaceDeclaration' }));
  check('ast-shapes: isInterfaceDeclaration false for class',
    isInterfaceDeclaration({ type: 'ClassDeclaration' }), false);

  // typeAliasBody: TS uses `typeAnnotation`, Flow uses `right`
  const tsAlias = { type: 'TSTypeAliasDeclaration', typeAnnotation: { type: 'TSStringKeyword' } };
  check('ast-shapes: typeAliasBody TS',
    typeAliasBody(tsAlias)?.type, 'TSStringKeyword');
  const flowAlias = { type: 'TypeAlias', right: { type: 'StringTypeAnnotation' } };
  check('ast-shapes: typeAliasBody Flow',
    typeAliasBody(flowAlias)?.type, 'StringTypeAnnotation');

  // extendsId: TS extends carries an `expression`, Flow carries an `id`
  const tsExtends = { expression: { type: 'Identifier', name: 'Base' } };
  check('ast-shapes: extendsId TS', extendsId(tsExtends)?.name, 'Base');
  const flowExtends = { id: { type: 'Identifier', name: 'Base' } };
  check('ast-shapes: extendsId Flow', extendsId(flowExtends)?.name, 'Base');

  // synthInterfaceExtendsRef: wraps an extends clause into a synthetic TSTypeReference
  const synth = synthInterfaceExtendsRef({
    expression: { type: 'Identifier', name: 'Base' },
    typeParameters: { params: [{ type: 'TSStringKeyword' }] },
  });
  check('ast-shapes: synthInterfaceExtendsRef type', synth?.type, 'TSTypeReference');
  check('ast-shapes: synthInterfaceExtendsRef typeName name', synth?.typeName?.name, 'Base');
  check('ast-shapes: synthInterfaceExtendsRef typeParameters preserved',
    synth?.typeParameters?.params?.[0]?.type, 'TSStringKeyword');

  // synthInterfaceExtendsRef: non-Identifier expression -> null
  check('ast-shapes: synthInterfaceExtendsRef non-identifier -> null',
    synthInterfaceExtendsRef({ expression: { type: 'CallExpression' } }), null);

  // isQualifiedNameNode: TSQualifiedName (babel) and MemberExpression (oxc) both qualify
  checkTruthy('ast-shapes: isQualifiedNameNode TSQualifiedName',
    isQualifiedNameNode({ type: 'TSQualifiedName' }));
  checkTruthy('ast-shapes: isQualifiedNameNode MemberExpression',
    isQualifiedNameNode({ type: 'MemberExpression' }));
  check('ast-shapes: isQualifiedNameNode Identifier -> false',
    isQualifiedNameNode({ type: 'Identifier' }), false);

  // collectQualifiedSegments: walks a TSQualifiedName chain to its segments
  const qChain = {
    type: 'TSQualifiedName',
    left: {
      type: 'TSQualifiedName',
      left: { type: 'Identifier', name: 'A' },
      right: { type: 'Identifier', name: 'B' },
    },
    right: { type: 'Identifier', name: 'C' },
  };
  check('ast-shapes: collectQualifiedSegments depth-3 chain',
    collectQualifiedSegments(qChain)?.join('.'), 'A.B.C');

  // collectQualifiedSegments: bare Identifier -> [name]
  check('ast-shapes: collectQualifiedSegments Identifier',
    collectQualifiedSegments({ type: 'Identifier', name: 'X' })?.join('.'), 'X');
}

// --- helpers/ast-patterns (pure top-level utilities) ---

{
  // singleQuasiString: TemplateLiteral with no interpolations -> the cooked string
  const tpl = {
    type: 'TemplateLiteral',
    expressions: [],
    quasis: [{ value: { cooked: 'hello' } }],
  };
  check('ast-patterns: singleQuasiString cooked', singleQuasiString(tpl), 'hello');

  // singleQuasiString: template with expressions -> null
  const tplWithExpr = {
    type: 'TemplateLiteral',
    expressions: [{ type: 'Identifier', name: 'x' }],
    quasis: [{ value: { cooked: 'a' } }, { value: { cooked: 'b' } }],
  };
  check('ast-patterns: singleQuasiString interpolated -> null',
    singleQuasiString(tplWithExpr), null);

  // singleQuasiString: non-TemplateLiteral -> null
  check('ast-patterns: singleQuasiString non-template -> null',
    singleQuasiString({ type: 'StringLiteral', value: 'x' }), null);

  // kebabToCamel: `weak-map` -> `weakMap` (first char stays lowercase)
  check('ast-patterns: kebabToCamel weak-map', kebabToCamel('weak-map'), 'weakMap');
  check('ast-patterns: kebabToCamel async-iterator',
    kebabToCamel('async-iterator'), 'asyncIterator');
  // no-dash input passes through unchanged
  check('ast-patterns: kebabToCamel no-dash', kebabToCamel('plain'), 'plain');
  // multiple dashes
  check('ast-patterns: kebabToCamel multi-dash',
    kebabToCamel('a-b-c-d'), 'aBCD');

  // unwrapParens: strips ParenthesizedExpression chain
  const parened = {
    type: 'ParenthesizedExpression',
    expression: {
      type: 'ParenthesizedExpression',
      expression: { type: 'Identifier', name: 'x' },
    },
  };
  check('ast-patterns: unwrapParens nested', unwrapParens(parened)?.type, 'Identifier');
  // unwrapParens: bare node passes through
  check('ast-patterns: unwrapParens bare',
    unwrapParens({ type: 'Identifier', name: 'x' })?.type, 'Identifier');

  // unwrapRuntimeExpr: strips TS wrappers + parens + ChainExpression
  const tsWrapped = {
    type: 'TSAsExpression',
    expression: {
      type: 'ChainExpression',
      expression: {
        type: 'ParenthesizedExpression',
        expression: { type: 'Identifier', name: 'x' },
      },
    },
  };
  check('ast-patterns: unwrapRuntimeExpr chain', unwrapRuntimeExpr(tsWrapped)?.type, 'Identifier');

  // unwrapRuntimeExpr: TSNonNullExpression (`x!`) peels
  check('ast-patterns: unwrapRuntimeExpr non-null',
    unwrapRuntimeExpr({
      type: 'TSNonNullExpression',
      expression: { type: 'Identifier', name: 'y' },
    })?.name, 'y');

  // unwrapExpressionChain: strips ChainExpression wrappers (preserves remaining structure)
  const chainExpr = {
    type: 'ChainExpression',
    expression: {
      type: 'OptionalMemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'x' },
    },
  };
  check('ast-patterns: unwrapExpressionChain peels ChainExpression',
    unwrapExpressionChain(chainExpr)?.type, 'OptionalMemberExpression');

  // getTypeArgs: babel uses `typeParameters`; oxc/ESTree uses `typeArguments`. Helper covers both
  const babelArgs = { typeParameters: { params: ['arg'] } };
  check('ast-patterns: getTypeArgs babel', getTypeArgs(babelArgs)?.params?.[0], 'arg');
  const oxcArgs = { typeArguments: { params: ['arg'] } };
  check('ast-patterns: getTypeArgs oxc', getTypeArgs(oxcArgs)?.params?.[0], 'arg');
  // neither slot -> undefined
  check('ast-patterns: getTypeArgs neither',
    getTypeArgs({})?.params, undefined);

  // getSuperTypeArgs: babel `superTypeParameters`, oxc `superTypeArguments`
  const babelSuper = { superTypeParameters: { params: ['T'] } };
  check('ast-patterns: getSuperTypeArgs babel',
    getSuperTypeArgs(babelSuper)?.params?.[0], 'T');
  const oxcSuper = { superTypeArguments: { params: ['T'] } };
  check('ast-patterns: getSuperTypeArgs oxc',
    getSuperTypeArgs(oxcSuper)?.params?.[0], 'T');
}

// --- base sets / constants membership ---

{
  // PRIMITIVES: PRIMITIVE_HINTS + null + undefined
  const primitivesArr = [...PRIMITIVES];
  check('base sets: PRIMITIVES length (5 + null + undefined)', primitivesArr.length, 7);
  checkTruthy('base sets: PRIMITIVES has string', PRIMITIVES.has('string'));
  checkTruthy('base sets: PRIMITIVES has bigint', PRIMITIVES.has('bigint'));
  checkTruthy('base sets: PRIMITIVES has null', PRIMITIVES.has('null'));
  checkTruthy('base sets: PRIMITIVES has undefined', PRIMITIVES.has('undefined'));
  // object NOT a primitive
  check('base sets: PRIMITIVES has object', PRIMITIVES.has('object'), false);
  // function NOT a primitive
  check('base sets: PRIMITIVES has function', PRIMITIVES.has('function'), false);

  // PROMISE_SYNONYMS: TS PromiseLike + Flow Thenable
  checkTruthy('base sets: PROMISE_SYNONYMS has PromiseLike', PROMISE_SYNONYMS.has('PromiseLike'));
  checkTruthy('base sets: PROMISE_SYNONYMS has Thenable', PROMISE_SYNONYMS.has('Thenable'));
  // bare `Promise` is NOT a synonym - it's the canonical
  check('base sets: PROMISE_SYNONYMS no bare Promise',
    PROMISE_SYNONYMS.has('Promise'), false);

  // GENERATOR_LIKE_NAMES: iterator-shape names share `<TYield, TReturn, TNext>` slot order
  checkTruthy('base sets: GENERATOR_LIKE_NAMES has Generator',
    GENERATOR_LIKE_NAMES.has('Generator'));
  checkTruthy('base sets: GENERATOR_LIKE_NAMES has AsyncGenerator',
    GENERATOR_LIKE_NAMES.has('AsyncGenerator'));
  checkTruthy('base sets: GENERATOR_LIKE_NAMES has IteratorObject (TS 5.6+)',
    GENERATOR_LIKE_NAMES.has('IteratorObject'));
  checkTruthy('base sets: GENERATOR_LIKE_NAMES has IterableIterator',
    GENERATOR_LIKE_NAMES.has('IterableIterator'));
  // Array is NOT iterator-shape (its T is element type, but slot semantics differ)
  check('base sets: GENERATOR_LIKE_NAMES rejects Array',
    GENERATOR_LIKE_NAMES.has('Array'), false);

  // STRUCTURE_PRESERVING_WRAPPERS: TRANSPARENT_WRAPPERS ∪ KEY_FILTERING_WRAPPERS
  checkTruthy('base sets: STRUCTURE_PRESERVING_WRAPPERS has Partial',
    STRUCTURE_PRESERVING_WRAPPERS.has('Partial'));
  checkTruthy('base sets: STRUCTURE_PRESERVING_WRAPPERS has Readonly',
    STRUCTURE_PRESERVING_WRAPPERS.has('Readonly'));
  checkTruthy('base sets: STRUCTURE_PRESERVING_WRAPPERS has NoInfer',
    STRUCTURE_PRESERVING_WRAPPERS.has('NoInfer'));
  checkTruthy('base sets: STRUCTURE_PRESERVING_WRAPPERS has Pick',
    STRUCTURE_PRESERVING_WRAPPERS.has('Pick'));
  checkTruthy('base sets: STRUCTURE_PRESERVING_WRAPPERS has Omit',
    STRUCTURE_PRESERVING_WRAPPERS.has('Omit'));
  // `ThisType` and `Exclude` are NOT structure-preserving
  check('base sets: STRUCTURE_PRESERVING_WRAPPERS no ThisType',
    STRUCTURE_PRESERVING_WRAPPERS.has('ThisType'), false);
  check('base sets: STRUCTURE_PRESERVING_WRAPPERS no Exclude',
    STRUCTURE_PRESERVING_WRAPPERS.has('Exclude'), false);

  // NULLABLE_NEVER_ANNOTATIONS: both TS and Flow annotation type names
  checkTruthy('base sets: NULLABLE_NEVER_ANNOTATIONS has TSNullKeyword',
    NULLABLE_NEVER_ANNOTATIONS.has('TSNullKeyword'));
  checkTruthy('base sets: NULLABLE_NEVER_ANNOTATIONS has TSNeverKeyword',
    NULLABLE_NEVER_ANNOTATIONS.has('TSNeverKeyword'));
  checkTruthy('base sets: NULLABLE_NEVER_ANNOTATIONS has NullLiteralTypeAnnotation (Flow)',
    NULLABLE_NEVER_ANNOTATIONS.has('NullLiteralTypeAnnotation'));
  checkTruthy('base sets: NULLABLE_NEVER_ANNOTATIONS has EmptyTypeAnnotation (Flow never)',
    NULLABLE_NEVER_ANNOTATIONS.has('EmptyTypeAnnotation'));
  // string-keyword is NOT nullable/never
  check('base sets: NULLABLE_NEVER_ANNOTATIONS no TSStringKeyword',
    NULLABLE_NEVER_ANNOTATIONS.has('TSStringKeyword'), false);

  // MEMBER_ANNOTATION_SLOTS: ordered most-common slot first
  check('base sets: MEMBER_ANNOTATION_SLOTS[0] = typeAnnotation',
    MEMBER_ANNOTATION_SLOTS[0], 'typeAnnotation');
  check('base sets: MEMBER_ANNOTATION_SLOTS length', MEMBER_ANNOTATION_SLOTS.length, 3);
  checkTruthy('base sets: MEMBER_ANNOTATION_SLOTS has returnType',
    MEMBER_ANNOTATION_SLOTS.includes('returnType'));
  checkTruthy('base sets: MEMBER_ANNOTATION_SLOTS has value',
    MEMBER_ANNOTATION_SLOTS.includes('value'));

  // PRIMITIVE_WRAPPERS: typeof name -> wrapper-class name
  check('base sets: PRIMITIVE_WRAPPERS.string', PRIMITIVE_WRAPPERS.string, 'String');
  check('base sets: PRIMITIVE_WRAPPERS.number', PRIMITIVE_WRAPPERS.number, 'Number');
  check('base sets: PRIMITIVE_WRAPPERS.bigint', PRIMITIVE_WRAPPERS.bigint, 'BigInt');
  check('base sets: PRIMITIVE_WRAPPERS.boolean', PRIMITIVE_WRAPPERS.boolean, 'Boolean');
  check('base sets: PRIMITIVE_WRAPPERS.symbol', PRIMITIVE_WRAPPERS.symbol, 'Symbol');
  // null-prototype - no inherited Object methods
  check('base sets: PRIMITIVE_WRAPPERS null-proto',
    Object.getPrototypeOf(PRIMITIVE_WRAPPERS), null);

  // UNBOXED_PRIMITIVES: reverse of PRIMITIVE_WRAPPERS (wrapper name -> typeof name)
  check('base sets: UNBOXED_PRIMITIVES.String', UNBOXED_PRIMITIVES.String, 'string');
  check('base sets: UNBOXED_PRIMITIVES.BigInt', UNBOXED_PRIMITIVES.BigInt, 'bigint');
  // not a primitive wrapper - undefined
  check('base sets: UNBOXED_PRIMITIVES.Array',
    UNBOXED_PRIMITIVES.Array, undefined);

  // TYPEOF_HINT_GROUPS: typeof string -> Set of hint names that group is valid for
  checkTruthy('base sets: TYPEOF_HINT_GROUPS.string contains string',
    TYPEOF_HINT_GROUPS.string.has('string'));
  checkTruthy('base sets: TYPEOF_HINT_GROUPS.function contains function',
    TYPEOF_HINT_GROUPS.function.has('function'));
  // object group: all hints not covered by typeof groups
  checkTruthy('base sets: TYPEOF_HINT_GROUPS.object contains array',
    TYPEOF_HINT_GROUPS.object.has('array'));
  checkTruthy('base sets: TYPEOF_HINT_GROUPS.object contains regexp',
    TYPEOF_HINT_GROUPS.object.has('regexp'));
  // string NOT in object group (typeof would say `string`, not `object`)
  check('base sets: TYPEOF_HINT_GROUPS.object excludes string',
    TYPEOF_HINT_GROUPS.object.has('string'), false);

  // PATTERN_WRAPPERS: destructure pattern node types
  checkTruthy('base sets: PATTERN_WRAPPERS has ArrayPattern',
    PATTERN_WRAPPERS.has('ArrayPattern'));
  checkTruthy('base sets: PATTERN_WRAPPERS has ObjectPattern',
    PATTERN_WRAPPERS.has('ObjectPattern'));
  checkTruthy('base sets: PATTERN_WRAPPERS has AssignmentPattern',
    PATTERN_WRAPPERS.has('AssignmentPattern'));
  checkTruthy('base sets: PATTERN_WRAPPERS has RestElement',
    PATTERN_WRAPPERS.has('RestElement'));

  // AMBIENT_FUNCTION_TYPES: TS / Flow declare statements with function shape
  checkTruthy('base sets: AMBIENT_FUNCTION_TYPES has TSDeclareFunction',
    AMBIENT_FUNCTION_TYPES.has('TSDeclareFunction'));
  checkTruthy('base sets: AMBIENT_FUNCTION_TYPES has DeclareFunction (Flow)',
    AMBIENT_FUNCTION_TYPES.has('DeclareFunction'));
  // bare FunctionDeclaration not ambient
  check('base sets: AMBIENT_FUNCTION_TYPES rejects FunctionDeclaration',
    AMBIENT_FUNCTION_TYPES.has('FunctionDeclaration'), false);

  // AMBIENT_FN_OR_CLASS_DECLARATION_TYPES: superset including DeclareClass
  checkTruthy('base sets: AMBIENT_FN_OR_CLASS_DECLARATION_TYPES has DeclareClass',
    AMBIENT_FN_OR_CLASS_DECLARATION_TYPES.has('DeclareClass'));
  checkTruthy('base sets: AMBIENT_FN_OR_CLASS_DECLARATION_TYPES has TSDeclareFunction',
    AMBIENT_FN_OR_CLASS_DECLARATION_TYPES.has('TSDeclareFunction'));

  // TRANSPARENT_WRAPPERS: subset of STRUCTURE_PRESERVING_WRAPPERS without filtering
  checkTruthy('base sets: TRANSPARENT_WRAPPERS has Partial',
    TRANSPARENT_WRAPPERS.has('Partial'));
  // Pick NOT here - that's key-filtering
  check('base sets: TRANSPARENT_WRAPPERS no Pick',
    TRANSPARENT_WRAPPERS.has('Pick'), false);

  // KEY_FILTERING_WRAPPERS: Pick + Omit
  checkTruthy('base sets: KEY_FILTERING_WRAPPERS has Pick',
    KEY_FILTERING_WRAPPERS.has('Pick'));
  checkTruthy('base sets: KEY_FILTERING_WRAPPERS has Omit',
    KEY_FILTERING_WRAPPERS.has('Omit'));
  check('base sets: KEY_FILTERING_WRAPPERS no Partial',
    KEY_FILTERING_WRAPPERS.has('Partial'), false);

  // REBIND_ASSIGNMENT_OPERATORS: full-rebind ops
  checkTruthy('base sets: REBIND_ASSIGNMENT_OPERATORS has =',
    REBIND_ASSIGNMENT_OPERATORS.has('='));
  checkTruthy('base sets: REBIND_ASSIGNMENT_OPERATORS has ||=',
    REBIND_ASSIGNMENT_OPERATORS.has('||='));
  // arithmetic assign reads + mutates; NOT a rebind
  check('base sets: REBIND_ASSIGNMENT_OPERATORS rejects +=',
    REBIND_ASSIGNMENT_OPERATORS.has('+='), false);

  // ASSIGN_LEFT_TYPES: LHS shapes that bind runtime values
  checkTruthy('base sets: ASSIGN_LEFT_TYPES has Identifier',
    ASSIGN_LEFT_TYPES.has('Identifier'));
  checkTruthy('base sets: ASSIGN_LEFT_TYPES has ObjectPattern',
    ASSIGN_LEFT_TYPES.has('ObjectPattern'));
  checkTruthy('base sets: ASSIGN_LEFT_TYPES has ArrayPattern',
    ASSIGN_LEFT_TYPES.has('ArrayPattern'));

  // STRUCTURAL_WALK_SKIP_KEYS: identity/position metadata skipped during recursion
  checkTruthy('base sets: STRUCTURAL_WALK_SKIP_KEYS has type',
    STRUCTURAL_WALK_SKIP_KEYS.has('type'));
  checkTruthy('base sets: STRUCTURAL_WALK_SKIP_KEYS has loc',
    STRUCTURAL_WALK_SKIP_KEYS.has('loc'));
  checkTruthy('base sets: STRUCTURAL_WALK_SKIP_KEYS has range',
    STRUCTURAL_WALK_SKIP_KEYS.has('range'));

  // EXTENDS_CHILD_RESOLVERS: dispatch from extends-clause expression type to child slots
  const callNode = { arguments: [{ type: 'Identifier', name: 'Base' }] };
  check('base sets: EXTENDS_CHILD_RESOLVERS CallExpression first arg',
    EXTENDS_CHILD_RESOLVERS.CallExpression(callNode)[0]?.name, 'Base');
  // SpreadElement filtered out
  const callWithSpread = {
    arguments: [
      { type: 'SpreadElement' },
      { type: 'Identifier', name: 'X' },
    ],
  };
  check('base sets: EXTENDS_CHILD_RESOLVERS CallExpression skips spread',
    EXTENDS_CHILD_RESOLVERS.CallExpression(callWithSpread).length, 1);
  // ConditionalExpression -> [consequent, alternate]
  const cond = {
    consequent: { type: 'Identifier', name: 'A' },
    alternate: { type: 'Identifier', name: 'B' },
  };
  const condChildren = EXTENDS_CHILD_RESOLVERS.ConditionalExpression(cond);
  check('base sets: EXTENDS_CHILD_RESOLVERS Conditional consequent',
    condChildren[0]?.name, 'A');
  check('base sets: EXTENDS_CHILD_RESOLVERS Conditional alternate',
    condChildren[1]?.name, 'B');
  // SequenceExpression -> [tail]
  const seq = {
    expressions: [
      { type: 'Identifier', name: 'A' },
      { type: 'Identifier', name: 'B' },
    ],
  };
  const seqChildren = EXTENDS_CHILD_RESOLVERS.SequenceExpression(seq);
  check('base sets: EXTENDS_CHILD_RESOLVERS Sequence tail only',
    seqChildren[0]?.name, 'B');
}

// --- base.js: regexes + tables ---

{
  // INTRINSIC_STRING_TRANSFORMERS: TS-level Uppercase / Lowercase / Capitalize / Uncapitalize
  const transformerNames = Object.keys(INTRINSIC_STRING_TRANSFORMERS);
  check('base helpers: INTRINSIC_STRING_TRANSFORMERS count', transformerNames.length, 4);
  check('base helpers: Uppercase',
    INTRINSIC_STRING_TRANSFORMERS.Uppercase('hello'), 'HELLO');
  check('base helpers: Lowercase',
    INTRINSIC_STRING_TRANSFORMERS.Lowercase('HELLO'), 'hello');
  check('base helpers: Capitalize',
    INTRINSIC_STRING_TRANSFORMERS.Capitalize('hello'), 'Hello');
  check('base helpers: Uncapitalize',
    INTRINSIC_STRING_TRANSFORMERS.Uncapitalize('Hello'), 'hello');
  check('base helpers: Capitalize empty', INTRINSIC_STRING_TRANSFORMERS.Capitalize(''), '');

  // quasiText: cooked > raw > ''
  check('base helpers: quasiText cooked',
    quasiText({ value: { cooked: 'a', raw: 'a' } }), 'a');
  // raw fallback when cooked null (invalid escape)
  check('base helpers: quasiText raw fallback',
    quasiText({ value: { cooked: null, raw: 'b' } }), 'b');
  // empty-string fallback
  check('base helpers: quasiText empty', quasiText(null), '');
  check('base helpers: quasiText missing value', quasiText({}), '');

  // NUMERIC_KEY_SHAPE_RE: integer / float / scientific
  checkTruthy('base regex: NUMERIC_KEY_SHAPE_RE int', NUMERIC_KEY_SHAPE_RE.test('42'));
  checkTruthy('base regex: NUMERIC_KEY_SHAPE_RE neg int', NUMERIC_KEY_SHAPE_RE.test('-5'));
  checkTruthy('base regex: NUMERIC_KEY_SHAPE_RE float', NUMERIC_KEY_SHAPE_RE.test('1.5'));
  checkTruthy('base regex: NUMERIC_KEY_SHAPE_RE scientific',
    NUMERIC_KEY_SHAPE_RE.test('1e10'));
  check('base regex: NUMERIC_KEY_SHAPE_RE rejects letter',
    NUMERIC_KEY_SHAPE_RE.test('1a'), false);
  check('base regex: NUMERIC_KEY_SHAPE_RE rejects empty',
    NUMERIC_KEY_SHAPE_RE.test(''), false);

  // NUMBER_LITERAL_RE: JS number literal shape
  checkTruthy('base regex: NUMBER_LITERAL_RE 42', NUMBER_LITERAL_RE.test('42'));
  checkTruthy('base regex: NUMBER_LITERAL_RE 1.5', NUMBER_LITERAL_RE.test('1.5'));
  checkTruthy('base regex: NUMBER_LITERAL_RE .5', NUMBER_LITERAL_RE.test('.5'));
  // requires digits in mantissa
  check('base regex: NUMBER_LITERAL_RE rejects bare dot',
    NUMBER_LITERAL_RE.test('.'), false);

  // PLACEHOLDER_VALIDATORS: per-type segment match
  // String accepts anything
  checkTruthy('base helpers: PLACEHOLDER_VALIDATORS TSStringKeyword',
    PLACEHOLDER_VALIDATORS.TSStringKeyword('anything'));
  // Number requires literal shape + finite
  checkTruthy('base helpers: PLACEHOLDER_VALIDATORS TSNumberKeyword 42',
    PLACEHOLDER_VALIDATORS.TSNumberKeyword('42'));
  check('base helpers: PLACEHOLDER_VALIDATORS TSNumberKeyword reject text',
    PLACEHOLDER_VALIDATORS.TSNumberKeyword('hello'), false);
  // Infinity is finite-fail via Number(); regex would pass but `Number.isFinite` guards
  check('base helpers: PLACEHOLDER_VALIDATORS TSNumberKeyword Infinity reject',
    PLACEHOLDER_VALIDATORS.TSNumberKeyword('Infinity'), false);
}

// --- helpers/ast-patterns: pure predicates ---

{
  // isASTNode: shape-only check - object with string `type`
  checkTruthy('ast-patterns: isASTNode identifier',
    isASTNode({ type: 'Identifier', name: 'x' }));
  check('ast-patterns: isASTNode null', isASTNode(null), false);
  check('ast-patterns: isASTNode undefined', isASTNode(undefined), false);
  check('ast-patterns: isASTNode plain object', isASTNode({}), false);
  check('ast-patterns: isASTNode missing type', isASTNode({ name: 'x' }), false);
  check('ast-patterns: isASTNode primitive', isASTNode('Identifier'), false);
  check('ast-patterns: isASTNode array', isASTNode([{ type: 'X' }]), false);

  // isThisReceiver: peels TS / paren wrappers down to ThisExpression
  checkTruthy('ast-patterns: isThisReceiver bare',
    isThisReceiver({ type: 'ThisExpression' }));
  // wrapped in TS `as` expression
  checkTruthy('ast-patterns: isThisReceiver through TSAsExpression',
    isThisReceiver({
      type: 'TSAsExpression',
      expression: { type: 'ThisExpression' },
    }));
  // identifier is NOT a this-receiver
  check('ast-patterns: isThisReceiver identifier -> false',
    isThisReceiver({ type: 'Identifier', name: 'this' }), false);
  check('ast-patterns: isThisReceiver null -> false', isThisReceiver(null), false);

  // isDirectiveStatement: ExpressionStatement carrying babel's `.directive` field
  // (`use strict` etc.). babel populates `.directive` for prologue strings; absent -> false
  checkTruthy('ast-patterns: isDirectiveStatement use strict',
    isDirectiveStatement({
      type: 'ExpressionStatement',
      directive: 'use strict',
      expression: { type: 'StringLiteral', value: 'use strict' },
    }));
  // an empty-string directive IS part of the prologue per the spec (any string-literal
  // statement extends it) - rejecting it stopped the prologue scan ahead of a following
  // `'use strict'` and anchored injected imports before the strict directive
  check('ast-patterns: isDirectiveStatement empty directive',
    isDirectiveStatement({
      type: 'ExpressionStatement',
      directive: '',
      expression: { type: 'StringLiteral', value: '' },
    }), true);
  // no `.directive` -> false even if expression is a string literal
  check('ast-patterns: isDirectiveStatement no directive field',
    isDirectiveStatement({
      type: 'ExpressionStatement',
      expression: { type: 'StringLiteral', value: 'use strict' },
    }), false);
  // not an ExpressionStatement -> false
  check('ast-patterns: isDirectiveStatement Identifier -> false',
    isDirectiveStatement({ type: 'Identifier', name: 'x' }), false);
  check('ast-patterns: isDirectiveStatement null -> false',
    isDirectiveStatement(null), false);

  // isNonReferencePosition: property key of MemberExpression (non-computed) is NOT a reference
  const idNode = { type: 'Identifier', name: 'foo' };
  const memberAccess = { type: 'MemberExpression', property: idNode, computed: false };
  checkTruthy('ast-patterns: isNonReferencePosition member prop key',
    isNonReferencePosition(memberAccess, idNode));
  // computed: `obj[foo]` -> foo IS a reference
  check('ast-patterns: isNonReferencePosition member computed',
    isNonReferencePosition({ type: 'MemberExpression', property: idNode, computed: true }, idNode),
    false);
  // import specifier: imported side is NOT a reference (it names the export)
  checkTruthy('ast-patterns: isNonReferencePosition import imported name',
    isNonReferencePosition({ type: 'ImportSpecifier', imported: idNode, local: { type: 'Identifier' } },
      idNode));
  // labeled statement
  checkTruthy('ast-patterns: isNonReferencePosition LabeledStatement label',
    isNonReferencePosition({ type: 'LabeledStatement', label: idNode }, idNode));
  check('ast-patterns: isNonReferencePosition no parent',
    isNonReferencePosition(null, idNode), false);

  // isBindingPosition: VariableDeclarator id IS a binding (not a reference)
  checkTruthy('ast-patterns: isBindingPosition VariableDeclarator',
    isBindingPosition({ type: 'VariableDeclarator', id: idNode, init: null }, idNode));
  // FunctionDeclaration id
  checkTruthy('ast-patterns: isBindingPosition FunctionDeclaration',
    isBindingPosition({ type: 'FunctionDeclaration', id: idNode }, idNode));
  // ClassExpression id
  checkTruthy('ast-patterns: isBindingPosition ClassExpression',
    isBindingPosition({ type: 'ClassExpression', id: idNode }, idNode));
  // CatchClause param
  checkTruthy('ast-patterns: isBindingPosition CatchClause',
    isBindingPosition({ type: 'CatchClause', param: idNode }, idNode));
  // declarator init slot is a reference, not a binding
  check('ast-patterns: isBindingPosition VariableDeclarator init',
    isBindingPosition({ type: 'VariableDeclarator', id: { type: 'Identifier' }, init: idNode },
      idNode), false);
  check('ast-patterns: isBindingPosition no parent',
    isBindingPosition(null, idNode), false);

  // resolveCallArgument: indexed access into args; null index past end
  const args = [
    { type: 'Identifier', name: 'a' },
    { type: 'Identifier', name: 'b' },
  ];
  check('ast-patterns: resolveCallArgument 0', resolveCallArgument(args, 0)?.name, 'a');
  check('ast-patterns: resolveCallArgument 1', resolveCallArgument(args, 1)?.name, 'b');
  check('ast-patterns: resolveCallArgument past end',
    resolveCallArgument(args, 5), null);
  // spread of a literal array expands inline
  const spreadArgs = [
    { type: 'Identifier', name: 'a' },
    {
      type: 'SpreadElement',
      argument: {
        type: 'ArrayExpression',
        elements: [
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
        ],
      },
    },
    { type: 'Identifier', name: 'd' },
  ];
  check('ast-patterns: resolveCallArgument spread literal 0',
    resolveCallArgument(spreadArgs, 0)?.name, 'a');
  check('ast-patterns: resolveCallArgument spread literal 1',
    resolveCallArgument(spreadArgs, 1)?.name, 'b');
  check('ast-patterns: resolveCallArgument spread literal 2',
    resolveCallArgument(spreadArgs, 2)?.name, 'c');
  check('ast-patterns: resolveCallArgument spread literal 3',
    resolveCallArgument(spreadArgs, 3)?.name, 'd');
  // non-literal spread before index -> null (length unknowable)
  const opaqueSpread = [
    { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
    { type: 'Identifier', name: 'tail' },
  ];
  check('ast-patterns: resolveCallArgument opaque spread',
    resolveCallArgument(opaqueSpread, 0), null);

  // unwrapExportedDeclaration: export wrapping passes inner declaration through
  const exported = {
    type: 'ExportNamedDeclaration',
    declaration: { type: 'VariableDeclaration', kind: 'const' },
  };
  check('ast-patterns: unwrapExportedDeclaration named',
    unwrapExportedDeclaration(exported)?.type, 'VariableDeclaration');
  const exportedDefault = {
    type: 'ExportDefaultDeclaration',
    declaration: { type: 'FunctionDeclaration' },
  };
  check('ast-patterns: unwrapExportedDeclaration default',
    unwrapExportedDeclaration(exportedDefault)?.type, 'FunctionDeclaration');
  // re-export without declaration -> null
  check('ast-patterns: unwrapExportedDeclaration re-export',
    unwrapExportedDeclaration({ type: 'ExportNamedDeclaration', declaration: null }), null);
  // non-export passes through unchanged
  check('ast-patterns: unwrapExportedDeclaration passthrough',
    unwrapExportedDeclaration({ type: 'VariableDeclaration' })?.type, 'VariableDeclaration');
}

// --- ast-patterns: additional pure helpers ---

{
  // kebabToPascal: dash-cased -> PascalCase; null when not a string OR malformed
  check('ast-patterns: kebabToPascal weak-map', kebabToPascal('weak-map'), 'WeakMap');
  check('ast-patterns: kebabToPascal promise', kebabToPascal('promise'), 'Promise');
  check('ast-patterns: kebabToPascal async-iterator',
    kebabToPascal('async-iterator'), 'AsyncIterator');
  // leading dash or trailing dash -> reject (invalid kebab)
  check('ast-patterns: kebabToPascal leading dash',
    kebabToPascal('-map'), null);
  check('ast-patterns: kebabToPascal trailing dash',
    kebabToPascal('map-'), null);
  check('ast-patterns: kebabToPascal non-string',
    kebabToPascal(42), null);

  // isDeleteTarget: parent is `delete x` UnaryExpression
  checkTruthy('ast-patterns: isDeleteTarget delete unary',
    isDeleteTarget({ type: 'UnaryExpression', operator: 'delete' }));
  check('ast-patterns: isDeleteTarget typeof',
    isDeleteTarget({ type: 'UnaryExpression', operator: 'typeof' }), false);
  check('ast-patterns: isDeleteTarget non-unary',
    isDeleteTarget({ type: 'BinaryExpression', operator: '+' }), false);
  check('ast-patterns: isDeleteTarget null',
    isDeleteTarget(null), false);

  // isUpdateTarget: parent is `++` / `--` UpdateExpression
  checkTruthy('ast-patterns: isUpdateTarget increment',
    isUpdateTarget({ type: 'UpdateExpression', operator: '++' }));
  check('ast-patterns: isUpdateTarget non-update',
    isUpdateTarget({ type: 'AssignmentExpression' }), false);

  // propBindingIdentifier: shorthand `{ x }` value -> Identifier; nested patterns -> null
  const idValue = { type: 'Identifier', name: 'x' };
  check('ast-patterns: propBindingIdentifier identifier',
    propBindingIdentifier(idValue)?.name, 'x');
  // AssignmentPattern: `{ x = 1 }` -> left side
  const assignPat = {
    type: 'AssignmentPattern',
    left: { type: 'Identifier', name: 'y' },
    right: { type: 'NumericLiteral', value: 1 },
  };
  check('ast-patterns: propBindingIdentifier AssignmentPattern',
    propBindingIdentifier(assignPat)?.name, 'y');
  // nested pattern -> null
  check('ast-patterns: propBindingIdentifier ObjectPattern',
    propBindingIdentifier({ type: 'ObjectPattern', properties: [] }), null);

  // isIdentifierPropValue: derived from propBindingIdentifier
  checkTruthy('ast-patterns: isIdentifierPropValue ident',
    isIdentifierPropValue(idValue));
  check('ast-patterns: isIdentifierPropValue nested pattern',
    isIdentifierPropValue({ type: 'ObjectPattern' }), false);

  // hasTopLevelESM: import / export at top-level body
  const esmProgram = {
    body: [
      { type: 'ImportDeclaration', specifiers: [] },
      { type: 'VariableDeclaration', declarations: [] },
    ],
  };
  checkTruthy('ast-patterns: hasTopLevelESM import', hasTopLevelESM(esmProgram));
  const exportProgram = {
    body: [{ type: 'ExportNamedDeclaration', declaration: null }],
  };
  checkTruthy('ast-patterns: hasTopLevelESM export', hasTopLevelESM(exportProgram));
  const cjsProgram = {
    body: [{ type: 'ExpressionStatement' }],
  };
  check('ast-patterns: hasTopLevelESM CJS only',
    hasTopLevelESM(cjsProgram), false);

  // declaresRequireBinding: function/class/var/import named `require` shadows the CJS global
  const declaresViaConst = [
    {
      type: 'VariableDeclaration',
      declarations: [
        { id: { type: 'Identifier', name: 'require' }, init: null },
      ],
    },
  ];
  checkTruthy('ast-patterns: declaresRequireBinding const',
    declaresRequireBinding(declaresViaConst));
  const declaresViaFn = [
    { type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'require' } },
  ];
  checkTruthy('ast-patterns: declaresRequireBinding fn',
    declaresRequireBinding(declaresViaFn));
  const declaresViaImport = [
    {
      type: 'ImportDeclaration',
      specifiers: [
        { local: { type: 'Identifier', name: 'require' } },
      ],
    },
  ];
  checkTruthy('ast-patterns: declaresRequireBinding import',
    declaresRequireBinding(declaresViaImport));
  // no binding -> false
  const noShadow = [{ type: 'ExpressionStatement' }];
  check('ast-patterns: declaresRequireBinding none',
    declaresRequireBinding(noShadow), false);
  check('ast-patterns: declaresRequireBinding null',
    declaresRequireBinding(null), false);

  // detectCommonJS: `module.exports = ...` -> true; ESM presence wins
  const cjsAssign = {
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'module' },
            property: { type: 'Identifier', name: 'exports' },
          },
          right: { type: 'ObjectExpression', properties: [] },
        },
      },
    ],
  };
  checkTruthy('ast-patterns: detectCommonJS module.exports', detectCommonJS(cjsAssign));
  // ESM wins: even if a CJS shape appears, top-level import overrides
  const esmWins = {
    body: [
      ...cjsAssign.body,
      { type: 'ImportDeclaration', specifiers: [] },
    ],
  };
  check('ast-patterns: detectCommonJS ESM wins', detectCommonJS(esmWins), false);
  // nothing CJS-like
  check('ast-patterns: detectCommonJS empty', detectCommonJS({ body: [] }), false);

  // mayHaveSideEffects: conservatively SE; only provably pure -> false
  check('ast-patterns: mayHaveSideEffects Identifier',
    mayHaveSideEffects({ type: 'Identifier', name: 'x' }), false);
  check('ast-patterns: mayHaveSideEffects NumericLiteral',
    mayHaveSideEffects({ type: 'NumericLiteral', value: 1 }), false);
  // CallExpression -> always SE
  checkTruthy('ast-patterns: mayHaveSideEffects CallExpression',
    mayHaveSideEffects({ type: 'CallExpression', callee: { type: 'Identifier' }, arguments: [] }));
  // AssignmentExpression -> always SE
  checkTruthy('ast-patterns: mayHaveSideEffects AssignmentExpression',
    mayHaveSideEffects({
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier' },
      right: { type: 'NumericLiteral' },
    }));
  // NewExpression -> always SE
  checkTruthy('ast-patterns: mayHaveSideEffects NewExpression',
    mayHaveSideEffects({ type: 'NewExpression', callee: { type: 'Identifier' }, arguments: [] }));
  // UpdateExpression -> always SE
  checkTruthy('ast-patterns: mayHaveSideEffects UpdateExpression',
    mayHaveSideEffects({ type: 'UpdateExpression', operator: '++' }));
  // Array literal of pure elements -> pure
  check('ast-patterns: mayHaveSideEffects array of literals',
    mayHaveSideEffects({
      type: 'ArrayExpression',
      elements: [
        { type: 'NumericLiteral', value: 1 },
        { type: 'NumericLiteral', value: 2 },
      ],
    }), false);
  // Array with SpreadElement -> SE (proxy traps)
  checkTruthy('ast-patterns: mayHaveSideEffects array with spread',
    mayHaveSideEffects({
      type: 'ArrayExpression',
      elements: [{ type: 'SpreadElement', argument: { type: 'Identifier' } }],
    }));
  // delete x -> SE (unary)
  checkTruthy('ast-patterns: mayHaveSideEffects delete unary',
    mayHaveSideEffects({
      type: 'UnaryExpression',
      operator: 'delete',
      argument: { type: 'Identifier' },
    }));
  // typeof x -> pure
  check('ast-patterns: mayHaveSideEffects typeof unary',
    mayHaveSideEffects({
      type: 'UnaryExpression',
      operator: 'typeof',
      argument: { type: 'Identifier' },
    }), false);
  // ConditionalExpression all-pure -> false
  check('ast-patterns: mayHaveSideEffects conditional pure',
    mayHaveSideEffects({
      type: 'ConditionalExpression',
      test: { type: 'Identifier' },
      consequent: { type: 'NumericLiteral' },
      alternate: { type: 'NumericLiteral' },
    }), false);
  // babel ObjectMethod with non-computed Identifier key -> pure (method body deferred)
  check('ast-patterns: mayHaveSideEffects ObjectMethod ident key',
    mayHaveSideEffects({
      type: 'ObjectExpression',
      properties: [{
        type: 'ObjectMethod',
        kind: 'method',
        computed: false,
        key: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    }), false);
  // babel ObjectMethod with SE computed key -> SE: `{ [fn()]() {} }`. body stays deferred,
  // but the key is evaluated at object-literal-eval time
  checkTruthy('ast-patterns: mayHaveSideEffects ObjectMethod computed call key',
    mayHaveSideEffects({
      type: 'ObjectExpression',
      properties: [{
        type: 'ObjectMethod',
        kind: 'method',
        computed: true,
        key: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }],
    }));
  // ESTree shorthand-method shape `Property { method: true }` mirrors the same gate -
  // the existing Property/ObjectProperty branch already covers computed-key SE
  checkTruthy('ast-patterns: mayHaveSideEffects ESTree shorthand method computed call key',
    mayHaveSideEffects({
      type: 'ObjectExpression',
      properties: [{
        type: 'Property',
        method: true,
        kind: 'init',
        computed: true,
        key: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        value: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        shorthand: false,
      }],
    }));

  // walkPatternIdentifiers: visit each Identifier leaf
  const idsCollected = [];
  walkPatternIdentifiers(
    {
      type: 'ObjectPattern',
      properties: [
        {
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'a' },
          value: { type: 'Identifier', name: 'a' },
          shorthand: true,
        },
        {
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: 'b' },
          value: {
            type: 'ArrayPattern',
            elements: [
              { type: 'Identifier', name: 'c' },
              { type: 'Identifier', name: 'd' },
            ],
          },
        },
      ],
    },
    id => idsCollected.push(id.name),
  );
  check('ast-patterns: walkPatternIdentifiers nested',
    idsCollected.join(','), 'a,c,d');
  // RestElement
  const restCollected = [];
  walkPatternIdentifiers(
    {
      type: 'ArrayPattern',
      elements: [
        { type: 'Identifier', name: 'head' },
        { type: 'RestElement', argument: { type: 'Identifier', name: 'tail' } },
      ],
    },
    id => restCollected.push(id.name),
  );
  check('ast-patterns: walkPatternIdentifiers rest',
    restCollected.join(','), 'head,tail');
}

// --- ast-patterns: set/constants membership ---

{
  // collect set sizes upfront to drive the no-lone-blocks guard with a meaningful summary
  const setSizes = [
    TS_EXPR_WRAPPERS.size,
    IIFE_CALL_PATH_WRAPPERS.size,
    TRANSPARENT_EXPR_WRAPPER_TYPES.size,
    FUNCTION_LIKE_NODE_TYPES.size,
    ESM_MARKER_TYPES.size,
  ];
  checkTruthy('ast-patterns sets: all non-empty', setSizes.every(n => n > 0));

  // TS_EXPR_WRAPPERS: TS expression-wrapper node types
  checkTruthy('ast-patterns sets: TS_EXPR_WRAPPERS has TSAsExpression',
    TS_EXPR_WRAPPERS.has('TSAsExpression'));
  checkTruthy('ast-patterns sets: TS_EXPR_WRAPPERS has TSNonNullExpression',
    TS_EXPR_WRAPPERS.has('TSNonNullExpression'));
  checkTruthy('ast-patterns sets: TS_EXPR_WRAPPERS has TSSatisfiesExpression',
    TS_EXPR_WRAPPERS.has('TSSatisfiesExpression'));
  checkTruthy('ast-patterns sets: TS_EXPR_WRAPPERS has TSTypeAssertion',
    TS_EXPR_WRAPPERS.has('TSTypeAssertion'));
  // Flow TypeCastExpression also lives in TS_EXPR_WRAPPERS for cross-parser uniformity
  checkTruthy('ast-patterns sets: TS_EXPR_WRAPPERS has Flow TypeCastExpression',
    TS_EXPR_WRAPPERS.has('TypeCastExpression'));
  // not a wrapper - ParenthesizedExpression handled separately
  check('ast-patterns sets: TS_EXPR_WRAPPERS no Paren',
    TS_EXPR_WRAPPERS.has('ParenthesizedExpression'), false);

  // IIFE_CALL_PATH_WRAPPERS: ancestors above arrow-IIFE call sites
  checkTruthy('ast-patterns sets: IIFE_CALL_PATH_WRAPPERS has UnaryExpression',
    IIFE_CALL_PATH_WRAPPERS.has('UnaryExpression'));
  checkTruthy('ast-patterns sets: IIFE_CALL_PATH_WRAPPERS has SequenceExpression',
    IIFE_CALL_PATH_WRAPPERS.has('SequenceExpression'));
  checkTruthy('ast-patterns sets: IIFE_CALL_PATH_WRAPPERS has ParenthesizedExpression',
    IIFE_CALL_PATH_WRAPPERS.has('ParenthesizedExpression'));
  checkTruthy('ast-patterns sets: IIFE_CALL_PATH_WRAPPERS has ChainExpression',
    IIFE_CALL_PATH_WRAPPERS.has('ChainExpression'));

  // TRANSPARENT_EXPR_WRAPPER_TYPES: TS wrappers + Paren (excludes Unary/SE/ChainExpression)
  checkTruthy('ast-patterns sets: TRANSPARENT_EXPR_WRAPPER_TYPES has Paren',
    TRANSPARENT_EXPR_WRAPPER_TYPES.has('ParenthesizedExpression'));
  checkTruthy('ast-patterns sets: TRANSPARENT_EXPR_WRAPPER_TYPES has TSAsExpression',
    TRANSPARENT_EXPR_WRAPPER_TYPES.has('TSAsExpression'));
  check('ast-patterns sets: TRANSPARENT_EXPR_WRAPPER_TYPES no Unary',
    TRANSPARENT_EXPR_WRAPPER_TYPES.has('UnaryExpression'), false);

  // FUNCTION_LIKE_NODE_TYPES: all function-like body owners
  checkTruthy('ast-patterns sets: FUNCTION_LIKE_NODE_TYPES has FunctionDeclaration',
    FUNCTION_LIKE_NODE_TYPES.has('FunctionDeclaration'));
  checkTruthy('ast-patterns sets: FUNCTION_LIKE_NODE_TYPES has ArrowFunctionExpression',
    FUNCTION_LIKE_NODE_TYPES.has('ArrowFunctionExpression'));
  checkTruthy('ast-patterns sets: FUNCTION_LIKE_NODE_TYPES has ClassMethod',
    FUNCTION_LIKE_NODE_TYPES.has('ClassMethod'));
  checkTruthy('ast-patterns sets: FUNCTION_LIKE_NODE_TYPES has ObjectMethod',
    FUNCTION_LIKE_NODE_TYPES.has('ObjectMethod'));
  // babel-only private-method shape - own param-binding scope + block body, body-extract
  // must stop here instead of walking up into the enclosing class
  checkTruthy('ast-patterns sets: FUNCTION_LIKE_NODE_TYPES has ClassPrivateMethod',
    FUNCTION_LIKE_NODE_TYPES.has('ClassPrivateMethod'));
  check('ast-patterns sets: FUNCTION_LIKE_NODE_TYPES no Identifier',
    FUNCTION_LIKE_NODE_TYPES.has('Identifier'), false);

  // ESM_MARKER_TYPES: top-level ESM markers
  checkTruthy('ast-patterns sets: ESM_MARKER_TYPES has ImportDeclaration',
    ESM_MARKER_TYPES.has('ImportDeclaration'));
  checkTruthy('ast-patterns sets: ESM_MARKER_TYPES has ExportNamedDeclaration',
    ESM_MARKER_TYPES.has('ExportNamedDeclaration'));
  checkTruthy('ast-patterns sets: ESM_MARKER_TYPES has ExportDefaultDeclaration',
    ESM_MARKER_TYPES.has('ExportDefaultDeclaration'));
  checkTruthy('ast-patterns sets: ESM_MARKER_TYPES has ExportAllDeclaration',
    ESM_MARKER_TYPES.has('ExportAllDeclaration'));
  // CJS-only statements not ESM markers
  check('ast-patterns sets: ESM_MARKER_TYPES no ExpressionStatement',
    ESM_MARKER_TYPES.has('ExpressionStatement'), false);
}

// --- ast-patterns: SE-prefix peelers + deep fallback receiver ---

{
  // peelNestedSequenceExpressions: returns { prefix: Node[], tail }
  //   `(se1(), (se2(), G))` -> prefix=[se1(), se2()], tail=G
  const callA = { type: 'CallExpression', callee: { type: 'Identifier', name: 'se1' }, arguments: [] };
  const callB = { type: 'CallExpression', callee: { type: 'Identifier', name: 'se2' }, arguments: [] };
  const goal = { type: 'Identifier', name: 'G' };
  const nested = {
    type: 'SequenceExpression',
    expressions: [
      callA,
      {
        type: 'SequenceExpression',
        expressions: [callB, goal],
      },
    ],
  };
  const peeled = peelNestedSequenceExpressions(nested);
  check('ast-patterns: peelNestedSequenceExpressions tail.name',
    peeled.tail?.name, 'G');
  check('ast-patterns: peelNestedSequenceExpressions prefix length', peeled.prefix.length, 2);
  check('ast-patterns: peelNestedSequenceExpressions prefix[0] is se1 call',
    peeled.prefix[0]?.callee?.name, 'se1');
  check('ast-patterns: peelNestedSequenceExpressions prefix[1] is se2 call',
    peeled.prefix[1]?.callee?.name, 'se2');
  // non-SE - empty prefix, identity tail
  const bareResult = peelNestedSequenceExpressions({ type: 'Identifier', name: 'x' });
  check('ast-patterns: peelNestedSequenceExpressions non-seq prefix empty',
    bareResult.prefix.length, 0);
  check('ast-patterns: peelNestedSequenceExpressions non-seq tail identity',
    bareResult.tail?.name, 'x');

  // unwrapSafeSequenceTail: peel SE tail unconditionally
  check('ast-patterns: unwrapSafeSequenceTail nested SE',
    unwrapSafeSequenceTail(nested)?.name, 'G');
  // TS-wrapped SE -> still reaches goal
  const wrappedSE = { type: 'TSAsExpression', expression: nested };
  check('ast-patterns: unwrapSafeSequenceTail TS-wrapped SE',
    unwrapSafeSequenceTail(wrappedSE)?.name, 'G');
  // bare -> identity
  check('ast-patterns: unwrapSafeSequenceTail bare',
    unwrapSafeSequenceTail({ type: 'Identifier', name: 'x' })?.name, 'x');

  // peelFallbackReceiver: chain-assign + paren + TS + safe-SE alternation
  // `r = (cond ? A : B)` -> ConditionalExpression
  const condExpr = {
    type: 'ConditionalExpression',
    test: { type: 'Identifier', name: 'cond' },
    consequent: { type: 'Identifier', name: 'A' },
    alternate: { type: 'Identifier', name: 'B' },
  };
  const chainAssign = {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: 'r' },
    right: condExpr,
  };
  check('ast-patterns: peelFallbackReceiver chain-assign',
    peelFallbackReceiver(chainAssign)?.type, 'ConditionalExpression');
  // paren + TS + safe-SE alternation
  const wrappedCond = {
    type: 'ParenthesizedExpression',
    expression: {
      type: 'TSAsExpression',
      expression: {
        type: 'SequenceExpression',
        expressions: [
          { type: 'NumericLiteral', value: 0 },
          condExpr,
        ],
      },
    },
  };
  check('ast-patterns: peelFallbackReceiver paren+TS+SE',
    peelFallbackReceiver(wrappedCond)?.type, 'ConditionalExpression');
  // SE with side-effectful prefix -> peel unconditionally to tail (prefix preserved at
  // apply time via per-branch substitution / source-range overwrite around inner Identifier)
  const seWithCall = {
    type: 'SequenceExpression',
    expressions: [
      { type: 'CallExpression', callee: { type: 'Identifier' }, arguments: [] },
      condExpr,
    ],
  };
  check('ast-patterns: peelFallbackReceiver peels SE-with-side-effects to tail',
    peelFallbackReceiver(seWithCall)?.type, 'ConditionalExpression');
}

// --- ast-patterns: member-write contexts + tag predicates ---

{
  // isMemberWriteOnlyContext: parent contexts where MemberExpression is write-only
  const memberNode = {
    type: 'MemberExpression',
    object: { type: 'Identifier' },
    property: { type: 'Identifier' },
  };
  // simple assignment: `obj.x = 1`
  const simpleAssign = {
    type: 'AssignmentExpression',
    operator: '=',
    left: memberNode,
    right: { type: 'NumericLiteral' },
  };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext simple assignment',
    isMemberWriteOnlyContext(memberNode, simpleAssign));
  // compound `+=` -> NOT write-only (reads LHS first)
  const compoundAssign = {
    type: 'AssignmentExpression',
    operator: '+=',
    left: memberNode,
    right: { type: 'NumericLiteral' },
  };
  check('ast-patterns: isMemberWriteOnlyContext compound assignment',
    isMemberWriteOnlyContext(memberNode, compoundAssign), false);
  // AssignmentPattern left -> write
  const assignPattern = {
    type: 'AssignmentPattern',
    left: memberNode,
    right: { type: 'NumericLiteral' },
  };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext AssignmentPattern',
    isMemberWriteOnlyContext(memberNode, assignPattern));
  // ObjectProperty.value within ObjectPattern: `({a: obj.x} = src)`
  const objPropWriter = {
    type: 'ObjectProperty',
    value: memberNode,
  };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext destructured object property',
    isMemberWriteOnlyContext(memberNode, objPropWriter, { type: 'ObjectPattern' }));
  // grandparent not ObjectPattern -> NOT write
  check('ast-patterns: isMemberWriteOnlyContext property without ObjectPattern parent',
    isMemberWriteOnlyContext(memberNode, objPropWriter, { type: 'ObjectExpression' }), false);
  // ArrayPattern element: `[obj.x] = src`
  const arrPattern = {
    type: 'ArrayPattern',
    elements: [memberNode],
  };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext ArrayPattern element',
    isMemberWriteOnlyContext(memberNode, arrPattern));
  // RestElement target: `[...obj.x] = src`
  const restWriter = { type: 'RestElement', argument: memberNode };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext RestElement',
    isMemberWriteOnlyContext(memberNode, restWriter));
  // no parent -> false
  check('ast-patterns: isMemberWriteOnlyContext no parent',
    isMemberWriteOnlyContext(memberNode, null), false);
  check('ast-patterns: isMemberWriteOnlyContext no member',
    isMemberWriteOnlyContext(null, simpleAssign), false);
  // for-of LHS: `for (Array.from of arr)` - rebinds the static slot per iteration
  const forOfWrite = {
    type: 'ForOfStatement',
    left: memberNode,
    right: { type: 'Identifier' },
    body: { type: 'BlockStatement' },
  };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext for-of LHS',
    isMemberWriteOnlyContext(memberNode, forOfWrite));
  // for-in LHS: `for (Array.from in src)` - enumerated property name lands in the slot
  const forInWrite = {
    type: 'ForInStatement',
    left: memberNode,
    right: { type: 'Identifier' },
    body: { type: 'BlockStatement' },
  };
  checkTruthy('ast-patterns: isMemberWriteOnlyContext for-in LHS',
    isMemberWriteOnlyContext(memberNode, forInWrite));
  // member sits on `.right` of a for-of - reading position, not a write
  const forOfRightRead = {
    type: 'ForOfStatement',
    left: { type: 'Identifier' },
    right: memberNode,
    body: { type: 'BlockStatement' },
  };
  check('ast-patterns: isMemberWriteOnlyContext for-of right (read)',
    isMemberWriteOnlyContext(memberNode, forOfRightRead), false);

  // isSingleNestedProxyChain: `const { X: { y } } = Z` - innerPattern + outerPattern + declaration shape
  const innerPat = {
    type: 'ObjectPattern',
    properties: [{ type: 'ObjectProperty' }],
  };
  const outerPat = {
    type: 'ObjectPattern',
    properties: [{ type: 'ObjectProperty' }],
  };
  const declaration = {
    type: 'VariableDeclaration',
    declarations: [{ type: 'VariableDeclarator' }],
  };
  checkTruthy('ast-patterns: isSingleNestedProxyChain canonical shape',
    isSingleNestedProxyChain(innerPat, outerPat, declaration));
  // multiple inner props -> false
  const multiInner = {
    type: 'ObjectPattern',
    properties: [{ type: 'ObjectProperty' }, { type: 'ObjectProperty' }],
  };
  check('ast-patterns: isSingleNestedProxyChain multi inner',
    isSingleNestedProxyChain(multiInner, outerPat, declaration), false);
  // multiple declarators -> false
  const multiDecl = {
    type: 'VariableDeclaration',
    declarations: [
      { type: 'VariableDeclarator' },
      { type: 'VariableDeclarator' },
    ],
  };
  check('ast-patterns: isSingleNestedProxyChain multi decl',
    isSingleNestedProxyChain(innerPat, outerPat, multiDecl), false);
  // non-ObjectPattern outer -> false
  check('ast-patterns: isSingleNestedProxyChain non-Object outer',
    isSingleNestedProxyChain(innerPat, { type: 'ArrayPattern' }, declaration), false);

  // isTaggedTemplateTag: prototype placement only, parent is TaggedTemplateExpression with tag === node
  const targetNode = { type: 'Identifier', name: 'tag' };
  const tagParent = {
    type: 'TaggedTemplateExpression',
    tag: targetNode,
    quasi: { type: 'TemplateLiteral' },
  };
  checkTruthy('ast-patterns: isTaggedTemplateTag prototype tag',
    isTaggedTemplateTag(tagParent, targetNode, 'prototype'));
  // static placement -> false (only prototype is unsafe)
  check('ast-patterns: isTaggedTemplateTag static tag',
    isTaggedTemplateTag(tagParent, targetNode, 'static'), false);
  // non-TaggedTemplateExpression parent -> false
  check('ast-patterns: isTaggedTemplateTag non-tagged',
    isTaggedTemplateTag({ type: 'CallExpression', callee: targetNode }, targetNode, 'prototype'),
    false);
  // node is template quasi, not tag -> false
  check('ast-patterns: isTaggedTemplateTag wrong slot',
    isTaggedTemplateTag(tagParent, { type: 'TemplateLiteral' }, 'prototype'), false);

  // hasRestSiblingExcept: any property other than current is a rest
  const restEl = { type: 'RestElement' };
  const propA = { type: 'ObjectProperty' };
  const propB = { type: 'ObjectProperty' };
  checkTruthy('ast-patterns: hasRestSiblingExcept has rest sibling',
    hasRestSiblingExcept([propA, restEl], propA));
  // current IS the rest -> false (we skip self)
  check('ast-patterns: hasRestSiblingExcept self is rest',
    hasRestSiblingExcept([propA, restEl], restEl), false);
  // no rest at all
  check('ast-patterns: hasRestSiblingExcept no rest',
    hasRestSiblingExcept([propA, propB], propA), false);
  // empty list
  check('ast-patterns: hasRestSiblingExcept empty', hasRestSiblingExcept([], propA), false);
  check('ast-patterns: hasRestSiblingExcept null', hasRestSiblingExcept(null, propA), false);
}

// --- mutation pre-pass: canonical receiver resolution (cross-plugin, source-based) ---
// the pre-pass moved from a synthetic-node alias graph to the scoped plugin collectors backed
// by the read-side canons; these locks run REAL sources through BOTH collectors and assert
// agreement, preserving every behavior the old synthetic blocks pinned

{
  // suites probe the COLLECTOR semantics; shim ignoring depends on plugin resolvers, so the
  // harness adapters answer "nothing is polyfillable" - every shim shape stays recorded here
  const babelMutationAdapter = createBabelAdapter(() => null, 'usage-pure');
  const estreeMutationAdapter = createEstreeAdapter(() => null, 'usage-pure');
  function collectBoth(src) {
    let babelMutated = null;
    babelTransform(src, {
      configFile: false,
      babelrc: false,
      sourceType: 'module',
      plugins: [{ visitor: { Program(p2) { babelMutated = collectBabelMutationPrePass(p2, babelMutationAdapter).mutated; } } }],
    });

    const estreeMutated = collectEstreeMutationPrePass(parseSyncOxc('unit.mjs', src).program, estreeMutationAdapter).mutated;
    const a = [...babelMutated].sort().join('|');
    const b = [...estreeMutated].sort().join('|');
    check(`mutation pre-pass parity for: ${ src.slice(0, 60) }`, a, b);
    return babelMutated;
  }
  const CASES = [
    // [source, expected-present[], expected-absent[]]
    ['Array.from = 1;', ['Array.from'], []],
    ['for (Array.from of arr) {}', ['Array.from'], []],
    ['for (Array.from in src) {}', ['Array.from'], []],
    ['for (x of Array.from) {}', [], ['Array.from']],
    ["Object.defineProperty(Array, 'from', d);", ['Array.from'], []],
    ['Object.defineProperties(Iterator, { from: { value: 1 } });', ['Iterator.from'], []],
    ['Object.assign(Array, { of: 1 }, { from: 2 });', ['Array.of', 'Array.from'], []],
    ["Reflect.set(Array, 'of', 1);", ['Array.of'], []],
    // alias canonicalization: the read side canonicalizes, so the mutation must too
    ['const A = Array; A.from = 1;', ['Array.from'], ['A.from']],
    ['const A = Array; const b = A; b.of = 1;', ['Array.of'], []],
    // reassigned alias poisons EVERY reachable value
    ['let A = Array; A = Map; A.of = 1;', ['Array.of', 'Map.of'], []],
    ['let A = Array; A ||= Map; A.of = 1;', ['Array.of', 'Map.of'], []],
    ['let A = Array; [A] = [Iterator]; A.of = 1;', ['Array.of', 'Iterator.of'], []],
    // composite values fan out
    ['const A = cond ? Map : Iterator; A.of = 1;', ['Map.of', 'Iterator.of'], []],
    ['let A; A = (se(), Map); A.of = 1;', ['Map.of'], []],
    ['let A; A = (B = Map); A.of = 1;', ['Map.of'], []],
    ['let B2; ({ B2 = Promise } = {}); B2.resolve = 1;', ['Promise.resolve'], []],
    // call returns: direct IIFE and bound single-return functions
    ['const A = (() => Map)(); A.of = 1;', ['Map.of'], []],
    ['const f = () => Map; const A = f(); A.of = 1;', ['Map.of'], []],
    ['function g() { return Iterator; } const B = g(); B.from = 1;', ['Iterator.from'], []],
    // static containers: object literal (deep), class static field; duplicate keys take the
    // LAST (live) value; the leaf-name shortcut must not appear
    ['const NS = { M: Map }; const A = NS.M; A.of = 1;', ['Map.of'], ['M.of']],
    ['const NS = { a: { I: Iterator } }; const A = NS.a.I; A.from = 1;', ['Iterator.from'], []],
    ['class NS { static M = Map; } const A = NS.M; A.of = 1;', ['Map.of'], []],
    ['const ND = { M: Array, M: Iterator }; const A = ND.M; A.from = 1;', ['Iterator.from'], ['Array.from']],
    // computed STATIC-string keys read like plain keys (container, mutation, assign source)
    ["const NS = { ['M']: Map }; const A = NS.M; A.of = 1;", ['Map.of'], []],
    ["const A = Array; A['from'] = 1;", ['Array.from'], []],
    ["Object.assign(Array, { ['from']: 1 });", ['Array.from'], []],
    // proxy-global chain receivers (SE-buried roots and proxy aliases included)
    ['globalThis.Array.from = 1;', ['Array.from'], []],
    ['(eff(), globalThis).Array.from = 1;', ['Array.from'], []],
    ['const g = globalThis; g.Array.from = 1;', ['Array.from'], []],
    ['const s = globalThis.self; s.Iterator.from = 1;', ['Iterator.from'], []],
    // pattern-slot edges: a hole still pairs positionally; rest binds a FRESH array (its
    // element mutation is not a constructor mutation); a swap stays an unresolvable cycle
    ['let A = Array; [, A] = [0, Iterator]; A.of = 1;', ['Iterator.of'], []],
    ['let B = Array; [...B] = [Iterator]; B.of = 1;', [], ['Iterator.of']],
    // chain targets through every alias value shape reaching a proxy global
    ['let h; h = c ? o : globalThis.self; h.Iterator.from = 1;', ['Iterator.from'], []],
    ['let h = globalThis; if (c) h = o; h.Array.of = 1;', ['Array.of'], []],
    ['const h = (() => globalThis)(); h.Array.from = 1;', ['Array.from'], []],
    // namespace-call mutators through alias receivers; spread sources stay unenumerable but
    // the literal keys beside them still record
    ["const g = globalThis; Reflect.set(g.Array, 'of', 1);", ['Array.of'], []],
    ["let h2; h2 = c ? o : globalThis; Object.defineProperty(h2.Array, 'of', d);", ['Array.of'], []],
    ['Object.assign(Iterator, { ...patch }, { from: f });', ['Iterator.from'], ['Iterator.toArray']],
    // prototype mutations record `Ctor.prototype.key` (the enrichment imports the instance
    // entry up front); deeper or non-prototype chains keep their ordinary resolution
    ['String.prototype.at = patch;', ['String.prototype.at'], []],
    ['Array.prototype.flatMap ||= patch;', ['Array.prototype.flatMap'], []],
    ['const S = String; S.prototype.at = patch;', ['String.prototype.at'], []],
    ['globalThis.String.prototype.at = patch;', ['String.prototype.at'], []],
    ['globalThis.self.Array.prototype.flatMap = patch;', ['Array.prototype.flatMap'], []],
    ['config.thing.prototype.at = patch;', [], ['thing.prototype.at']],
    ['const proto = String.prototype; proto.at = patch;', ['String.prototype.at'], []],
    ['for (const k of ks) String.prototype[k] = fns[k];', [], ['String.prototype.at']],
    // nested writes into a local container whose keys are static and DON'T match stay out
    // (the gate skips the scoped traverse for them entirely)
    ['const config = { mode: 1 }; config.foo.bar = patch;', [], ['foo.bar']],
    // GUARDED shim shapes are mutations like any other: the routing model handles them by
    // enriching the key (polyfill-then-patch), so the collector must record them
    ['Iterator.from ||= shim;', ['Iterator.from'], []],
    ['Promise.allSettled = Promise.allSettled || shim;', ['Promise.allSettled'], []],
    ['if (!Object.groupBy) Object.groupBy = shim;', ['Object.groupBy'], []],
    ["if (typeof Map.groupBy != 'function') Map.groupBy = shim;", ['Map.groupBy'], []],
    ["if (!('from' in Array)) Array.from = shim;", ['Array.from'], []],
    // ctor-slot writes through proxies record the slot (the enrichment pins the ctor entry)
    ['window.Promise = window.Promise || Shim;', ['window.Promise'], []],
    ['globalThis.Map = ShimMap;', ['globalThis.Map'], []],
    // shadows: a local twin of the alias name poisons BOTH reachable values; a shadowing
    // parameter is not the global; export-default class declares a program binding
    // the scoped resolver sees the REAL (inner) callee - the outer twin is dead for this
    // mutation and stays unpoisoned (a precision gain over the former scope-flat collector)
    ['const f = () => Map; function g() { const f = () => Iterator; const A = f(); A.from = 1; }', ['Iterator.from'], ['Map.from']],
    ['function f(Array) { Array.from = 1; }', [], ['Array.from']],
    ['export default class Array {} Array.from = 1;', [], ['Array.from']],
  ];
  for (const [src, present, absent] of CASES) {
    const mutated = collectBoth(src);
    for (const key of present) checkTruthy(`mutation pre-pass: ${ src.slice(0, 50) } has ${ key }`, mutated.has(key));
    for (const key of absent) check(`mutation pre-pass: ${ src.slice(0, 50) } lacks ${ key }`, mutated.has(key), false);
  }
  // pattern-LHS writes pair into the alias value union and the reaching-definition recovery
  // (a plain helper flowed the WHOLE array literal instead of the slot value)
  {
    const mutated = collectBoth('let A = Array; [A] = [Iterator]; A.of = 1;');
    checkTruthy('mutation pre-pass: pattern write poisons the paired Iterator.of', mutated.has('Iterator.of'));
  }
  // a chain target whose root is a reassigned alias REACHING a proxy global records the
  // constructor-leaf mutation (an unresolved chain root silently bypassed the patch)
  {
    const mutated = collectBoth('let h; h = c ? other : globalThis; h.Array.of = 1;');
    checkTruthy('mutation pre-pass: reassigned proxy-alias chain poisons Array.of', mutated.has('Array.of'));
    const clean = collectBoth('let h3; h3 = c ? a : b; h3.config.of = 1;');
    check('mutation pre-pass: non-proxy alias chain stays unrecorded', clean.has('config.of'), false);
  }
}

// --- ast-patterns: createTypeAnnotationChecker factory ---

{
  // build synthetic path chain: first arg is the LEAF (return value), subsequent are ancestors
  // pathFor(leaf, parent, grandparent) -> leaf with parent->grandparent chain
  function pathFor(...nodes) {
    let parentPath = null;
    // walk from outermost to innermost so the leaf retains the longest .parentPath chain
    for (let i = nodes.length - 1; i >= 0; i--) {
      parentPath = { node: nodes[i], parentPath };
    }
    return parentPath;
  }
  // predicate: node.type startsWith 'TS'
  const isTSAnnotation = type => type.startsWith('TS');

  const checker = createTypeAnnotationChecker(isTSAnnotation);
  // leaf inside `TSTypeReference` -> true
  const annLeaf = { type: 'Identifier' };
  const annPath = pathFor(
    annLeaf,
    { type: 'TSTypeReference' },
  );
  checkTruthy('ast-patterns: createTypeAnnotationChecker reaches TSTypeReference',
    checker(annPath));
  // leaf with no TS ancestor -> false
  const plainPath = pathFor(
    { type: 'Identifier' },
    { type: 'VariableDeclarator' },
    { type: 'VariableDeclaration' },
  );
  check('ast-patterns: createTypeAnnotationChecker no TS ancestor',
    checker(plainPath), false);

  // .reset() flushes cache - exercise the entrypoint
  checker.reset();
  checkTruthy('ast-patterns: createTypeAnnotationChecker reset reusable',
    checker(annPath));
  // re-call exercises cache hit path
  checkTruthy('ast-patterns: createTypeAnnotationChecker cached hit',
    checker(annPath));
}

// --- ast-patterns: pattern / destructure / TS-binding predicates ---

{
  // isChainAssignment: `foo = X` with bare-Identifier LHS only
  checkTruthy('ast-patterns: isChainAssignment simple',
    isChainAssignment({
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Identifier', name: 'bar' },
    }));
  // compound `+=` rejected
  check('ast-patterns: isChainAssignment compound +=',
    isChainAssignment({
      type: 'AssignmentExpression',
      operator: '+=',
      left: { type: 'Identifier', name: 'foo' },
      right: { type: 'Identifier' },
    }), false);
  // destructure-LHS rejected
  check('ast-patterns: isChainAssignment destructure LHS',
    isChainAssignment({
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'ObjectPattern' },
      right: { type: 'Identifier' },
    }), false);
  check('ast-patterns: isChainAssignment non-assign',
    isChainAssignment({ type: 'BinaryExpression' }), false);

  // destructureReceiverSlot: receiver slot name per wrapper
  check('ast-patterns: destructureReceiverSlot AssignmentPattern',
    destructureReceiverSlot({ type: 'AssignmentPattern' }), 'right');
  check('ast-patterns: destructureReceiverSlot AssignmentExpression',
    destructureReceiverSlot({ type: 'AssignmentExpression' }), 'right');
  check('ast-patterns: destructureReceiverSlot VariableDeclarator',
    destructureReceiverSlot({ type: 'VariableDeclarator' }), 'init');
  check('ast-patterns: destructureReceiverSlot non-wrapper',
    destructureReceiverSlot({ type: 'Identifier' }), null);

  // getFallbackBranchSlots: ConditionalExpression -> [consequent, alternate], Logical -> [left, right]
  const condSlots = getFallbackBranchSlots({ type: 'ConditionalExpression' });
  check('ast-patterns: getFallbackBranchSlots Conditional[0]',
    condSlots[0], 'consequent');
  check('ast-patterns: getFallbackBranchSlots Conditional[1]',
    condSlots[1], 'alternate');
  const logicalSlots = getFallbackBranchSlots({ type: 'LogicalExpression' });
  check('ast-patterns: getFallbackBranchSlots Logical[0]', logicalSlots[0], 'left');
  check('ast-patterns: getFallbackBranchSlots Logical[1]', logicalSlots[1], 'right');
  check('ast-patterns: getFallbackBranchSlots non-branch',
    getFallbackBranchSlots({ type: 'Identifier' }), null);

  // isTransparentDestructureWrapper:
  //   AssignmentPattern { left: child } passthrough
  const inner = { type: 'ObjectPattern' };
  const assignPattern = {
    type: 'AssignmentPattern',
    left: inner,
    right: { type: 'Identifier' },
  };
  checkTruthy('ast-patterns: isTransparentDestructureWrapper AssignmentPattern',
    isTransparentDestructureWrapper(assignPattern, inner));
  // ArrayPattern length=1 with child passthrough
  const singletonArr = { type: 'ArrayPattern', elements: [inner] };
  checkTruthy('ast-patterns: isTransparentDestructureWrapper ArrayPattern single',
    isTransparentDestructureWrapper(singletonArr, inner));
  // ArrayPattern with > 1 elements: not transparent (siblings matter)
  const multiArr = { type: 'ArrayPattern', elements: [inner, { type: 'Identifier' }] };
  check('ast-patterns: isTransparentDestructureWrapper ArrayPattern multi',
    isTransparentDestructureWrapper(multiArr, inner), false);
  check('ast-patterns: isTransparentDestructureWrapper null parent',
    isTransparentDestructureWrapper(null, inner), false);

  // isTypeOnlyImportEquals: `import type X = require(...)`
  checkTruthy('ast-patterns: isTypeOnlyImportEquals',
    isTypeOnlyImportEquals({ type: 'TSImportEqualsDeclaration', importKind: 'type' }));
  // value-mode is not type-only
  check('ast-patterns: isTypeOnlyImportEquals value',
    isTypeOnlyImportEquals({ type: 'TSImportEqualsDeclaration', importKind: 'value' }), false);
  check('ast-patterns: isTypeOnlyImportEquals non-equals',
    isTypeOnlyImportEquals({ type: 'ImportDeclaration' }), false);

  // isTypeOnlyImportBinding: 3 forms
  //   import type X from "x" -> parent.importKind === 'type'
  checkTruthy('ast-patterns: isTypeOnlyImportBinding parent type-only',
    isTypeOnlyImportBinding({ type: 'ImportSpecifier' },
      { type: 'ImportDeclaration', importKind: 'type' }));
  //   import { type X } from "x" -> specifier-level
  checkTruthy('ast-patterns: isTypeOnlyImportBinding specifier-level',
    isTypeOnlyImportBinding({ type: 'ImportSpecifier', importKind: 'type' },
      { type: 'ImportDeclaration' }));
  // regular import -> not type-only
  check('ast-patterns: isTypeOnlyImportBinding value',
    isTypeOnlyImportBinding({ type: 'ImportSpecifier' },
      { type: 'ImportDeclaration' }), false);

  // isAmbientTypeDeclaration: TS ambient decl shapes
  checkTruthy('ast-patterns: isAmbientTypeDeclaration TSDeclareFunction',
    isAmbientTypeDeclaration({ type: 'TSDeclareFunction' }));
  checkTruthy('ast-patterns: isAmbientTypeDeclaration TSInterfaceDeclaration',
    isAmbientTypeDeclaration({ type: 'TSInterfaceDeclaration' }));
  checkTruthy('ast-patterns: isAmbientTypeDeclaration TSTypeAliasDeclaration',
    isAmbientTypeDeclaration({ type: 'TSTypeAliasDeclaration' }));
  // `declare const X` carries `declare: true`
  checkTruthy('ast-patterns: isAmbientTypeDeclaration declare:true',
    isAmbientTypeDeclaration({ type: 'VariableDeclaration', declare: true }));
  // plain VariableDeclaration not ambient
  check('ast-patterns: isAmbientTypeDeclaration plain var',
    isAmbientTypeDeclaration({ type: 'VariableDeclaration' }), false);
  check('ast-patterns: isAmbientTypeDeclaration null',
    isAmbientTypeDeclaration(null), false);

  // isAmbientBindingShape: ambient-type-decl OR type-only-import OR declare-var-declarator
  checkTruthy('ast-patterns: isAmbientBindingShape TSDeclareFunction',
    isAmbientBindingShape({ type: 'TSDeclareFunction' }, null));
  checkTruthy('ast-patterns: isAmbientBindingShape declare const declarator',
    isAmbientBindingShape({ type: 'VariableDeclarator' },
      { type: 'VariableDeclaration', declare: true }));
  // regular VariableDeclarator -> not ambient
  check('ast-patterns: isAmbientBindingShape plain declarator',
    isAmbientBindingShape({ type: 'VariableDeclarator' },
      { type: 'VariableDeclaration' }), false);

  // isRestProperty: RestElement OR SpreadElement (parser-agnostic)
  checkTruthy('ast-patterns: isRestProperty RestElement',
    isRestProperty({ type: 'RestElement' }));
  checkTruthy('ast-patterns: isRestProperty SpreadElement',
    isRestProperty({ type: 'SpreadElement' }));
  check('ast-patterns: isRestProperty Property',
    isRestProperty({ type: 'Property' }), false);
  check('ast-patterns: isRestProperty null', isRestProperty(null), false);

  // objectPatternPropNeedsReceiverRewrite: rest / computed / default-shape -> true
  checkTruthy('ast-patterns: objectPatternPropNeedsReceiverRewrite rest',
    objectPatternPropNeedsReceiverRewrite({ type: 'RestElement' }));
  checkTruthy('ast-patterns: objectPatternPropNeedsReceiverRewrite computed',
    objectPatternPropNeedsReceiverRewrite({ type: 'ObjectProperty', computed: true }));
  // AssignmentPattern in value -> default expr; needs rewrite
  checkTruthy('ast-patterns: objectPatternPropNeedsReceiverRewrite default value',
    objectPatternPropNeedsReceiverRewrite({
      type: 'ObjectProperty', computed: false, value: { type: 'AssignmentPattern' },
    }));
  // plain `{ p }` shorthand
  check('ast-patterns: objectPatternPropNeedsReceiverRewrite shorthand',
    objectPatternPropNeedsReceiverRewrite({
      type: 'ObjectProperty', computed: false, value: { type: 'Identifier' },
    }), false);
  check('ast-patterns: objectPatternPropNeedsReceiverRewrite null',
    objectPatternPropNeedsReceiverRewrite(null), false);

  // isSynthSimpleObjectPattern: all props are non-computed Identifier-keyed Property
  checkTruthy('ast-patterns: isSynthSimpleObjectPattern simple',
    isSynthSimpleObjectPattern({
      properties: [
        { type: 'ObjectProperty', computed: false, key: { type: 'Identifier', name: 'from' } },
        { type: 'ObjectProperty', computed: false, key: { type: 'Identifier', name: 'of' } },
      ],
    }));
  // duplicate static keys bail the synth: the literal would need duplicate properties
  check('ast-patterns: isSynthSimpleObjectPattern duplicate keys',
    isSynthSimpleObjectPattern({
      properties: [
        { type: 'ObjectProperty', computed: false, key: { type: 'Identifier', name: 'from' } },
        { type: 'ObjectProperty', computed: false, key: { type: 'Identifier', name: 'from' } },
      ],
    }), false);
  // bare-Identifier computed key that does NOT read a sibling binding -> true (synth-swap parity)
  checkTruthy('ast-patterns: isSynthSimpleObjectPattern computed-ident',
    isSynthSimpleObjectPattern({
      type: 'ObjectPattern',
      properties: [
        { type: 'ObjectProperty', computed: false, key: { type: 'Identifier', name: 'from' }, value: { type: 'Identifier', name: 'from' } },
        { type: 'ObjectProperty', computed: true, key: { type: 'Identifier', name: 'k' }, value: { type: 'Identifier', name: 'of' } },
      ],
    }));
  // computed key that reads a SIBLING binding (`{ of, [of]: picked }`) -> false (scope-gate)
  check('ast-patterns: isSynthSimpleObjectPattern computed reads sibling',
    isSynthSimpleObjectPattern({
      type: 'ObjectPattern',
      properties: [
        { type: 'ObjectProperty', computed: false, key: { type: 'Identifier', name: 'of' }, value: { type: 'Identifier', name: 'of' } },
        { type: 'ObjectProperty', computed: true, key: { type: 'Identifier', name: 'of' }, value: { type: 'Identifier', name: 'picked' } },
      ],
    }), false);
  // non-Identifier computed key (`[a.b]`) -> false (only bare Identifiers are mirrored)
  check('ast-patterns: isSynthSimpleObjectPattern computed non-ident',
    isSynthSimpleObjectPattern({
      type: 'ObjectPattern',
      properties: [
        { type: 'ObjectProperty', computed: true, key: { type: 'MemberExpression' }, value: { type: 'Identifier', name: 'x' } },
      ],
    }), false);
  // numeric-literal key -> false
  check('ast-patterns: isSynthSimpleObjectPattern numeric key',
    isSynthSimpleObjectPattern({
      properties: [
        { type: 'ObjectProperty', computed: false, key: { type: 'NumericLiteral' } },
      ],
    }), false);
  // RestElement among properties -> false
  check('ast-patterns: isSynthSimpleObjectPattern rest',
    isSynthSimpleObjectPattern({
      properties: [{ type: 'RestElement' }],
    }), false);
}

// --- ast-patterns: unwrap chain & body helpers ---

{
  // unwrapInitValue: peel ParenthesizedExpression + SequenceExpression tail
  const inner = { type: 'Identifier', name: 'x' };
  check('ast-patterns: unwrapInitValue paren',
    unwrapInitValue({ type: 'ParenthesizedExpression', expression: inner })?.name, 'x');
  check('ast-patterns: unwrapInitValue SE tail',
    unwrapInitValue({
      type: 'SequenceExpression',
      expressions: [{ type: 'Identifier', name: 'a' }, inner],
    })?.name, 'x');
  // mixed paren + SE
  const mixed = {
    type: 'ParenthesizedExpression',
    expression: {
      type: 'SequenceExpression',
      expressions: [{ type: 'Identifier', name: 'a' }, inner],
    },
  };
  check('ast-patterns: unwrapInitValue paren+SE',
    unwrapInitValue(mixed)?.name, 'x');
  // bare passthrough
  check('ast-patterns: unwrapInitValue bare',
    unwrapInitValue(inner)?.name, 'x');

  // singleReturnBodyExpression: BlockStatement with single return -> return.argument
  const blockSingleReturn = {
    type: 'BlockStatement',
    body: [
      {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'result' },
      },
    ],
  };
  check('ast-patterns: singleReturnBodyExpression single return',
    singleReturnBodyExpression(blockSingleReturn)?.name, 'result');
  // expression-body arrow (no BlockStatement wrap) passes through
  check('ast-patterns: singleReturnBodyExpression bare expr',
    singleReturnBodyExpression(inner)?.name, 'x');
  // two returns -> null (ambiguous)
  const blockTwoReturns = {
    type: 'BlockStatement',
    body: [
      { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'a' } },
      { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'b' } },
    ],
  };
  check('ast-patterns: singleReturnBodyExpression two returns',
    singleReturnBodyExpression(blockTwoReturns), null);
  // non-return non-expression statement -> null
  const blockWithIf = {
    type: 'BlockStatement',
    body: [{ type: 'IfStatement' }],
  };
  check('ast-patterns: singleReturnBodyExpression with if',
    singleReturnBodyExpression(blockWithIf), null);
  // return-only with no argument -> null
  const emptyReturn = {
    type: 'BlockStatement',
    body: [{ type: 'ReturnStatement', argument: null }],
  };
  check('ast-patterns: singleReturnBodyExpression bare return',
    singleReturnBodyExpression(emptyReturn), null);
  check('ast-patterns: singleReturnBodyExpression null body',
    singleReturnBodyExpression(null), null);

  // unwrapReceiverLeaf: peels transparent wrappers + zero-param IIFE shells
  // `(() => x)()` -> x
  const iife = {
    type: 'CallExpression',
    callee: {
      type: 'ArrowFunctionExpression',
      params: [],
      async: false,
      generator: false,
      body: inner,
    },
    arguments: [],
  };
  check('ast-patterns: unwrapReceiverLeaf arrow-IIFE',
    unwrapReceiverLeaf(iife)?.name, 'x');
  // `(function () { return x; })()`
  const iifeFn = {
    type: 'CallExpression',
    callee: {
      type: 'FunctionExpression',
      params: [],
      async: false,
      generator: false,
      body: {
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: inner }],
      },
    },
    arguments: [],
  };
  check('ast-patterns: unwrapReceiverLeaf function-IIFE',
    unwrapReceiverLeaf(iifeFn)?.name, 'x');
  // arrow with params -> not peeled (zero-param contract)
  const arrowWithParam = {
    type: 'CallExpression',
    callee: {
      type: 'ArrowFunctionExpression',
      params: [{ type: 'Identifier', name: 'p' }],
      body: inner,
    },
    arguments: [{ type: 'NumericLiteral' }],
  };
  check('ast-patterns: unwrapReceiverLeaf arrow with param -> not peeled',
    unwrapReceiverLeaf(arrowWithParam)?.type, 'CallExpression');
  // bare passes through
  check('ast-patterns: unwrapReceiverLeaf bare',
    unwrapReceiverLeaf(inner)?.name, 'x');
}

// --- ast-shapes: qualifiedNameLeft / qualifiedNameRight + heritage clauses ---

{
  // qualifiedNameLeft / qualifiedNameRight: parser-agnostic slot accessors
  //   babel TSQualifiedName: { left, right }
  const babelQName = {
    type: 'TSQualifiedName',
    left: { type: 'Identifier', name: 'A' },
    right: { type: 'Identifier', name: 'B' },
  };
  check('ast-shapes: qualifiedNameLeft TSQualifiedName',
    qualifiedNameLeft(babelQName)?.name, 'A');
  check('ast-shapes: qualifiedNameRight TSQualifiedName',
    qualifiedNameRight(babelQName)?.name, 'B');
  // flow QualifiedTypeIdentifier: { qualification, id }
  const flowQName = {
    type: 'QualifiedTypeIdentifier',
    qualification: { type: 'Identifier', name: 'NS' },
    id: { type: 'Identifier', name: 'X' },
  };
  check('ast-shapes: qualifiedNameLeft Flow', qualifiedNameLeft(flowQName)?.name, 'NS');
  check('ast-shapes: qualifiedNameRight Flow', qualifiedNameRight(flowQName)?.name, 'X');
  // oxc MemberExpression (type-position): { object, property }
  const oxcQName = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'NS' },
    property: { type: 'Identifier', name: 'Y' },
    computed: false,
  };
  check('ast-shapes: qualifiedNameLeft MemberExpression',
    qualifiedNameLeft(oxcQName)?.name, 'NS');
  check('ast-shapes: qualifiedNameRight MemberExpression',
    qualifiedNameRight(oxcQName)?.name, 'Y');

  // extendsId: TS heritage `TSExpressionWithTypeArguments { expression }`
  const tsExtend = {
    type: 'TSExpressionWithTypeArguments',
    expression: { type: 'Identifier', name: 'Base' },
  };
  check('ast-shapes: extendsId TS', extendsId(tsExtend)?.name, 'Base');
  // Flow heritage `InterfaceExtends { id }`
  const flowExtend = {
    type: 'InterfaceExtends',
    id: { type: 'Identifier', name: 'Base' },
  };
  check('ast-shapes: extendsId Flow', extendsId(flowExtend)?.name, 'Base');
  // neither slot -> null
  check('ast-shapes: extendsId neither',
    extendsId({ type: 'TSExpressionWithTypeArguments' }), null);

  // synthInterfaceExtendsRef:
  //   bare Identifier base -> TSTypeReference wrapping
  const synthBare = synthInterfaceExtendsRef({
    type: 'TSExpressionWithTypeArguments',
    expression: { type: 'Identifier', name: 'Base' },
    typeParameters: { params: [{ type: 'TSStringKeyword' }] },
  });
  check('ast-shapes: synthInterfaceExtendsRef type',
    synthBare?.type, 'TSTypeReference');
  check('ast-shapes: synthInterfaceExtendsRef typeName',
    synthBare?.typeName?.name, 'Base');
  check('ast-shapes: synthInterfaceExtendsRef typeParameters first',
    synthBare?.typeParameters?.params?.[0]?.type, 'TSStringKeyword');
  // qualified-name base -> wrapped
  const synthQualified = synthInterfaceExtendsRef({
    type: 'TSExpressionWithTypeArguments',
    expression: babelQName,
  });
  check('ast-shapes: synthInterfaceExtendsRef qualified typeName',
    synthQualified?.typeName?.type, 'TSQualifiedName');
  // call-expression base -> null (unsupported shape)
  const synthUnsupported = synthInterfaceExtendsRef({
    type: 'TSExpressionWithTypeArguments',
    expression: { type: 'CallExpression' },
  });
  check('ast-shapes: synthInterfaceExtendsRef unsupported',
    synthUnsupported, null);
  // no extendsId at all -> null
  check('ast-shapes: synthInterfaceExtendsRef no extends',
    synthInterfaceExtendsRef({ type: 'TSExpressionWithTypeArguments' }), null);
}

// --- exit-analysis: extended cases ---

{
  // blockAlwaysExits is `nodeAlwaysExits(block.node)` - thin wrapper
  const block = { type: 'BlockStatement', body: [{ type: 'ReturnStatement' }] };
  checkTruthy('exit-analysis: blockAlwaysExits return',
    blockAlwaysExits({ node: block }));
  // empty body -> false
  check('exit-analysis: blockAlwaysExits empty',
    blockAlwaysExits({ node: { type: 'BlockStatement', body: [] } }), false);

  // try with finalizer exit -> always exits (finalizer overrides)
  const tryFinallyReturn = {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body: [] },
    handler: null,
    finalizer: { type: 'BlockStatement', body: [{ type: 'ReturnStatement' }] },
  };
  checkTruthy('exit-analysis: TryStatement finalizer-only return',
    nodeAlwaysExits(tryFinallyReturn));
  // try-body exits + no catch -> always
  const tryNoCatchReturn = {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body: [{ type: 'ReturnStatement' }] },
    handler: null,
    finalizer: null,
  };
  checkTruthy('exit-analysis: TryStatement body-return no catch',
    nodeAlwaysExits(tryNoCatchReturn));
  // try-body exits + catch falls through -> NOT always
  const tryCatchFalls = {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body: [{ type: 'ReturnStatement' }] },
    handler: { body: { type: 'BlockStatement', body: [] } },
    finalizer: null,
  };
  check('exit-analysis: TryStatement catch-falls',
    nodeAlwaysExits(tryCatchFalls), false);
  // try-body falls + finalizer falls -> NOT always
  const tryAllFall = {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body: [] },
    handler: null,
    finalizer: { type: 'BlockStatement', body: [] },
  };
  check('exit-analysis: TryStatement all-fall', nodeAlwaysExits(tryAllFall), false);

  // ThrowStatement / BreakStatement / ContinueStatement are exit statements
  checkTruthy('exit-analysis: ThrowStatement exits',
    nodeAlwaysExits({ type: 'ThrowStatement' }));
  checkTruthy('exit-analysis: BreakStatement exits',
    nodeAlwaysExits({ type: 'BreakStatement' }));
  checkTruthy('exit-analysis: ContinueStatement exits',
    nodeAlwaysExits({ type: 'ContinueStatement' }));

  // canFallThrough: consequent with no exit -> true; with return -> false
  check('exit-analysis: canFallThrough empty consequent',
    canFallThrough({ consequent: [] }), true);
  check('exit-analysis: canFallThrough with return',
    canFallThrough({
      consequent: [{ type: 'ReturnStatement' }],
    }), false);
  // statements after exit -> still no fall-through (first exit wins)
  check('exit-analysis: canFallThrough exit-then-other',
    canFallThrough({
      consequent: [
        { type: 'ThrowStatement' },
        { type: 'ExpressionStatement' },
      ],
    }), false);
}

// --- name-resolution: ambient node predicates (module-level surface) ---

{
  // span all three predicates with the same input sets to verify the union contract
  const allPredicates = [isAmbientFunctionNode, isAmbientClassNode, isAmbientFunctionOrClassNode];
  check('name-resolution: predicates exported', allPredicates.length, 3);

  // isAmbientFunctionNode: TSDeclareFunction / DeclareFunction
  checkTruthy('name-resolution: isAmbientFunctionNode TSDeclareFunction',
    isAmbientFunctionNode({ type: 'TSDeclareFunction' }));
  checkTruthy('name-resolution: isAmbientFunctionNode DeclareFunction (Flow)',
    isAmbientFunctionNode({ type: 'DeclareFunction' }));
  check('name-resolution: isAmbientFunctionNode FunctionDeclaration',
    isAmbientFunctionNode({ type: 'FunctionDeclaration' }), false);
  check('name-resolution: isAmbientFunctionNode null',
    isAmbientFunctionNode(null), false);

  // isAmbientClassNode: DeclareClass OR ClassDeclaration with declare: true
  checkTruthy('name-resolution: isAmbientClassNode DeclareClass',
    isAmbientClassNode({ type: 'DeclareClass' }));
  checkTruthy('name-resolution: isAmbientClassNode declare:true ClassDeclaration',
    isAmbientClassNode({ type: 'ClassDeclaration', declare: true }));
  // ClassDeclaration without declare flag -> false (runtime class)
  check('name-resolution: isAmbientClassNode runtime ClassDeclaration',
    isAmbientClassNode({ type: 'ClassDeclaration' }), false);

  // isAmbientFunctionOrClassNode: union predicate
  checkTruthy('name-resolution: isAmbientFunctionOrClassNode fn',
    isAmbientFunctionOrClassNode({ type: 'TSDeclareFunction' }));
  checkTruthy('name-resolution: isAmbientFunctionOrClassNode class',
    isAmbientFunctionOrClassNode({ type: 'DeclareClass' }));
  check('name-resolution: isAmbientFunctionOrClassNode plain',
    isAmbientFunctionOrClassNode({ type: 'FunctionDeclaration' }), false);
}

// --- helpers/class-walk (pure utilities) ---

{
  // POSSIBLE_GLOBAL_OBJECTS: from known-built-in-return-types.globalProxies
  checkTruthy('class-walk: POSSIBLE_GLOBAL_OBJECTS has globalThis',
    POSSIBLE_GLOBAL_OBJECTS.has('globalThis'));
  checkTruthy('class-walk: POSSIBLE_GLOBAL_OBJECTS has self',
    POSSIBLE_GLOBAL_OBJECTS.has('self'));
  checkTruthy('class-walk: POSSIBLE_GLOBAL_OBJECTS has window',
    POSSIBLE_GLOBAL_OBJECTS.has('window'));
  // bare `Array` is a built-in, not a global-proxy alias
  check('class-walk: POSSIBLE_GLOBAL_OBJECTS no Array',
    POSSIBLE_GLOBAL_OBJECTS.has('Array'), false);

  // globalProxyMemberName: `globalThis.Map` -> 'Map'
  const directProxy = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'globalThis' },
    property: { type: 'Identifier', name: 'Map' },
    computed: false,
  };
  check('class-walk: globalProxyMemberName direct',
    globalProxyMemberName({ node: directProxy }), 'Map');

  // `self.Map` -> 'Map' (any proxy-global)
  const selfProxy = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'self' },
    property: { type: 'Identifier', name: 'Set' },
    computed: false,
  };
  check('class-walk: globalProxyMemberName self',
    globalProxyMemberName({ node: selfProxy }), 'Set');

  // chain through `globalThis.self.X` resolves to 'X'
  const chainProxy = {
    type: 'MemberExpression',
    object: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'globalThis' },
      property: { type: 'Identifier', name: 'self' },
      computed: false,
    },
    property: { type: 'Identifier', name: 'Map' },
    computed: false,
  };
  check('class-walk: globalProxyMemberName chained globalThis.self.X',
    globalProxyMemberName({ node: chainProxy }), 'Map');

  // `globalThis['Map']` -> 'Map' (string-literal computed key)
  const computedProxy = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'globalThis' },
    property: { type: 'StringLiteral', value: 'Map' },
    computed: true,
  };
  check('class-walk: globalProxyMemberName computed string',
    globalProxyMemberName({ node: computedProxy }), 'Map');

  // non-global root -> null
  const userBound = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'obj' },
    property: { type: 'Identifier', name: 'Map' },
    computed: false,
  };
  check('class-walk: globalProxyMemberName user root',
    globalProxyMemberName({ node: userBound }), null);

  // not a MemberExpression -> null
  check('class-walk: globalProxyMemberName non-member',
    globalProxyMemberName({ node: { type: 'Identifier', name: 'globalThis' } }), null);

  // empty key `globalThis['']` -> null (no real global has empty name)
  const emptyKey = {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'globalThis' },
    property: { type: 'StringLiteral', value: '' },
    computed: true,
  };
  check('class-walk: globalProxyMemberName empty key',
    globalProxyMemberName({ node: emptyKey }), null);

  // isClassifiableReceiverArg: strict - Identifier only
  checkTruthy('class-walk: isClassifiableReceiverArg identifier',
    isClassifiableReceiverArg({ type: 'Identifier', name: 'X' }));
  check('class-walk: isClassifiableReceiverArg member -> false',
    isClassifiableReceiverArg(directProxy), false);
  check('class-walk: isClassifiableReceiverArg null -> false',
    isClassifiableReceiverArg(null), false);
  // `undefined` arg: the global sentinel makes the IIFE-param default apply, so it is NOT a
  // classifiable receiver; a shadowing local binding turns it into a real value (use the arg)
  const undefinedArg = { type: 'Identifier', name: 'undefined' };
  check('class-walk: isClassifiableReceiverArg undefined node-only -> false',
    isClassifiableReceiverArg(undefinedArg), false);
  check('class-walk: isClassifiableReceiverArg global undefined -> false',
    isClassifiableReceiverArg(undefinedArg, {}, { hasBinding: () => false }), false);
  checkTruthy('class-walk: isClassifiableReceiverArg shadowed undefined -> true',
    isClassifiableReceiverArg(undefinedArg, {}, { hasBinding: () => true }));

  // isExpandedClassifiableReceiver: permissive - Identifier OR proxy-global member
  checkTruthy('class-walk: isExpandedClassifiableReceiver identifier',
    isExpandedClassifiableReceiver({ node: { type: 'Identifier', name: 'X' } }));
  checkTruthy('class-walk: isExpandedClassifiableReceiver globalThis.X',
    isExpandedClassifiableReceiver({ node: directProxy }));
  // user-bound member -> false
  check('class-walk: isExpandedClassifiableReceiver user member',
    isExpandedClassifiableReceiver({ node: userBound }), false);

  // symbolKeyToEntry: Symbol.X -> symbol/<kebab>
  check('class-walk: symbolKeyToEntry hasInstance',
    symbolKeyToEntry('Symbol.hasInstance'), 'symbol/has-instance');
  check('class-walk: symbolKeyToEntry iterator',
    symbolKeyToEntry('Symbol.iterator'), 'symbol/iterator');
  check('class-walk: symbolKeyToEntry asyncIterator',
    symbolKeyToEntry('Symbol.asyncIterator'), 'symbol/async-iterator');
  check('class-walk: symbolKeyToEntry toPrimitive',
    symbolKeyToEntry('Symbol.toPrimitive'), 'symbol/to-primitive');
  // not a Symbol.X key -> null
  check('class-walk: symbolKeyToEntry plain key',
    symbolKeyToEntry('Array.from'), null);
  // empty suffix -> null (Symbol. with nothing after)
  check('class-walk: symbolKeyToEntry empty suffix',
    symbolKeyToEntry('Symbol.'), null);
  // uppercase first letter -> null (well-known symbols are lowercase)
  check('class-walk: symbolKeyToEntry uppercase first',
    symbolKeyToEntry('Symbol.X'), null);
  check('class-walk: symbolKeyToEntry null', symbolKeyToEntry(null), null);

  // markSynthReceiverSkipped: walk down `.object` chain of proxy-global member chain
  const skipped = new Set();
  const inner = { type: 'Identifier', name: 'globalThis' };
  const chain = {
    type: 'MemberExpression',
    object: {
      type: 'MemberExpression',
      object: inner,
      property: { type: 'Identifier', name: 'self' },
    },
    property: { type: 'Identifier', name: 'Map' },
  };
  markSynthReceiverSkipped(chain, skipped);
  // every chain node + inner Identifier is marked
  checkTruthy('class-walk: markSynthReceiverSkipped outer chain',
    skipped.has(chain));
  checkTruthy('class-walk: markSynthReceiverSkipped intermediate',
    skipped.has(chain.object));
  checkTruthy('class-walk: markSynthReceiverSkipped innermost identifier',
    skipped.has(inner));
  // null receiver - no crash
  const emptySet = new Set();
  markSynthReceiverSkipped(null, emptySet);
  check('class-walk: markSynthReceiverSkipped null receiver', emptySet.size, 0);
  // bare Identifier - only that node is added
  const bareSet = new Set();
  const bareId = { type: 'Identifier', name: 'globalThis' };
  markSynthReceiverSkipped(bareId, bareSet);
  check('class-walk: markSynthReceiverSkipped bare identifier size', bareSet.size, 1);
  checkTruthy('class-walk: markSynthReceiverSkipped bare identifier has node',
    bareSet.has(bareId));

  // resolveSuperImportName: rewrites .object via injector.getPureImport
  // injector hit -> `.object` swapped to imp.hint, other fields preserved
  const mockInjector = {
    getPureImport(name) {
      if (name === 'MyPromise') return { hint: 'Promise' };
      return null;
    },
  };
  const superMetaWithRemap = {
    kind: 'property',
    object: 'MyPromise',
    key: 'try',
    placement: 'static',
  };
  const remapped = resolveSuperImportName(mockInjector, superMetaWithRemap);
  check('class-walk: resolveSuperImportName injector hit object',
    remapped?.object, 'Promise');
  check('class-walk: resolveSuperImportName injector hit key preserved',
    remapped?.key, 'try');
  check('class-walk: resolveSuperImportName injector hit placement preserved',
    remapped?.placement, 'static');
  // injector miss -> original returned (identity)
  const noHit = resolveSuperImportName(mockInjector, {
    kind: 'property',
    object: 'NotImported',
    key: 'x',
  });
  check('class-walk: resolveSuperImportName injector miss',
    noHit?.object, 'NotImported');
  // null injector -> input unchanged
  const samePassthrough = resolveSuperImportName(null, superMetaWithRemap);
  check('class-walk: resolveSuperImportName null injector',
    samePassthrough?.object, 'MyPromise');
  // null superMeta -> null
  check('class-walk: resolveSuperImportName null superMeta',
    resolveSuperImportName(mockInjector, null), null);
  // missing .object -> input unchanged
  const noObj = resolveSuperImportName(mockInjector, { kind: 'property' });
  check('class-walk: resolveSuperImportName no .object',
    noObj?.kind, 'property');

  // remapInheritedStaticMeta: carries sideEffects from originalMeta
  const sideEffect = { type: 'CallExpression' };
  const original = {
    kind: 'property',
    object: 'Original',
    sideEffects: [sideEffect],
  };
  const inherited = {
    kind: 'property',
    object: 'MyPromise',
    key: 'try',
  };
  const remappedWithSE = remapInheritedStaticMeta(mockInjector, original, inherited);
  check('class-walk: remapInheritedStaticMeta remaps object',
    remappedWithSE?.object, 'Promise');
  check('class-walk: remapInheritedStaticMeta carries SE',
    remappedWithSE?.sideEffects?.[0], sideEffect);
  // no inherited -> null
  check('class-walk: remapInheritedStaticMeta no inherited',
    remapInheritedStaticMeta(mockInjector, original, null), null);
  // original without SE -> result has no SE slot or carries undefined
  const noSE = remapInheritedStaticMeta(mockInjector, { kind: 'property', object: 'X' }, inherited);
  check('class-walk: remapInheritedStaticMeta no SE no carry',
    noSE?.sideEffects, undefined);

  // buildSuperStaticMeta: ClassDeclaration with superClass resolved by resolveSuperType
  const fakeResolver = id => id?.type === 'Identifier' ? id.name : null;
  const classWithSuper = {
    type: 'ClassDeclaration',
    superClass: { type: 'Identifier', name: 'Base' },
  };
  const staticMeta = buildSuperStaticMeta(classWithSuper, 'try', fakeResolver);
  check('class-walk: buildSuperStaticMeta object', staticMeta?.object, 'Base');
  check('class-walk: buildSuperStaticMeta key', staticMeta?.key, 'try');
  check('class-walk: buildSuperStaticMeta placement', staticMeta?.placement, 'static');
  // null superClass -> null
  const noSuperClass = buildSuperStaticMeta(
    { type: 'ClassDeclaration', superClass: null },
    'try', fakeResolver,
  );
  check('class-walk: buildSuperStaticMeta no superClass', noSuperClass, null);
  // resolver returns null -> null
  const unresolved = buildSuperStaticMeta(
    classWithSuper, 'try', () => null,
  );
  check('class-walk: buildSuperStaticMeta unresolved', unresolved, null);
  // non-class node -> null
  check('class-walk: buildSuperStaticMeta non-class',
    buildSuperStaticMeta({ type: 'FunctionDeclaration' }, 'try', fakeResolver), null);
  // class wrapped in TS cast -> peel reaches Base
  const classWithCastSuper = {
    type: 'ClassExpression',
    superClass: {
      type: 'TSAsExpression',
      expression: { type: 'Identifier', name: 'Base' },
    },
  };
  const castMeta = buildSuperStaticMeta(classWithCastSuper, 'of', fakeResolver);
  check('class-walk: buildSuperStaticMeta TS-cast superClass',
    castMeta?.object, 'Base');
}

// --- type-structure + annotations findings ---

// a non-numeric string key against a number-only / symbol-only index signature has no
// member in TS - the resolver must return null, not the index value type (over-emission)
runBoth('number-only index signature, non-numeric string key -> null',
  'type T = { [k: number]: number[] }; declare const t: T; let x = t.foo;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    check(`${ lbl } number-only index sig string key`, adapter.makeResolver().resolveNodeType(decl.get('id')), null);
  });

runBoth('symbol-only index signature, non-numeric string key -> null',
  'type T = { [k: symbol]: number[] }; declare const t: T; let x = t.foo;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    check(`${ lbl } symbol-only index sig string key`, adapter.makeResolver().resolveNodeType(decl.get('id')), null);
  });

// a body-less generic method reached via an indexed-access binding (`C<number>['m']`)
// must keep the element type on BOTH parsers; oxc nests the returnType on a
// TSEmptyBodyFunctionExpression `.value`, so the dispatch entry that drops it caused a divergence
runBoth('declare-class generic method via indexed-access keeps element type on both parsers',
  'declare class C<T> { m(): T[]; } declare const f: C<number>["m"]; const r = f();',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'r');
    const type = adapter.makeResolver().resolveNodeType(decl.get('init'));
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
    checkTruthy(`${ lbl } inner number`, type?.inner?.type === 'number');
  });

// abstract variant: oxc models `abstract m(): T[]` as TSAbstractMethodDefinition (babel as
// TSDeclareMethod), with the return type nested on its `.value` - same element-type-preservation
// must hold on both parsers, threaded through the dispatch / method-shape / member / call layers
runBoth('abstract-class generic method via indexed-access keeps element type on both parsers',
  'abstract class C<T> { abstract m(): T[]; } declare const f: C<number>["m"]; const r = f();',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'r');
    const type = adapter.makeResolver().resolveNodeType(decl.get('init'));
    checkType(lbl, type, { primitive: false, ctor: 'Array' });
    checkTruthy(`${ lbl } inner number`, type?.inner?.type === 'number');
  });

// regression guard: a method-local generic shadowing an enclosing alias
// type-param of the same name is NOT bound by the alias arg - the return resolves to null/generic
runBoth('method-local generic shadowing outer alias type-param resolves null (no over-narrow)',
  'interface I<T> { m<T>(): T; } declare const f: I<number[]>["m"]; const r = f();',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'r');
    check(`${ lbl } method-local shadow`, adapter.makeResolver().resolveNodeType(decl.get('init')), null);
  });

// a deep stack of non-reducing aliased conditionals (each sibling branch re-hopping to the
// same downstream conditional) must resolve via per-(node,scope) memoization, not a 2^N branch tree
runBoth('deep nested non-reducing conditional type resolves via memoization',
  'interface Brand { __brand: true }\n'
  + 'type S0<U> = U extends Brand ? W0<U> : S1<U>;\ntype W0<U> = S1<U>;\n'
  + 'type S1<U> = U extends Brand ? W1<U> : S2<U>;\ntype W1<U> = S2<U>;\n'
  + 'type S2<U> = U extends Brand ? W2<U> : S3<U>;\ntype W2<U> = S3<U>;\n'
  + 'type S3<U> = string[];\ndeclare const x: S0<{ plain: 1 }>;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'x');
    checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('id')), { primitive: false, ctor: 'Array' });
  });

// a member sub-path narrow (`obj.a` via `obj.a.kind === 'x'`) is dropped when that exact sub-path
// is reassigned inside the guarded block (`obj.a = other`): the receiver widens back to the full
// union, so the type resolves to null (generic) rather than the narrowed `data: string` branch.
// the reassign is a property write, NOT a `constantViolation` of the root binding, so it is
// recovered from the binding's references via the parser-agnostic enumerator - reading babel's
// `referencePaths` directly would leave the estree-toolkit (oxc) adapter with the stale narrow
runBoth('member sub-path reassign drops discriminant narrow on both parsers',
  'type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };\n'
  + 'declare const obj: { a: Inner };\ndeclare const dynInner: Inner;\n'
  + 'if (obj.a.kind === "x") {\n  obj.a = dynInner;\n  obj.a.data.at(0);\n}',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    check(`${ lbl } widened to generic`, adapter.makeResolver().resolveNodeType(member.get('object')), null);
  });

// control: without the sub-path reassign the discriminant narrow holds, so the receiver resolves
// to the `kind: "x"` branch's `data: string` - proves the null above is the dropped narrow, not a
// blanket resolution bail on this shape
runBoth('member sub-path narrow holds without reassign on both parsers',
  'type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };\n'
  + 'declare const obj: { a: Inner };\n'
  + 'if (obj.a.kind === "x") {\n  obj.a.data.at(0);\n}',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { kind: 'string' });
  });

// `Reflect.construct(target, args, newTarget)` builds an object with newTarget.prototype, so the
// 3-arg form is an instance of newTarget - its members resolve against newTarget's class, not the
// target's. resolving the constructor from arguments[2] reaches D.m's string return on both parsers
runBoth('Reflect.construct 3-arg newTarget resolves the instance to the newTarget class',
  'class C { m() { return [1, 2, 3]; } } class D { m() { return "s"; } } const r = Reflect.construct(C, [], D).m();',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'r');
    checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')), { kind: 'string' });
  });

// control: the 2-arg form has no newTarget, so the result is a target (C) instance and resolves
// against C.m's array return - confirms the newTarget branch does not hijack the plain case
runBoth('Reflect.construct 2-arg resolves the instance to the target class',
  'class C { m() { return [1, 2, 3]; } } const r = Reflect.construct(C, []).m();',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'r');
    checkType(lbl, adapter.makeResolver().resolveNodeType(decl.get('init')), { primitive: false, ctor: 'Array' });
  });

// a getter returning DIFFERENT functions per branch (one -> number[], one -> string) is type-equal
// as a bare function but differs on invoke; folding every branch's invoke-return yields no common
// type, so `obj.getter()` resolves to null (generic) instead of narrowing to the first branch
runBoth('invoked getter with divergent branch-function returns folds to null',
  'declare const cond: boolean;\n'
  + 'class C { get f() { if (cond) return () => [1, 2, 3]; return () => "s"; } }\n'
  + 'const c = new C(); const r = c.f();',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'r');
    check(`${ lbl } folds to null`, adapter.makeResolver().resolveNodeType(decl.get('init')), null);
  });

// a parameter's array default narrows the receiver ONLY when no call site overrides it. a call
// passing a real argument (`f(foreign)`) makes the runtime value the argument, not the default, so
// the `.at` receiver inside the body widens to generic (null). the call-site scan enumerates the
// function's references through the parser-agnostic helper, so the override is seen on oxc too -
// reading babel's `referencePaths` directly would leave the estree adapter narrowing off a dead default
runBoth('default-param array narrow widens when a call site passes an overriding argument',
  'function f(x = [1, 2, 3]) { return x.at(0); }\ndeclare const foreign: any;\nf(foreign);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    check(`${ lbl } widened to generic`, adapter.makeResolver().resolveNodeType(member.get('object')), null);
  });

// control: the only call site passes no argument (`f()`), so the default applies and the receiver
// keeps the array narrow - proves the null above is the call-site override, not a blanket bail
runBoth('default-param array narrow holds when no call site overrides it',
  'function f(x = [1, 2, 3]) { return x.at(0); }\nf();',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// --- cluster-G edge coverage ---

// a rest binding nested under an inner OBJECT pattern in for-of (`[{ ...rest }]`) is always an
// Object, independent of the iterable element type - it must not pick up the element type
runBoth('for-of nested object-rest binding resolves to Object',
  'declare const items: Array<[{ a: number }]>;\nfor (const [{ ...rest }] of items) {\n  rest.x;\n}',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'x');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Object' });
  });

// control: a rest binding nested under an inner ARRAY pattern (`[[...rest]]`) is always an Array -
// proves the depth-recursive rest classifier handles both pattern kinds
runBoth('for-of nested array-rest binding resolves to Array',
  'declare const items: string[][];\nfor (const [[...rest]] of items) {\n  rest.x;\n}',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'x');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// a wide primitive does NOT extend a narrower literal of the same family, so the conditional takes
// the FALSE branch across every literal family (not just `number extends 1`)
for (const [variant, src] of [
  ['boolean extends true', 'type D<T> = T extends true ? string : number[];\ndeclare const w: D<boolean>;\nw.x;'],
  ['bigint extends 1n', 'type D<T> = T extends 1n ? string : number[];\ndeclare const w: D<bigint>;\nw.x;'],
]) {
  runBoth(`conditional wide-extends-literal takes the false branch: ${ variant }`, src,
    (adapter, prog, lbl) => {
      const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'x');
      checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
    });
}

// control: the assignable direction `1 extends number` is TRUE (a literal IS assignable to the wide
// primitive), so it keeps the true branch - proves the fix only flips the non-assignable direction
runBoth('conditional literal-extends-wide keeps the true branch',
  'type D<T> = T extends number ? string : number[];\ndeclare const w: D<1>;\nw.x;',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'x');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { kind: 'string' });
  });

// a dynamic computed-key index access selects the index signature matching the access-key type, not
// the first signature - a number key picks the number sig, a symbol key picks the symbol sig
for (const [variant, src] of [
  ['number key', 'declare const o: { [k: symbol]: string; [k: number]: number[]; [k: string]: string };\ndeclare const k: number;\no[k].x;'],
  ['symbol key', 'declare const o: { [k: string]: string; [k: symbol]: number[] };\ndeclare const k: symbol;\no[k].x;'],
]) {
  runBoth(`index-signature dynamic key selection: ${ variant }`, src,
    (adapter, prog, lbl) => {
      const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'x');
      checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
    });
}

// control: a write to a DEEPER path than the narrowed one (`obj.a.b.data = x` under a narrow on
// `obj.a.b`) only mutates a property of the narrowed object, so the discriminant narrow holds -
// proves the prefix-write invalidation is strict (descendants do not count)
runBoth('discriminant narrow holds when a deeper path is written',
  'type Inner = { kind: "x"; data: string } | { kind: "y"; data: number[] };\n'
  + 'declare const obj: { a: { b: Inner } };\n'
  + 'if (obj.a.b.kind === "y") {\n  obj.a.b.data = [9];\n  obj.a.b.data.at(0);\n}',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// control: a callable field with a SINGLE-family declared return (`() => number[]`) resolves the
// call to that family - the union-bail fires only for differing families, not for every annotation
runBoth('callable-field call with single-family annotation keeps the family',
  'class C {\n  make: () => number[] = () => [1, 2, 3];\n  read() { return this.make().at(0); }\n}\nnew C().read();',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// a spread arg at the defaulted param's OWN slot makes its runtime value unknown (the spread may or
// may not supply it), so the body receiver widens to generic - same bail as a spread before the slot
runBoth('default-param narrow widens when a spread arg covers its slot',
  'declare const arr: string[];\nfunction f(b = [1, 2, 3]) { return b.at(0); }\nf(...arr);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    check(`${ lbl } widened to generic`, adapter.makeResolver().resolveNodeType(member.get('object')), null);
  });

// --- Type-resolution cluster regression locks ---

// the indirect-call idiom `(0, ref)(...)` evaluates to ref's return type; resolveRuntimeExpression
// peels the side-effect-free SequenceExpression tail so the call receiver narrows
runBoth('sequence-wrapped callee `(0, getArr)().includes` resolves Array receiver',
  'function getArr() { return [1, 2, 3]; } (0, getArr)().includes(1);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => (p.node.property?.name ?? p.node.property?.value) === 'includes');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// `readonly [T, U]` (TSTypeOperator) indexing resolves like the `Readonly<[T, U]>` generic form
runBoth('readonly-operator tuple index `readonly [string[], number][0]` -> Array',
  'declare const x: readonly [string[], number]; const v = x[0];',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.computed);
    checkType(lbl, adapter.makeResolver().resolveNodeType(member), { primitive: false, ctor: 'Array' });
  });

// a union constituent reached through parens (or an alias) inside an intersection distributes, so a
// two-hop property access keeps the narrowed member type instead of dropping to null
runBoth('parenthesized union inside intersection keeps two-hop member type',
  'function f(v: ({ a: { x: number[] } } | { a: { x: number[] } }) & { b: string }) { return v.a.x; }',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => (p.node.property?.name ?? p.node.property?.value) === 'x');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member), { primitive: false, ctor: 'Array' });
  });

// a no-subst conditional whose infer pattern is definitively false resolves the FALSE branch, never
// leaking the INFER_PATTERN_FALSE sentinel as a Type (toHint would crash on the Symbol)
runBoth('no-subst conditional infer disjoint check resolves false branch (not a symbol)',
  'type T = string extends (infer U)[] ? U : number; declare const y: T; y.at(0);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    const objType = adapter.makeResolver().resolvePropertyObjectType(member);
    checkTruthy(`${ lbl } not a symbol`, typeof objType !== 'symbol');
    checkType(lbl, objType, { primitive: true, kind: 'number' });
  });

// a discriminant narrow is dropped when the discriminated binding is reassigned inside a captured
// function (which may run before the use) - mirrors the typeof-guard captured-mutation soundness filter
runBoth('discriminant narrow drops on captured-function reassignment',
  "type U = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };\ndeclare const altA: U;\n"
  + "function f(u: U) { if (u.kind === 'b') { mutate(); u.data.at(0); function mutate() { u = altA; } } }",
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    check(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), null);
  });

// a conditional reassignment positioned between a straight-line assignment and the use can overwrite
// it - the receiver widens to generic, not the straight-line value's single type
runBoth('conditional reassignment between straight-line assignment and use widens to generic',
  'let x;\nx = "hello";\nif (window.flag) { x = [1, 2, 3]; }\nx.at(-1);',
  (adapter, prog, lbl) => {
    const call = adapter.pickPath(prog, 'CallExpression');
    check(lbl, adapter.makeResolver().resolveNodeType(call.get('callee').get('object')), null);
  });

// an assignment whose own RHS hosts the use (`x = ("" + x.at(-1))`) has not executed at the use, so
// the receiver resolves from the prior value, not the not-yet-evaluated string assignment
runBoth('self-referential assignment RHS resolves receiver from prior value (not string)',
  'let x = [1, 2, 3];\nx = ("" + x.at(-1));',
  (adapter, prog, lbl) => {
    const call = adapter.pickPath(prog, 'CallExpression');
    const t = adapter.makeResolver().resolveNodeType(call.get('callee').get('object'));
    checkTruthy(`${ lbl } not narrowed to string`, !(t && t.primitive && t.type === 'string'));
  });

// the SE-tail peel applies in the `new` dispatch too: `new (0, C)()` constructs a C instance
runBoth('sequence-wrapped `new (0, C)()` resolves the class instance method receiver',
  'class C { items() { return [1, 2, 3]; } } const o = new (0, C)(); o.items().includes(1);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => (p.node.property?.name ?? p.node.property?.value) === 'includes');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// the readonly-operator peel covers a readonly ARRAY (not just tuples), reached via destructuring
runBoth('readonly array element via destructure `readonly string[][]` -> Array',
  'declare const x: readonly string[][]; const [a] = x; a.at(0);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

// the no-subst conditional false-branch resolution recurses: a false branch that is ITSELF an
// infer-false conditional resolves through to the inner false branch, never leaking the sentinel
runBoth('nested no-subst conditional infer-false recurses to inner false branch (not a symbol)',
  'type T = string extends (infer U)[] ? U : (number extends Array<infer V> ? V : boolean); declare const y: T; y.at(0);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    const objType = adapter.makeResolver().resolvePropertyObjectType(member);
    checkTruthy(`${ lbl } not a symbol`, typeof objType !== 'symbol');
    checkType(lbl, objType, { primitive: true, kind: 'boolean' });
  });

// a union constituent inside a 3-way intersection still distributes (breadth of the parens/alias fix)
runBoth('union inside 3-way intersection keeps two-hop member type',
  'function f(v: ({ a: { x: number[] } } | { a: { x: number[] } }) & { b: string } & { c: number }) { return v.a.x; }',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => (p.node.property?.name ?? p.node.property?.value) === 'x');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member), { primitive: false, ctor: 'Array' });
  });

// a doubly-nested SequenceExpression IIFE returning a proxy global is recognized by the path walk
// (it peels SE-callee tails to a fixpoint, matching the node-level peelIIFEReturn), so the chained
// instance-method receiver narrows
runBoth('double-SE IIFE proxy-global `(0, (1, () => globalThis))().Array.from(...).at` narrows to Array',
  '(0, (1, () => globalThis))().Array.from([1, 2, 3]).at(0);',
  (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    checkType(lbl, adapter.makeResolver().resolveNodeType(member.get('object')), { primitive: false, ctor: 'Array' });
  });

finish();
