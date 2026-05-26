import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { entryToGlobalHint } from './index.js';
import { POSSIBLE_GLOBAL_OBJECTS } from './helpers/class-walk.js';
import {
  getTypeArgs,
  kebabToCamel,
  singleQuasiString,
  unwrapRuntimeExpr,
} from './helpers/ast-patterns.js';
import {
  $Object,
  CONSTRUCTOR_ALIASES,
  GENERATOR_LIKE_NAMES,
  MAX_DEPTH,
  PATTERN_WRAPPERS,
  PROMISE_SYNONYMS,
  SINGLE_ELEMENT_COLLECTIONS,
  STRUCTURE_PRESERVING_WRAPPERS,
  TYPEOF_HINT_GROUPS,
  intersectHintSets,
  primitiveTypeOf,
  toHint,
} from './resolve-node-type/base.js';
import {
  collectQualifiedSegments,
  isBareUndefinedIdentifier,
  peelTSParenthesized,
  typeRefName,
  typeRefSegments,
} from './resolve-node-type/ast-shapes.js';
import { createAwaited } from './resolve-node-type/awaited.js';
import { createBindingAnalysis } from './resolve-node-type/binding-analysis.js';
import { createCallResolution } from './resolve-node-type/call-resolution.js';
import { createClassContext } from './resolve-node-type/class-context.js';
import { createClassFields } from './resolve-node-type/class-fields.js';
import { createClassObjectMember } from './resolve-node-type/class-object-member.js';
import { createClosureAnalysis } from './resolve-node-type/closure-analysis.js';
import { createDiscriminantNarrow } from './resolve-node-type/discriminant-narrow.js';
import { createElementTypes } from './resolve-node-type/element-types.js';
import { createEnumTypes } from './resolve-node-type/enum-types.js';
import { createExpressionDispatch } from './resolve-node-type/expression-dispatch.js';
import { createGlobalResolve } from './resolve-node-type/global-resolve.js';
import { createPredicateGuards } from './resolve-node-type/guard-shapes.js';
import { createKnownGlobals } from './resolve-node-type/known-globals.js';
import { createMemberResolve } from './resolve-node-type/member-resolve.js';
import {
  createNameResolution,
  isAmbientClassNode,
} from './resolve-node-type/name-resolution.js';
import { createNarrowByGuards } from './resolve-node-type/narrow-by-guards.js';
import { createPatternBindings } from './resolve-node-type/pattern-bindings.js';
import { createReturnType } from './resolve-node-type/return-type.js';
import {
  assignRightKey,
  createStraightLineFlow,
} from './resolve-node-type/straight-line-flow.js';
import { createTypeAnnotationResolve } from './resolve-node-type/type-annotation-resolve.js';
import { createTypeExpansion } from './resolve-node-type/type-expansion.js';
import { createTypeFolding } from './resolve-node-type/type-folding.js';
import { createTypeMembers } from './resolve-node-type/type-members.js';
import { createTypeQuery } from './resolve-node-type/type-query.js';
import { createTypeResolveDispatch } from './resolve-node-type/type-resolve-dispatch.js';
import { createTypeSubst } from './resolve-node-type/type-subst.js';
import { createTypeofGuards } from './resolve-node-type/typeof-guards.js';
import { createUserTypeResolve } from './resolve-node-type/user-type-resolve.js';
import { createValueOps } from './resolve-node-type/value-ops.js';
import { blockAlwaysExits, canFallThrough } from './resolve-node-type/exit-analysis.js';

const {
  constructors: KNOWN_CONSTRUCTORS,
  globalMethods: KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  globalProperties: KNOWN_GLOBAL_PROPERTY_RETURN_TYPES,
  staticMethods: KNOWN_STATIC_METHOD_RETURN_TYPES,
  staticProperties: KNOWN_STATIC_PROPERTY_RETURN_TYPES,
  instanceMethods: KNOWN_INSTANCE_METHOD_RETURN_TYPES,
  instanceProperties: KNOWN_INSTANCE_PROPERTY_RETURN_TYPES,
  staticTypeGuards: KNOWN_STATIC_TYPE_GUARDS,
} = knownBuiltInReturnTypes;

const { hasOwn } = Object;

// binding adapter shared with `walkStaticReceiverChain`. `getBindingPolyfillHint` is a
// side-channel for the post-rewrite alias `_globalThis` -> `globalThis` mapping, kept off
// the binding object so closure / alias trackers preserve WeakMap identity. covers both
// pure-import bindings (`import _Array$from` -> entry `array/from` -> hint `Array`) and
// alias-only bindings (`_globalThis` registered via `registerGlobalAlias`, no entry path).
// string-literal helpers + `packages` mirror the detect-usage adapter surface so the same
// `walkStaticReceiverChain` / `resolveKey` machinery reaches into ObjectExpression keys
// from the resolver path (destructure-leaf -> proxy-global)
function makeBabelBindingAdapter(getPolyfillBindingHint, babelNodeType) {
  return {
    packages: null,
    hasBinding: (scope, name) => !!scope?.getBinding(name),
    getBindingNodeType: (scope, name) => scope?.getBinding(name)?.path?.node?.type,
    getBinding: (scope, name) => scope?.getBinding(name),
    getBindingPolyfillHint(scope, name) {
      const hint = getPolyfillBindingHint(scope, name);
      return hint && POSSIBLE_GLOBAL_OBJECTS.has(hint) ? hint : null;
    },
    isStringLiteral: node => babelNodeType(node) === 'StringLiteral',
    getStringValue: node => babelNodeType(node) === 'StringLiteral' ? node.value : null,
  };
}

// `cycleSeenSets` + `cycleFlipDetector` live in `resolve-node-type/user-type-resolve.js`
// (their only consumer). `getOrInitMap` lives in `resolve-node-type/base.js` (consumed
// by typeof-guards + name-resolution).

// eslint-disable-next-line max-statements -- factory of type inference engine
function createResolveNodeType(babelNodeType, t, {
  getPolyfillBindingEntry = () => null,
  getPolyfillBindingHint = () => null,
  isReassignedBinding = () => false,
} = {}) {
  const babelBindingAdapter = makeBabelBindingAdapter(getPolyfillBindingHint, babelNodeType);
  // --- AST walkers & predicates ---
  // value-typed literal predicate. `kind` matches the Babel-shaped name (`String`/`Numeric`/...).
  // both ESTree (oxc) and Babel route through `babelNodeType` which normalises ESTree's `Literal`
  // discriminator + value-type sniffing into the Babel name. callers stay parser-agnostic
  function isLiteralOf(node, kind) {
    return babelNodeType(node) === `${ kind }Literal`;
  }

  function literalKeyValue(node) {
    if (isLiteralOf(node, 'String')) return node.value;
    if (isLiteralOf(node, 'Numeric')) return String(node.value);
    // negative numeric literals (`-1`, `-0`) parse as UnaryExpression { operator: '-',
    // argument: NumericLiteral } - the raw `value` slot is undefined on the wrapper,
    // so callers that compare against stringified numeric keys (`K extends -1 ? ...`)
    // would otherwise see `null` from the wrapper and bail
    if (node?.type === 'UnaryExpression' && node.operator === '-' && isLiteralOf(node.argument, 'Numeric')) {
      return String(-node.argument.value);
    }
    return null;
  }

  // statically-known property name from a Member/OptionalMemberExpression. accepts:
  //   - non-computed Identifier (`obj.x`)
  //   - computed string/numeric literal (`obj['x']` / `obj[0]`) - cross-parser via
  //     `literalKeyValue` (babel: StringLiteral/NumericLiteral, ESTree/oxc: Literal+typeof)
  //   - computed single-quasi TemplateLiteral (`obj[`x`]`) via `singleQuasiString`
  // returns null for dynamic shapes (Identifier alias, BinaryExpression concat, MemberExpression
  // chain, computed expressions). callers wanting alias-chain / enum / Symbol resolution should
  // route through `resolveComputedKeyName` (scope-aware) or `indexedAccessKey` (TS-position)
  function getMemberProperty(node) {
    if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
    const { property, computed } = node;
    if (!computed) return property?.type === 'Identifier' ? property.name : null;
    return literalKeyValue(property) ?? singleQuasiString(property);
  }

  function getKeyName(key) {
    if (key?.type === 'Identifier') return key.name;
    // `#` prefix keeps private keys disjoint from same-named public members at match time
    if (key?.type === 'PrivateIdentifier') return `#${ key.name }`;
    if (key?.type === 'PrivateName') return `#${ key.id.name }`;
    return literalKeyValue(key);
  }

  // T["key"] / T[0] / T[`key`] index literal - unwrap TSLiteralType; fall through template-literal
  // for parity with computed-member resolution. null for non-literal / keyof / union indexes
  function indexedAccessKey(indexType) {
    const literal = indexType?.type === 'TSLiteralType' ? indexType.literal : indexType;
    return literalKeyValue(literal) ?? singleQuasiString(literal);
  }

  // unified TSIndexedAccessType dispatcher under generic substitution. walks down the
  // chain to the root TSTypeReference, collecting raw indexType nodes outer-first;
  // length-1 = direct `T[k]` / `T[number]`, length-N = chained `T[k1]...[kN]`. resolves
  // through (in order): T[number] inner, argPath descend, single-step constraint
  // fallback (root-is-typeparam path) - then call-site arg-literal rewrite for the
  // `NamedType[K]` shape, finally plain resolveTypeAnnotation
  function resolveIndexedAccessSubst(node, typeParamMap, scope, depth) {
    const indexNodes = [];
    let root = node;
    while (root?.type === 'TSIndexedAccessType') {
      indexNodes.unshift(root.indexType);
      root = root.objectType;
    }
    const rootName = root && typeRefName(root);
    if (rootName && typeParamMap.has(rootName)) {
      const direct = resolveIndexAccessHit({ rootName, indexNodes, typeParamMap, scope, depth });
      if (direct !== null) return direct;
    }
    // `NamedType[K]` shape: K is out of scope at the call site, so `isKeyofTargeting`'s
    // constraint walk can't find K - rewrite each typeparam indexNode to the literal
    // bound to it at the call site (recorded on the side via `getTypeParamArgPath`) and
    // hand the synthetic literal-indexed chain to the standard dispatcher. covers
    // `pick<K extends keyof Items>(k: K): Items[K]` called as `pick('a')` / `pick(0)` /
    // ``pick(`a`)`` / chained `T[K1][K2]` with multiple typeparam slots
    const concrete = indexNodes.map(idx => indexFromArgLiteral(idx, typeParamMap));
    if (concrete.some((c, i) => c !== indexNodes[i])) {
      const resolved = resolveTypeAnnotation(rebuildIndexedAccess(root, concrete), scope, depth);
      if (resolved !== null) return resolved;
    }
    return resolveTypeAnnotation(node, scope, depth);
  }

  // re-fold the unfolded `(root, indexNodes)` pair back into a chained TSIndexedAccessType.
  // outer-most index applied last so the resulting AST matches the structure the unfold
  // loop originally walked
  function rebuildIndexedAccess(root, indexNodes) {
    let node = root;
    for (const idx of indexNodes) node = { type: 'TSIndexedAccessType', objectType: node, indexType: idx };
    return node;
  }

  // map a typeparam-bound indexType to its concrete literal indexType using the call-
  // site argPath. returns the original indexType when the rewrite doesn't apply (not a
  // typeparam ref, no recorded argPath, or arg isn't a static literal) - the caller's
  // `some((c, i) => c !== indexNodes[i])` guard then sees no change and falls through.
  // accepted arg shapes: bare String/Numeric literal, runtime-peeled `as const`, and
  // single-quasi TemplateLiteral - the same shapes `indexedAccessKey` recognises on
  // the type side. shape is re-emitted with babel-named TSLiteralType slots since the
  // downstream consumers walk through `isLiteralOf` (parser-agnostic)
  function indexFromArgLiteral(indexType, typeParamMap) {
    if (indexType?.type !== 'TSTypeReference') return indexType;
    const name = typeRefName(indexType);
    if (!name || !typeParamMap.has(name)) return indexType;
    const argPath = returnTypeCluster.getTypeParamArgPath(typeParamMap, name);
    if (!argPath?.node) return indexType;
    const peeled = resolveRuntimeExpression(argPath)?.node ?? argPath.node;
    if (isLiteralOf(peeled, 'String')) return synthLiteralIndex('StringLiteral', peeled.value);
    if (isLiteralOf(peeled, 'Numeric')) return synthLiteralIndex('NumericLiteral', peeled.value);
    const quasi = singleQuasiString(peeled);
    if (quasi !== null) return synthLiteralIndex('StringLiteral', quasi);
    return indexType;
  }

  function synthLiteralIndex(literalType, value) {
    return { type: 'TSLiteralType', literal: { type: literalType, value } };
  }

  // single resolution attempt against a known-mapped typeparam: T[number] inner,
  // argPath descent through literal keys, single-step constraint fallback. returns null
  // on miss so caller can fall through to plain resolveTypeAnnotation
  function resolveIndexAccessHit({ rootName, indexNodes, typeParamMap, scope, depth }) {
    if (indexNodes.length === 1 && indexNodes[0]?.type === 'TSNumberKeyword') {
      const inner = resolveInnerType(typeParamMap.get(rootName));
      if (inner) return inner;
    }
    // T[keyof T] under subst: substitute objectType with the AST stored in typeParamMap,
    // then fold via standard resolveIndexedAccessType. without this, keyof T's segments
    // never resolve because T's structural members aren't reachable through the bare ref.
    // gate on single-step and keyof referencing the SAME root - chained / cross-typeparam
    // forms fall through to the alias-chain / constraint branches below
    const literalKeys = indexNodes.map(indexedAccessKey);
    if (literalKeys.every(k => k !== null)) {
      let argPath = returnTypeCluster.getTypeParamArgPath(typeParamMap, rootName);
      for (let i = 0; i < literalKeys.length - 1; i++) {
        if (!argPath) break;
        argPath = walkObjectLiteralPropertyPath(argPath, literalKeys[i]);
      }
      const propType = argPath && resolveObjectLiteralProperty(argPath, literalKeys.at(-1));
      if (propType) return propType;
    }
    // single-step constraint fallback: `<T extends {k: number[]}>(o: T): T['k']` with no
    // arg-Path match still resolves through constraint. multi-step constraint walking
    // requires alias-chain follow + per-hop subst - deferred until concrete repro
    if (indexNodes.length === 1) {
      const paramInfo = findTypeParameter(rootName, scope);
      if (paramInfo?.constraint) {
        const syntheticNode = { type: 'TSIndexedAccessType', objectType: paramInfo.constraint, indexType: indexNodes[0] };
        return resolveTypeAnnotation(syntheticNode, paramInfo.scope, depth);
      }
    }
    return null;
  }

  // any SpreadElement at AST-index <= `index` shifts the runtime position of subsequent
  // elements by an unknown amount, so `elements[index]` no longer corresponds to runtime
  // slot `index`. bail conservatively. forward iteration up to `index` keeps the cost
  // O(index) per lookup; arrays with deep static lookups stay sub-linear in array length
  function arrayElementsHaveSpreadAtOrBefore(elements, index) {
    for (let i = 0; i <= index && i < elements.length; i++) {
      if (elements[i]?.node?.type === 'SpreadElement') return true;
    }
    return false;
  }

  // backward iteration so the LAST assignment wins (`{a: 1, a: 2}` returns 2) and any
  // SpreadElement encountered before the match could have injected `key` -> bail.
  // forward iteration with `return-on-first-match` was double-wrong: returned an early
  // match for `{a: 1, ...spread}` (spread might override) AND bailed for `{...spread, a: 1}`
  // (the LATER literal wins even after the spread). returns null when no key matches, when
  // a spread sits before the latest match, or when the matched value is a leaf method
  // shorthand (`onMethod` returns the leaf decision so callers split method/value semantics)
  function findObjectLiteralKey(propsPath, key, onMethod) {
    for (let i = propsPath.length - 1; i >= 0; i--) {
      const prop = propsPath[i];
      const { node } = prop;
      if (node.type === 'SpreadElement') return null;
      if (node.computed || getKeyName(node.key) !== key) continue;
      if (babelNodeType(node) === 'ObjectMethod') return onMethod();
      return prop.get('value');
    }
    return null;
  }

  // walk into an ObjectExpression / ArrayExpression argPath one key deep, returning the
  // INNER Path (suitable for chaining further hops). complementary to
  // `resolveObjectLiteralProperty` which returns a leaf Type Object - this returns the
  // intermediate path so chained indexed access (`T[k1][k2]`) can step through nested
  // literal shapes. method shorthand and SpreadElement bail (no walkable path)
  function walkObjectLiteralPropertyPath(argPath, key) {
    if (argPath?.node) argPath = resolveRuntimeExpression(argPath);
    if (argPath?.node?.type === 'ArrayExpression') {
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const elements = argPath.get('elements');
      if (arrayElementsHaveSpreadAtOrBefore(elements, index)) return null;
      const elementPath = elements[index];
      if (!elementPath?.node) return null;
      return elementPath;
    }
    if (argPath?.node?.type !== 'ObjectExpression') return null;
    // ObjectMethod is a leaf (Function value with no walkable inner shape)
    return findObjectLiteralKey(argPath.get('properties'), key, () => null);
  }

  // ObjectExpression { key: value, ... } -> value's type for the literal key.
  // Spread bails (unknown key coverage); method shorthand resolves to Function
  function resolveObjectLiteralProperty(argPath, key) {
    // peel ParenthesizedExpression / TS expression wrappers (`as const`, `satisfies T`,
    // `<T>x` casts). oxc preserves parens around call-args (`fn(({k: [1]} as const))`)
    // while babel strips them - without this peel, oxc-parsed sources fall to constraint
    // fallback and lose precision (parser-divergence asymmetry between plugins)
    if (argPath?.node) argPath = resolveRuntimeExpression(argPath);
    // `T[N]` where T is bound to a concrete tuple/array LITERAL at the call-site:
    // `first<T extends [unknown, unknown]>(t: T): T[0]` called with `[['x'], 1]` as arg -
    // element 0 is a known ArrayExpression, resolve it to that type. without this branch
    // the generic substitution path falls back to T's constraint (`[unknown, unknown]`)
    // and element 0 resolves to `unknown`
    if (argPath?.node?.type === 'ArrayExpression') {
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const elements = argPath.get('elements');
      if (arrayElementsHaveSpreadAtOrBefore(elements, index)) return null;
      const elementPath = elements[index];
      if (!elementPath?.node) return null;
      return resolveNodeType(elementPath);
    }
    if (argPath?.node?.type !== 'ObjectExpression') return null;
    // babel-only `ObjectMethod` shorthand: `{ foo() {...} }`. oxc emits `Property { value: FunctionExpression }`
    // and falls through to `resolveNodeType(prop.get('value'))` which returns Function via FunctionExpression
    const valuePath = findObjectLiteralKey(argPath.get('properties'), key, () => new $Object('Function'));
    if (valuePath === null) return null;
    return valuePath instanceof $Object ? valuePath : resolveNodeType(valuePath);
  }

  // [key] where key is a string/number literal, a const binding (chain) to one, or an
  // enum member access (`obj[Enum.A]` - enum members carry static literals at known slots)
  function resolveComputedKeyName(key, scope, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    const literal = literalKeyValue(key);
    if (literal !== null) return literal;
    // single-quasi TemplateLiteral (`` `foo` `` with no interpolations) resolves to its
    // cooked text. matches `getMemberProperty`'s template handling so `box.kind === \`A\``
    // (and identifier chains pointing at such templates) classify the same as `'A'`
    const quasi = singleQuasiString(key);
    if (quasi !== null) return quasi;
    if (!scope) return null;
    if (key?.type === 'Identifier') {
      const binding = scope.getBinding?.(key.name);
      if (!binding || binding.constantViolations?.length) return null;
      const decl = binding.path;
      if (!t.isVariableDeclarator(decl.node) || !decl.node.init) return null;
      return resolveComputedKeyName(decl.node.init, decl.scope ?? scope, depth + 1);
    }
    // `Enum.A` - TSEnumDeclaration lookup via findTypeDeclaration (scope-chain walk),
    // not scope.getBinding - estree-toolkit adapter doesn't register enum bindings the
    // same way babel does; type-declaration walker works uniformly for both
    const memberName = getMemberProperty(key);
    if (memberName !== null && key.object?.type === 'Identifier') {
      const enumDecl = findEnumDeclaration(key.object.name, scope);
      if (enumDecl) {
        const member = findEnumMember(enumDecl, memberName);
        const initValue = member?.initializer ? literalKeyValue(member.initializer) : null;
        if (initValue !== null) return initValue;
      }
    }
    return null;
  }

  function keyMatchesName(key, name) {
    return getKeyName(key) === name;
  }

  function isMemberLike(path) {
    return t.isMemberExpression(path.node) || t.isOptionalMemberExpression(path.node);
  }

  // name-based resolution cluster: scope walks for type / enum / namespace declarations,
  // type-parameter lookup, and ambient `declare` walks. predicates (`isTypeAlias` /
  // `isInterfaceDeclaration`) ship from `ast-shapes` - the cluster imports them directly.
  // `isAmbientFunctionNode` / `isAmbientClassNode` / `isAmbientFunctionOrClassNode` are
  // module-level consts in the cluster file - identity-stable for `ambientDeclCache`'s
  // `matchType` key
  const nameResolutionCluster = createNameResolution({ t });
  const {
    withLookupPath,
    isFunctionLike,
    isFunctionOrClassDeclaration,
    isClassLikeDeclaration,
    findAmbientDeclarationPath,
    findAmbientFunctionPaths,
    findAmbientFunctionPath,
    findAmbientClassPath,
    findNamespacedFunctionPath,
    findOverloadsForName,
    findDeclPathBySegments,
    findTypeDeclaration,
    findEnumDeclaration,
    findAllTypeDeclarations,
    typeParamName,
    findTypeParameter,
  } = nameResolutionCluster;

  // resolve variable references and unwrap transparent TS expression wrappers to reach the actual runtime value
  // iterates: after unwrapping a TS wrapper, the underlying expression may be another variable reference
  // `x as Type`, `x!`, `x satisfies Type`
  function resolveRuntimeExpression(path) {
    let depth = MAX_DEPTH;
    while (depth-- && path.node) {
      path = resolvePath(path);
      if (!path.node) break;
      const { type } = path.node;
      if (type === 'TSAsExpression'
        || type === 'TSTypeAssertion'
        || type === 'TSSatisfiesExpression'
        || type === 'TSNonNullExpression'
        || type === 'TSInstantiationExpression'
        || type === 'TypeCastExpression'
        || type === 'ParenthesizedExpression'
        || type === 'ChainExpression') {
        path = path.get('expression');
      // chain-AssignmentExpression `(a = init)` evaluates to its right operand at runtime.
      // common shape: `const x = a = init` / `const x = a = b = init`. peel here so the
      // alias walker reaches the rightmost value through nested assignment chains
      } else if (type === 'AssignmentExpression' && path.node.operator === '=') {
        path = path.get('right');
      } else break;
    }
    return path;
  }

  function isRestBinding(elements, varName) {
    for (const element of elements) {
      if (element?.type === 'RestElement' && element.argument?.type === 'Identifier' && element.argument.name === varName) return true;
    }
    return false;
  }

  function unwrapTypeAnnotation(node) {
    if (!node) return null;
    if (node.type === 'TSTypeAnnotation' || node.type === 'TypeAnnotation') return unwrapTypeAnnotation(node.typeAnnotation);
    return node;
  }
  // peelTSParenthesized is imported from ast-shapes and shared with siblings that
  // pattern-match TSUnionType / TSIntersectionType / TSTypeQuery on the oxc parser path

  // `function fn(x = 'a')` - default wraps param in AssignmentPattern; type is on `.left`.
  // `function fn(...xs: T[])` - RestElement carries `T[]` annotation; caller must unwrap one level
  function effectiveParam(param) {
    if (!param) return { param: null, isRest: false };
    if (param.type === 'AssignmentPattern') return { param: param.left, isRest: false };
    if (param.type === 'RestElement') return { param, isRest: true };
    return { param, isRest: false };
  }

  // forward decls for late-bound cluster outputs (`type-resolve-dispatch`, `awaited`,
  // `call-resolution`, `class-object-member`, `member-resolve`, `type-annotation-resolve`,
  // `closure-analysis`, `pattern-bindings`, `class-fields`, `type-members`, `type-query`).
  // these clusters are instantiated below all helper function declarations they consume;
  // forward-decl `let`s let earlier factory functions capture the bindings via closure -
  // all reads happen at call time, by which point the destructure assignments below have
  // populated them
  /* eslint-disable prefer-const -- destructuring assignment below rebinds these */
  let buildCallSiteSubst, substituteTypeParams, functionTypeParams;
  let findExpressionAnnotation, findTypeMember, getTypeMembers, classSubstInner, methodFnPath;
  let findClassPathForTypeReference, findClassMember, findObjectMember, isMethodMember;
  let resolveObjectMember, resolveTypeAnnotation, resolveKnownContainerType, extendsClauseName;
  /* eslint-enable prefer-const -- destructuring assignment below rebinds these */

  // known-globals cluster: type-from-hint conversion + built-in / global member resolvers
  // backed by the shared `KNOWN_*` registries. instantiated early so typeExpansion (below)
  // sees `isPromiseRefName` + the rest of the factory body sees `typeFromHint` /
  // `resolveInnerType` etc. service captures factory hoisted helpers (`resolveNodeType` /
  // `resolveGlobalName` / `resolveMemberPropertyName` / `isMemberLike` / `isNullableOrNever`)
  // via closure - all calls happen at AST-walk time, after factory init
  const {
    typeFromHint,
    resolveInnerType,
    unwrapPromise,
    promiseRefInner,
    isPromiseRefName,
    lookupNested,
    resolveKnownInstanceMember,
    resolveKnownStaticReturnType,
    resolveKnownPropertyReturnType,
    resolveGlobalStaticReference,
    resolveKnownGlobalReference,
  } = createKnownGlobals({
    babelNodeType,
    isMemberLike,
    isNullableOrNever: (...args) => isNullableOrNever(...args),
    resolveMemberPropertyName: (...args) => resolveMemberPropertyName(...args),
    resolveGlobalName: (...args) => resolveGlobalName(...args),
    resolveNodeType,
    KNOWN_STATIC_METHOD_RETURN_TYPES,
    KNOWN_STATIC_PROPERTY_RETURN_TYPES,
    KNOWN_INSTANCE_PROPERTY_RETURN_TYPES,
    KNOWN_GLOBAL_PROPERTY_RETURN_TYPES,
    KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  });

  // type-folding cluster: tuple structural ops + commonType / equality fold +
  // union / intersection / tuple resolved-fold + annotation-context resolvers. instantiated
  // between known-globals and type-expansion so its outputs flow into every later cluster
  // as direct destructure refs. forward-declared `let`s cover the awaited cluster output
  // (`peelStructurePreservingWrapper`), element-types output (`extractElementAnnotation`),
  // and typeQuery output (`resolveTypeQueryBinding`) - all late-bound via thunks
  // eslint-disable-next-line prefer-const -- destructuring assignment below rebinds these
  let peelStructurePreservingWrapper, extractElementAnnotation, resolveTypeQueryBinding;
  const {
    tupleElements,
    rebuildTupleElements,
    tupleAsArrayType,
    resolveParametersParams,
    findTupleElement,
    resolveAnnotationInContext,
    typesEqual,
    innersEqual,
    commonType,
    isNullableOrNever,
    isNullableOrNeverAnnotation,
    foldUnionTypes,
    foldIntersectionTypes,
    resolveTupleInner,
    resolveNonNullableAnnotation,
    safeInnerType,
  } = createTypeFolding({
    t,
    resolveRuntimeExpression,
    effectiveParam,
    resolveInnerType,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    substituteTypeParams: (...args) => substituteTypeParams(...args),
    applySubst: (...args) => applySubst(...args),
    applyAliasSubstDeep: (...args) => applyAliasSubstDeep(...args),
    peelStructurePreservingWrapper: (...args) => peelStructurePreservingWrapper(...args),
    followTypeAliasChain: (...args) => followTypeAliasChain(...args),
    extractElementAnnotation: (...args) => extractElementAnnotation(...args),
    resolveTypeQueryBinding: (...args) => resolveTypeQueryBinding(...args),
  });

  // value-ops cluster: per-shape runtime resolvers - binary-operator narrowing, union /
  // nullish-coalesce / default-ternary handlers, numeric / member-name extraction. consumed
  // by `resolveNodeTypeExpression`'s dispatch switch. depends only on type-folding outputs
  // (`isNullableOrNever` / `commonType`) + factory hoisted helpers; no late deps
  const {
    resolveNumericType,
    resolveMemberPropertyName,
    resolveUnionType,
    resolveDesugarDefaultTernary,
    resolveBinaryOperatorType,
  } = createValueOps({
    isLiteralOf,
    literalKeyValue,
    singleQuasiString,
    getKeyName,
    resolveRuntimeExpression,
    resolveComputedKeyName,
    resolveNodeType,
    resolvePath,
    isNullableOrNever,
    commonType,
  });

  // global-resolve cluster: bare-Identifier / global-proxy / `<Cls>.prototype` resolution +
  // `extends` chain walker. `resolveClassInheritance` needs forward-decl thunks for
  // `resolveKnownContainerType` / `resolveTypeAnnotation` (factory `let`s populated when
  // type-annotation-resolve cluster binds them later)
  const {
    resolveGlobalName,
    resolvePrototypeAsInstance,
    resolveClassInheritance,
  } = createGlobalResolve({
    t,
    isMemberLike,
    keyMatchesName,
    resolveMemberPropertyName,
    resolveKnownConstructor,
    resolveRuntimeExpression,
    resolveKnownContainerType: (...args) => resolveKnownContainerType(...args),
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    babelBindingAdapter,
  });

  // mapped + conditional type evaluation lives in the `type-expansion` cluster. service
  // object passes function references that close over the factory's later-declared deps
  // (`getTypeMembers`, `resolveInnerType`) via function-declaration hoisting.
  // `applyAliasSubstDeep` / `substituteTypeParams` go through thunks because they're `let`
  // bindings (assigned by the `type-subst` / `type-resolve-dispatch` cluster destructures
  // further down), not hoisted function declarations
  const typeExpansionCluster = createTypeExpansion({
    literalKeyValue,
    applyAliasSubstDeep: (...args) => applyAliasSubstDeep(...args),
    unwrapTypeAnnotation,
    getTypeMembers: (...args) => getTypeMembers(...args),
    getKeyName,
    peelTSParenthesized,
    substituteTypeParams: (...args) => substituteTypeParams(...args),
    resolveInnerType,
    // late-bound: type-annotation-resolve cluster builds resolveTypeAnnotation after this
    // factory runs. used in `infer T extends C` to convert the constraint AST keyword
    // (TSStringKeyword / TSNumberKeyword / ...) to the internal $Primitive representation
    // before substitution; otherwise downstream `toHint` walks an AST node and crashes
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    // shared parser-shape helper: babel wraps TSTypeParameter.name as Identifier,
    // oxc stores the bare string. extractInferTarget reuses it for `infer U` extraction
    typeParamName,
    commonType,
    isNullableOrNever,
    typesEqual,
    innersEqual,
    typeRefName,
    typeRefSegments,
    isPromiseRefName,
  });
  const {
    mappedTypeKeyName,
    mappedTypeConstraint,
    unwrapMappedTypePassthrough,
    expandMappedTypeMembers,
    evaluateConditionalType,
    pickConditionalBranchVia,
    resolveInferElementPattern,
    resolveConditionalBranches,
    isUnconstrainedTypeReference,
    collectInferredNames,
    typeRefSegmentsEqual,
    dropMapKeys,
    trueBranchSubst,
  } = typeExpansionCluster;

  // decompose a type reference into its dotted segments. `Foo` -> ['Foo'],
  // `NS.Data` -> ['NS', 'Data'], `A.B.T` -> ['A', 'B', 'T']. Returns null when the
  // reference uses a non-identifier head (e.g. an `import("...").Type` form)
  // `typeRefSegments` / `isQualifiedNameNode` / `qualifiedNameLeft` / `qualifiedNameRight`
  // / `collectQualifiedSegments` / `typeRefName` / `isTypeAlias` / `isInterfaceDeclaration`
  // / `typeAliasBody` / `extendsId` / `synthInterfaceExtendsRef` live in
  // `resolve-node-type/ast-shapes.js` (closure-free pure predicates).

  // --- Alias chain & substitution ---
  // `type-subst` cluster: alias chain walker (`followTypeAliasChain` /
  // `swapAliasToTSTypeQueryWithSubst`) + AST substitution machinery (`applyAliasSubstDeep` /
  // `applySubst` / `substMembers` / `substMemberAnnotations` / `dropTypeParamSubst`).
  // `followTypeAliasChain` invokes `applySubst` on the terminal node when a trivial mapped
  // passthrough lands (or folds accumulated subst into the whole mapped type for `as`-rename
  // shapes); merging the two halves into one closure removes the previous circular service
  // dep that the legacy `alias-chain` / `ast-subst` split required. `functionTypeParams`
  // stays a forward-decl `let` here because
  // awaited cluster (which exposes it) is instantiated later
  const {
    followTypeAliasChain,
    swapAliasToTSTypeQueryWithSubst,
    applyAliasSubstDeep,
    applySubst,
    substMembers,
    reset: resetTypeSubst,
  } = createTypeSubst({
    unwrapTypeAnnotation,
    findTypeDeclaration,
    typeParamName,
    unwrapMappedTypePassthrough,
    tupleElements,
    rebuildTupleElements,
    mappedTypeKeyName,
    dropMapKeys,
    trueBranchSubst,
    functionTypeParams: (...args) => functionTypeParams(...args),
  });

  // --- Scope lookup & declarations ---
  function constantBindingPath(name, scope) {
    if (!scope) return null;
    const binding = scope.getBinding(name);
    return binding?.constant ? binding.path : null;
  }

  // type-query cluster (`resolveTypeQuery`, `resolveTypeofFromSegments`,
  // `resolveTypeQueryBinding`, `resolveReturnTypeFromTypeQuery`) lives in
  // `resolve-node-type/type-query.js`. instantiation appears below alongside the other
  // late clusters (it consumes `applyAliasSubstDeep` through a thunk and several factory
  // function decls)

  // computed enum initializers: TS evaluates `1 + 2` / `'a' + 'b'` at compile time;
  // we can't but operand-shape inference covers the common cases. TemplateLiteral always
  // yields string; BinaryExpression preserves the kind if both operands match.
  // enum-type resolution lives in `resolve-node-type/enum-types.js`. wired immediately
  // after name-resolution so its outputs are available to the downstream type-name resolver
  const {
    findEnumMember,
    resolveEnumMemberType,
    resolveEnumType,
  } = createEnumTypes({ babelNodeType });

  // declaration / scope-walk helpers (`isClassLikeDeclaration` /
  // `findNamespacedFunctionPath` / `findTypeDeclaration` / `findEnumDeclaration` /
  // `findAllTypeDeclarations` / `typeParamName` / `findTypeParameter` etc.) live in
  // `resolve-node-type/name-resolution.js`

  function resolveKnownConstructor(name) {
    return hasOwn(KNOWN_CONSTRUCTORS, name) ? typeFromHint(KNOWN_CONSTRUCTORS[name].new) : null;
  }

  // user-type-resolve cluster: walks `type` / `interface` / `class` / `enum` declarations
  // to produce Type objects; handles generic substitution, default type params, namespace-
  // qualified extends, alias cycle detection. instantiated here so its outputs flow into
  // every later cluster directly. `substituteTypeParams` / `resolveTypeAnnotation` /
  // `resolveKnownContainerType` are factory `let` thunks (assigned by later clusters);
  // `extendsClauseName` is closureAnalysis output thunked via the forward-decl let
  const {
    resolveUserDefinedType,
    buildSubstMap,
    buildDefaultTypeParamMap,
  } = createUserTypeResolve({
    typeParamName,
    findTypeDeclaration,
    findTypeParameter,
    isClassLikeDeclaration,
    extendsClauseName: (...args) => extendsClauseName(...args),
    resolveKnownConstructor,
    resolveKnownContainerType: (...args) => resolveKnownContainerType(...args),
    resolveEnumType,
    substituteTypeParams: (...args) => substituteTypeParams(...args),
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    dropMapKeys,
  });

  // --- Type annotation resolver ---
  // build the typeParamMap for entering a nested type decl. produces a Type-object-valued
  // binding map: `Map<string, ResolvedType>` for `substituteTypeParams` consumption
  // (distinct from AST-valued `buildSubstMap` -> `applyAliasSubstDeep`).
  // two-phase rebuild:
  //   1. resolve callArgs through OUTER `typeParamMap` - args live in caller-scope, may
  //      reference type-params whose names collide with this decl's params (`B<T>` calling
  //      `A<T>` where each T is a different scope). substituting under the outer map
  //      resolves refs to concrete types BEFORE the inner scope strips them
  //   2. build localMap from outer-non-colliding bindings + freshly resolved declParam
  //      entries. outer bindings whose name MATCHES a declParam are dropped (variable
  //      capture guard - nested decl's `T` is its own scope per TS spec)
  // when nothing was substituted AND no name collides, return typeParamMap as-is so
  // caller's identity preserves for downstream memoize keys

  // `substMemberAnnotations` / `substMembers` live in `resolve-node-type/type-subst.js`

  // `TRANSPARENT_WRAPPERS` / `KEY_FILTERING_WRAPPERS` / `STRUCTURE_PRESERVING_WRAPPERS` /
  // `PROMISE_SYNONYMS` live in `resolve-node-type/base.js`

  // return-type cluster: function return resolution including call-site type-param inference.
  // instantiated before awaited so awaited's `resolveBodyReturnType` dep is bound. cluster
  // captures hoisted factory function decls (`resolveTypeAnnotation` / `generatorTypeParams` /
  // `classSubstInner` / etc.) via closure; thunks for `substituteTypeParams` (forward-decl let)
  // and `resolveNodeType`
  const returnTypeCluster = createReturnType({
    t,
    babelNodeType,
    unwrapTypeAnnotation,
    effectiveParam,
    typeParamName,
    tupleElements,
    mappedTypeConstraint,
    resolveNodeType,
    resolvePath,
    resolveInnerType,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    substituteTypeParams: (...args) => substituteTypeParams(...args),
    generatorTypeParams,
    classSubstInner: (...args) => classSubstInner(...args),
    isNullableOrNever,
    safeInnerType,
    commonType,
    // pattern-bindings cluster instantiates later in this factory; thunk through so the
    // closure picks up the populated reference at call time (TDZ otherwise)
    findPatternKeyPath: (...args) => findPatternKeyPath(...args),
    resolveDestructuredMember: (...args) => resolveDestructuredMember(...args),
    resolveObjectMemberPath: (...args) => resolveObjectMemberPath(...args),
  });
  const { resolveReturnType, resolveBodyReturnType, collectReturnPaths } = returnTypeCluster;

  // awaited cluster: AST-level + Type-object Awaited peel + `await` expression resolver.
  // the two walkers cross-reference (AST `peelAwaitedCommonSteps` <-> Type
  // `pickAwaitedConditionalBranch` / `getPromiseInnerAnnotation`); consolidated into one
  // closure so the cycle resolves internally - no forward-decl thunks needed at this layer.
  // `findTypeMember` / `getTypeMembers` are forward-decl `let`s thunked here because
  // type-members cluster is instantiated late
  const awaitedCluster = createAwaited({
    babelNodeType,
    unwrapTypeAnnotation,
    peelTSParenthesized,
    rebuildTupleElements,
    indexedAccessKey,
    findTypeMember: (...args) => findTypeMember(...args),
    followTypeAliasChain,
    applySubst,
    unwrapMappedTypePassthrough,
    foldUnionTypes,
    foldIntersectionTypes,
    tupleAsArrayType,
    promiseRefInner,
    unwrapPromise,
    resolveNodeType,
    resolveRuntimeExpression,
    resolveBodyReturnType,
    resolveAnnotationInContext,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    isFunctionLike,
    findClassPathForTypeReference: (...args) => findClassPathForTypeReference(...args),
    buildSubstMap,
    findClassMember: (...args) => findClassMember(...args),
    isMethodMember: (...args) => isMethodMember(...args),
    methodFnPath: (...args) => methodFnPath(...args),
    getTypeMembers: (...args) => getTypeMembers(...args),
    keyMatchesName,
    findExpressionAnnotation: (...args) => findExpressionAnnotation(...args),
    pickConditionalBranchVia,
    isUnconstrainedTypeReference,
  });
  ({ peelStructurePreservingWrapper, functionTypeParams } = awaitedCluster);
  const {
    unwrapPassthroughWrapper,
    resolveAwaitedAnnotation,
    resolveAwaitExpressionType,
    resolveIndexedAccessMemberAnnotationAST,
  } = awaitedCluster;

  // `resolveTypeAnnotation` + `resolveConstructorType` + `resolveConstructorCallType` live
  // in `resolve-node-type/type-annotation-resolve.js` along with the named-utility-type
  // dispatch (`resolveNamedType`), literal / conditional / indexed-access / keyof handlers,
  // and the cluster-private `resolveExtractExclude` / `resolveKnownContainerType` /
  // `isAssignableTo`. forward-declared via `let` near the top of the factory; instantiation
  // appears further down once the late cluster outputs (typeQuery / element-types / awaited)
  // it consumes are bound

  // dispatcher over the two pattern-key walkers (ArrayPattern numeric index / ObjectPattern
  // string key). returns null for anything else (Identifier handled by caller, RestElement
  // / nested patterns covered inside the underlying walkers). shared by `assignmentBindsTarget`
  // (predicate) and resolvePath's destructure branch (key-path consumer)
  function findPatternKeyPath(pattern, name, scope) {
    if (pattern?.type === 'ArrayPattern') return findArrayPatternKeyPath(pattern, name, scope);
    if (pattern?.type === 'ObjectPattern') return findDestructuredKeyPath(pattern, name, scope);
    return null;
  }

  // walk an RHS path (`right` of an AssignmentExpression with destructure LHS) along the
  // key-path produced by `findPatternKeyPath`, returning the path bound to that slot - or
  // null when the RHS shape doesn't match (annotation fallback handled by callers). path-
  // returning companion to `resolveObjectMemberPath` which produces a Type; used in
  // resolvePath where downstream needs the live Path
  function followKeyPathInRhs(rhsPath, keyPath) {
    if (!keyPath?.length) return null;
    let cur = resolveRuntimeExpression(rhsPath);
    for (const step of keyPath) {
      if (typeof step === 'number') {
        // -1 marks rest-element ("whole tail" slice) - no single Path to surface
        if (step < 0) return null;
        if (!t.isArrayExpression(cur.node) || cur.node.elements.length <= step) return null;
        const next = cur.get('elements')[step];
        if (!next?.node) return null;
        cur = resolveRuntimeExpression(next);
      } else {
        if (!t.isObjectExpression(cur.node)) return null;
        const prop = findObjectMember(cur, step);
        if (!prop?.node || !t.isObjectProperty(prop.node)) return null;
        cur = resolveRuntimeExpression(prop.get('value'));
      }
    }
    return cur;
  }

  // --- Type utilities & runtime expression resolver ---
  function resolvePath(path) {
    let depth = MAX_DEPTH;
    while (depth-- && t.isIdentifier(path.node)) {
      if (!path.scope) break;
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) break;
      // injector-recorded reassignment flag: the destructure-emitter saw `constantViolations`
      // at registration time (pre-AST-mutation, when scope was fresh) and stored the flag.
      // babel's post-mutation scope can't be queried reliably here -- the original binding
      // is replaced and the new one has empty `constantViolations`. break out of the alias
      // walk so downstream narrowing (e.g. via the polyfill UID this binding was rewritten
      // to) doesn't dispatch type-specific instance polyfills for a value whose runtime
      // identity is no longer guaranteed
      if (isReassignedBinding(path.node.name, binding)) break;
      // mutable binding with reassignments: follow the last preceding-block `=` assignment
      // before `path` so `let f: Foo = init; f = { kind:'b', data:'str' }; f.data.at(0)`
      // (and `if (...) { f = {...}; f.data.at(0); }`) narrows `f` to the RHS shape, not the
      // declared union. uses `findPrecedingBlockAssignment` (relative to use site) rather
      // than `findLastStraightLineAssignment` (relative to var-scope) so assignments nested
      // in conditional blocks still apply when the use site shares the same block
      if (binding.constantViolations?.length) {
        const lastAssign = findPrecedingBlockAssignment(binding, path);
        if (lastAssign?.node?.type === 'AssignmentExpression' && lastAssign.node.operator === '=') {
          const { left } = lastAssign.node;
          // simple `f = X` reassignment - follow RHS directly
          if (left?.type === 'Identifier' && left.name === path.node.name) {
            path = lastAssign.get(assignRightKey(lastAssign.node));
            continue;
          }
          // destructure-assignment `[f] = [X]` / `({f} = {f: X})` - resolveBindingType handles
          // these via key-path walks, but resolvePath is invoked from `resolveRuntimeExpression`
          // (member-chain resolution) which never reaches that fallback. extract the matching
          // RHS slot here so `f.data.at(0)` after `[f] = [{data: ['x']}]` narrows correctly
          const keyPath = findPatternKeyPath(left, path.node.name, lastAssign.scope);
          if (keyPath) {
            const elem = followKeyPathInRhs(lastAssign.get('right'), keyPath);
            if (elem?.node) {
              path = elem;
              continue;
            }
          }
          break;
        }
        break;
      }
      const { path: bindingPath } = binding;
      const initPath = followableVarInit(bindingPath);
      if (initPath) {
        path = initPath;
        continue;
      }
      if (isFunctionOrClassDeclaration(bindingPath.node)) return bindingPath;
      break;
    }
    return path;
  }

  // returns the init path to follow for `const X = init` style bindings, or null when:
  //  - not a VariableDeclarator (function / class / param / catch / import...)
  //  - destructured binding (init is the collection, not the element value)
  //  - explicit annotation + nullish placeholder init (`const x: T | null = null`) -
  //    annotation declares the intended runtime type; init is a placeholder, so
  //    `resolveBindingType` will pick the annotation up downstream
  // broader annotations (`object`, `any`) fall through to init so `const x: object =
  // [1, 2, 3]` narrows to Array via the init expression
  function followableVarInit(bindingPath) {
    if (!t.isVariableDeclarator(bindingPath.node)) return null;
    const { id } = bindingPath.node;
    if (id?.type === 'ObjectPattern' || id?.type === 'ArrayPattern') return null;
    let initPath = bindingPath.get('init');
    if (!initPath?.node) return null;
    if (id?.typeAnnotation && isNullishInit(initPath.node)) return null;
    // zero-arg IIFE on init (`const x = (() => RHS)()`) evaluates to the function body's
    // sole expression at runtime. peel one IIFE layer when the body is an expression-only
    // arrow / FE with no params - downstream alias-walker then reaches RHS just like
    // `const x = RHS`. multi-statement bodies / param'd IIFEs stay opaque (side effects /
    // arg binding can't be statically inlined)
    const iifeBody = zeroArgIifeBodyPath(initPath);
    if (iifeBody) initPath = iifeBody;
    return initPath;
  }

  // returns the inner expression Path when `initPath` wraps a zero-arg arrow / FunctionExpression
  // call with an expression-only body, otherwise null
  function zeroArgIifeBodyPath(initPath) {
    const { node } = initPath;
    if (node?.type !== 'CallExpression' || node.arguments?.length) return null;
    // peel paren / chain / TS-wrappers off the callee: oxc preserves `(() => x)()` as
    // `CallExpression { callee: ParenthesizedExpression { ArrowFunctionExpression } }`,
    // babel strips the paren on parse. without this both parsers must agree on the IIFE
    // shape or the unplugin path silently misses the alias-walk's chain-narrow downstream
    const arrow = unwrapRuntimeExpr(node.callee);
    if (arrow?.type !== 'ArrowFunctionExpression' || arrow.params?.length) return null;
    if (arrow.body?.type === 'BlockStatement') return null;
    const arrowPath = walkPathToNode(initPath.get('callee'), arrow);
    return arrowPath?.get('body') ?? null;
  }

  // walk a wrapped path through `.get('expression')` until its node matches `target`.
  // mirrors `unwrapRuntimeExpr` on the node side - paths produced by callee-side peels
  // (ParenthesizedExpression / ChainExpression / TS expression wrappers) all expose
  // their inner shape through the `expression` slot, so a single walker covers every
  // combination. returns null when the walk overshoots (defensive against mismatched
  // wrapper depth between node and path)
  function walkPathToNode(pathStart, target) {
    let walker = pathStart;
    while (walker?.node && walker.node !== target) walker = walker.get('expression');
    return walker?.node === target ? walker : null;
  }

  // `null` / `undefined` literal or `void <expr>` - placeholders that don't reflect runtime
  // type. covers babel `NullLiteral` + ESTree `Literal { value: null }` (oxc); the `regex`
  // guard excludes `/foo/` literals which also reuse the `Literal` node in ESTree.
  // shared `unwrapRuntimeExpr` strips ParenthesizedExpression / TS expression wrappers
  // (`null as any`, `(null)`) so the nullish-tail is recognized through user-applied wrappers
  function isNullishInit(node) {
    const inner = unwrapRuntimeExpr(node);
    if (!inner) return false;
    if (inner.type === 'NullLiteral') return true;
    if (inner.type === 'Literal' && inner.value === null && !inner.regex) return true;
    if (isBareUndefinedIdentifier(inner)) return true;
    return inner.type === 'UnaryExpression' && inner.operator === 'void';
  }

  // TS lib types whose first type-param is the yielded element type, structurally
  // equivalent to Generator's TYield slot. `Iterator<T,...>`/`AsyncIterator<T,...>` carry
  // `GENERATOR_LIKE_NAMES` imported from base - shared with `SINGLE_ELEMENT_COLLECTIONS` so
  // the two callers don't maintain parallel hardcoded lists. all members share param-0 =
  // TYield, matching `resolveGeneratorTypeParam`'s contract
  // if annotation resolves to one of GENERATOR_LIKE_NAMES, return its type params; otherwise null
  // handles aliased types: type MyGen<T> = Generator<T> -> substitutes T with actual args
  // supports chained aliases with different param names: type A<T> = B<T>; type B<U> = Generator<U>
  function generatorTypeParams(annotation, scope) {
    const { node: ref, subst } = followTypeAliasChain(annotation, scope);
    const refName = typeRefName(ref);
    if (!GENERATOR_LIKE_NAMES.has(refName)) return null;
    const params = getTypeArgs(ref)?.params;
    if (!params?.length) return null;
    if (!subst) return params;
    // `Generator<T[]>` carries the type-param inside `TSArrayType` / `TSUnionType` -
    // deep subst descends into it
    return params.map(p => applyAliasSubstDeep(p, subst));
  }

  // resolve a specific Generator/AsyncGenerator type parameter from an expression
  // paramIndex: 0 = TYield, 1 = TReturn, 2 = TNext
  function resolveGeneratorTypeParam(exprPath, paramIndex) {
    // direct annotation: identifier with type, type cast, etc.
    const info = findExpressionAnnotation(exprPath);
    if (info) {
      const params = generatorTypeParams(info.annotation, info.scope);
      if (params?.[paramIndex]) return resolveTypeAnnotation(params[paramIndex], info.scope);
      return null;
    }
    // call expression: resolve callee function's return type annotation. async-generator
    // `yield* await inner()` parses the delegate as AwaitExpression wrapping the call -
    // peel one level so the call's return-type signature reaches the dispatch (Awaited<>
    // on a Generator return is the same Generator shape, so unwrap is sound here)
    let resolved = resolveRuntimeExpression(exprPath);
    if (t.isAwaitExpression(resolved.node)) resolved = resolveRuntimeExpression(resolved.get('argument'));
    if (t.isCallExpression(resolved.node) || t.isNewExpression(resolved.node)) {
      const callee = resolveRuntimeExpression(resolved.get('callee'));
      if (t.isFunction(callee.node) && callee.node.returnType) {
        const params = generatorTypeParams(unwrapTypeAnnotation(callee.node.returnType), callee.scope);
        if (params?.[paramIndex]) return resolveTypeAnnotation(params[paramIndex], callee.scope);
      }
    }
    return null;
  }

  // --- Class / object member resolvers ---
  // `binding-analysis` cluster: closure / mutation tracking. instantiated early because
  // its `isReflectConstructCallee` feeds `class-context`'s service. service deps are
  // factory function decls (hoisted) + a known-static registry
  const bindingAnalysisCluster = createBindingAnalysis({
    t,
    memoize,
    findProgramPath,
    getDeclaratorBindingName,
    staticPairFromPolyfillEntry,
    lookupNested,
    KNOWN_STATIC_METHOD_RETURN_TYPES,
  });
  const {
    buildProgramIndex,
    classBindingName,
    isClassExported,
    isReceiverNewOfClass,
    objectBindingName,
    isReflectConstructCallee,
    classBindingRefClassifier,
    computeAliasClosureFromBinding,
  } = bindingAnalysisCluster;

  // `resolveThisAnchor` / `resolveThisClass` / `resolveThisObject` / `resolveSuperClassPath`
  // / `resolveClassContext` / `buildParentClassSubstFromNodes` / `buildParentClassSubst`
  // live in `resolve-node-type/class-context.js`. service captures `isReflectConstructCallee`
  // from `binding-analysis` (destructured just above) and the late-bound `type-subst`
  // `applyAliasSubstDeep` via thunk
  const classContextCluster = createClassContext({
    t,
    resolveRuntimeExpression,
    isReflectConstructCallee,
    buildSubstMap,
    findAmbientDeclarationPath,
    findDeclPathBySegments,
    isClassLikeDeclaration,
    applyAliasSubstDeep,
  });
  const {
    resolveThisClass,
    resolveThisObject,
    resolveSuperClassPath,
    resolveClassContext,
    buildParentClassSubstFromNodes,
    buildParentClassSubst,
  } = classContextCluster;

  // oxc-wrapped paths don't implement `findParent`; walk the chain directly so unplugin
  // and babel share this helper
  function findProgramPath(path) {
    let current = path;
    while (current && !t.isProgram(current.node)) current = current.parentPath;
    return current;
  }

  // generic memoize over a `WeakMap` cache. uses `has` to distinguish "not yet computed"
  // from "computed as null/undefined" - some caches store null sentinels (closures bailed
  // on leak, descendants bailed on anonymous, etc.). centralizes the get/has/set boilerplate
  function memoize(cache, key, compute) {
    if (cache.has(key)) return cache.get(key);
    const value = compute();
    cache.set(key, value);
    return value;
  }

  // declarator-init binding name extractor: `const X = <init>` / `let X = <init>` / etc.
  // returns `X` only when init === path.node and id is a plain Identifier. shared between
  // class-expression `const C = class{}` form and object-literal `const o = {...}` form.
  // destructured ids (`const {a} = ...`) bail to null - no stable single name to enumerate
  function getDeclaratorBindingName(path) {
    const parent = path.parentPath?.node;
    if (parent?.type === 'VariableDeclarator' && parent.init === path.node && t.isIdentifier(parent.id)) {
      return parent.id.name;
    }
    return null;
  }

  // `binding-analysis` public surface (instantiated above class-context): `classBindingName` /
  // `isClassExported` / `isNewOfClass` / `isReceiverNewOfClass` / `objectBindingName` /
  // `isReflectConstructCallee` / `classBindingRefClassifier` / `computeAliasClosureFromBinding`.
  // additional cluster-internal helpers (export classification, static-call recognition,
  // mutation classification) stay private to the cluster

  // closure-analysis cluster: module-wide closure builders + temporal-flow + module-field
  // index. instantiated before `class-fields` because the field-flow scan consumes its
  // outputs. service deps from `binding-analysis` are already destructured; the rest are
  // factory function decls (hoisted) or pure imports
  const closureAnalysisCluster = createClosureAnalysis({
    t,
    babelBindingAdapter,
    memoize,
    getKeyName,
    objectBindingName,
    computeAliasClosureFromBinding,
    classBindingName,
    classBindingRefClassifier,
    buildProgramIndex,
    resolveNodeType,
  });
  const {
    computeObjectAliasClosure,
    isReceiverInClosure,
    getClosureTemporalBound,
    getClassInstanceTemporalBound,
    getClassInstanceClosure,
    getClassBindingClosure,
    collectClassDescendantPaths,
    pushIfWriteMatches,
    getModuleFieldIndex,
  } = closureAnalysisCluster;
  ({ extendsClauseName } = closureAnalysisCluster);

  // class / object field-flow type inference lives in `resolve-node-type/class-fields.js`.
  // public outputs: `resolveClassFieldType`, `resolveObjectFieldFlow`. `resolveNodeType`
  // thunk via late binding (the cluster recurses into the resolver entry for init /
  // write-RHS types). all other deps are factory function decls (hoisted) or upstream
  // cluster outputs (closure-analysis just above)
  const classFieldsCluster = createClassFields({
    t,
    getKeyName,
    memoize,
    findProgramPath,
    methodFnPath: (...args) => methodFnPath(...args),
    findObjectMember: (...args) => findObjectMember(...args),
    resolveObjectMember: (...args) => resolveObjectMember(...args),
    resolveNodeType,
    getModuleFieldIndex,
    pushIfWriteMatches,
    classBindingName,
    isClassExported,
    isReceiverNewOfClass,
    collectClassDescendantPaths,
    getClassBindingClosure,
    getClassInstanceClosure,
    getClassInstanceTemporalBound,
    getClosureTemporalBound,
    isReceiverInClosure,
    computeObjectAliasClosure,
    isNullableOrNever,
    commonType,
  });
  const {
    resolveClassFieldType,
    resolveObjectFieldFlow,
  } = classFieldsCluster;

  // class-object-member cluster: class body + merged-interface + object literal member
  // resolution. instantiated after classFields (consumes its `resolveClassFieldType` output);
  // forward-decl `let`s above let returnType / awaited / classFields service objects route
  // these through thunks
  const classObjectMemberCluster = createClassObjectMember({
    t,
    keyMatchesName,
    buildSubstMap,
    unwrapTypeAnnotation,
    typesEqual,
    collectReturnPaths,
    resolveRuntimeExpression,
    resolveNodeType,
    resolveReturnType,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    applySubst,
    applyAliasSubstDeep,
    resolveSuperClassPath,
    buildParentClassSubst,
    resolveClassFieldType,
    getTypeMembers: (...args) => getTypeMembers(...args),
    findNamespacedFunctionPath,
  });
  ({
    classSubstInner,
    methodFnPath,
    isMethodMember,
    findClassMember,
    findObjectMember,
    resolveObjectMember,
  } = classObjectMemberCluster);
  const {
    resolveClassMember,
    applySubstToTypeRefArgs,
  } = classObjectMemberCluster;

  // serialize `x`, `this.data`, `obj.a.b` - null for computed / shapes we don't probe
  function pathKey(node) {
    if (node?.type === 'Identifier') return node.name;
    if (node?.type === 'ThisExpression') return 'this';
    const propName = getMemberProperty(node);
    if (propName !== null) {
      const parent = pathKey(node.object);
      return parent === null ? null : `${ parent }.${ propName }`;
    }
    return null;
  }

  // strip outer parens + leading `!` so `if (!(x === 'a'))` narrows identically to `x !== 'a'`.
  // returns the peeled test plus a flag the caller XOR-s into its own polarity tracker.
  // peels ALL consecutive `!` operators (parity-tracked) so `!!X` -> X with negated=false,
  // `!!!X` -> X with negated=true. without this, double-bang coercion `!!(typeof x === 'a')`
  // (idiom for explicit boolean cast) leaves a leftover UnaryExpression that the binary /
  // call branches below don't pattern-match against
  function peelNegation(test) {
    // unwrapRuntimeExpr strips parens + ChainExpression + TS wrappers (`as` / `satisfies` / `!`)
    // so `((x as any) instanceof Array)` and `Array.isArray?.(x)` (ESTree wraps optional calls
    // in ChainExpression) reach the same `BinaryExpression` / `CallExpression` shape that the
    // typeof / instanceof / known-static branches below pattern-match against
    let negated = false;
    test = unwrapRuntimeExpr(test);
    while (test?.type === 'UnaryExpression' && test.operator === '!') {
      negated = !negated;
      test = unwrapRuntimeExpr(test.argument);
    }
    return { test, negated };
  }

  // discriminated-union narrowing lives in `resolve-node-type/discriminant-narrow.js`.
  // consolidates the guards collector (`findDiscriminantGuards`) and the narrowing entry
  // points (`narrowDiscriminatedUnion` / `narrowUnionByAssignmentLiteral` /
  // `findPrecedingBlockAssignment`) - the narrowing path calls the collector internally so
  // they share one closure. `flattenCondition` / `resolveExitCondition` /
  // `getStatementSiblings` come from `typeofGuardsCluster` (instantiated below) via thunks
  // because typeofGuards depends on `createPredicateGuards` which lands after this point;
  // the thunks resolve at AST-walk time after factory init completes
  const {
    findPrecedingBlockAssignment,
    narrowUnionByAssignmentLiteral,
    narrowDiscriminatedUnion,
  } = createDiscriminantNarrow({
    t,
    peelNegation,
    pathKey,
    getMemberProperty,
    flattenCondition: (...args) => typeofGuardsCluster.flattenCondition(...args),
    resolveComputedKeyName,
    getStatementSiblings: (...args) => typeofGuardsCluster.getStatementSiblings(...args),
    resolveExitCondition: (...args) => typeofGuardsCluster.resolveExitCondition(...args),
    literalKeyValue,
    findPatternKeyPath,
    getKeyName,
    unwrapTypeAnnotation,
    canFallThrough,
    getTypeMembers: (...args) => getTypeMembers(...args),
    findTypeMember: (...args) => findTypeMember(...args),
    followTypeAliasChain,
    applySubst,
  });

  // post-rewrite alias `const from = _Array$from`: injector exposes the canonical entry
  // path (`array/from`) - leading segment maps to the constructor name via the same
  // resolver injector itself uses (`entryToGlobalHint`), trailing segment is the method.
  // entry paths are kebab-case (`reflect/set-prototype-of`, `array/from-async`); table
  // keys are camelCase (`Reflect.setPrototypeOf`, `Array.fromAsync`) - convert via
  // `kebabToCamel`. single-segment names (`from`, `assign`) pass through unchanged.
  // kept in factory (not in call-return cluster) because binding-analysis cluster
  // instantiated upstream consumes it as a service dep
  function staticPairFromPolyfillEntry(scope, name) {
    const entry = getPolyfillBindingEntry(scope, name);
    if (!entry) return null;
    const segments = entry.split('/');
    if (segments.length < 2) return null;
    const constructor = entryToGlobalHint(segments[0]);
    if (!constructor) return null;
    // gate on KNOWN_STATIC_METHOD_RETURN_TYPES the same as `staticPairFromDestructure`
    // does - asymmetric acceptance otherwise resurfaces stale entries for unknown
    // constructors (`reflect/xxx` shimmed but not tracked structurally) and downstream
    // call-return inference reads garbage
    if (!hasOwn(KNOWN_STATIC_METHOD_RETURN_TYPES, constructor)) return null;
    return { constructor, method: kebabToCamel(segments.at(-1)) };
  }

  // `resolveCallReturnType` + `resolveCallReturnTypeFromAnnotation` +
  // `functionTypeReturnAnnotation` + `staticPairFromDestructure` live in
  // `resolve-node-type/call-resolution.js`

  // --- Destructuring resolver ---
  // `resolveElementType` / `extractElementAnnotation` (+ shared `resolveUserTypeElement`
  // alias / interface-extends walker) live in `resolve-node-type/element-types.js`
  const elementTypesCluster = createElementTypes({
    babelNodeType,
    unwrapTypeAnnotation,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    tupleElements,
    resolveTupleInner,
    commonType,
    isNullableOrNever,
    findTypeDeclaration,
    applyAliasSubstDeep,
    buildSubstMap,
  });
  ({ extractElementAnnotation } = elementTypesCluster);
  const { resolveElementType } = elementTypesCluster;

  // straight-line-flow cluster instantiated first so pattern-bindings can consume
  // `findLastStraightLineAssignment` for `resolveBindingType` (last assignment before usage)
  const straightLineFlowCluster = createStraightLineFlow({ t, babelNodeType });
  const { findLastStraightLineAssignment } = straightLineFlowCluster;

  // pattern-bindings cluster: destructuring + for-of binding resolution + the full
  // `resolveBindingType` entry-point. ~23 functions total. service object is heavy (~26
  // entries) but all deps are hoisted function decls or upstream cluster outputs;
  // `resolveNodeType` / `substituteTypeParams` thunked
  const patternBindingsCluster = createPatternBindings({
    t,
    babelNodeType,
    isRestBinding,
    resolveNodeType,
    resolveRuntimeExpression,
    resolveInnerType,
    commonType,
    findEnumDeclaration,
    resolveEnumMemberType,
    findTypeMember: (...args) => findTypeMember(...args),
    substituteTypeParams: (...args) => substituteTypeParams(...args),
    buildDefaultTypeParamMap,
    promiseRefInner,
    unwrapPromise,
    unwrapTypeAnnotation,
    findExpressionAnnotation: (...args) => findExpressionAnnotation(...args),
    extractElementAnnotation,
    resolveElementType,
    findTupleElement,
    resolveObjectMember,
    findObjectMember,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    resolveComputedKeyName,
    getKeyName,
    findLastStraightLineAssignment,
    withLookupPath,
  });
  const {
    findArrayPatternKeyPath,
    findDestructuredKeyPath,
    findForLoopParent,
    resolveArrayLiteralElement,
    resolveArrayLiteralCommonType,
    findBindingAnnotation,
    resolveAnnotatedMember,
    resolveAnnotatedMemberPath,
    resolveForOfResolvedElement,
    resolveObjectMemberPath,
    resolveDestructuredMember,
    collectPatternKeyPath,
    resolveBindingType,
  } = patternBindingsCluster;

  // type-query <-> call-return form a small dep cycle (typeQuery's `resolveReturnTypeFromTypeQuery`
  // uses `functionTypeReturnAnnotation`; call-return's `resolveCallReturnTypeFromAnnotation`
  // uses `resolveReturnTypeFromTypeQuery`). break it by instantiating typeQuery first with a
  // thunk for functionTypeReturnAnnotation, then call-return reads `resolveReturnTypeFromTypeQuery`
  // from the typeQuery destructure directly
  // eslint-disable-next-line prefer-const -- destructuring assignment below rebinds this
  let functionTypeReturnAnnotation;
  const typeQueryCluster = createTypeQuery({
    t,
    constantBindingPath,
    findEnumDeclaration,
    findDeclPathBySegments,
    resolveEnumMemberType,
    isFunctionOrClassDeclaration,
    isFunctionLike,
    findAmbientDeclarationPath,
    findNamespacedFunctionPath,
    findOverloadsForName,
    findTypeMember: (...args) => findTypeMember(...args),
    findBindingAnnotation,
    findObjectMember,
    findClassMember,
    methodFnPath,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    resolveNodeType,
    resolveRuntimeExpression,
    resolveClassMember,
    resolveObjectMemberPath,
    resolveAnnotatedMemberPath,
    resolveReturnType,
    unwrapTypeAnnotation,
    applyAliasSubstDeep,
    buildCallSiteSubst: (...args) => buildCallSiteSubst(...args),
    functionTypeReturnAnnotation: (...args) => functionTypeReturnAnnotation(...args),
  });
  ({ resolveTypeQueryBinding } = typeQueryCluster);
  const {
    resolveTypeQuery,
    resolveTypeofFromSegments,
    resolveReturnTypeFromTypeQuery,
  } = typeQueryCluster;

  // call-resolution cluster: consolidates call-return (dispatch `foo()` / `obj.method()` /
  // aliased static / typeof-binding calls to a return type) + expression-annotation (find
  // the raw TS / Flow annotation of any expression path). the two walkers cross-reference
  // each other (resolveCallReturnTypeFromAnnotation -> findExpressionAnnotation;
  // findExpressionAnnotation -> functionTypeReturnAnnotation on call-callee annotations);
  // one cluster closure resolves the cycle internally. `staticPairFromPolyfillEntry` stays
  // in the factory (binding-analysis cluster consumer) and is passed through here. assigns
  // forward-declared `functionTypeReturnAnnotation` + `buildCallSiteSubst` so typeQuery
  // (instantiated earlier) sees them via thunks
  const callResolutionCluster = createCallResolution({
    t,
    babelNodeType,
    babelBindingAdapter,
    isMemberLike,
    isFunctionLike,
    isNullableOrNever,
    resolveNodeType,
    resolveRuntimeExpression,
    resolveReturnType,
    findAmbientFunctionPath,
    resolveFromMemberExpression: (...args) => resolveFromMemberExpression(...args),
    resolveKnownStaticReturnType,
    resolveKnownInstanceMember,
    KNOWN_INSTANCE_METHOD_RETURN_TYPES,
    staticPairFromPolyfillEntry,
    typeFromHint,
    lookupNested,
    KNOWN_STATIC_METHOD_RETURN_TYPES,
    findDestructuredKeyPath,
    swapAliasToTSTypeQueryWithSubst,
    resolveReturnTypeFromTypeQuery,
    resolveTypeAnnotation: (...args) => resolveTypeAnnotation(...args),
    unwrapTypeAnnotation,
    getMemberProperty,
    followTypeAliasChain,
    applySubst,
    applyAliasSubstDeep,
    isNullableOrNeverAnnotation,
    getTypeMembers: (...args) => getTypeMembers(...args),
    keyMatchesName,
    findBindingAnnotation,
    narrowUnionByAssignmentLiteral,
    buildSubstMap,
    typeParamName,
    effectiveParam,
    resolveIndexedAccessMemberAnnotationAST,
  });
  ({ functionTypeReturnAnnotation, findExpressionAnnotation, buildCallSiteSubst } = callResolutionCluster);
  const { resolveCallReturnType, resolveIndexSignatureValue } = callResolutionCluster;

  // type-annotation-resolve cluster: ResolveTypeAnnotation + named-utility-type dispatch.
  // instantiated here because it consumes typeQuery / call-resolution / element-types
  // outputs (all just-destructured). assigns the factory's forward-declared `let`s for
  // `resolveTypeAnnotation` / `resolveConstructorType` / `resolveConstructorCallType`
  const typeAnnotationResolveCluster = createTypeAnnotationResolve({
    t,
    babelNodeType,
    isLiteralOf,
    KNOWN_CONSTRUCTORS,
    CONSTRUCTOR_ALIASES,
    PROMISE_SYNONYMS,
    STRUCTURE_PRESERVING_WRAPPERS,
    SINGLE_ELEMENT_COLLECTIONS,
    MAX_DEPTH,
    isAmbientClassNode,
    typeRefSegmentsEqual,
    typeRefName,
    findTypeParameter,
    collectQualifiedSegments,
    unwrapTypeAnnotation,
    safeInnerType,
    followTypeAliasChain,
    applySubst,
    resolveKnownConstructor,
    typeFromHint,
    resolveInnerType,
    effectiveParam,
    resolveParametersParams,
    resolveAnnotationInContext,
    resolveNonNullableAnnotation,
    resolveAwaitedAnnotation,
    resolveReturnTypeFromTypeQuery,
    functionTypeReturnAnnotation,
    resolveTypeQueryBinding,
    resolveTypeQuery,
    resolveTypeofFromSegments,
    resolveClassInheritance,
    resolveUserDefinedType,
    resolveElementType,
    foldUnionTypes,
    foldIntersectionTypes,
    findTypeMember: (...args) => findTypeMember(...args),
    findTupleElement,
    unwrapMappedTypePassthrough,
    tupleAsArrayType,
    resolveInferElementPattern,
    resolveConditionalBranches,
    getTypeMembers: (...args) => getTypeMembers(...args),
  });
  ({
    resolveTypeAnnotation,
    resolveKnownContainerType,
  } = typeAnnotationResolveCluster);
  const {
    resolveConstructorType,
    resolveConstructorCallType,
    resolveNamedType,
  } = typeAnnotationResolveCluster;

  // type-members cluster: member-resolution against any TS / Flow type-position node
  // (interface / class merging, tuple indexing, structure-preserving wrappers, conditional /
  // mapped / indexed-access / alias-chain dispatch). instantiated late so its service object
  // sees the already-bound `resolveTypeAnnotation` (let from `type-annotation-resolve`),
  // typeQuery / call-resolution / class-context outputs. `unwrapPassthroughWrapper` is
  // direct (awaited destructured early); the forward-decl thunks `findTypeMember` /
  // `getTypeMembers` populate via destructure assignment below
  const typeMembersCluster = createTypeMembers({
    unwrapTypeAnnotation,
    peelTSParenthesized,
    isNullableOrNeverAnnotation,
    isClassLikeDeclaration,
    keyMatchesName,
    getKeyName,
    literalKeyValue,
    indexedAccessKey,
    findAllTypeDeclarations,
    findTypeDeclaration,
    extendsClauseName,
    buildSubstMap,
    buildParentClassSubstFromNodes,
    substMembers,
    applySubst,
    applyAliasSubstDeep,
    applySubstToTypeRefArgs,
    findTupleElement,
    followTypeAliasChain,
    unwrapMappedTypePassthrough,
    expandMappedTypeMembers,
    isUnconstrainedTypeReference,
    pickConditionalBranchVia,
    evaluateConditionalType,
    resolveTypeQueryBinding,
    buildCallSiteSubst,
    resolveTypeAnnotation,
    functionTypeReturnAnnotation,
    unwrapPassthroughWrapper,
    collectInferredNames,
    dropMapKeys,
  });
  ({ findTypeMember, getTypeMembers } = typeMembersCluster);

  // member-resolve cluster: typed-side member walking + runtime receiver-aware dispatch.
  // consolidates the former member-resolution (annotation-based: chain walker, return
  // resolver, typed-member dispatcher) + member-dispatch (runtime side: from-member-expr,
  // array-index, enum-member). single closure removes the cluster boundary the previous
  // member-dispatch instantiation had to chase through service deps for `resolveTypedMember` /
  // `resolveIndexSignatureMember`. service captures pattern-bindings / classFields /
  // class-object-member / classContext / nameResolution / enumTypes / value-ops / typeQuery /
  // discriminant-narrow / type-subst outputs. thunks for `findExpressionAnnotation` /
  // `functionTypeReturnAnnotation` / `applyAliasSubstDeep` / `applySubst` /
  // `substituteTypeParams` / `resolveNodeType` (forward-decl let bindings)
  const memberResolveCluster = createMemberResolve({
    t,
    isLiteralOf,
    unwrapTypeAnnotation,
    getTypeMembers,
    keyMatchesName,
    findBindingAnnotation,
    findExpressionAnnotation,
    functionTypeReturnAnnotation,
    applyAliasSubstDeep,
    foldUnionTypes,
    followTypeAliasChain,
    applySubst,
    isNullableOrNeverAnnotation,
    commonType,
    narrowDiscriminatedUnion,
    swapAliasToTSTypeQueryWithSubst,
    resolveTypeQueryBinding,
    resolveObjectMember,
    resolveClassContext,
    resolveClassMember,
    resolveAnnotatedMember,
    buildDefaultTypeParamMap,
    substituteTypeParams: (...args) => substituteTypeParams(...args),
    resolveTypeAnnotation,
    findTypeMember,
    findTypeDeclaration,
    resolveIndexSignatureValue,
    resolveMemberPropertyName,
    resolveRuntimeExpression,
    resolveThisObject,
    resolveObjectFieldFlow,
    findAmbientClassPath,
    resolveArrayLiteralElement,
    findEnumDeclaration,
    resolveEnumMemberType,
    resolveEnumType,
    resolveNodeType,
  });
  ({ findClassPathForTypeReference } = memberResolveCluster);
  const {
    resolveMemberCallChain,
    resolveBindingReturnInfo,
    memberCallReturnAnnotation,
    resolveFromMemberExpression,
    resolveArrayIndexAccess,
    resolveEnumMemberAccess,
  } = memberResolveCluster;

  // pattern-bindings cluster public surface (destructured above): array-literal / for-of /
  // destructuring resolvers + `findBindingAnnotation` + `resolveBindingType` (the integrated
  // entry that ties destructuring + for-of + straight-line-flow's
  // `findLastStraightLineAssignment` lookup into one entry-point). straight-line-flow
  // cluster (`findLastStraightLineAssignment` + IIFE / var-scope walkers) lives in
  // `resolve-node-type/straight-line-flow.js`

  // --- Guard parsing & narrowing ---
  // `narrow-by-guards` cluster (`resolveGuardType` / `findGuardsForBinding` /
  // `resolveTypeGuardNarrowing` + cluster-internal mutation / classification helpers) lives
  // in `resolve-node-type/narrow-by-guards.js`. cluster instantiation appears below
  // alongside the other late clusters (the typeof-guards cluster outputs feed its service)
  //
  // guard builders (`typeofGuard` / `instanceofGuard` / `guardFromHint` /
  // `guardFromResolvedType` / `isTypeofVar`) live alongside `createPredicateGuards` in
  // `resolve-node-type/guard-shapes.js` - pure top-level exports imported directly so
  // typeof-guards and the predicate path both consume without going through factory closure

  // alias-chain walker + AST substitution machinery consolidated into `type-subst.js`,
  // instantiated near the top of the factory (alongside the typeFolding / typeExpansion
  // clusters). `functionTypeParams` reaches it through the forward-decl `let` thunk

  // Type-object substitution dispatch (`substituteTypeParams` chain) lives in
  // `resolve-node-type/type-resolve-dispatch.js`. consumes `unwrapMappedTypePassthrough`
  // / `evaluateConditionalType` from the `type-expansion` cluster; the rest are factory
  // function declarations passed through closure
  ({ substituteTypeParams } = createTypeResolveDispatch({
    typeRefSegments,
    resolveKnownConstructor,
    resolveKnownContainerType,
    resolveUserDefinedType,
    resolveNamedType,
    safeInnerType,
    tupleAsArrayType,
    foldUnionTypes,
    foldIntersectionTypes,
    resolveTypeAnnotation,
    resolveIndexedAccessSubst,
    unwrapTypeAnnotation,
    unwrapMappedTypePassthrough,
    evaluateConditionalType,
  }));

  // user-defined type-predicate cluster lives in `resolve-node-type/guard-shapes.js`;
  // wire it with the type-resolution helpers it consumes and bind the two public entries
  const { parseUserPredicateGuard, parseAssertionStatementGuard } = createPredicateGuards({
    resolveMemberCallChain,
    unwrapTypeAnnotation,
    memberCallReturnAnnotation,
    resolveBindingReturnInfo,
    findAmbientFunctionPaths,
    resolveTypeAnnotation,
  });

  // typeof / instanceof / switch / preceding-exit guard cluster lives in
  // `resolve-node-type/typeof-guards.js`. wired here so the predicate-guards entries
  // (already bound above) and the exit-analysis pure helpers thread into its service
  const typeofGuardsCluster = createTypeofGuards({
    t,
    peelNegation,
    isLiteralOf,
    getMemberProperty,
    constantBindingPath,
    lookupNested,
    parseUserPredicateGuard,
    parseAssertionStatementGuard,
    blockAlwaysExits,
    canFallThrough,
    KNOWN_STATIC_TYPE_GUARDS,
    babelBindingAdapter,
  });
  const {
    findEnclosingTypeGuards,
    siblingGuardsBinding,
    findConditionalGuards,
    findSwitchCaseGuards,
    findEarlyExitGuards,
    guardAppliesToBinding,
    getStatementSiblings,
  } = typeofGuardsCluster;

  // guard-narrowing cluster: filters union annotations / synthesises from positive guards.
  // service deps span factory function decls + typeof-guards cluster outputs + late-bound
  // `type-subst` `applyAliasSubstDeep` (thunk). instantiated after typeof-guards above
  const narrowByGuardsCluster = createNarrowByGuards({
    t,
    resolveTypeAnnotation,
    isNullableOrNever,
    commonType,
    resolveKnownConstructor,
    findBindingAnnotation,
    followTypeAliasChain,
    applyAliasSubstDeep,
    findEnclosingTypeGuards,
    guardAppliesToBinding,
    siblingGuardsBinding,
    findConditionalGuards,
    findSwitchCaseGuards,
    findEarlyExitGuards,
    getStatementSiblings,
    canFallThrough,
  });
  const {
    resolveGuardType,
    findGuardsForBinding,
    resolveTypeGuardNarrowing,
  } = narrowByGuardsCluster;

  // --- Entry / public API ---
  let resolveCache = new WeakMap();

  // expression-dispatch cluster: the big switch mapping runtime AST node kind to a resolved
  // Type object. instantiated late so all dependent cluster outputs (callResolution /
  // patternBindings / classContext / awaited / known-globals / global-resolve / value-ops)
  // are bound as direct const refs. `resolvedTypeCache` shared via factory `let` (reassigned
  // in `reset()` below)
  const { resolveNodeTypeExpression } = createExpressionDispatch({
    t,
    babelNodeType,
    KNOWN_GLOBAL_METHOD_RETURN_TYPES,
    getCachedType: node => resolvedTypeCache.get(node),
    resolvePath,
    resolveNodeType,
    resolveRuntimeExpression,
    unwrapTypeAnnotation,
    resolveGlobalName,
    resolveConstructorType,
    resolveConstructorCallType,
    resolveCallReturnType,
    typeFromHint,
    resolveArrayLiteralCommonType,
    resolveThisClass,
    resolveClassInheritance,
    resolveFromMemberExpression,
    resolveArrayIndexAccess,
    resolveEnumMemberAccess,
    resolveKnownPropertyReturnType,
    resolveGlobalStaticReference,
    resolvePrototypeAsInstance,
    resolveKnownGlobalReference,
    resolveBinaryOperatorType,
    resolveUnionType,
    resolveDesugarDefaultTernary,
    resolveNumericType,
    resolveTypeAnnotation,
    resolveAwaitExpressionType,
    generatorTypeParams,
    resolveGeneratorTypeParam,
  });
  // pre-mutation Type cache for plugin-side rewrites: babel mutates the AST in-place, so
  // when a sibling rewrite later re-resolves a node whose CallExpression callee was swapped
  // (`arr.concat(x)` -> `_concatMaybeArray(arr).call(arr, x)`), the new shape isn't recognized
  // by `resolveNodeTypeExpression`. emitters stash the resolved Type here BEFORE mutation;
  // resolveNodeTypeExpression hits this WeakMap first. WeakMap (vs node-attached property)
  // avoids polluting AST nodes - sibling plugins iterate `node` own-properties / clone via
  // `Object.assign`-style merges; an opaque side-channel won't leak into their pipelines
  let resolvedTypeCache = new WeakMap();

  // rebuild per-file to bound memory and drop retained entries from previous parses
  // (WeakMap is GC-safe, but rebuilding makes the memory footprint deterministic).
  //
  // INVARIANT: all caches below MUST be node-keyed (WeakMap, NodePath identity). cross-
  // program-state retention only matters when a Node identity is reused across parses,
  // which Babel's parser doesn't do (fresh AST per file). reset() runs at parser-level
  // entry (per-file). adding a NEW cache here means: (a) declare let-binding above, (b)
  // re-assign to fresh WeakMap in reset, (c) use ONLY node-identity / NodePath as keys -
  // never strings (file paths / type names) which can collide across parses
  function reset() {
    returnTypeCluster.reset();
    typeofGuardsCluster.reset();
    narrowByGuardsCluster.reset();
    nameResolutionCluster.reset();
    bindingAnalysisCluster.reset();
    classFieldsCluster.reset();
    closureAnalysisCluster.reset();
    straightLineFlowCluster.reset();
    callResolutionCluster.resetExpressionAnnotationCache();
    resolveCache = new WeakMap();
    resolvedTypeCache = new WeakMap();
    resetTypeSubst();
  }

  function resolveNodeType(path) {
    const { node } = path;
    if (!node) return null;
    if (resolveCache.has(node)) return resolveCache.get(node);
    // sentinel before recursion: circular references (e.g. `const a = b.x(); const b = a.x();`)
    // resolve to null (unknown type) instead of causing infinite recursion
    resolveCache.set(node, null);
    // anchor the path on the lookup-path stack for the WHOLE resolution chain - covers
    // direct annotation lookups, member-type substitution, generic-arg resolution, etc.
    // parsers (estree-toolkit) that don't expose TSModuleDeclaration as scope can then
    // fall back to walking path ancestors for namespace-local type decls regardless of
    // how deep into the resolver chain the lookup happens
    return withLookupPath(path, () => resolveNodeTypeInternal(path, node));
  }

  // explicit-annotation override of expression-derived Identifier resolution. fires only
  // when the init walk produced something AND the binding has a declared annotation:
  //   - refinesInner: same outer, init lacks inner, annotation supplies it
  //     (`const s: Set<string> = new Set()`)
  //   - overridesNullish: init resolved to `$Primitive('null'|'undefined')`, typically from
  //     `return null as any` / `return undefined as any` body inference on an `any`-returning
  //     callee. TS treats `const r: T = init` as type T regardless of init's static type;
  //     the scalar carries no info, so the annotation wins
  function preferAnnotationOverExpression(result, annotated) {
    if (!annotated) return result;
    const refinesInner = !result.inner && annotated.inner && typesEqual(result, annotated);
    const overridesNullish = annotated.constructor && result.primitive
      && (result.type === 'null' || result.type === 'undefined');
    return refinesInner || overridesNullish ? annotated : result;
  }

  function resolveNodeTypeInternal(path, node) {
    let result;
    try {
      result = resolveNodeTypeExpression(path);
      if (!result) {
        // guards win over the raw binding type: for open annotations and unannotated
        // bindings they yield the most specific type, otherwise we fall back.
        result = resolveTypeGuardNarrowing(path) || resolveBindingType(path);
      } else if (t.isIdentifier(path.node)) {
        result = preferAnnotationOverExpression(result, resolveBindingType(path));
      }
      // $Primitive('unknown') (e.g. from `+` with unresolved operands) is truthy but imprecise -
      // allow typeof / instanceof guards to refine it to a concrete type
      if (result?.type === 'unknown') {
        result = resolveTypeGuardNarrowing(path) || result;
      }
    } catch (error) {
      // drop the sentinel so a future query may retry instead of seeing a stale `null`
      resolveCache.delete(node);
      throw error;
    }
    resolveCache.set(node, result);
    return result;
  }

  // RHS of `= expr` in assignment or variable declarator
  function getPatternInit(p) {
    if (t.isAssignmentExpression(p?.node)) return p.get('right');
    if (t.isVariableDeclarator(p?.node)) return p.get('init');
    return null;
  }

  // resolve the type of the object from which a property is accessed:
  // member expression (obj.prop, obj?.prop) or destructuring ({ prop } = obj)
  function resolvePropertyObjectType(path) {
    if (isMemberLike(path)) return resolveNodeType(path.get('object'));
    if (!t.isObjectProperty(path.node)) return null;
    const objectPattern = path.parentPath;
    if (!t.isObjectPattern(objectPattern?.node)) return null;
    if (objectPattern.node.typeAnnotation) {
      return resolveTypeAnnotation(objectPattern.node.typeAnnotation, objectPattern.scope);
    }
    const parent = objectPattern.parentPath;
    // direct parent owns the init - resolve the whole RHS
    const directInit = getPatternInit(parent);
    if (directInit?.node) return resolveNodeType(directInit);
    // nested pattern: collect key path via shared walk, resolve through the init
    let ancestor = parent;
    while (ancestor && PATTERN_WRAPPERS.has(babelNodeType(ancestor.node))) ancestor = ancestor.parentPath;
    const keyPath = collectPatternKeyPath(objectPattern);
    if (keyPath?.length) {
      const initPath = getPatternInit(ancestor);
      if (initPath?.node) {
        const member = resolveObjectMemberPath(resolveRuntimeExpression(initPath), keyPath);
        if (member) return member;
      }
    }
    const forOfPath = t.isForOfStatement(ancestor?.node) ? ancestor : findForLoopParent(ancestor);
    if (t.isForOfStatement(forOfPath?.node)) return resolveForOfResolvedElement(forOfPath);
    return null;
  }

  // `toHint`, `intersectHintSets`, `primitiveTypeOf` live in `resolve-node-type/base.js`
  // (closure-independent pure helpers); imported at the top of this module

  // collect type hints to include/exclude from typeof / instanceof guards when no annotation
  // returns { includedHints: Set } for positive typeof (whitelist, future-proof)
  // or { excludedHints: Set } for negative-only guards (blacklist)
  // or null when no hints can be determined
  function resolveGuardHints(path) {
    const info = findGuardsForBinding(path);
    if (!info) return null;
    const { guards, classification } = info;
    // only unannotated or open (unknown/any/object/mixed) bindings accept hint-based narrowing.
    // 'closed' is already filtered by findGuardsForBinding
    if (classification.kind !== 'none' && classification.kind !== 'open') return null;
    // bail if any positive guard resolves to a concrete type (already handled by resolveTypeGuardNarrowing)
    if (guards.some(g => g.positive && resolveGuardType(g))) return null;

    // resolve typeof / typeof-or guard to a set of hints
    function typeofGuardHints(guard) {
      if (guard.kind === 'typeof') {
        return hasOwn(TYPEOF_HINT_GROUPS, guard.value) ? TYPEOF_HINT_GROUPS[guard.value] : null;
      }
      if (guard.kind === 'typeof-or') {
        const union = new Set();
        for (const value of guard.values) {
          if (hasOwn(TYPEOF_HINT_GROUPS, value)) {
            for (const hint of TYPEOF_HINT_GROUPS[value]) union.add(hint);
          }
        }
        return union.size ? union : null;
      }
      return null;
    }

    function addHintsToSet(target, guard) {
      const hints = typeofGuardHints(guard);
      if (hints) {
        for (const hint of hints) target.add(hint);
        return true;
      }
      const hint = toHint(resolveGuardType(guard));
      if (hint) {
        target.add(hint);
        return true;
      }
      return false;
    }

    function deleteHintsFromSet(target, guard) {
      const hints = typeofGuardHints(guard);
      if (hints) {
        for (const hint of hints) target.delete(hint);
        return;
      }
      const hint = toHint(resolveGuardType(guard));
      if (hint) target.delete(hint);
    }

    // check for positive typeof guards -> use whitelist approach
    // whitelist is future-proof: unknown future hints are excluded by default
    let included = null;
    for (const guard of guards) {
      if (!guard.positive) continue;
      const hints = typeofGuardHints(guard);
      if (hints) included = intersectHintSets(included, hints);
    }

    if (included) {
      // subtract negative guards from the whitelist
      for (const guard of guards) {
        if (!guard.positive) deleteHintsFromSet(included, guard);
      }
      return included.size ? { includedHints: included } : null;
    }

    // no positive typeof -> use blacklist approach (conservative: unknown future hints are included)
    const excluded = new Set();
    for (const guard of guards) {
      if (!guard.positive) addHintsToSet(excluded, guard);
    }
    return excluded.size ? { excludedHints: excluded } : null;
  }

  function isString(path) {
    return primitiveTypeOf(resolveNodeType(path)) === 'string';
  }

  function isObject(path) {
    return resolveNodeType(path)?.primitive === false;
  }

  // {get,set} bundle around `resolvedTypeCache` - closure indirection so per-file `reset()`
  // re-binding propagates to consumers (direct WeakMap export would leave stale refs)
  const resolvedType = {
    get: node => resolvedTypeCache.get(node),
    set: (node, type) => resolvedTypeCache.set(node, type),
  };

  return {
    isObject,
    isString,
    reset,
    resolveGuardHints,
    resolveNodeType,
    resolvePropertyObjectType,
    resolvedType,
    toHint,
  };
}

export { createResolveNodeType };
