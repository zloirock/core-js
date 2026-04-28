import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName } from './helpers/class-walk.js';
import {
  getSuperTypeArgs,
  getTypeArgs,
  peelFallbackWrappers,
  singleQuasiString,
  unwrapExportedDeclaration,
  unwrapParens,
  unwrapRuntimeExpr,
} from './helpers/ast-patterns.js';
import {
  $Object,
  $Primitive,
  MAX_DEPTH,
  PATTERN_WRAPPERS,
  PRIMITIVE_WRAPPERS,
  PRIMITIVES,
  SINGLE_ELEMENT_COLLECTIONS,
  TYPE_HINTS,
  TYPEOF_HINT_GROUPS,
  UNBOXED_PRIMITIVES,
} from './resolve-node-type-base.js';

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

const { assign, create, hasOwn } = Object;

// side-channel cycle flag: Set instances that hit a declaration-cycle during a walk.
// per-walk, keyed on the decl-set's identity so parent frames can detect cycles without
// a monkey-patched `.hadCycle` property (which would be lost on any defensive clone)
const cycleSeenSets = new WeakSet();

// get-or-init nested Map inside a WeakMap/Map container. used by two-level caches where
// outer key is an AST node / scope / matchType and inner key is a string / secondary id
function getOrInitMap(container, key) {
  let inner = container.get(key);
  if (!inner) {
    inner = new Map();
    container.set(key, inner);
  }
  return inner;
}

// snapshot the pre-call cycle state; returned predicate reports whether the flag flipped
// during the caller's work. used by interface/class `extends` walks to distinguish "no
// parent matched" (safe fallback to $Object) from "cyclic extends poisoned the result"
// (must NOT fall back - returns null so the generic polyfill plugin stays emitted)
function cycleFlipDetector(visited) {
  const preCycle = cycleSeenSets.has(visited);
  return () => !preCycle && cycleSeenSets.has(visited);
}

// eslint-disable-next-line max-statements -- factory of type inference engine
function createResolveNodeType(babelNodeType, t) {
  // --- AST walkers & predicates ---
  // get the primitive type name, unboxing wrapper objects: $Object('String') -> 'string', $Primitive('number') -> 'number'
  function primitiveTypeOf(type) {
    return type?.primitive ? type.type : UNBOXED_PRIMITIVES[type?.constructor] ?? null;
  }

  function literalKeyValue(node) {
    if (babelNodeType(node) === 'StringLiteral') return node.value;
    if (babelNodeType(node) === 'NumericLiteral') return String(node.value);
    return null;
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

  // ObjectExpression { key: value, ... } -> value's type for the literal key.
  // Spread bails (unknown key coverage); method shorthand resolves to Function
  function resolveObjectLiteralProperty(argPath, key) {
    // `T[N]` where T is bound to a concrete tuple/array LITERAL at the call-site:
    // `first<T extends [unknown, unknown]>(t: T): T[0]` called with `[['x'], 1]` as arg -
    // element 0 is a known ArrayExpression, resolve it to that type. without this branch
    // the generic substitution path falls back to T's constraint (`[unknown, unknown]`)
    // and element 0 resolves to `unknown`
    if (argPath?.node?.type === 'ArrayExpression') {
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const elements = argPath.get('elements');
      const elementPath = elements[index];
      if (!elementPath?.node || elementPath.node.type === 'SpreadElement') return null;
      return resolveNodeType(elementPath);
    }
    if (argPath?.node?.type !== 'ObjectExpression') return null;
    for (const prop of argPath.get('properties')) {
      const { node } = prop;
      if (node.type === 'SpreadElement') return null;
      if (node.computed || getKeyName(node.key) !== key) continue;
      // babel-only `ObjectMethod` shorthand: `{ foo() {...} }`. oxc emits `Property { value: FunctionExpression }`
      // and falls through to `resolveNodeType(prop.get('value'))` which returns Function via FunctionExpression
      if (babelNodeType(node) === 'ObjectMethod') return new $Object('Function');
      return resolveNodeType(prop.get('value'));
    }
    return null;
  }

  // [key] where key is a string/number literal, a const binding (chain) to one, or an
  // enum member access (`obj[Enum.A]` - enum members carry static literals at known slots)
  function resolveComputedKeyName(key, scope, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    const literal = literalKeyValue(key);
    if (literal !== null) return literal;
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
    if (key?.type === 'MemberExpression' && !key.computed
      && key.object?.type === 'Identifier' && key.property?.type === 'Identifier') {
      const enumDecl = findTypeDeclaration(key.object.name, scope);
      if (enumDecl?.type === 'TSEnumDeclaration') {
        const member = findEnumMember(enumDecl, key.property.name);
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

  // ambient TS / Flow declarations alongside runtime functions/classes - they all carry
  // `returnType` / `typeParameters`, so the same code paths work for both
  // splitting into sets keeps the predicates terse and lets us reuse the membership checks
  const AMBIENT_FUNCTION_TYPES = new Set([
    'TSDeclareFunction',
    'TSDeclareMethod',
    'DeclareFunction',
    'DeclareMethod',
  ]);

  const AMBIENT_FN_OR_CLASS_DECLARATION_TYPES = new Set([
    'TSDeclareFunction',
    'DeclareFunction',
    'DeclareClass',
  ]);

  function isFunctionLike(node) {
    return !!node && (t.isFunction(node) || AMBIENT_FUNCTION_TYPES.has(node.type));
  }

  function isFunctionOrClassDeclaration(node) {
    return !!node && (t.isFunctionDeclaration(node) || t.isClassDeclaration(node)
      || AMBIENT_FN_OR_CLASS_DECLARATION_TYPES.has(node.type));
  }

  function walkAmbientDeclarationPath(name, scope, matchType) {
    for (let cur = scope; cur; cur = cur.parent) {
      const bodyPaths = cur.path?.get('body');
      if (!Array.isArray(bodyPaths)) continue;
      for (const stmtPath of bodyPaths) {
        const { type } = stmtPath.node ?? {};
        const declPath = type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration'
          ? stmtPath.get('declaration') : stmtPath;
        const { node } = declPath;
        if (node?.id?.name === name && matchType(node)) return declPath;
      }
    }
    return null;
  }

  // Babel doesn't register ambient `declare function/class` in `scope.bindings`; scan
  // enclosing statement lists instead. `matchType` picks the ambient kind we want.
  // keyed by (scope, matchType, name) - matchType references are module-level constants,
  // safe Map keys; inner Map uses string name
  let ambientDeclCache = new WeakMap();
  function findAmbientDeclarationPath(name, scope, matchType) {
    if (!scope) return null;
    const byName = getOrInitMap(getOrInitMap(ambientDeclCache, scope), matchType);
    if (byName.has(name)) return byName.get(name);
    const result = walkAmbientDeclarationPath(name, scope, matchType);
    byName.set(name, result);
    return result;
  }

  // TS `declare class X` is parsed as ClassDeclaration { declare: true }, not DeclareClass
  const isAmbientFunctionNode = node => node?.type === 'TSDeclareFunction' || node?.type === 'DeclareFunction';
  const isAmbientClassNode = node => node?.type === 'DeclareClass'
    || (node?.type === 'ClassDeclaration' && node.declare === true);
  const isAmbientFunctionOrClassNode = node => isAmbientFunctionNode(node) || isAmbientClassNode(node);
  const findAmbientFunctionPath = (name, scope) => findAmbientDeclarationPath(name, scope, isAmbientFunctionNode);

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

  // `function fn(x = 'a')` - default wraps param in AssignmentPattern; type is on `.left`.
  // `function fn(...xs: T[])` - RestElement carries `T[]` annotation; caller must unwrap one level
  function effectiveParam(param) {
    if (!param) return { param: null, isRest: false };
    if (param.type === 'AssignmentPattern') return { param: param.left, isRest: false };
    if (param.type === 'RestElement') return { param, isRest: true };
    return { param, isRest: false };
  }

  // detect the trivial passthrough mapped type `{ [K in keyof T]: T[K] }` and return T.
  // `readonly` / `optional` / `-readonly` / `-?` modifiers don't change the member set, only
  // descriptor flags, so we let them through; `nameType` (key remap via `as`) does rename and blocks
  function unwrapMappedTypePassthrough(node) {
    if (!node || node.type !== 'TSMappedType') return null;
    if (node.nameType || !node.typeAnnotation) return null;
    // Babel nests `typeParameter: TSTypeParameter { name, constraint }`;
    // oxc/TS-ESTree flattens to `key: Identifier` + `constraint` on the mapped type itself
    const constraint = node.typeParameter?.constraint ?? node.constraint;
    const keyNameNode = node.typeParameter?.name ?? node.key;
    if (constraint?.type !== 'TSTypeOperator' || constraint.operator !== 'keyof') return null;
    // key name is a bare string in babel-parser ASTs and an Identifier in oxc/ESTree
    const paramName = typeof keyNameNode === 'string' ? keyNameNode : keyNameNode?.name;
    if (!paramName) return null;
    const body = node.typeAnnotation;
    if (body.type !== 'TSIndexedAccessType') return null;
    const indexParam = body.indexType;
    if (indexParam?.type !== 'TSTypeReference' || indexParam.typeName?.type !== 'Identifier'
      || indexParam.typeName.name !== paramName) return null;
    return body.objectType ?? null;
  }

  // decompose a type reference into its dotted segments. `Foo` -> ['Foo'],
  // `NS.Data` -> ['NS', 'Data'], `A.B.T` -> ['A', 'B', 'T']. Returns null when the
  // reference uses a non-identifier head (e.g. an `import("...").Type` form)
  function typeRefSegments(node) {
    if (!node) return null;
    const head = node.type === 'TSTypeReference' ? node.typeName
      : node.type === 'GenericTypeAnnotation' ? node.id : null;
    return collectQualifiedSegments(head);
  }

  // walk a possibly-qualified name node into a [first, ..., last] segment list
  // returns null on any non-identifier link in the chain
  function collectQualifiedSegments(node) {
    if (node?.type === 'Identifier') return [node.name];
    if (node?.type !== 'TSQualifiedName' && node?.type !== 'QualifiedTypeIdentifier') return null;
    const left = collectQualifiedSegments(node.left ?? node.qualification);
    const right = node.right ?? node.id;
    if (!left || right?.type !== 'Identifier') return null;
    left.push(right.name);
    return left;
  }

  function typeRefName(node) {
    const segments = typeRefSegments(node);
    return segments?.length === 1 ? segments[0] : null;
  }

  function isTypeAlias(decl) {
    return decl?.type === 'TSTypeAliasDeclaration' || decl?.type === 'TypeAlias' || decl?.type === 'OpaqueType';
  }

  function isInterfaceDeclaration(decl) {
    return decl?.type === 'TSInterfaceDeclaration' || decl?.type === 'InterfaceDeclaration';
  }

  function typeAliasBody(decl) {
    if (decl.type === 'TSTypeAliasDeclaration') return decl.typeAnnotation;
    if (decl.type === 'OpaqueType') return decl.impltype;
    return decl.right;
  }

  // TS extends: TSExpressionWithTypeArguments has .expression; Flow extends: InterfaceExtends has .id
  function extendsId(parent) {
    return parent.expression ?? parent.id ?? parent;
  }

  // --- Alias chain & substitution ---
  // follow type alias chain: type A = type B = ... until non-alias or non-reference found
  // returns { node, subst } where subst is a Map<string, ASTNode> of accumulated type parameter
  // substitutions through the chain, or null if no generic aliases were traversed
  function followTypeAliasChain(node, scope) {
    let depth = MAX_DEPTH;
    let subst = null;
    // bail on cycle (`type A = B; type B = A;`) before depth exhausts and subst balloons
    const visited = new Set();
    node = unwrapTypeAnnotation(node);
    while (depth-- && (node?.type === 'TSTypeReference' || node?.type === 'GenericTypeAnnotation')) {
      const refName = typeRefName(node);
      if (!refName) break;
      const decl = findTypeDeclaration(refName, scope);
      if (!isTypeAlias(decl)) break;
      if (visited.has(decl)) break;
      visited.add(decl);
      // accumulate type parameter substitutions for generic aliases
      const declParams = decl.typeParameters?.params;
      const usageArgs = getTypeArgs(node)?.params;
      if (declParams?.length) {
        const newSubst = new Map(subst);
        for (let i = 0; i < declParams.length; i++) {
          let arg = usageArgs?.[i] ?? declParams[i].default;
          if (!arg) continue;
          // resolve through existing substitutions for chained generic aliases:
          // type A<T> = B<T>; type B<U> = [U, U]; -> A<string> needs U -> T -> string
          if (subst) {
            const argName = typeRefName(arg);
            if (argName && subst.has(argName)) arg = subst.get(argName);
          }
          newSubst.set(typeParamName(declParams[i]), arg);
        }
        subst = newSubst;
      }
      node = unwrapTypeAnnotation(typeAliasBody(decl));
    }
    // unwrap a final-step trivial mapped passthrough so `Copy<T> = { [K in keyof T]: T[K] }`
    // resolves through to T (substituted) instead of stopping at the mapped type
    if (node?.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(node);
      if (passthrough) node = unwrapTypeAnnotation(subst ? applyAliasSubstDeep(passthrough, subst) : passthrough);
    }
    return { node, subst };
  }

  // substitute type-param references through `followTypeAliasChain`'s subst map.
  // recurses into refs/args/arrays/tuples/unions so interface-extends args reach
  // inherited members after getTypeMembers flattens them
  function substSlot(node, slot, subst, depth) {
    const next = applyAliasSubstDeep(node[slot], subst, depth + 1);
    return next === node[slot] ? node : { ...node, [slot]: next };
  }
  function substList(node, slot, subst, depth) {
    const list = node[slot];
    if (!list?.length) return node;
    const next = list.map(el => applyAliasSubstDeep(el, subst, depth + 1));
    return next.every((el, i) => el === list[i]) ? node : { ...node, [slot]: next };
  }
  // rebuild a reference-shape node with substituted typeArguments. `base` is the spread base;
  // when `base === node` (no substitute swap happened), preserves identity if all args
  // resolve to themselves so caller sees `===` against the input
  function withSubstitutedTypeArgs(node, base, subst, depth) {
    const args = getTypeArgs(node);
    if (!args?.params?.length) return base;
    const next = args.params.map(p => applyAliasSubstDeep(p, subst, depth + 1));
    if (base === node && next.every((p, i) => p === args.params[i])) return node;
    const argsKey = node.typeParameters ? 'typeParameters' : 'typeArguments';
    return { ...base, [argsKey]: { ...args, params: next } };
  }
  function applyAliasSubstDeep(node, subst, depth = 0) {
    if (depth > MAX_DEPTH || !subst || !node || typeof node !== 'object') return node;
    switch (node.type) {
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        // chained generic aliases can stash a compound arg under a param key - e.g.
        // `type A<T> = B<T[]>; type B<U> = U[]` leaves subst {T: string, U: T[]}, and
        // naive `subst.get(U)` leaks T. re-run the replacement through the same subst
        // to finish resolving references inside the compound AST
        if (name && subst.has(name)) {
          const replaced = applyAliasSubstDeep(subst.get(name), subst, depth + 1);
          // higher-kinded `Wrap<F, U> = F<U>` with F->Box: travel ownArgs onto the replacement
          // when it's a parameterisable shape without its own args. otherwise (primitive
          // keyword, array, already-parameterised) ownArgs stay dropped - attaching would
          // corrupt the shape
          if (replaced?.type !== 'TSTypeReference' && replaced?.type !== 'GenericTypeAnnotation') return replaced;
          if (getTypeArgs(replaced)?.params?.length) return replaced;
          return withSubstitutedTypeArgs(node, replaced, subst, depth);
        }
        return withSubstitutedTypeArgs(node, node, subst, depth);
      }
      case 'TSTypeAnnotation':
      case 'TypeAnnotation':
      case 'TSParenthesizedType':
      case 'TSOptionalType':
      case 'NullableTypeAnnotation': return substSlot(node, 'typeAnnotation', subst, depth);
      case 'TSArrayType':
      case 'ArrayTypeAnnotation': return substSlot(node, 'elementType', subst, depth);
      case 'TSTupleType': return substList(node, 'elementTypes', subst, depth);
      case 'TupleTypeAnnotation':
      case 'TSUnionType':
      case 'UnionTypeAnnotation':
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation': return substList(node, 'types', subst, depth);
      case 'TSTypeLiteral': {
        let changed = false;
        const members = node.members?.map(m => {
          const ta = m.typeAnnotation ? applyAliasSubstDeep(m.typeAnnotation, subst, depth + 1) : m.typeAnnotation;
          const rt = m.returnType ? applyAliasSubstDeep(m.returnType, subst, depth + 1) : m.returnType;
          if (ta === m.typeAnnotation && rt === m.returnType) return m;
          changed = true;
          return { ...m, typeAnnotation: ta, returnType: rt };
        });
        return changed ? { ...node, members } : node;
      }
      case 'TSConditionalType': {
        const ck = applyAliasSubstDeep(node.checkType, subst, depth + 1);
        const ex = applyAliasSubstDeep(node.extendsType, subst, depth + 1);
        const tr = applyAliasSubstDeep(node.trueType, subst, depth + 1);
        const fl = applyAliasSubstDeep(node.falseType, subst, depth + 1);
        return ck === node.checkType && ex === node.extendsType && tr === node.trueType && fl === node.falseType
          ? node : { ...node, checkType: ck, extendsType: ex, trueType: tr, falseType: fl };
      }
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation': {
        const returnSlot = node.returnType ? 'returnType' : 'typeAnnotation';
        const rt = node[returnSlot] ? applyAliasSubstDeep(node[returnSlot], subst, depth + 1) : node[returnSlot];
        // subst params too: `type F<T> = (x: T) => void; F<number[]>.params[0].type` needs
        // T -> number[]. rare (params type inference doesn't drive polyfill dispatch for most
        // callsites), but preserves invariant that subst walks the full type shape
        const params = node.params?.map(p => {
          const pTA = p.typeAnnotation ? applyAliasSubstDeep(p.typeAnnotation, subst, depth + 1) : p.typeAnnotation;
          return pTA === p.typeAnnotation ? p : { ...p, typeAnnotation: pTA };
        });
        const paramsChanged = params && params.some((p, i) => p !== node.params[i]);
        if (rt === node[returnSlot] && !paramsChanged) return node;
        return { ...node, [returnSlot]: rt, ...paramsChanged && { params } };
      }
      case 'TSIndexedAccessType': {
        const obj = applyAliasSubstDeep(node.objectType, subst, depth + 1);
        const idx = applyAliasSubstDeep(node.indexType, subst, depth + 1);
        return obj === node.objectType && idx === node.indexType
          ? node : { ...node, objectType: obj, indexType: idx };
      }
      case 'TSTypeOperator':
        return substSlot(node, 'typeAnnotation', subst, depth);
      // mapped type: `{ [K in T]: T[K] }` - substitute `typeParameter.constraint`, `typeAnnotation`,
      // and `nameType` (TS `as` remapping). without this, `type Box<T> = { [K in keyof T]: T[K] }`
      // passed `Box<{a: string[]}>` wouldn't substitute T in the mapped body
      case 'TSMappedType': {
        const tp = node.typeParameter;
        const tpConstraint = tp?.constraint ? applyAliasSubstDeep(tp.constraint, subst, depth + 1) : tp?.constraint;
        const ann = node.typeAnnotation ? applyAliasSubstDeep(node.typeAnnotation, subst, depth + 1) : node.typeAnnotation;
        const nameType = node.nameType ? applyAliasSubstDeep(node.nameType, subst, depth + 1) : node.nameType;
        if (tpConstraint === tp?.constraint && ann === node.typeAnnotation && nameType === node.nameType) return node;
        return { ...node, typeParameter: tp ? { ...tp, constraint: tpConstraint } : tp, typeAnnotation: ann, nameType };
      }
      // rest type inside tuples: `[...T[]]` / `[first, ...Rest]` - substitute inner
      case 'TSRestType': return substSlot(node, 'typeAnnotation', subst, depth);
      // named tuple member: `[x: string, ...rest: number[]]` - inner elementType
      case 'TSNamedTupleMember': return substSlot(node, 'elementType', subst, depth);
      // `typeof X` - substitute if X maps through the alias (rare but keeps invariant)
      case 'TSTypeQuery':
        return node.exprName?.type === 'Identifier' && subst.has(node.exprName.name)
          ? subst.get(node.exprName.name) : node;
      default: return node;
    }
  }

  // --- Scope lookup & declarations ---
  function constantBindingPath(name, scope) {
    if (!scope) return null;
    const binding = scope.getBinding(name);
    return binding?.constant ? binding.path : null;
  }

  // resolve `typeof variable` to a type - shared by TS TSTypeQuery and Flow TypeofTypeAnnotation
  function resolveTypeofBinding(name, scope) {
    // `typeof Enum` (alone in annotation) - enum's runtime value is the enum object itself.
    // TSEnumDeclaration has no typeAnnotation slot so the bindingPath walk below returns null;
    // treat it as $Object('Object') so downstream member inference uses the enum as a receiver
    const typeDecl = findTypeDeclaration(name, scope);
    if (typeDecl?.type === 'TSEnumDeclaration') return new $Object('Object');
    const bindingPath = constantBindingPath(name, scope);
    if (!bindingPath) return null;
    if (t.isVariableDeclarator(bindingPath.node)) {
      const annotation = bindingPath.node.id?.typeAnnotation;
      if (annotation) return resolveTypeAnnotation(annotation, scope);
      const init = bindingPath.get('init');
      if (init.node) return resolveNodeType(init);
    } else {
      const annotation = findBindingAnnotation(bindingPath);
      if (annotation) return resolveTypeAnnotation(annotation, scope);
    }
    if (isFunctionOrClassDeclaration(bindingPath.node)) return new $Object('Function');
    return null;
  }

  // `typeof obj.prop[.prop...]` - resolve a qualified member chain from a binding. 1-level
  // short-circuits to the binding's runtime value (ObjectExpression / class) when available;
  // deeper chains always walk through the type annotation
  function resolveTypeofQualifiedMember(objectName, memberPath, scope) {
    // `typeof Enum.Member` - TSEnumDeclaration has no typeAnnotation and its bindingPath
    // fallthrough returns null. look it up via findTypeDeclaration and map the member to
    // the enum's value kind ($Primitive('string'|'number'))
    if (memberPath.length === 1) {
      const typeDecl = findTypeDeclaration(objectName, scope);
      if (typeDecl?.type === 'TSEnumDeclaration') {
        const type = resolveEnumMemberType(typeDecl, memberPath[0]);
        if (type) return type;
      }
    }
    const bindingPath = constantBindingPath(objectName, scope);
    if (!bindingPath || !memberPath.length) return null;
    if (memberPath.length === 1) {
      const [memberName] = memberPath;
      if (t.isVariableDeclarator(bindingPath.node)) {
        const init = bindingPath.get('init');
        if (init.node) {
          const resolved = resolveRuntimeExpression(init);
          if (t.isObjectExpression(resolved.node)) {
            const result = resolveObjectMember(resolved, memberName);
            if (result) return result;
          }
          if (t.isClass(resolved.node)) return resolveClassMember(resolved, memberName, true);
        }
      }
      if (t.isClassDeclaration(bindingPath.node)) return resolveClassMember(bindingPath, memberName, true);
    }
    const annotation = findBindingAnnotation(bindingPath);
    return annotation ? resolveAnnotatedMemberPath(annotation, memberPath, scope) : null;
  }

  // shared dispatch for `typeof X` and `typeof X.Y[.Z...]` - segments is what
  // collectQualifiedSegments returns for TS `TSQualifiedName` or Flow `QualifiedTypeIdentifier`
  function resolveTypeofFromSegments(segments, scope) {
    if (!segments?.length) return null;
    const [rootName, ...chain] = segments;
    return chain.length ? resolveTypeofQualifiedMember(rootName, chain, scope) : resolveTypeofBinding(rootName, scope);
  }

  function resolveTypeQuery(node, scope) {
    return resolveTypeofFromSegments(collectQualifiedSegments(node.exprName), scope);
  }

  // computed enum initializers: TS evaluates `1 + 2` / `'a' + 'b'` at compile time;
  // we can't but operand-shape inference covers the common cases. TemplateLiteral always
  // yields string; BinaryExpression preserves the kind if both operands match.
  // ESTree preserves ParenthesizedExpression wrappers (babel strips them); unwrap so
  // `enum E { A = (1 + 2) }` resolves through BinaryExpression's operand-shape check
  function resolveEnumMemberKind(initializer) {
    let init = initializer;
    while (init?.type === 'ParenthesizedExpression') init = init.expression;
    if (!init) return 'number'; // implicit numeric
    const nodeType = babelNodeType(init);
    if (nodeType === 'StringLiteral') return 'string';
    // numeric UnaryExpression: `+`/`-`/`~` yield number; `!` yields boolean (invalid as
    // enum initializer but TS would reject at compile time); `typeof`/`void`/`delete`
    // yield non-number. limit to arithmetic operators to stay precise
    if (init.type === 'UnaryExpression') {
      return init.operator === '+' || init.operator === '-' || init.operator === '~' ? 'number' : null;
    }
    if (nodeType === 'NumericLiteral') return 'number';
    if (init.type === 'TemplateLiteral') return 'string';
    if (init.type === 'BinaryExpression') {
      const left = resolveEnumMemberKind(init.left);
      return left && left === resolveEnumMemberKind(init.right) ? left : null;
    }
    return null;
  }

  // ESTree (oxc-parser): members under body.members; Babel: directly on declaration
  function enumMembers(declaration) {
    return declaration.members ?? declaration.body?.members;
  }

  // member's id may be Identifier (babel) or StringLiteral (oxc) - handle both shapes
  function findEnumMember(declaration, name) {
    return enumMembers(declaration)?.find(m => (m.id?.name ?? m.id?.value) === name) ?? null;
  }

  function resolveEnumMemberType(declaration, name) {
    const member = findEnumMember(declaration, name);
    if (!member) return null;
    const kind = resolveEnumMemberKind(member.initializer);
    return kind ? new $Primitive(kind) : null;
  }

  function resolveEnumType(declaration) {
    const members = enumMembers(declaration);
    if (!members?.length) return null;
    let kind = null;
    for (const member of members) {
      const memberKind = resolveEnumMemberKind(member.initializer);
      if (!memberKind) return null;
      if (!kind) kind = memberKind;
      else if (kind !== memberKind) return null;
    }
    return kind ? new $Primitive(kind) : null;
  }

  function isClassLikeDeclaration(decl) {
    return decl?.type === 'ClassDeclaration' || decl?.type === 'DeclareClass';
  }

  function isTypeBearingDeclaration(decl) {
    return isTypeAlias(decl) || isInterfaceDeclaration(decl) || isClassLikeDeclaration(decl)
      || decl?.type === 'TSEnumDeclaration';
  }

  // statement list directly inside a TSModuleDeclaration. for Babel's nested form
  // (`namespace A.B {}` -> A.body = TSModuleDeclaration B) expose B as a single-element list
  // so the next recursion can match its name. for oxc's flat form (id = TSQualifiedName)
  // the body is a TSModuleBlock and we return its statements directly.
  function moduleStatements(decl) {
    const body = decl?.body;
    if (body?.type === 'TSModuleDeclaration') return [body];
    return Array.isArray(body?.body) ? body.body : null;
  }

  // segment names of a TSModuleDeclaration id: Babel uses Identifier (single segment),
  // oxc uses TSQualifiedName for `namespace A.B {}` (multi-segment)
  function moduleNameSegments(id) {
    if (!id) return null;
    if (id.type === 'Identifier') return [id.name];
    if (id.type === 'TSQualifiedName') {
      const left = moduleNameSegments(id.left);
      return left && [...left, id.right.name];
    }
    return null;
  }

  // does `segments` start with the same names as `prefix`?
  function startsWithSegments(segments, prefix) {
    if (prefix.length > segments.length) return false;
    for (let i = 0; i < prefix.length; i++) if (segments[i] !== prefix[i]) return false;
    return true;
  }

  // resolve `NS.Inner.Decl` segments inside a statement list. `collect=null` short-circuits
  // on the first hit; `collect=[]` keeps walking to enable TS interface merging
  function walkStatementsForDecl(segments, statements, collect) {
    if (!Array.isArray(statements) || !segments.length) return null;
    const [head, ...rest] = segments;
    for (const statement of statements) {
      const decl = unwrapExportedDeclaration(statement);
      if (!decl) continue;
      if (rest.length === 0 && decl.id?.name === head && isTypeBearingDeclaration(decl)) {
        if (!collect) return decl;
        collect.push(decl);
        continue;
      }
      if (decl.type !== 'TSModuleDeclaration') continue;
      const moduleSegs = moduleNameSegments(decl.id);
      if (!moduleSegs) continue;
      // bare name: descend into every namespace; dotted: namespace must prefix segments
      if (rest.length === 0) {
        const inner = walkStatementsForDecl(segments, moduleStatements(decl), collect);
        if (inner && !collect) return inner;
        continue;
      }
      if (!startsWithSegments(segments, moduleSegs)) continue;
      const inner = walkStatementsForDecl(segments.slice(moduleSegs.length), moduleStatements(decl), collect);
      if (inner && !collect) return inner;
    }
    return null;
  }

  // walk scope chain; `collect=null` returns first hit, `collect=[]` collects siblings
  // at the first containing scope (interface merging only - others don't merge)
  function walkScopesForDecl(name, scope, collect) {
    if (!scope) return null;
    const segments = typeof name === 'string' ? name.split('.') : name;
    for (let cur = scope; cur; cur = cur.parent) {
      const block = cur.block ?? cur.path?.node;
      if (!block) continue;
      const body = block.type === 'Program' ? block.body : block.body?.body;
      const before = collect?.length;
      const result = walkStatementsForDecl(segments, body, collect);
      if (!collect && result) return result;
      if (collect && collect.length > before) return null;
    }
    return null;
  }

  // per-scope cache. serialize multi-segment / array inputs to a dotted string so qualified
  // references (`NS.Type`) and array-form callsites share the cache slot with their string form
  let typeDeclCache = new WeakMap();
  function findTypeDeclaration(name, scope) {
    if (!scope) return null;
    const key = typeof name === 'string' ? name : Array.isArray(name) ? name.join('.') : null;
    if (key === null) return walkScopesForDecl(name, scope, null);
    const byName = getOrInitMap(typeDeclCache, scope);
    if (byName.has(key)) return byName.get(key);
    const decl = walkScopesForDecl(name, scope, null);
    byName.set(key, decl);
    return decl;
  }

  // all `interface X {}` siblings at the first scope level that contains one
  function findAllTypeDeclarations(name, scope) {
    const collected = [];
    walkScopesForDecl(name, scope, collected);
    return collected;
  }

  // ESTree (oxc-parser): TSTypeParameter.name is Identifier node; Babel: it's a string
  function typeParamName(param) {
    return typeof param.name === 'string' ? param.name : param.name?.name;
  }

  function findTypeParameter(name, scope) {
    let currentScope = scope;
    while (currentScope) {
      const params = (currentScope.block ?? currentScope.path?.node)?.typeParameters?.params;
      if (params) for (const param of params) {
        if (typeParamName(param) === name) return {
          constraint: param.constraint ?? param.bound,
          default: param.default,
          scope: currentScope,
        };
      }
      currentScope = currentScope.parent;
    }
    return null;
  }

  function resolveKnownConstructor(name) {
    return hasOwn(KNOWN_CONSTRUCTORS, name) ? typeFromHint(KNOWN_CONSTRUCTORS[name].new) : null;
  }

  // --- Type annotation resolver ---
  function resolveTypeArgs(decl, node, typeParamMap, scope, depth, seen) {
    const declParams = decl.typeParameters?.params;
    if (!declParams?.length) return typeParamMap;
    const callArgs = getTypeArgs(node)?.params;
    const base = typeParamMap || new Map();
    const localMap = new Map(base);
    let extended = false;
    // `<T, U = T[]>`: each default sees earlier params via `localMap` accumulated so far
    for (let i = 0; i < declParams.length; i++) {
      const arg = callArgs?.[i] ?? declParams[i].default;
      if (!arg) continue;
      const resolved = localMap.size > 0
        ? substituteTypeParams(arg, localMap, scope, depth + 1, seen)
        : resolveTypeAnnotation(arg, scope, depth + 1);
      if (resolved) {
        localMap.set(typeParamName(declParams[i]), resolved);
        extended = true;
      }
    }
    return extended ? localMap : typeParamMap;
  }

  // `Container<string>` -> { T: string }; `Container` with `<T = number[]>` -> { T: Array }
  function buildDefaultTypeParamMap(annotation, scope) {
    const segments = typeRefSegments(annotation);
    if (!segments) return null;
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    const declParams = declaration.typeParameters?.params;
    if (!declParams?.length) return null;
    const callArgs = getTypeArgs(annotation)?.params;
    // `<T, U = T[]>`: U sees already-resolved T from earlier iterations
    let map = null;
    for (let i = 0; i < declParams.length; i++) {
      const arg = callArgs?.[i] ?? declParams[i].default;
      if (!arg) continue;
      const resolved = map
        ? substituteTypeParams(arg, map, scope, 0)
        : resolveTypeAnnotation(arg, scope);
      if (resolved) {
        if (!map) map = new Map();
        map.set(typeParamName(declParams[i]), resolved);
      }
    }
    return map;
  }

  function resolveUserDefinedType(name, node, scope, depth, typeParamMap, seen) {
    if (depth > MAX_DEPTH) return null;
    // type parameters shadow type declarations with the same name.
    // fall back to `default` FIRST (what TS binds without inference arguments), then
    // `constraint` (upper bound, typically over-broad - `object` / `unknown`)
    const typeParam = findTypeParameter(name, scope);
    if (typeParam) {
      const annotation = typeParam.default ?? typeParam.constraint;
      if (!annotation) return null;
      return typeParamMap
        ? substituteTypeParams(annotation, typeParamMap, typeParam.scope, depth + 1)
        : resolveTypeAnnotation(annotation, typeParam.scope, depth + 1);
    }
    const declaration = findTypeDeclaration(name, scope);
    if (!declaration) return null;
    // `interface A extends B; interface B extends A` - MAX_DEPTH catches the loop, but a
    // per-walk decl-set short-circuits it at the second visit. cycle-detection uses a
    // side-channel WeakSet keyed on the decl-set identity instead of a monkey-patched
    // property - that way `new Set(visited)` (should a caller ever clone) doesn't silently
    // forget the cycle flag; the cloned Set is simply a different identity with no flag.
    // unknowable cyclic type must NOT masquerade as `Object` (it suppresses generic polyfill)
    if (seen?.has(declaration)) {
      cycleSeenSets.add(seen);
      return null;
    }
    const visited = seen ?? new Set();
    visited.add(declaration);
    typeParamMap = resolveTypeArgs(declaration, node, typeParamMap, scope, depth, visited);
    // thread `visited` into the body-resolution closure so self-recursive aliases
    // (`type Rec<T> = Rec<T[]>`) hit the decl-set guard on re-entry instead of
    // growing `typeParamMap` unboundedly until MAX_DEPTH bottom-outs via CPU-burn
    const resolve = typeParamMap
      ? p => substituteTypeParams(p, typeParamMap, scope, depth + 1, visited)
      : p => resolveTypeAnnotation(p, scope, depth + 1);
    if (isTypeAlias(declaration)) return resolve(typeAliasBody(declaration));
    if (declaration.type === 'TSEnumDeclaration') return resolveEnumType(declaration);
    if (isInterfaceDeclaration(declaration)) {
      const parents = declaration.extends;
      if (parents?.length) {
        const cycleFlipped = cycleFlipDetector(visited);
        for (const parent of parents) {
          const base = extendsId(parent);
          if (base.type !== 'Identifier') continue;
          const constructor = resolveKnownConstructor(base.name);
          const result = resolveKnownContainerType(base.name, constructor, parent, resolve)
            || resolveUserDefinedType(base.name, parent, scope, depth + 1, typeParamMap, visited);
          if (result) return result;
        }
        if (cycleFlipped()) return null;
      }
      return new $Object('Object');
    }
    // class as a type: walk `extends` for known container (`Array<T>`) or user parent.
    // cyclic class extends should NOT fall back to `$Object('Object')` - that masquerades
    // as a concrete type and suppresses the generic polyfill plugin emits for unknowable
    // receivers. mirrors the interface-branch cycle handling above
    if (isClassLikeDeclaration(declaration)) {
      const superClass = declaration.superClass ?? declaration.extends?.[0]?.id;
      if (superClass?.type !== 'Identifier') return new $Object('Object');
      const parentRef = {
        type: 'TSTypeReference',
        typeName: superClass,
        typeParameters: getSuperTypeArgs(declaration),
      };
      const ctor = resolveKnownConstructor(superClass.name);
      if (ctor) return resolveKnownContainerType(superClass.name, ctor, parentRef, resolve) || ctor;
      const cycleFlipped = cycleFlipDetector(visited);
      const result = resolveUserDefinedType(superClass.name, parentRef, scope, depth + 1, typeParamMap, visited);
      if (result) return result;
      if (cycleFlipped()) return null;
      return new $Object('Object');
    }
    return null;
  }

  // build {paramName -> argNode} from explicit usage args, falling back to decl param defaults
  function buildSubstMap(declParams, usageArgs) {
    if (!declParams?.length) return null;
    const subst = new Map();
    for (let i = 0; i < declParams.length; i++) {
      const arg = usageArgs?.[i] ?? declParams[i].default;
      if (arg) subst.set(typeParamName(declParams[i]), arg);
    }
    return subst.size ? subst : null;
  }

  // parent interface ref (`Container<string>`) -> Map<declParam, argNode>
  function buildParentSubst(parentRef, scope) {
    const segments = typeRefSegments(parentRef);
    const decl = segments ? findTypeDeclaration(segments, scope) : null;
    if (!isInterfaceDeclaration(decl) && !isTypeAlias(decl)) return null;
    return buildSubstMap(decl.typeParameters?.params, getTypeArgs(parentRef)?.params);
  }

  // clone member with deep-substituted annotation slots; `key`/`computed` stay as-is.
  // covers TS `TSPropertySignature`/`TSIndexSignature`/`TSMethodSignature` and Flow `ObjectTypeProperty`
  const MEMBER_ANNOTATION_SLOTS = ['typeAnnotation', 'returnType', 'value'];
  function substMemberAnnotations(member, subst) {
    if (!member || typeof member !== 'object') return member;
    let cloned = null;
    for (const slot of MEMBER_ANNOTATION_SLOTS) {
      if (!member[slot]) continue;
      const next = applyAliasSubstDeep(member[slot], subst);
      if (next === member[slot]) continue;
      cloned ??= { ...member };
      cloned[slot] = next;
    }
    return cloned ?? member;
  }

  // TS utility types whose member set is the same as their first type parameter's
  const STRUCTURE_PRESERVING_WRAPPERS = new Set([
    'Omit',
    'Partial',
    'Pick',
    'Readonly',
    'Required',
    '$ReadOnly',
  ]);

  // TS `PromiseLike<T>` / Flow `Thenable<T>` are structural supertypes of Promise that
  // `await` / `Awaited<>` unwrap identically; alias them to Promise for type resolution
  const PROMISE_SYNONYMS = new Set(['PromiseLike', 'Thenable']);

  // follow superClass for declared parent members. `Identifier` covers both real and ambient
  // (`declare class P {}` + `class C extends P {}`), which behave the same in type position
  function findParentClassDecl(classDecl, scope) {
    const parentId = classDecl.superClass ?? classDecl.extends?.[0]?.id;
    if (parentId?.type !== 'Identifier') return null;
    const parent = findTypeDeclaration(parentId.name, scope);
    return isClassLikeDeclaration(parent) ? parent : null;
  }

  // `Cfg['items']` / chained `Cfg['items']['data']` - resolve the indexed access to its
  // annotation, then get members of that. without this, `findTypeMember` on a binding
  // annotated `Cfg['items']` returns null and downstream dispatches to generic polyfill
  function resolveIndexedAccessMembers(node, scope, depth) {
    const key = indexedAccessKey(node.indexType);
    if (key === null) return null;
    const member = findTypeMember(node.objectType, key, scope);
    const annotation = member && unwrapTypeAnnotation(member.typeAnnotation ?? member);
    return annotation ? getTypeMembers(annotation, scope, depth + 1) : null;
  }

  // collect members of an interface declaration (including merged sibling interfaces and
  // every `extends`'d parent's members). `interface A extends B; interface B extends A` cycle:
  // MAX_DEPTH bottoms out via 64-frame CPU-burn. visited Set short-circuits at the second
  // visit - mirrors `resolveTypeAnnotation`'s decl-set guard (type aliases) and
  // `collectClassLikeMembers`'s `seen` Set (class-extends chains)
  function collectInterfaceMembers(declaration, segments, scope, depth, visited) {
    const seen = visited ?? new Set();
    if (seen.has(declaration)) return null;
    seen.add(declaration);
    const interfaces = findAllTypeDeclarations(segments, scope).filter(isInterfaceDeclaration);
    const all = [];
    for (const decl of interfaces) {
      // TS: decl.body.body, Flow: decl.body.properties
      const own = decl.body?.body ?? decl.body?.properties;
      if (own) for (const m of own) all.push(m);
      for (const parent of decl.extends ?? []) {
        const expr = extendsId(parent);
        const parentRef = expr.type === 'Identifier'
          ? { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) }
          : expr;
        const parentMembers = getTypeMembers(parentRef, scope, depth + 1, seen);
        if (!parentMembers) continue;
        const parentSubst = buildParentSubst(parentRef, scope);
        for (const m of parentMembers) all.push(parentSubst ? substMemberAnnotations(m, parentSubst) : m);
      }
    }
    return all.length ? all : null;
  }

  function getTypeMembers(objectType, scope, depth = 0, visited = undefined) {
    if (depth > MAX_DEPTH) return null;
    if (objectType.type === 'TSTypeLiteral') return objectType.members;
    if (objectType.type === 'ObjectTypeAnnotation') return objectType.properties;
    if (objectType.type === 'TSIndexedAccessType') return resolveIndexedAccessMembers(objectType, scope, depth);
    // intersection: collect members from all parts
    if (objectType.type === 'TSIntersectionType' || objectType.type === 'IntersectionTypeAnnotation') {
      const all = [];
      for (const member of objectType.types) {
        const members = getTypeMembers(unwrapTypeAnnotation(member), scope, depth + 1, visited);
        if (members) for (const m of members) all.push(m);
      }
      return all.length ? all : null;
    }
    // handle dotted refs (`NS.Data`) by passing the segment path through
    const segments = typeRefSegments(objectType);
    if (!segments) return null;
    // structure-preserving wrappers: `Readonly<{...}>.x`, `Pick<T,K>.x` look up on T directly
    if (segments.length === 1 && STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])) {
      const arg = getTypeArgs(objectType)?.params[0];
      return arg ? getTypeMembers(unwrapTypeAnnotation(arg), scope, depth + 1, visited) : null;
    }
    // `Record<K, V>` - every member access returns V. emit a synthetic index signature so
    // findTypeMember's TSIndexSignature fallback picks it up for any key
    if (segments.length === 1 && segments[0] === 'Record') {
      const params = getTypeArgs(objectType)?.params;
      if (params?.[1]) return [{
        type: 'TSIndexSignature',
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: params[1] },
      }];
    }
    // `InstanceType<typeof Cls>.x` / `ReturnType<typeof fn>.x` -> members of the pointed-to decl
    if (segments.length === 1 && (segments[0] === 'InstanceType' || segments[0] === 'ReturnType')) {
      const arg = getTypeArgs(objectType)?.params[0];
      const resolved = arg?.type === 'TSTypeQuery' ? resolveTypeQueryBinding(arg, scope) : null;
      if (!resolved?.node) return null;
      const target = segments[0] === 'InstanceType'
        ? resolved.node.id && { type: 'TSTypeReference', typeName: resolved.node.id }
        : resolved.node.returnType ?? resolved.node.typeAnnotation;
      return target ? getTypeMembers(unwrapTypeAnnotation(target), scope, depth + 1, visited) : null;
    }
    // fast path first; only re-walk for the rare interface-merging case
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    if (isInterfaceDeclaration(declaration)) return collectInterfaceMembers(declaration, segments, scope, depth, visited);
    if (isClassLikeDeclaration(declaration)) {
      return collectClassLikeMembers(declaration, segments, scope, depth);
    }
    if (isTypeAlias(declaration)) {
      // substitute the alias's type params into member annotations so
      // `type Dict<V> = { [k: string]: V }` + `Dict<number[]>[string]` resolves V to number[]
      const subst = buildSubstMap(declaration.typeParameters?.params, getTypeArgs(objectType)?.params);
      const members = getTypeMembers(unwrapTypeAnnotation(typeAliasBody(declaration)), scope, depth + 1, visited);
      if (!members) return null;
      return subst ? members.map(m => substMemberAnnotations(m, subst)) : members;
    }
    return null;
  }

  // class-as-type with TS declaration merging: non-static body entries up the superClass chain
  // (real and ambient parents) plus every sibling `interface <name>` body + its extends chain
  function collectClassLikeMembers(declaration, segments, scope, depth) {
    const merged = [];
    const seen = new Set();
    for (let cur = declaration; cur && !seen.has(cur); cur = findParentClassDecl(cur, scope)) {
      seen.add(cur);
      for (const m of cur.body?.body ?? []) if (!m?.static) merged.push(m);
    }
    for (const iface of findAllTypeDeclarations(segments, scope).filter(isInterfaceDeclaration)) {
      for (const m of iface.body?.body ?? iface.body?.properties ?? []) merged.push(m);
      appendInterfaceExtendsMembers(iface, scope, depth, merged);
    }
    return merged.length ? merged : null;
  }

  // walk `interface X extends A, B` parents. each parent's members carry through the
  // `buildParentSubst` mapping so `A<T>.m: T` becomes `m: <instantiated>`
  function appendInterfaceExtendsMembers(iface, scope, depth, out) {
    for (const parent of iface.extends ?? []) {
      const expr = extendsId(parent);
      if (!expr) continue;
      const parentRef = expr.type === 'Identifier'
        ? { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) }
        : expr;
      const parentMembers = getTypeMembers(parentRef, scope, depth + 1);
      if (!parentMembers) continue;
      const subst = buildParentSubst(parentRef, scope);
      for (const m of parentMembers) out.push(subst ? substMemberAnnotations(m, subst) : m);
    }
  }

  // `Readonly<[T, U]>[0]` / `Partial<[T,U]>[0]` - structure-preserving wrappers around tuples
  // keep the element types intact. `findTypeMember`'s tuple case expects raw TSTupleType,
  // `getTypeMembers`'s wrapper case returns null for tuples (they have no property members).
  // recurse through the wrapper so the tuple index path below can pick up the element
  function peelStructurePreservingWrapper(objectType) {
    if (objectType?.type !== 'TSTypeReference' && objectType?.type !== 'GenericTypeAnnotation') return null;
    const segments = typeRefSegments(objectType);
    if (segments?.length !== 1 || !STRUCTURE_PRESERVING_WRAPPERS.has(segments[0])) return null;
    const arg = getTypeArgs(objectType)?.params[0];
    return arg ? unwrapTypeAnnotation(arg) : null;
  }

  // mixed `{[k:number]:A; [k:string]:B}` index signatures resolve per-lookup: numeric keys ->
  // number sig, string keys -> string sig (permissive fallback when only one sig is declared)
  function pickIndexSignature(members, key) {
    let numberSig = null;
    let stringSig = null;
    let symbolSig = null;
    for (const member of members) {
      if (member.type !== 'TSIndexSignature' || !member.typeAnnotation) continue;
      const keyType = member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type;
      if (keyType === 'TSNumberKeyword') numberSig ??= member.typeAnnotation;
      else if (keyType === 'TSSymbolKeyword') symbolSig ??= member.typeAnnotation;
      else stringSig ??= member.typeAnnotation;
    }
    const isNumericKey = typeof key === 'number' || /^-?\d+$/.test(String(key));
    return isNumericKey ? (numberSig ?? stringSig) : (stringSig ?? numberSig ?? symbolSig);
  }

  function findTypeMember(objectType, key, scope, depth = 0) {
    if (!objectType || depth > MAX_DEPTH) return null;
    // unions: recurse per branch (with subst applied), fold matches into a synthetic union.
    // union member may itself be a wrapped generic (`Inner<T>` / `T[]`); deep subst
    // descends into the inner type-param
    const { node: aliased, subst } = followTypeAliasChain(objectType, scope);
    // `Readonly<[T, U]>[0]` - after chain-follow the alias may still land on a structure-
    // preserving wrapper. peel it here so the tuple branch below gets the raw TSTupleType
    // (getTypeMembers fallback returns null for tuples - they carry element types, not members)
    const peeled = peelStructurePreservingWrapper(aliased ?? objectType);
    if (peeled) {
      const substituted = subst ? applyAliasSubstDeep(peeled, subst) : peeled;
      return findTypeMember(substituted, key, scope, depth + 1);
    }
    const withSubst = node => {
      if (!node) return node;
      const unwrapped = unwrapTypeAnnotation(node);
      return subst ? applyAliasSubstDeep(unwrapped, subst) : unwrapped;
    };
    const resolveBranch = member => findTypeMember(withSubst(unwrapTypeAnnotation(member)), key, scope, depth + 1);
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      const found = aliased.types.map(resolveBranch).filter(Boolean);
      if (!found.length) return null;
      if (found.length === 1) return found[0];
      return { type: aliased.type, types: found };
    }
    // intersection: first match wins - parts contribute disjoint keys (duplicate-key
    // intersections are ill-formed at the TS level anyway)
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      for (const member of aliased.types) {
        const resolved = resolveBranch(member);
        if (resolved) return resolved;
      }
      return null;
    }
    // tuple numeric index: `type Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`.
    // `length` resolves to the tuple's static arity (`number` literal); handle separately
    // so `Number('length') = NaN` doesn't silently drop the lookup
    if (aliased?.type === 'TSTupleType' || aliased?.type === 'TupleTypeAnnotation') {
      if (key === 'length') return { type: 'TSNumberKeyword' };
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const element = findTupleElement(aliased, index, scope);
      return element ? (subst ? applyAliasSubstDeep(element, subst) : element) : null;
    }
    // walk through trivial mapped passthroughs / aliases when looking up members
    const members = getTypeMembers(aliased ?? objectType, scope, depth);
    if (!members) return null;
    for (const member of members) {
      switch (member.type) {
        case 'TSPropertySignature':
        case 'TSMethodSignature':
          if (keyMatchesName(member.key, key)) {
            if (member.type !== 'TSMethodSignature') return withSubst(member.typeAnnotation);
            // getters are TSMethodSignature kind:'get' but semantically read the return
            // value, not a function. plain methods -> function type
            return member.kind === 'get'
              ? withSubst(member.typeAnnotation ?? member.returnType)
              : { type: 'TSFunctionType' };
          }
          break;
        case 'ObjectTypeProperty':
          if (keyMatchesName(member.key, key)) return withSubst(member.value);
          break;
        case 'ClassProperty':
        case 'PropertyDefinition':
        case 'ClassAccessorProperty':
          // class body property: typeAnnotation if present, otherwise we can't infer the type
          if (!member.computed && keyMatchesName(member.key, key)) return withSubst(member.typeAnnotation ?? null);
          break;
        // getter: property access yields the return type (ESTree nests it on `.value.returnType`,
        // babel carries it directly). setter: `break` so iteration continues to a paired getter
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareMethod':
        case 'MethodDefinition':
          if (member.computed || !keyMatchesName(member.key, key)) break;
          if (member.kind === 'get') return withSubst(member.returnType ?? member.value?.returnType);
          if (member.kind === 'set') break;
          return { type: 'TSFunctionType' };
      }
    }
    const indexSig = pickIndexSignature(members, key);
    if (indexSig) return withSubst(indexSig);
    // Flow: ObjectTypeIndexer stored separately in the type node, not in properties
    // resolve through type aliases since getTypeMembers follows aliases but returns only properties
    let resolvedType = objectType;
    let flowSubst = null;
    if (resolvedType.type !== 'ObjectTypeAnnotation') {
      const followed = followTypeAliasChain(resolvedType, scope);
      if (followed.node) {
        resolvedType = followed.node;
        flowSubst = followed.subst;
      }
    }
    if (resolvedType.type === 'ObjectTypeAnnotation' && resolvedType.indexers?.length) {
      const indexerValue = resolvedType.indexers[0].value;
      // deep subst - Flow indexer value can be a wrapped generic (`{[K]: T[]}`)
      return flowSubst ? applyAliasSubstDeep(indexerValue, flowSubst) : indexerValue;
    }
    return null;
  }

  function unwrapTupleMember(element) {
    let node = element;
    // peel TSNamedTupleMember and TSRestType wrappers in any order:
    // [name: string] -> TSNamedTupleMember -> elementType
    // [...number[]] -> TSRestType -> typeAnnotation
    // [...rest: string[]] -> TSRestType -> TSNamedTupleMember -> elementType
    for (let i = 0; i < 2; i++) {
      if (node.type === 'TSNamedTupleMember') node = node.elementType;
      else if (node.type === 'TSRestType') node = node.typeAnnotation;
      else break;
    }
    return node;
  }

  function isTupleRestElement(element) {
    const unwrapped = element.type === 'TSNamedTupleMember' ? element.elementType : element;
    return unwrapped.type === 'TSRestType';
  }

  // get tuple element list: TS uses elementTypes, Flow uses types
  function tupleElements(node) {
    return node.elementTypes || node.types;
  }

  // params list of the function/class referenced by `Parameters<typeof fn>` /
  // `ConstructorParameters<typeof Cls>`. classes without an own constructor inherit - walk
  // `extends` chain until own params (plain function) or a `constructor` method surface
  function resolveParametersParams(typeRef, scope) {
    const name = typeRefName(typeRef);
    if (name !== 'Parameters' && name !== 'ConstructorParameters') return null;
    const arg = getTypeArgs(typeRef)?.params[0];
    if (arg?.type !== 'TSTypeQuery') return null;
    let current = resolveTypeQueryBinding(arg, scope);
    let depth = MAX_DEPTH;
    while (depth-- && current?.node) {
      if (current.node.params) return current.node.params;
      const ctor = current.node.body?.body?.find(m => m?.kind === 'constructor');
      // babel: ClassMethod.params; oxc: MethodDefinition.value.params (FunctionExpression)
      if (ctor) return ctor.params ?? ctor.value?.params ?? null;
      if (!t.isClass(current.node) || !current.node.superClass) return null;
      current = resolveRuntimeExpression(current.get('superClass'));
    }
    return null;
  }

  function findTupleElement(objectType, index, scope) {
    if (index < 0) return null;
    // `Parameters<typeof fn>[N]` / `ConstructorParameters<typeof Cls>[N]` - N-th param's
    // annotation; rest param unwraps `T[]` -> T and covers every index >= its position
    const params = resolveParametersParams(objectType, scope);
    if (params) {
      for (let i = 0; i < params.length; i++) {
        const { param, isRest } = effectiveParam(params[i]);
        const annotation = param?.typeAnnotation?.typeAnnotation;
        if (!isRest && i === index) return annotation ?? null;
        if (isRest) return i <= index ? extractElementAnnotation(annotation, scope, 0) ?? null : null;
      }
      return null;
    }
    // `Readonly<[T, U]>` / `Partial<[T, U]>` - structure-preserving wrappers over tuples keep
    // element types intact. without this peel, the alias chain resolves to the wrapper itself,
    // not the inner tuple, and numeric indexing falls through to generic `_at`
    const peeled = peelStructurePreservingWrapper(objectType);
    if (peeled) return findTupleElement(peeled, index, scope);
    const { node: tuple, subst } = followTypeAliasChain(objectType, scope);
    if (tuple?.type !== 'TSTupleType' && tuple?.type !== 'TupleTypeAnnotation') return null;
    const elements = tupleElements(tuple);
    if (!elements?.length) return null;
    // direct hit: [string, ...number[]][0] -> string, [string, ...number[]][1] -> number
    const element = index < elements.length ? elements[index]
      // beyond tuple length: fall back to rest element if present - [string, ...number[]][5] -> number
      : isTupleRestElement(elements.at(-1)) ? elements.at(-1) : null;
    if (!element) return null;
    const memberNode = isTupleRestElement(element)
      ? extractElementAnnotation(unwrapTupleMember(element), scope, 0) : unwrapTupleMember(element);
    if (!memberNode) return null;
    // deep subst so generic args reach nested shapes: `Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`
    return applyAliasSubstDeep(memberNode, subst);
  }

  function isAssignableTo(candidate, target) {
    if (typesEqual(candidate, target)) {
      // matching outer type (e.g. both Array) - require inner distinction for container types
      // so `Extract<Array<number>|Array<string>, Array<string>>` narrows correctly. target with
      // no inner (bare `Array`) accepts any inner (covariant); mismatched inners reject
      if (!target.inner) return true;
      return innersEqual(candidate.inner, target.inner);
    }
    // any non-primitive is assignable to object / Object
    return !candidate.primitive && !target.primitive && (!target.constructor || target.constructor === 'Object');
  }

  // resolve a type-arg annotation honoring the caller's generic-substitution map when present,
  // so utility-type params (`Awaited<T>`, `Extract<T,U>`, etc.) and deep union members bind
  // against the caller's T/U instead of collapsing to null on raw parameter refs
  function resolveAnnotationInContext(node, scope, depth, typeParamMap, seen) {
    return typeParamMap
      ? substituteTypeParams(node, typeParamMap, scope, depth + 1, seen)
      : resolveTypeAnnotation(node, scope, depth + 1);
  }

  function resolveExtractExclude(first, second, scope, depth, keep, typeParamMap, seen) {
    const resolve = node => resolveAnnotationInContext(node, scope, depth, typeParamMap, seen);
    const target = resolve(second);
    if (!target) return null;
    let unwrapped = unwrapTypeAnnotation(first);
    if (!unwrapped) return null;
    // capture subst so generic union members (`type Foo<T> = T | string`) keep their bindings
    const { node: aliasTarget, subst } = followTypeAliasChain(unwrapped, scope);
    if (aliasTarget) unwrapped = aliasTarget;
    const types = unwrapped.type === 'TSUnionType' || unwrapped.type === 'UnionTypeAnnotation' ? unwrapped.types : [unwrapped];
    let result = null;
    let anyKept = false;
    for (const member of types) {
      const substituted = subst ? applyAliasSubstDeep(member, subst) : member;
      const resolved = resolve(substituted);
      if (!resolved) return null;
      if (isAssignableTo(resolved, target) !== keep) continue;
      anyKept = true;
      result = commonType(result, resolved);
      if (!result) return null;
    }
    // all members excluded -> never (not null/unknown)
    if (!anyKept) return new $Primitive('never');
    return result;
  }

  // resolve a member of an object/class binding to its runtime value path
  function resolveMemberValuePath(bindingPath, name) {
    let containerPath;
    if (t.isVariableDeclarator(bindingPath.node)) {
      containerPath = resolveRuntimeExpression(bindingPath.get('init'));
    } else if (t.isClassDeclaration(bindingPath.node)) {
      containerPath = bindingPath;
    }
    if (!containerPath?.node) return null;
    if (t.isObjectExpression(containerPath.node)) {
      const property = findObjectMember(containerPath, name);
      if (!property) return null;
      if (t.isObjectProperty(property.node)) return resolveRuntimeExpression(property.get('value'));
      if (t.isObjectMethod(property.node)) return methodFnPath(property);
    }
    if (t.isClass(containerPath.node)) {
      const member = findClassMember(containerPath, name, true);
      if (!member) return null;
      if (t.isClassMethod(member.node)) return methodFnPath(member);
      if (t.isClassProperty(member.node) || t.isClassAccessorProperty(member.node)) {
        const value = member.get('value');
        return value.node ? resolveRuntimeExpression(value) : null;
      }
    }
    return null;
  }

  // resolve TSTypeQuery (typeof x or typeof x.y) to the runtime path of the target.
  // falls back to ambient `declare function/class` when the name isn't in scope.bindings
  function resolveTypeQueryBinding(param, scope) {
    if (param.type !== 'TSTypeQuery') return null;
    const { exprName } = param;
    if (exprName?.type === 'TSQualifiedName') {
      const { left, right } = exprName;
      if (left.type !== 'Identifier' || right.type !== 'Identifier') return null;
      const bindingPath = constantBindingPath(left.name, scope);
      return bindingPath ? resolveMemberValuePath(bindingPath, right.name) : null;
    }
    if (exprName?.type !== 'Identifier') return null;
    const { name } = exprName;
    const bindingPath = constantBindingPath(name, scope);
    if (bindingPath) {
      if (t.isFunctionDeclaration(bindingPath.node) || t.isClassDeclaration(bindingPath.node)) return bindingPath;
      if (t.isVariableDeclarator(bindingPath.node)) {
        const init = bindingPath.get('init');
        return init.node ? resolveRuntimeExpression(init) : null;
      }
      return null;
    }
    return findAmbientDeclarationPath(name, scope, isAmbientFunctionOrClassNode);
  }

  // locate the function-like TYPE that a `typeof X` / `typeof NS.fn` annotation points at.
  // `declare const` bindings have no runtime init to resolve - the type lives on the binding's
  // annotation instead. for qualified names we walk the root binding's annotation to the
  // referenced member. returns {type, scope} or null
  function findTypeQueryFunctionType(exprName, scope) {
    if (exprName?.type === 'Identifier') {
      const binding = constantBindingPath(exprName.name, scope);
      const annotation = binding ? unwrapTypeAnnotation(findBindingAnnotation(binding)) : null;
      return annotation ? { type: annotation, scope: binding.scope } : null;
    }
    if (exprName?.type === 'TSQualifiedName' && exprName.left?.type === 'Identifier'
        && exprName.right?.type === 'Identifier') {
      const binding = constantBindingPath(exprName.left.name, scope);
      const annotation = binding ? unwrapTypeAnnotation(findBindingAnnotation(binding)) : null;
      const member = annotation ? findTypeMember(annotation, exprName.right.name, binding.scope) : null;
      // `findTypeMember` returns the member's RESOLVED type (after `withSubst`), already
      // unwrapped from its TSTypeAnnotation wrapper - use it directly, NOT `member.typeAnnotation`
      // (which on a TSFunctionType is the RETURN annotation, not the function type)
      return member ? { type: unwrapTypeAnnotation(member), scope: binding.scope } : null;
    }
    return null;
  }

  function resolveReturnTypeFromTypeQuery(param, scope) {
    const resolved = resolveTypeQueryBinding(param, scope);
    if (isFunctionLike(resolved?.node)) return resolveReturnType(resolved);
    if (param?.type !== 'TSTypeQuery') return null;
    // `resolveTypeQueryBinding` returns null for no-init `declare const` shapes; fall back to
    // the annotation-only path which also handles qualified names (`typeof NS.fn`)
    const fnType = findTypeQueryFunctionType(param.exprName, scope);
    const ret = fnType && functionTypeReturnAnnotation(fnType.type);
    return ret ? resolveTypeAnnotation(ret, fnType.scope) : null;
  }

  function resolveKnownContainerType(name, base, node, innerResolver) {
    if (!base) return null;
    if (!SINGLE_ELEMENT_COLLECTIONS.has(name) && name !== 'Promise') return base;
    const params = getTypeArgs(node)?.params;
    if (params?.[0]) {
      const inner = innerResolver(params[0]);
      if (inner && !isNullableOrNever(inner)) return new $Object(base.constructor, inner);
    }
    return base;
  }

  function resolveConstructorType(name, path) {
    return resolveKnownContainerType(name, resolveKnownConstructor(name), path.node, p => resolveTypeAnnotation(p, path.scope));
  }

  function resolveConstructorCallType(name, path) {
    if (!hasOwn(KNOWN_CONSTRUCTORS, name)) return null;
    const callResult = typeFromHint(KNOWN_CONSTRUCTORS[name].call);
    if (callResult.primitive) return callResult;
    return resolveKnownContainerType(name, callResult, path.node, p => resolveTypeAnnotation(p, path.scope));
  }

  // TS 5.6+ stdlib base-classes share method tables with their concrete pairs
  const CONSTRUCTOR_ALIASES = assign(create(null), {
    IteratorObject: 'Iterator',
    AsyncIteratorObject: 'AsyncIterator',
  });

  function resolveNamedType(name, node, scope, depth, typeParamMap, seen) {
    // PromiseLike / Thenable are structural Promise supertypes for await / Awaited<>;
    // aliasing upfront lets the Promise branch of resolveKnownContainerType handle both
    if (PROMISE_SYNONYMS.has(name)) name = 'Promise';
    if (hasOwn(CONSTRUCTOR_ALIASES, name)) name = CONSTRUCTOR_ALIASES[name];
    const resolveArgInner = arg => resolveAnnotationInContext(arg, scope, depth, typeParamMap, seen);
    const known = resolveKnownContainerType(name, resolveKnownConstructor(name), node, resolveArgInner);
    if (known) return known;
    const firstArg = () => getTypeArgs(node)?.params[0];
    const resolveArg = (arg, fallback) => arg
      ? resolveArgInner(arg) ?? fallback
      : null;
    // structure-preserving wrappers (T[] stays array, {..} stays object). null fallback
    // to $Object('Object') keeps arg-type=object filters firing for TSTypeLiteral inners
    if (STRUCTURE_PRESERVING_WRAPPERS.has(name)) return resolveArg(firstArg(), new $Object('Object'));
    switch (name) {
      // structurally new shape from their type parameter - collapse to Object
      case 'Record':
      case '$Shape':
      case '$Diff':
      case '$Rest':
      case '$ObjMap':
      case '$ObjMapi':
      case '$ObjMapConst':
        return new $Object('Object');
      case 'Parameters':
      case 'ConstructorParameters': {
        // tuple approximated as Array<first-param-type> so chained `.at(0)` / `.forEach`
        // resolve; indexed access `T[N]` picks the N-th via `findTupleElement`
        const { param, isRest } = effectiveParam(resolveParametersParams(node, scope)?.[0]);
        const resolved = param?.typeAnnotation ? resolveArgInner(param.typeAnnotation) : null;
        // `...xs: T[]` - annotation is `T[]`, the tuple element is T
        const inner = isRest ? resolveInnerType(resolved) : resolved;
        return inner && !isNullableOrNever(inner) ? new $Object('Array', inner) : new $Object('Array');
      }
      // Flow: $Keys
      case 'Uppercase':
      case 'Lowercase':
      case 'Capitalize':
      case 'Uncapitalize':
      case '$Keys':
        return new $Primitive('string');
      // TS lib alias for `string | number | symbol`; no shared polyfill API, null lets
      // downstream fall back to generic-instance emission
      case 'PropertyKey':
        return null;
      // transparent wrappers resolving type parameter. Flow: $Exact
      case 'NoInfer':
      case '$Exact':
        return resolveArg(firstArg(), null);
      // resolve type parameter, strip nullable/never. Flow: $NonMaybeType
      case 'NonNullable':
      case '$NonMaybeType': {
        const arg = firstArg();
        return arg ? resolveNonNullableAnnotation(arg, scope, depth, typeParamMap, seen) : null;
      }
      case 'Awaited': {
        const arg = firstArg();
        return arg ? unwrapPromise(resolveArgInner(arg)) : null;
      }
      case 'ReturnType': {
        const arg = firstArg();
        if (!arg) return null;
        // TSTypeQuery (`ReturnType<typeof fn>`) routes through runtime-binding lookup.
        // direct function type alias (`type Fn = () => T; ReturnType<Fn>`) has no typeof -
        // follow the alias chain, extract return annotation, fold accumulated subst into it
        // (mirrors Awaited / Extract / findTupleElement)
        if (arg.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(arg, scope);
        const { node: aliased, subst } = followTypeAliasChain(unwrapTypeAnnotation(arg), scope);
        const ret = functionTypeReturnAnnotation(unwrapTypeAnnotation(aliased));
        return ret ? resolveTypeAnnotation(subst ? applyAliasSubstDeep(ret, subst) : ret, scope) : null;
      }
      case 'InstanceType': {
        const arg = firstArg();
        const resolved = arg ? resolveTypeQueryBinding(arg, scope) : null;
        if (!(t.isClass(resolved?.node) || isAmbientClassNode(resolved?.node))) return null;
        return resolveClassInheritance(resolved) || new $Object('Object');
      }
      case 'Extract':
      case 'Exclude': {
        const params = getTypeArgs(node)?.params;
        return params?.length >= 2
          ? resolveExtractExclude(params[0], params[1], scope, depth, name === 'Extract', typeParamMap, seen) : null;
      }
      // Flow $ReadOnlyArray<T> -> Array with inner type (equivalent to ReadonlyArray<T>)
      case '$ReadOnlyArray': {
        const arg = firstArg();
        return new $Object('Array', arg ? resolveNonNullableAnnotation(arg, scope, depth, typeParamMap, seen) : null);
      }
      // conservative: unknown for Flow variants we don't model structurally
      case '$Values':
      case '$ElementType':
      case '$PropertyType':
      case '$Call':
        return null;
    }
    return resolveUserDefinedType(name, node, scope, depth, undefined, seen);
  }

  function resolveTypeAnnotation(node, scope, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      // TS primitive keywords
      case 'TSStringKeyword':
      case 'StringTypeAnnotation':
        return new $Primitive('string');
      case 'TSNumberKeyword':
      case 'NumberTypeAnnotation':
        return new $Primitive('number');
      case 'TSBooleanKeyword':
      case 'BooleanTypeAnnotation':
        return new $Primitive('boolean');
      case 'TSBigIntKeyword':
      case 'BigIntTypeAnnotation':
        return new $Primitive('bigint');
      case 'TSSymbolKeyword':
      case 'SymbolTypeAnnotation':
        return new $Primitive('symbol');
      case 'TSVoidKeyword':
      case 'TSUndefinedKeyword':
      case 'VoidTypeAnnotation':
        return new $Primitive('undefined');
      case 'TSNullKeyword':
      case 'NullLiteralTypeAnnotation':
        return new $Primitive('null');
      case 'TSNeverKeyword':
      case 'EmptyTypeAnnotation':
        return new $Primitive('never');
      // TS `object` keyword = any non-primitive, too broad to narrow polyfills
      case 'TSObjectKeyword':
        return new $Object(null);
      // TS `{}` without members matches ANY non-nullish runtime value - primitives (string,
      // number, bigint, boolean, symbol), functions, all constructor objects (Array, Map,
      // Promise, Date, ...), user classes. returning `$Object('Object')` would narrow to
      // Object-methods only and misroute `.at()` / `.includes()` etc; null routes through
      // `resolveHint` common/rest fallback which is the correct conservative choice
      case 'TSTypeLiteral':
      case 'ObjectTypeAnnotation':
        return null;
      // TS mapped type: detect the trivial passthrough `{ [K in keyof T]: T[K] }` and resolve
      // through to T directly; everything else is structurally opaque
      case 'TSMappedType': {
        const passthrough = unwrapMappedTypePassthrough(node);
        return passthrough ? resolveTypeAnnotation(passthrough, scope, depth + 1) : null;
      }
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return new $Object('Array', resolveNonNullableAnnotation(node.elementType, scope, depth));
      case 'TSTupleType':
      case 'TupleTypeAnnotation': {
        const elements = tupleElements(node);
        return new $Object('Array', elements?.length
          ? resolveTupleInner(elements, e => resolveTypeAnnotation(e, scope, depth + 1))
          : null);
      }
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation':
        return new $Object('Function');
      // TS / Flow named types - only well-known built-ins and utility types
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        // handle dotted refs (`NS.Data`) - join segments so resolveNamedType /
        // findTypeDeclaration can split them back into a path-walk
        const segments = typeRefSegments(node);
        if (!segments) return null;
        return resolveNamedType(segments.join('.'), node, scope, depth);
      }
      // transparent wrappers - unwrap and resolve the inner type
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
      // TS type operator: `readonly T[]`, `unique symbol` - but NOT `keyof T`
      case 'TSTypeOperator':
        if (node.operator !== 'keyof') return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1);
        return null;
      // TS typeof in type position: `typeof variable`
      case 'TSTypeQuery':
        return resolveTypeQuery(node, scope);
      // `typeof import('x')` / `import('x').Foo` - referenced module isn't visible
      // without file I/O. explicit case so future extension doesn't need to untangle
      // a silent fall-through through `TSTypeReference`
      case 'TSImportType':
        return null;
      // Flow typeof in type position: `typeof variable`
      case 'TypeofTypeAnnotation': {
        const arg = node.argument;
        return arg?.type === 'GenericTypeAnnotation'
          ? resolveTypeofFromSegments(collectQualifiedSegments(arg.id), scope) : null;
      }
      // TS template literal type: `prefix_${string}`
      case 'TSTemplateLiteralType':
        return new $Primitive('string');
      // TS type predicate: `x is string` -> boolean
      case 'TSTypePredicate':
        return new $Primitive('boolean');
      // TS conditional type: T extends U ? X : Y - resolve if both branches have the same type, or one is `never`.
      // `T extends (infer U)[] ? U : never` with T already substituted (via alias-chain) is the
      // canonical element-extraction shape: trueType references the inferred name, falseType is
      // never-like. match first so `First<string[]>` resolves to `string` instead of collapsing
      // through the generic branches (which can't resolve the naked `U` reference)
      case 'TSConditionalType': {
        const inferred = resolveInferElementPattern(node, null, scope, depth, null);
        if (inferred) return inferred;
        return resolveConditionalBranches(
          resolveTypeAnnotation(node.trueType, scope, depth + 1),
          resolveTypeAnnotation(node.falseType, scope, depth + 1));
      }
      // TS / Flow union and intersection - resolve if all (non-nullable for unions) members have the same type
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types || !types.length) return null;
        return foldUnionTypes(types, member => resolveTypeAnnotation(member, scope, depth + 1));
      }
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation': {
        const { types } = node;
        if (!types || !types.length) return null;
        return foldIntersectionTypes(types, member => resolveTypeAnnotation(member, scope, depth + 1));
      }
      // TS literal types: 'hello', 42, true, etc.
      case 'TSLiteralType':
        if (node.literal) switch (babelNodeType(node.literal)) {
          case 'StringLiteral':
          case 'TemplateLiteral':
            return new $Primitive('string');
          case 'NumericLiteral':
            return new $Primitive('number');
          case 'BooleanLiteral':
            return new $Primitive('boolean');
          case 'BigIntLiteral':
            return new $Primitive('bigint');
          case 'UnaryExpression':
            return new $Primitive(babelNodeType(node.literal.argument) === 'BigIntLiteral' ? 'bigint' : 'number');
        }
        return null;
      // Flow literal types: 'hello', 42, true
      case 'StringLiteralTypeAnnotation':
        return new $Primitive('string');
      case 'NumberLiteralTypeAnnotation':
        return new $Primitive('number');
      case 'BooleanLiteralTypeAnnotation':
        return new $Primitive('boolean');
      // TS indexed access type: Config["items"], [string, number[]][1], Items[number], or Dict[string]
      case 'TSIndexedAccessType': {
        // T[number] - element type of array/tuple
        if (node.indexType?.type === 'TSNumberKeyword') return resolveElementType(node.objectType, scope, depth + 1);
        // T[string] - string index signature type
        if (node.indexType?.type === 'TSStringKeyword') {
          const members = getTypeMembers(node.objectType, scope);
          if (members) for (const member of members) {
            if (member.type === 'TSIndexSignature' && member.typeAnnotation
              && member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type === 'TSStringKeyword') {
              return resolveTypeAnnotation(member.typeAnnotation, scope, depth + 1);
            }
          }
          return null;
        }
        // `T['a' | 'b']` - union of literal indices. fold each branch back through this same
        // resolver (each with one TSLiteralType indexType); `foldUnionTypes` aggregates to
        // the widest common type, handing us precise inference when all branches agree
        if (node.indexType?.type === 'TSUnionType') {
          return foldUnionTypes(node.indexType.types, branch => resolveTypeAnnotation(
            { type: 'TSIndexedAccessType', objectType: node.objectType, indexType: branch },
            scope,
            depth + 1,
          ));
        }
        // template-literal type index `T[\`foo\`]` without interpolations is equivalent to
        // `T['foo']` - TS-level evaluation of the template yields a plain string literal.
        // interpolations (`T[\`_${K}\`]`) would require compile-time type-string computation
        // (mapped-type renamers like `as \`_${K & string}\``); conservative bail for now.
        // TS wraps template literals in TSLiteralType { literal: TemplateLiteral }; unwrap first
        const literalIndex = node.indexType?.type === 'TSLiteralType' ? node.indexType.literal : node.indexType;
        const quasi = singleQuasiString(literalIndex);
        if (quasi !== null) {
          const member = findTypeMember(node.objectType, quasi, scope);
          return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
        }
        if (node.indexType?.type !== 'TSLiteralType') return null;
        const { literal } = node.indexType;
        let member;
        if (babelNodeType(literal) === 'StringLiteral') member = findTypeMember(node.objectType, literal.value, scope);
        else if (babelNodeType(literal) === 'NumericLiteral') member = findTupleElement(node.objectType, literal.value, scope);
        return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
      }
    }
    return null;
  }

  // --- Type utilities & runtime expression resolver ---
  function resolvePath(path) {
    let depth = MAX_DEPTH;
    while (depth-- && t.isIdentifier(path.node)) {
      if (!path.scope) break;
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) break;
      // mutable binding with reassignments: follow the last preceding-block `=` assignment
      // before `path` so `let f: Foo = init; f = { kind:'b', data:'str' }; f.data.at(0)`
      // (and `if (...) { f = {...}; f.data.at(0); }`) narrows `f` to the RHS shape, not the
      // declared union. uses `findPrecedingBlockAssignment` (relative to use site) rather
      // than `findLastStraightLineAssignment` (relative to var-scope) so assignments nested
      // in conditional blocks still apply when the use site shares the same block
      if (binding.constantViolations?.length) {
        const lastAssign = findPrecedingBlockAssignment(binding, path);
        if (lastAssign?.node?.type === 'AssignmentExpression' && lastAssign.node.operator === '=') {
          path = lastAssign.get(assignRightKey(lastAssign.node));
          continue;
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
    const initPath = bindingPath.get('init');
    if (!initPath?.node) return null;
    if (id?.typeAnnotation && isNullishInit(initPath.node)) return null;
    return initPath;
  }

  // `null` / `undefined` literal or `void <expr>` - placeholders that don't reflect runtime
  // type. covers babel `NullLiteral` + ESTree `Literal { value: null }` (oxc); the `regex`
  // guard excludes `/foo/` literals which also reuse the `Literal` node in ESTree.
  // shared `peelFallbackWrappers` strips ParenthesizedExpression / TS expression wrappers
  // (`null as any`, `(null)`) so the nullish-tail is recognized through user-applied wrappers
  function isNullishInit(node) {
    const inner = peelFallbackWrappers(node);
    if (!inner) return false;
    if (inner.type === 'NullLiteral') return true;
    if (inner.type === 'Literal' && inner.value === null && !inner.regex) return true;
    if (inner.type === 'Identifier' && inner.name === 'undefined') return true;
    return inner.type === 'UnaryExpression' && inner.operator === 'void';
  }

  function resolveNumericType(path) {
    // `resolveNodeType` on a bare Identifier stops at the identifier itself without
    // descending to its binding init - `resolvePath` walks `const x = BigInt(1)` so
    // `x++` sees the BigInt-typed init. `number` fallback kept for unresolvable paths
    const resolved = resolveNodeType(resolvePath(path));
    return new $Primitive(primitiveTypeOf(resolved) === 'bigint' ? 'bigint' : 'number');
  }

  // resolve property name from a MemberExpression, handling both
  // non-computed (obj.prop), string/numeric literal (obj['prop'], obj[0]),
  // constant binding (const key = 'prop'; obj[key]) and enum member access (`obj[Enum.A]`)
  function resolveMemberPropertyName(path) {
    const { property, computed } = path.node;
    if (!computed) return getKeyName(property);
    return literalKeyValue(property)
      ?? literalKeyValue(resolveRuntimeExpression(path.get('property')).node)
      ?? resolveComputedKeyName(property, path.scope);
  }

  // intentionally compares only outer type identity (type + constructor), ignoring `inner`
  function typesEqual(a, b) {
    return a.type === b.type && a.constructor === b.constructor;
  }

  // deep equality of inner type hints (string hints or type objects)
  function innersEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a === 'string' || typeof b === 'string') return a === b;
    return typesEqual(a, b) && innersEqual(a.inner, b.inner);
  }

  // merge two types into a common type: returns null if outer types differ,
  // strips inner if outer types match but inner types disagree
  function commonType(existing, incoming) {
    if (!existing) return incoming;
    if (!typesEqual(existing, incoming)) return null;
    if (existing.primitive || innersEqual(existing.inner, incoming.inner)) return existing;
    return new $Object(existing.constructor);
  }

  function isNullableOrNever(resolved) {
    return resolved.type === 'null' || resolved.type === 'undefined' || resolved.type === 'never';
  }

  // unified fold: resolve each member, classify via `classify(resolved)`:
  //   FOLD (2) - contribute to commonType
  //   SKIP (1) - skip member, track as fallback for all-skipped case
  //   BAIL (0) - abort, return null
  function foldTypes(members, resolve, classify) {
    let result = null;
    let skipped = null;
    for (const member of members) {
      const resolved = resolve(member);
      const action = classify(resolved);
      if (action === 0) return null; // BAIL
      if (action === 1) { // SKIP
        if (resolved) skipped ??= resolved;
        continue;
      }
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result ?? skipped;
  }

  // fold union members: unresolvable -> bail, nullable/never -> skip, rest -> fold
  function foldUnionTypes(types, resolve) {
    return foldTypes(types, resolve, r => !r ? 0 : isNullableOrNever(r) ? 1 : 2);
  }

  // fold intersection members: unresolvable or plain Object -> skip, rest -> fold
  function foldIntersectionTypes(types, resolve) {
    return foldTypes(types, resolve, r => !r || (!r.primitive && (!r.constructor || r.constructor === 'Object')) ? 1 : 2);
  }

  // compute common inner type from tuple elements using a parameterized resolver
  // returns the common type if all non-nullable elements agree, null otherwise
  function resolveTupleInner(elements, resolver) {
    const result = foldTypes(elements, elem => {
      // rest element: ...string[] or ...Array<string> - resolve the collection type, use its inner
      if (isTupleRestElement(elem)) return resolveInnerType(resolver(unwrapTupleMember(elem)));
      return resolver(unwrapTupleMember(elem));
    }, r => !r ? 0 : isNullableOrNever(r) ? 1 : 2);
    // all-nullable tuples: return null (unknown inner), not the nullable fallback
    return result && isNullableOrNever(result) ? null : result;
  }

  // resolve a type annotation, returning null for nullable/never types (not useful as inner types)
  function resolveNonNullableAnnotation(node, scope, depth, typeParamMap, seen) {
    if (!node) return null;
    const resolved = resolveAnnotationInContext(node, scope, depth, typeParamMap, seen);
    return resolved && !isNullableOrNever(resolved) ? resolved : null;
  }

  // resolve conditional type branches: if both match return that type, if one is `never` return the other
  function resolveConditionalBranches(trueBranch, falseBranch) {
    if (trueBranch && falseBranch) {
      const merged = commonType(trueBranch, falseBranch);
      if (merged) return merged;
    }
    if (trueBranch?.type === 'never') return falseBranch;
    if (falseBranch?.type === 'never') return trueBranch;
    return null;
  }

  // narrow infer pattern: `T extends (infer U)[] ? U : X` / `T extends Array<infer U> ? U : X`.
  // when the pattern matches AND checkType's substituted type is an array-like, returns the
  // element type. any other shape (nested infers, non-array containers, trueType != U) -> null,
  // caller falls back to plain branch resolution
  function resolveInferElementPattern(node, typeParamMap, scope, depth, seen) {
    const inferName = matchArrayInferPattern(node.extendsType);
    if (!inferName) return null;
    if (typeRefName(node.trueType) !== inferName) return null;
    const checkType = substituteTypeParams(node.checkType, typeParamMap, scope, depth + 1, seen);
    return checkType ? resolveInnerType(checkType) : null;
  }

  // `Container<infer U>` is a recognised narrow pattern when the container's `.inner`
  // slot semantically stores its type parameter - exactly the set of `SINGLE_ELEMENT_COLLECTIONS`
  // plus Promise (and its structural synonyms, which alias to Promise via `resolveNamedType`)
  function isInferContainerName(name) {
    return SINGLE_ELEMENT_COLLECTIONS.has(name) || name === 'Promise' || PROMISE_SYNONYMS.has(name);
  }

  // extracts `U` from `(infer U)[]`, `readonly (infer U)[]`, or `Container<infer U>`
  // where Container is a known single-element generic. returns null otherwise
  function matchArrayInferPattern(extendsType) {
    let node = unwrapTypeAnnotation(extendsType);
    // peel `readonly X` modifier (TSTypeOperator operator='readonly')
    if (node?.type === 'TSTypeOperator' && node.operator === 'readonly') node = node.typeAnnotation;
    if (node?.type === 'TSArrayType') {
      // babel wraps `(infer U)` in TSParenthesizedType; oxc collapses to bare TSInferType.
      // peel the wrapper so both shapes reach the inner inference name
      let element = node.elementType;
      while (element?.type === 'TSParenthesizedType') element = element.typeAnnotation;
      if (element?.type === 'TSInferType') {
        return element.typeParameter?.name?.name ?? element.typeParameter?.name;
      }
    }
    if (node?.type === 'TSTypeReference' && isInferContainerName(typeRefName(node))) {
      const arg = getTypeArgs(node)?.params?.[0];
      if (arg?.type === 'TSInferType') return arg.typeParameter?.name?.name ?? arg.typeParameter?.name;
    }
    return null;
  }

  // `op === '??'` ('??' / '??='): left contributes only when non-nullish - if left is
  // statically null/undefined primitive, right is the only runtime value. similarly for
  // `||`/`||=`: literal-null/undefined left always falls through to right. without this
  // peel, `null ?? 'a'` yields commonType(null, string) = null, losing the string type
  function resolveUnionType(leftPath, rightPath, op) {
    const left = resolveNodeType(leftPath);
    const right = resolveNodeType(rightPath);
    if (left && right && (op === '??' || op === '??=' || op === '||' || op === '||=')
        && isNullableOrNever(left)) return right;
    return left && right ? commonType(left, right) : null;
  }

  // recognize Babel's destructuring default desugaring: _ref === void 0 ? DEFAULT : _ref
  // and resolve to the type of DEFAULT (the consequent branch)
  function resolveDesugarDefaultTernary(path) {
    const { test, alternate } = path.node;
    if (test.type !== 'BinaryExpression' || test.operator !== '===') return null;
    const { left, right } = test;
    const refName = checkSelfTernaryRefName(left, right);
    if (!refName) return null;
    if (alternate.type !== 'Identifier' || alternate.name !== refName) return null;
    return resolveNodeType(path.get('consequent'));
  }

  // identify the destructure-ref name from a default-ternary test. babel emits
  // `_ref === void 0`; swc / esbuild emit `typeof _ref === 'undefined'`. both desugar
  // the same `function({x = D})` pattern - missing the typeof form silently dropped
  // type inference for any swc / esbuild output passed through the plugin
  function checkSelfTernaryRefName(left, right) {
    if (left.type === 'Identifier' && isVoidZero(right)) return left.name;
    if (left.type === 'UnaryExpression' && left.operator === 'typeof'
      && left.argument?.type === 'Identifier' && isUndefinedString(right)) return left.argument.name;
    return null;
  }

  function isVoidZero(node) {
    return node.type === 'UnaryExpression' && node.operator === 'void'
      && babelNodeType(node.argument) === 'NumericLiteral' && node.argument.value === 0;
  }

  function isUndefinedString(node) {
    if (babelNodeType(node) === 'StringLiteral' && node.value === 'undefined') return true;
    return node?.type === 'Literal' && node.value === 'undefined';
  }

  function resolveBinaryOperatorType(operator, leftPath, rightPath) {
    switch (operator) {
      case '+': {
        const leftType = primitiveTypeOf(resolveNodeType(leftPath));
        const rightType = primitiveTypeOf(resolveNodeType(rightPath));
        if (leftType === 'string' || rightType === 'string') return new $Primitive('string');
        if (leftType === 'number' && rightType === 'number') return new $Primitive('number');
        if (leftType === 'bigint' && rightType === 'bigint') return new $Primitive('bigint');
        return new $Primitive('unknown');
      }
      // >>> (unsigned right shift) throws on BigInt, result is always Number
      case '>>>':
        return new $Primitive('number');
      // arithmetic and bitwise operators work on both Number and BigInt
      // mixing them throws, so knowing one operand's type determines the result
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
      case '|':
      case '&':
      case '^':
      case '<<':
      case '>>': {
        const leftType = primitiveTypeOf(resolveNodeType(leftPath));
        const rightType = primitiveTypeOf(resolveNodeType(rightPath));
        if (leftType === 'bigint' || rightType === 'bigint') return new $Primitive('bigint');
        // `number` if resolving is not possible - acceptable assumption within `core-js`
        return new $Primitive('number');
      }
    }
    return null;
  }

  function isGlobalThis(path) {
    let current = path;
    while (current = current.parentPath) {
      // non-arrow function rebinds `this` - not global
      if (t.isFunction(current.node) && !t.isArrowFunctionExpression(current.node)) return false;
      // class body rebinds `this` for property initializers and static blocks
      if (t.isClassBody(current.node)) return false;
      if (t.isProgram(current.node)) return true;
    }
    return false;
  }

  function isGlobalProxy(objectPath) {
    if (t.isIdentifier(objectPath.node)) {
      return POSSIBLE_GLOBAL_OBJECTS.has(objectPath.node.name) && !objectPath.scope?.getBinding(objectPath.node.name);
    }
    // top-level `this` (not inside any non-arrow function or class) is a global proxy
    return t.isThisExpression(objectPath.node) && isGlobalThis(objectPath);
  }

  function resolveGlobalName(path) {
    if (t.isIdentifier(path.node) && !path.scope?.getBinding(path.node.name)) return path.node.name;
    if (!isMemberLike(path) || path.node.computed) return null;
    const object = path.get('object');
    if (!isGlobalProxy(object)) return null;
    const property = path.get('property');
    return t.isIdentifier(property.node) ? property.node.name : null;
  }

  // known constructor at the runtime-resolved target of `path`, or null
  function knownConstructorAt(path) {
    return resolveKnownConstructor(resolveGlobalName(resolveRuntimeExpression(path)));
  }

  // `const { prototype: name } = ...` shape - `name` is bound to the init's `.prototype`.
  // peel AssignmentPattern wrapper on value: `const { prototype: P = Array.prototype } = Set`
  // still binds P to `.prototype` when the default is unreached at runtime
  function isDestructuredAsPrototype(bindingPath, name) {
    if (!t.isVariableDeclarator(bindingPath.node)) return false;
    const { id, init } = bindingPath.node;
    if (!t.isObjectPattern(id) || !init) return false;
    return id.properties.some(p => {
      if (!t.isObjectProperty(p) || p.computed || !keyMatchesName(p.key, 'prototype')) return false;
      const value = t.isAssignmentPattern(p.value) ? p.value.left : p.value;
      return t.isIdentifier(value) && value.name === name;
    });
  }

  // `.prototype` of a known constructor reads as an instance of it: we infer which
  // constructor's instance-methods are reachable here, and prototype objects host those.
  // direct `X.prototype` and member-init `const P = X.prototype` fall through resolvePath;
  // destructure `const { prototype: P } = X` doesn't (resolvePath skips patterns)
  function resolvePrototypeAsInstance(path) {
    if (isMemberLike(path)) {
      return resolveMemberPropertyName(path) === 'prototype'
        ? knownConstructorAt(path.get('object'))
        : null;
    }
    if (!t.isIdentifier(path.node)) return null;
    const binding = path.scope?.getBinding(path.node.name);
    if (!binding || binding.constantViolations?.length) return null;
    if (!isDestructuredAsPrototype(binding.path, path.node.name)) return null;
    return knownConstructorAt(binding.path.get('init'));
  }

  function resolveClassInheritance(classPath) {
    let current = classPath;
    let depth = MAX_DEPTH;
    while (depth--) {
      if (!current.node.superClass) return null;
      const superPath = current.get('superClass');
      const name = resolveGlobalName(superPath);
      if (name) {
        const base = resolveKnownConstructor(name);
        // `class MyArr extends Array<string>` - the super's type argument is the element type
        // of the instance. resolve through same helper as `new Array<string>()` so the inner
        // flows into polyfill dispatch (`_atMaybeArray` over generic)
        const args = getSuperTypeArgs(current.node);
        return args?.params
          ? resolveKnownContainerType(name, base, { typeParameters: args }, p => resolveTypeAnnotation(p, current.scope))
          : base;
      }
      current = resolveRuntimeExpression(superPath);
      if (!t.isClass(current.node)) return null;
    }
    return null;
  }

  // if annotation resolves to Generator/AsyncGenerator, return its type params; otherwise null
  // handles aliased types: type MyGen<T> = Generator<T> -> substitutes T with actual args
  // supports chained aliases with different param names: type A<T> = B<T>; type B<U> = Generator<U>
  function generatorTypeParams(annotation, scope) {
    const { node: ref, subst } = followTypeAliasChain(annotation, scope);
    const refName = typeRefName(ref);
    if (refName !== 'Generator' && refName !== 'AsyncGenerator') return null;
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
    // call expression: resolve callee function's return type annotation
    const resolved = resolveRuntimeExpression(exprPath);
    if (t.isCallExpression(resolved.node) || t.isNewExpression(resolved.node)) {
      const callee = resolveRuntimeExpression(resolved.get('callee'));
      if (t.isFunction(callee.node) && callee.node.returnType) {
        const params = generatorTypeParams(unwrapTypeAnnotation(callee.node.returnType), callee.scope);
        if (params?.[paramIndex]) return resolveTypeAnnotation(params[paramIndex], callee.scope);
      }
    }
    return null;
  }

  function resolveNodeTypeExpression(path) {
    // polyfill-side transformations (memoized optional-chain refs, chained conditional
    // wrappers, destructure-extracted helpers) stash a pre-mutation type hint on the node
    // so downstream type resolution can recover the original receiver type even after the
    // expression has been rewritten. check the hint BEFORE resolvePath - synthesized refs
    // (`_ref` from babel-compat optional-chain memoization) carry the hint on the cloned
    // Identifier; if resolvePath ever found a meaningful binding init, the hint stashed
    // on the cloned identifier itself would be lost
    if (path.node.coreJSResolvedType) return typeFromHint(path.node.coreJSResolvedType);
    path = resolvePath(path);
    if (path.node.coreJSResolvedType) return typeFromHint(path.node.coreJSResolvedType);

    switch (babelNodeType(path.node)) {
      // ESTree wraps optional chains in ChainExpression, preserves parentheses - unwrap
      case 'ChainExpression':
        return resolveNodeType(path.get('expression'));
      case 'Identifier':
        return resolvePrototypeAsInstance(path) || resolveKnownGlobalReference(path);
      case 'NullLiteral':
        return new $Primitive('null');
      case 'StringLiteral':
      case 'TemplateLiteral':
        return new $Primitive('string');
      case 'NumericLiteral':
        return new $Primitive('number');
      case 'BigIntLiteral':
        return new $Primitive('bigint');
      case 'BooleanLiteral':
        return new $Primitive('boolean');
      case 'RegExpLiteral':
        return new $Object('RegExp');
      case 'ObjectExpression':
        return new $Object('Object');
      case 'ArrayExpression':
        return new $Object('Array', resolveArrayLiteralCommonType(path));
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'ClassExpression':
      case 'ClassDeclaration':
        return new $Object('Function');
      case 'ThisExpression': {
        const context = resolveThisClass(path);
        if (context) return resolveClassInheritance(context.classPath) || new $Object('Object');
        return null;
      }
      case 'NewExpression': {
        const callee = path.get('callee');
        const name = resolveGlobalName(callee);
        if (name) {
          return resolveConstructorType(name, path) || new $Object(name);
        }
        {
          const resolved = resolveRuntimeExpression(callee);
          if (t.isClass(resolved.node)) return resolveClassInheritance(resolved) || new $Object('Object');
        }
        return new $Object(null);
      }
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        return resolveFromMemberExpression(path)
          || resolveArrayIndexAccess(path)
          || resolveKnownPropertyReturnType(path)
          || resolveGlobalStaticReference(path)
          || resolvePrototypeAsInstance(path)
          || resolveKnownGlobalReference(path);
      case 'CallExpression':
      case 'OptionalCallExpression': {
        // coreJSResolvedType short-circuit handled at the top of resolveNodeTypeExpression
        const callee = path.get('callee');
        const name = resolveGlobalName(callee);
        if (name) {
          // known constructor called without `new`: String(), Array(), etc.
          const known = resolveConstructorCallType(name, path);
          if (known) return known;
          // known global function: parseInt(), parseFloat(), etc.
          if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_METHOD_RETURN_TYPES[name]);
        }
        if (t.isImport(callee.node)) return new $Object('Promise');
        return resolveCallReturnType(callee);
      }
      // ESTree: import('foo') is ImportExpression (not CallExpression with Import callee)
      case 'ImportExpression':
        return new $Object('Promise');
      // tagged templates are semantically calls: String.raw`foo` ==== String.raw(...)
      case 'TaggedTemplateExpression':
        return resolveCallReturnType(path.get('tag'));
      case 'UnaryExpression':
        switch (path.node.operator) {
          case 'void':
            return new $Primitive('undefined');
          case 'typeof':
            return new $Primitive('string');
          case '!':
          case 'delete':
            return new $Primitive('boolean');
          // unary + throws on BigInt, result is always Number
          case '+':
            return new $Primitive('number');
          // unary - and ~ work on both Number and BigInt, preserving the type
          case '-':
          case '~':
            return resolveNumericType(path.get('argument'));
        }
        return null;
      case 'UpdateExpression':
        // ++ and -- work on both Number and BigInt, preserving the type
        return resolveNumericType(path.get('argument'));
      case 'BinaryExpression':
        switch (path.node.operator) {
          case '==':
          case '!=':
          case '===':
          case '!==':
          case '<':
          case '>':
          case '<=':
          case '>=':
          case 'instanceof':
          case 'in':
            return new $Primitive('boolean');
          default:
            return resolveBinaryOperatorType(path.node.operator, path.get('left'), path.get('right'));
        }
      case 'SequenceExpression': {
        const expressions = path.get('expressions');
        if (expressions.length) return resolveNodeType(expressions.at(-1));
        return null;
      }
      case 'AssignmentExpression':
        switch (path.node.operator) {
          case '=':
            return resolveNodeType(path.get('right'));
          case '||=':
          case '&&=':
          case '??=':
            return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
          default:
            return resolveBinaryOperatorType(path.node.operator.slice(0, -1), path.get('left'), path.get('right'));
        }
      case 'ConditionalExpression':
        // Babel desugars destructuring defaults as: _ref === void 0 ? DEFAULT : _ref
        // when one branch is a void-0 check and the other is the same identifier, resolve to the default branch
        return resolveDesugarDefaultTernary(path)
          || resolveUnionType(path.get('consequent'), path.get('alternate'), '?:');
      case 'LogicalExpression':
        return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
      case 'ParenthesizedExpression':
        return resolveNodeType(path.get('expression'));
      case 'TSAsExpression':
      case 'TSTypeAssertion':
      case 'TypeCastExpression':
        return resolveTypeAnnotation(path.node.typeAnnotation, path.scope) || resolveNodeType(path.get('expression'));
      case 'TSSatisfiesExpression':
        return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation, path.scope);
      case 'TSNonNullExpression':
      case 'TSInstantiationExpression':
        return resolveNodeType(path.get('expression'));
      case 'AwaitExpression': {
        const argument = path.get('argument');
        const type = resolveNodeType(argument);
        // await on non-Promise value returns the value type unchanged
        if (type && type.constructor !== 'Promise') return type;
        // recursively unwrap Promise<Promise<...T>> -> T
        const resolved = unwrapPromise(type);
        if (resolved && resolved !== type) return resolved;
        // try to unwrap Promise<T> from type annotation on the awaited expression
        const annotationInfo = findExpressionAnnotation(argument);
        if (annotationInfo) {
          const annotation = unwrapTypeAnnotation(annotationInfo.annotation);
          if (annotation && typeRefName(annotation) === 'Promise') {
            const inner = getTypeArgs(annotation)?.params[0];
            if (inner) return resolveTypeAnnotation(inner, annotationInfo.scope);
          }
        }
        return null;
      }
      case 'YieldExpression': {
        const fnPath = path.getFunctionParent();
        if (!fnPath?.node.generator) return null;
        if (path.node.delegate) {
          // yield* delegates to an iterable; result is the delegated iterator's TReturn (params[1])
          return resolveGeneratorTypeParam(path.get('argument'), 1);
        }
        // yield evaluates to the value passed to generator.next(value) = TNext (params[2])
        const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
        if (params?.[2]) return resolveTypeAnnotation(params[2], fnPath.scope);
        return null;
      }
    }
    return null;
  }

  // --- Function return types ---
  // resolve parameter type from call-site argument, default value, or rest-element shape
  function resolveParamType(binding, fnPath, callPath) {
    const { params } = fnPath.node;
    const args = callPath.get('arguments');
    for (let i = 0; i < params.length; i++) {
      if (params[i].type === 'RestElement') {
        if (params[i] === binding.path.node) return new $Object('Array');
        continue;
      }
      if (params[i] !== binding.path.node) continue;
      // argument provided at call site - resolve its type
      if (i < args.length) return resolveNodeType(args[i]);
      // no argument - resolve from the default value
      if (params[i].type === 'AssignmentPattern') return resolveNodeType(fnPath.get('params')[i].get('right'));
      return null;
    }
    return null;
  }

  // resolve expression type within a function body, with fallback to call-site parameter inference
  function resolveBodyExpr(path, fnPath, callPath) {
    const type = resolveNodeType(path);
    if (type) return type;
    if (!callPath) return null;
    const resolved = resolvePath(path);
    if (!t.isIdentifier(resolved.node)) return null;
    const binding = resolved.scope?.getBinding(resolved.node.name);
    if (!binding || binding.constantViolations?.length) return null;
    return resolveParamType(binding, fnPath, callPath);
  }

  // collect return statement paths from a block body, skipping nested functions
  // per JS spec, `return` in `finally` always overrides `return` in the try/catch
  // of the same TryStatement - this is handled per-TryStatement, not globally,
  // so returns outside a try-finally are unaffected
  function collectReturnPaths(blockPath) {
    const getChildren = (path, key) => Array.isArray(path.node[key]) ? path.get(key) : [path.get(key)];
    const collect = (path, depth = 0) => {
      if (depth > MAX_DEPTH || !path.node || t.isFunction(path.node)) return [];
      if (t.isReturnStatement(path.node)) return [path];
      const { node } = path;
      // TryStatement: if finally has returns, they override try/catch returns
      if (node.type === 'TryStatement') {
        const finalizerReturns = node.finalizer ? collect(path.get('finalizer'), depth + 1) : [];
        if (finalizerReturns.length) return finalizerReturns;
        const result = [];
        if (node.block) for (const r of collect(path.get('block'), depth + 1)) result.push(r);
        if (node.handler) for (const r of collect(path.get('handler'), depth + 1)) result.push(r);
        return result;
      }
      // recurse into block/control-flow children
      const result = [];
      if (node.body) for (const p of getChildren(path, 'body')) for (const r of collect(p, depth + 1)) result.push(r);
      if (node.consequent) for (const p of getChildren(path, 'consequent')) for (const r of collect(p, depth + 1)) result.push(r);
      if (node.alternate) for (const r of collect(path.get('alternate'), depth + 1)) result.push(r);
      if (node.cases) for (const p of path.get('cases')) for (const r of collect(p, depth + 1)) result.push(r);
      return result;
    };
    const result = [];
    for (const stmt of blockPath.get('body')) for (const r of collect(stmt)) result.push(r);
    return result;
  }

  function resolveBodyReturnType(fnPath, callPath) {
    const body = fnPath.get('body');
    // arrow with expression body: () => [1, 2, 3]
    if (!t.isBlockStatement(body.node)) return resolveBodyExpr(body, fnPath, callPath);
    // block body: collect return statements, skip nested functions
    let result = null;
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      const type = arg.node ? resolveBodyExpr(arg, fnPath, callPath) : new $Primitive('undefined');
      if (!type) return null;
      // skip nullable/never returns - common in catch bail-outs like `catch { return; }`
      // consistent with how resolveConditionalBranches handles `never` branches
      if (isNullableOrNever(type)) continue;
      const merged = commonType(result, type);
      if (result && !merged) return null;
      result = merged;
    }
    return result ?? new $Primitive('undefined');
  }

  // check whether a type annotation AST node references any type parameter from the given set
  function hasTypeParamReference(node, typeParamNames, depth) {
    if (depth > MAX_DEPTH) return false;
    node = unwrapTypeAnnotation(node);
    if (!node) return false;
    switch (babelNodeType(node)) {
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (name && typeParamNames.has(name)) return true;
        const params = getTypeArgs(node)?.params;
        if (params) for (const param of params) {
          if (hasTypeParamReference(param, typeParamNames, depth + 1)) return true;
        }
        return false;
      }
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
      case 'TSUnionType':
      case 'UnionTypeAnnotation':
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation':
        for (const member of node.types) {
          if (hasTypeParamReference(member, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSTupleType':
      case 'TupleTypeAnnotation':
        for (const element of tupleElements(node) || []) {
          const actual = element.type === 'TSNamedTupleMember' ? element.elementType : element;
          if (hasTypeParamReference(actual, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSConditionalType':
        return hasTypeParamReference(node.checkType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.extendsType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.trueType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.falseType, typeParamNames, depth + 1);
      case 'TSNamedTupleMember':
        return hasTypeParamReference(node.elementType, typeParamNames, depth + 1);
      case 'TSIndexedAccessType':
        return hasTypeParamReference(node.objectType, typeParamNames, depth + 1)
          || hasTypeParamReference(node.indexType, typeParamNames, depth + 1);
      case 'TSTypeOperator':
      case 'TSRestType':
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
      case 'TSTypeLiteral':
        for (const member of node.members) {
          if (hasTypeParamReference(member.typeAnnotation, typeParamNames, depth + 1)) return true;
          if (hasTypeParamReference(member.returnType, typeParamNames, depth + 1)) return true;
        }
        return false;
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'FunctionTypeAnnotation':
        return hasTypeParamReference(node.returnType ?? node.typeAnnotation, typeParamNames, depth + 1);
      // mapped type carries the constraint (`K in keyof T`) and body (`T[K]`); both can
      // reference type params. without this branch an outer function returning a raw
      // mapped type (not wrapped in TSTypeReference) skips substitution and loses inner
      case 'TSMappedType':
        return (node.typeParameter && hasTypeParamReference(node.typeParameter.constraint, typeParamNames, depth + 1))
          || hasTypeParamReference(node.typeAnnotation, typeParamNames, depth + 1);
      // `typeof x` references the type of a value binding; when x itself is typed by
      // a type param (rare: `declare const x: T; typeof x`), substitution is needed
      case 'TSTypeQuery':
        return typeof node.exprName?.name === 'string' && typeParamNames.has(node.exprName.name);
    }
    return false;
  }

  // extract inner type parameter name from a container annotation: T[] -> T, Array<T> -> T, Set<T> -> T, Promise<T> -> T, etc.
  function innerTypeParamName(annotation, refName) {
    // T[] syntax
    if (annotation.type === 'TSArrayType' || annotation.type === 'ArrayTypeAnnotation') {
      return typeRefName(annotation.elementType);
    }
    // Container<T>: Set<T>, Promise<T>, Iterator<T>, Array<T>, ReadonlyArray<T>, etc.
    if (refName && (SINGLE_ELEMENT_COLLECTIONS.has(refName) || refName === 'Promise')) {
      const typeArgs = getTypeArgs(annotation)?.params;
      if (typeArgs?.length >= 1) return typeRefName(typeArgs[0]);
    }
    return null;
  }

  // sidecar map (typeParamMap -> paramName -> arg NodePath) so indexed-access resolution
  // can inspect the actual call arg - the declared constraint is usually broader.
  // WeakMap auto-clears and avoids a banned custom property on `Map.prototype`
  let typeParamArgPaths = new WeakMap();

  // Map<string, Type> of type parameter bindings inferred from call-site arguments
  function buildTypeParamMap(typeParamNames, fnPath, callPath) {
    const typeParamMap = new Map();
    const argPaths = new Map();
    typeParamArgPaths.set(typeParamMap, argPaths);
    // phase 0: explicit type arguments at call site: foo<string>(...)
    const callTypeArgs = getTypeArgs(callPath.node)?.params;
    if (callTypeArgs) {
      const fnTypeParams = fnPath.node.typeParameters?.params;
      if (!fnTypeParams) return typeParamMap;
      for (let i = 0; i < fnTypeParams.length && i < callTypeArgs.length; i++) {
        const name = typeParamName(fnTypeParams[i]);
        if (!typeParamMap.has(name)) {
          const resolved = resolveTypeAnnotation(callTypeArgs[i], callPath.scope);
          if (resolved) typeParamMap.set(name, resolved);
        }
      }
    }
    const args = callPath.get('arguments');
    const { params } = fnPath.node;
    // phase 1: match param annotations against type parameter names
    for (let i = 0; i < params.length && i < args.length; i++) {
      const { param, isRest } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param.typeAnnotation);
      if (!paramAnnotation) continue;
      const name = typeRefName(paramAnnotation);
      // rest-only generic `function fn<T>(...xs: T[])` - annotation is T[] or Array<T>, bind T
      // to the element type of the first rest-arg. spread-call `fn(...arr)` passes `args[0]`
      // as a SpreadElement whose overall type IS the array - unwrap once to get the element.
      // no more params possible after rest, so break regardless
      if (isRest) {
        const elementParamName = innerTypeParamName(paramAnnotation, name);
        if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
          const arg = args[i];
          const isSpread = arg.node?.type === 'SpreadElement';
          const resolved = isSpread ? resolveInnerType(resolveNodeType(arg.get('argument'))) : resolveNodeType(arg);
          if (resolved) typeParamMap.set(elementParamName, resolved);
        }
        break;
      }
      // direct: param type is exactly T
      if (name && typeParamNames.has(name) && !typeParamMap.has(name)) {
        const resolved = resolveNodeType(args[i]);
        if (resolved) {
          typeParamMap.set(name, resolved);
          argPaths.set(name, args[i]);
        }
        continue;
      }
      // container wrapper: param type is T[], Array<T>, Set<T>, Promise<T>, etc.
      const elementParamName = innerTypeParamName(paramAnnotation, name);
      if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
        const elementType = resolveInnerType(resolveNodeType(args[i]));
        if (elementType) typeParamMap.set(elementParamName, elementType);
      }
    }
    // phase 2: default / constraint fallback for unresolved type params (TS binds to `default`
    // when call-site omits a type arg; constraint is only the upper bound, usually over-broad).
    // route through `substituteTypeParams` (not bare `resolveTypeAnnotation`) so a default that
    // references an earlier type param picks up the already-resolved binding, e.g.
    // `function f<T = string, U = T>(t: T): U` called as `f<number[]>(...)` resolves U to
    // number[] (T's user-supplied value) instead of T.default=string. order matters: phase 1
    // populates T from the explicit arg before phase 2 fills U
    for (const typeParam of fnPath.node.typeParameters.params) {
      const name = typeParamName(typeParam);
      if (typeParamMap.has(name)) continue;
      const annotation = typeParam.default ?? typeParam.constraint;
      if (annotation) {
        const resolved = substituteTypeParams(annotation, typeParamMap, fnPath.scope, 0);
        if (resolved) typeParamMap.set(name, resolved);
      }
    }
    return typeParamMap;
  }

  // resolve a type annotation substituting type parameters from the map.
  // `seen` is the decl-set guard threaded from `resolveUserDefinedType` so body
  // recursion into the same alias short-circuits instead of CPU-burning up to MAX_DEPTH.
  // `typeParamMap` defensive null-guard: callers pass Map, but some recursive entry
  // points (`resolveInferElementPattern` with null ctx) would crash on `.has()` otherwise
  // `typeParamMap` null degrades to plain type-annotation resolution (some recursive
  // entry points like `resolveInferElementPattern` with null ctx would crash on `.has()`).
  // eslint-disable-next-line max-statements -- 51 lines after defensive null-guard addition
  function substituteTypeParams(node, typeParamMap, scope, depth, seen) {
    if (depth > MAX_DEPTH) return null;
    if (!typeParamMap) return resolveTypeAnnotation(node, scope, depth);
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    // direct type parameter reference or known type with substituted inner
    if (node.type === 'TSTypeReference' || node.type === 'GenericTypeAnnotation') {
      const name = typeRefName(node);
      if (name && typeParamMap.has(name)) return typeParamMap.get(name);
      if (name) {
        // substitute type params in container inner types: Array<T>, Promise<T>, etc.
        const ctor = resolveKnownConstructor(name);
        const known = resolveKnownContainerType(name, ctor, node,
          p => substituteTypeParams(p, typeParamMap, scope, depth + 1, seen));
        if (known) return known;
        // user-defined type alias / interface: propagate type parameter substitutions.
        // resolveNamedType also sees the map so utility types (`Awaited<T>`, `NonNullable<T>`,
        // `Extract<T,U>`, etc.) resolve their args against the caller's T/U binding
        return resolveUserDefinedType(name, node, scope, depth, typeParamMap, seen)
          ?? resolveNamedType(name, node, scope, depth, typeParamMap, seen);
      }
      return null;
    }
    // union: T | null, T | undefined - strip nullable, substitute T
    if (node.type === 'TSUnionType' || node.type === 'UnionTypeAnnotation') {
      return foldUnionTypes(node.types, member => substituteTypeParams(member, typeParamMap, scope, depth + 1, seen));
    }
    // intersection: T & { extra: boolean } - skip plain $Object('Object') from type literals, rest must agree
    if (node.type === 'TSIntersectionType' || node.type === 'IntersectionTypeAnnotation') {
      return foldIntersectionTypes(node.types, member => substituteTypeParams(member, typeParamMap, scope, depth + 1, seen));
    }
    // transparent wrappers: (T), T?, readonly T[], etc.
    if (node.type === 'TSOptionalType' || node.type === 'TSParenthesizedType' || node.type === 'NullableTypeAnnotation'
      || (node.type === 'TSTypeOperator' && node.operator !== 'keyof')) {
      return substituteTypeParams(node.typeAnnotation, typeParamMap, scope, depth + 1, seen);
    }
    // conditional type: T extends U ? X : Y - substitute in branches. narrow infer-pattern
    // support handles the common `T extends (infer U)[] ? U : never` / `T extends Array<infer U> ? U : never`
    // shapes by short-circuiting to the checkType's element type. anything more complex
    // (nested infers, Promise unwrap chains) falls back to branch-folding without binding
    if (node.type === 'TSConditionalType') {
      const inferred = resolveInferElementPattern(node, typeParamMap, scope, depth, seen);
      if (inferred) return inferred;
      return resolveConditionalBranches(
        substituteTypeParams(node.trueType, typeParamMap, scope, depth + 1, seen),
        substituteTypeParams(node.falseType, typeParamMap, scope, depth + 1, seen));
    }
    // T[] -> Array with substituted element type
    if (node.type === 'TSArrayType' || node.type === 'ArrayTypeAnnotation') {
      const inner = substituteTypeParams(node.elementType, typeParamMap, scope, depth + 1, seen);
      return new $Object('Array', inner && !isNullableOrNever(inner) ? inner : null);
    }
    // [T, U] - resolve to Array, compute inner type if all elements agree
    if (node.type === 'TSTupleType' || node.type === 'TupleTypeAnnotation') {
      const elements = tupleElements(node);
      return new $Object('Array', elements?.length
        ? resolveTupleInner(elements, e => substituteTypeParams(e, typeParamMap, scope, depth + 1, seen))
        : null);
    }
    // T["key"] or T[number] - resolve indexed access, substituting type params in the object type
    if (node.type === 'TSIndexedAccessType') {
      const objParamName = typeRefName(node.objectType);
      if (objParamName && typeParamMap.has(objParamName)) {
        // T[number] - element type from the substituted container
        if (node.indexType?.type === 'TSNumberKeyword') {
          const inner = resolveInnerType(typeParamMap.get(objParamName));
          if (inner) return inner;
        }
        // T["key"] - try the concrete call arg before falling back to the declared constraint
        // (e.g. <T extends object>(o: T): T['k'] with arg `{ k: [1] }` narrows `k` to Array)
        const key = indexedAccessKey(node.indexType);
        if (key !== null) {
          const argPath = typeParamArgPaths.get(typeParamMap)?.get(objParamName);
          const propType = argPath && resolveObjectLiteralProperty(argPath, key);
          if (propType) return propType;
        }
        const paramInfo = findTypeParameter(objParamName, scope);
        if (paramInfo?.constraint) {
          const syntheticNode = { type: 'TSIndexedAccessType', objectType: paramInfo.constraint, indexType: node.indexType };
          return resolveTypeAnnotation(syntheticNode, paramInfo.scope, depth);
        }
      }
      return resolveTypeAnnotation(node, scope, depth);
    }
    // function type: (x: T) => R / new () => T - always Function regardless of type parameters
    if (node.type === 'TSFunctionType' || node.type === 'TSConstructorType'
      || node.type === 'FunctionTypeAnnotation') return new $Object('Function');
    // mapped type: { [K in keyof T]: V } - structural, can't derive concrete type
    if (node.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(node);
      // passthrough body references the mapped-over type param by name; delegate back to
      // substituteTypeParams so `{T->string[]}` subst survives into `T`-ref inside the body.
      // using resolveTypeAnnotation here would drop the map and collapse precise Array
      // receiver types to generic `$Object(null)` via `Copy<string[]>.at(...)` chains
      if (passthrough) return substituteTypeParams(passthrough, typeParamMap, scope, depth + 1, seen);
      return new $Object(null);
    }
    // fallback to regular annotation resolution
    return resolveTypeAnnotation(node, scope, depth);
  }

  // resolve return type of a function, inferring generic type parameters from call-site arguments
  function resolveReturnType(fnPath, callPath) {
    // generator functions return iterators, async generators return async iterators
    // yield type is extracted from Generator<TYield>/AsyncGenerator<TYield> annotation if present
    if (fnPath.node.generator) {
      const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
      let inner = params?.[0] ? resolveTypeAnnotation(params[0], fnPath.scope) : null;
      // substitute generic type parameters from call site into the yield type
      if (!inner && params?.[0] && callPath && fnPath.node.typeParameters?.params?.length) {
        const typeParamNames = new Set();
        for (const p of fnPath.node.typeParameters.params) typeParamNames.add(typeParamName(p));
        if (hasTypeParamReference(params[0], typeParamNames, 0)) {
          const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
          if (typeParamMap.size > 0) inner = substituteTypeParams(params[0], typeParamMap, fnPath.scope, 0);
        }
      }
      return new $Object(fnPath.node.async ? 'AsyncIterator' : 'Iterator', inner && !isNullableOrNever(inner) ? inner : null);
    }
    const { returnType, typeParameters } = fnPath.node;
    // infer generic type parameters and substitute into return type
    if (returnType && callPath && typeParameters?.params?.length) {
      const returnAnnotation = unwrapTypeAnnotation(returnType);
      const typeParamNames = new Set();
      for (const p of typeParameters.params) typeParamNames.add(typeParamName(p));
      if (hasTypeParamReference(returnAnnotation, typeParamNames, 0)) {
        const typeParamMap = buildTypeParamMap(typeParamNames, fnPath, callPath);
        if (typeParamMap.size > 0) {
          const substituted = substituteTypeParams(returnAnnotation, typeParamMap, fnPath.scope, 0);
          if (substituted) {
            if (fnPath.node.async && substituted.constructor !== 'Promise') return new $Object('Promise', substituted);
            return substituted;
          }
        }
      }
    }
    // try return type annotation
    if (returnType) {
      const resolved = resolveTypeAnnotation(returnType, fnPath.scope);
      if (resolved) {
        // Flow allows async functions with non-Promise return annotations (e.g. async function(): string)
        if (fnPath.node.async && resolved.constructor !== 'Promise') return new $Object('Promise', resolved);
        return resolved;
      }
    }
    // fallback: analyze return statements in the function body
    const bodyType = resolveBodyReturnType(fnPath, callPath);
    // async functions always return a Promise, even if body return type is unresolvable
    if (fnPath.node.async) {
      if (!bodyType) return new $Object('Promise');
      if (bodyType.constructor !== 'Promise') return new $Object('Promise', bodyType);
    }
    return bodyType;
  }

  // --- Class / object member resolvers ---
  // resolve `this` to the enclosing class context
  function resolveThisClass(path) {
    let current = path;
    while (current = current.parentPath) {
      // direct child of ClassBody - this is a class member
      if (t.isClassBody(current.parentPath?.node)) {
        const classPath = current.parentPath.parentPath;
        if (t.isClass(classPath?.node)) return { classPath, isStatic: !!current.node.static || current.node.type === 'StaticBlock' };
        return null;
      }
      // non-arrow function rebinds `this` - but skip ESTree MethodDefinition's wrapper FunctionExpression
      if (t.isFunction(current.node) && !t.isArrowFunctionExpression(current.node)) {
        // ESTree: MethodDefinition wraps body in FunctionExpression - don't stop here
        if (current.parentPath?.node?.type === 'MethodDefinition' || current.parentPath?.node?.type === 'Property') continue;
        return null;
      }
    }
    return null;
  }

  // resolve a class's superClass identifier to a declaration path, handling both real
  // (`class C extends Parent`) and ambient (`declare class Parent`) forms. returns null
  // for non-Identifier or unresolvable super heads
  function resolveSuperClassPath(classPath) {
    const superClass = classPath.get('superClass');
    if (!superClass.node) return null;
    const resolved = resolveRuntimeExpression(superClass);
    if (t.isClass(resolved.node)) return resolved;
    if (t.isIdentifier(superClass.node)) {
      // accept both TS `declare class` (ClassDeclaration{declare:true}) and Flow
      // `declare class X {...}` (DeclareClass node) - both describe the parent's surface
      // for type-flow analysis, even though only the TS form is currently common
      const ambient = findAmbientDeclarationPath(superClass.node.name, superClass.scope, isAmbientClassNode);
      if (ambient?.node.type === 'ClassDeclaration' || ambient?.node.type === 'DeclareClass') return ambient;
    }
    return null;
  }

  function resolveClassContext(objectPath) {
    // Foo.staticProp - object is the class itself
    if (t.isClass(objectPath.node)) return { classPath: objectPath, isStatic: true };
    // new Foo().prop - object is a class instance
    if (t.isNewExpression(objectPath.node)) {
      const classPath = resolveRuntimeExpression(objectPath.get('callee'));
      if (t.isClass(classPath.node)) return { classPath, isStatic: false };
    }
    // this.prop inside a class member
    if (t.isThisExpression(objectPath.node)) return resolveThisClass(objectPath);
    // super.prop inside a class member - resolve to parent class; isStatic inherits the
    // enclosing method's context (`static m() { super.x }` -> parent static; instance -> instance)
    if (objectPath.node?.type === 'Super') {
      const thisCtx = resolveThisClass(objectPath);
      const parentPath = thisCtx && resolveSuperClassPath(thisCtx.classPath);
      return parentPath ? { classPath: parentPath, isStatic: thisCtx.isStatic } : null;
    }
    return null;
  }

  function findClassMember(classPath, name, isStatic, depth = 0, visited = undefined) {
    if (depth > MAX_DEPTH) return null;
    // walk in reverse: in JS, duplicate method names are legal and the runtime uses the last definition
    // `findObjectMember` does the same; both must agree.
    const members = classPath.get('body').get('body');
    for (let i = members.length - 1; i >= 0; i--) {
      const member = members[i];
      if (member.node.computed) continue;
      if (!keyMatchesName(member.node.key, name)) continue;
      if (!!member.node.static !== isStatic) continue;
      if (member.node.kind === 'set') continue;
      return member;
    }
    // `class A extends B; class B extends A` cycle: MAX_DEPTH bottoms out via 64-frame
    // CPU-burn. visited Set on class nodes short-circuits at the second visit (parallels
    // `collectClassLikeMembers`'s `seen` and the type-alias decl-set guard)
    const seen = visited ?? new Set();
    if (seen.has(classPath.node)) return null;
    seen.add(classPath.node);
    const parentPath = resolveSuperClassPath(classPath);
    return parentPath ? findClassMember(parentPath, name, isStatic, depth + 1, seen) : null;
  }

  // single returned expression as a path - used to resolve getters like properties
  function resolveBodyReturnValue(fnPath) {
    const body = fnPath.get('body');
    if (!t.isBlockStatement(body.node)) return resolveRuntimeExpression(body);
    let result = null;
    let resultType; // lazy: only resolved once, on first cross-node compare
    for (const returnPath of collectReturnPaths(body)) {
      const arg = returnPath.get('argument');
      if (!arg.node) return null;
      const value = resolveRuntimeExpression(arg);
      if (!value) return null;
      if (result === null || result.node === value.node) {
        result = value;
        continue;
      }
      // distinct nodes - accept only on matching resolved type (e.g. two `return [1,2,3]`)
      if (resultType === undefined) resultType = resolveNodeType(result);
      if (!resultType) return null;
      const valueType = resolveNodeType(value);
      if (!valueType || !typesEqual(resultType, valueType)) return null;
    }
    return result;
  }

  function resolveClassMember(classPath, name, isStatic, callPath) {
    const member = findClassMember(classPath, name, isStatic);
    if (member) return resolveClassMemberNode(member, callPath);
    // TS declaration merging: sibling `interface X { ... }` contributes instance members
    // to the class type. runs only when the class body has no match, so real class methods
    // always win on collision (matches TS semantics)
    if (!isStatic && classPath.node.id?.name) {
      return resolveMergedInterfaceMember(classPath.node.id.name, classPath.scope, name, callPath);
    }
    return null;
  }

  // babel splits public/private/accessor into distinct types; ESTree uses MethodDefinition /
  // PropertyDefinition with a PrivateIdentifier key. collapse both shapes to one predicate per
  // category so resolveClassMemberNode doesn't miss private members
  const isMethodMember = n => t.isClassMethod(n) || t.isClassPrivateMethod?.(n);
  const isPropertyMember = n => t.isClassProperty(n) || t.isClassAccessorProperty(n) || t.isClassPrivateProperty?.(n);

  // ESTree MethodDefinition / ObjectMethod wrap the function in `.value`; babel ClassMethod /
  // ClassPrivateMethod carry body and params directly on the member. caller pre-filters to
  // method shapes; helper just picks the path that owns the function body
  function methodFnPath(memberPath) {
    const value = memberPath.get('value');
    return value?.node ? value : memberPath;
  }

  function resolveClassMemberNode(member, callPath) {
    const methodFn = isMethodMember(member.node) ? methodFnPath(member) : null;
    // TSDeclareMethod (ambient `declare class` body) has no body - only the return-type
    // annotation is available for resolution
    const declaredReturn = member.node.type === 'TSDeclareMethod' ? member.node.returnType : null;
    if (callPath) {
      if (methodFn) {
        if (member.node.kind !== 'get') return resolveReturnType(methodFn, callPath);
        // getter call: resolve like property - get the returned value, if callable -> call it
        const value = resolveBodyReturnValue(methodFn);
        if (t.isFunction(value?.node)) return resolveReturnType(value, callPath);
      } else if (declaredReturn) {
        return resolveTypeAnnotation(declaredReturn, member.scope);
      } else if (isPropertyMember(member.node)) {
        const value = resolveRuntimeExpression(member.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath);
      }
      return null;
    }
    // property access: foo.bar or foo.#bar
    if (isPropertyMember(member.node)) {
      if (member.node.typeAnnotation) return resolveTypeAnnotation(member.node.typeAnnotation, member.scope);
      return resolveClassFieldType(member);
    }
    // method: getter returns its return type, regular method returns Function
    if (methodFn) return member.node.kind === 'get' ? resolveReturnType(methodFn) : new $Object('Function');
    if (declaredReturn) return new $Object('Function');
    return null;
  }

  // mutable field - init alone is unsound (sentinel `#x = null` + later `this.#x = arr()`).
  // fold init + every assignment to the field; all-nullable collapses to unknown so the
  // nullable-receiver short-circuit in `resolveCallReturnType` doesn't skip polyfill emission.
  // private (`#x`) is scope-closed; public / auto-accessor are externally writable, so we also
  // fold subclass `this.<field>` writes and module-wide `<expr>.<field> = Y` whose receiver
  // looks like `new ClassName(...)`. anonymous class expressions bail to unknown
  let classFieldTypeCache = new WeakMap();
  function resolveClassFieldType(member) {
    if (classFieldTypeCache.has(member.node)) return classFieldTypeCache.get(member.node);
    // seed the sentinel before scanning so cross-referencing fields
    // (`this.a = this.b; this.b = this.a`) bail to unknown instead of recursing forever
    classFieldTypeCache.set(member.node, null);
    const fieldName = getKeyName(member.node.key);
    if (!fieldName) return null;
    const candidates = collectClassFieldCandidates(member, fieldName);
    const result = candidates ? foldNonNullableCommon(candidates) : null;
    classFieldTypeCache.set(member.node, result);
    return result;
  }

  // gather every type that could flow into `fieldName` on an instance. null signals
  // "unknown writer set" (anonymous OR exported public class) - caller treats as no inference
  function collectClassFieldCandidates(member, fieldName) {
    const classPath = member.parentPath.parentPath;
    const isPrivate = t.isClassPrivateProperty?.(member.node);
    // anonymous public class: external writes untrackable without a name. bail early,
    // before wasting work on init + class-internal scan that we can't soundly return
    const className = isPrivate ? null : classBindingName(classPath);
    if (!isPrivate && !className) return null;
    // exported public field: any consumer can `import { C }; C.field = whatever` (static)
    // or `(new C()).field = whatever` (instance). the writer set leaves the module - we
    // cannot enumerate it. private fields stay safe (`#x` not reachable through identity)
    if (!isPrivate && isClassExported(classPath)) return null;
    const candidates = [];
    const initPath = member.get('value');
    if (initPath.node) {
      const initType = resolveNodeType(initPath);
      if (initType) candidates.push(initType);
    }
    collectThisFieldAssignments(classPath, fieldName, candidates);
    if (isPrivate) return candidates;
    const program = findProgramPath(classPath);
    if (!program) return candidates;
    const index = getModuleFieldIndex(program);
    for (const sub of index.subclassesBySuper.get(className) ?? []) {
      collectThisFieldAssignments(sub, fieldName, candidates);
    }
    for (const writePath of index.writesByField.get(fieldName) ?? []) {
      pushIfExternalInstance(writePath, className, candidates);
    }
    return candidates;
  }

  // commonType-fold skipping nullable/never; collapse to null once union-incompatible so the
  // polyfill dispatch routes to the safe generic variant
  function foldNonNullableCommon(types) {
    let result = null;
    for (const cand of types) {
      if (isNullableOrNever(cand)) continue;
      result = result === null ? cand : commonType(result, cand);
      if (result === null) break;
    }
    return result;
  }

  // returns the receiver path of a `<receiver>.<fieldName>` write target (AssignmentExpression
  // .left or UpdateExpression .argument), or null when the target shape doesn't match. shared
  // by every write-flow handler so operator-specific dispatch keeps a uniform front gate.
  // dot-path `p.get('left.object')` is unsupported on unplugin's oxc-wrapped paths, so chain
  // two `.get` calls explicitly
  function fieldWriteReceiverPath(p, fieldName) {
    const targetPath = t.isAssignmentExpression(p.node) ? p.get('left') : p.get('argument');
    const target = targetPath.node;
    if (!t.isMemberExpression(target) || target.computed) return null;
    if (getKeyName(target.property) !== fieldName) return null;
    return targetPath.get('object');
  }

  // walk instance method bodies, folding in every `this.<field> = Y` assignment. traversal
  // skips function-like nodes that rebind `this` (regular fns, object methods, nested classes)
  // but descends into arrow functions (shared `this`). static members skip too: their `this`
  // is the class itself, unrelated to instance storage. compound assignments (`+=`, `-=`, ...)
  // and update expressions (`++`/`--`) can change type beyond what RHS alone reflects
  // (`#x = []; this.#x += 's'` -> string), so seed an `unknown` candidate that collapses the
  // fold to a generic instance dispatch
  function collectThisFieldAssignments(classPath, fieldName, out) {
    const handle = p => {
      const recv = fieldWriteReceiverPath(p, fieldName);
      if (!recv || !t.isThisExpression(recv.node)) return;
      if (t.isAssignmentExpression(p.node) && p.node.operator === '=') {
        const rhsType = resolveNodeType(p.get('right'));
        if (rhsType) out.push(rhsType);
      } else out.push(new $Primitive('unknown'));
    };
    for (const bodyMember of classPath.get('body').get('body')) {
      if (bodyMember.node.static || !isMethodMember(bodyMember.node)) continue;
      const body = methodFnPath(bodyMember).get('body');
      if (!body.node) continue;
      body.traverse({
        'FunctionDeclaration|FunctionExpression|ObjectMethod|ClassDeclaration|ClassExpression'(p) {
          p.skip();
        },
        AssignmentExpression: handle,
        UpdateExpression: handle,
      });
    }
  }

  // oxc-wrapped paths don't implement `findParent`; walk the chain directly so unplugin
  // and babel share this helper
  function findProgramPath(path) {
    let current = path;
    while (current && !t.isProgram(current.node)) current = current.parentPath;
    return current;
  }

  // class binding name for identity matching in the external-write scan. `class C {}` exposes
  // `id`; `const C = class {}` reuses the declarator name. anonymous shapes -> null (caller bails)
  function classBindingName(classPath) {
    if (classPath.node.id?.name) return classPath.node.id.name;
    const { parent } = classPath;
    if (t.isVariableDeclarator(parent) && parent.init === classPath.node) return parent.id?.name ?? null;
    return null;
  }

  // is this class reachable from outside the module? exported classes lose external-write
  // tracking - any importer can mutate public fields. covers three shapes:
  //   - direct: `export class C {}` / `export default class C {}`
  //   - via declarator: `export const C = class {}` / `export let C = class {}`
  //   - separate spec: `class C {}` ... `export { C }`
  // CommonJS (`module.exports.C = C`) currently NOT detected - usage-pure flows assume ESM
  let classExportedCache = new WeakMap();
  function isClassExported(classPath) {
    if (classExportedCache.has(classPath.node)) return classExportedCache.get(classPath.node);
    const result = computeClassExported(classPath);
    classExportedCache.set(classPath.node, result);
    return result;
  }
  function computeClassExported(classPath) {
    // adapters disagree on `t.isExport...` availability (estree-toolkit lacks them); use
    // string `.type` checks here to stay adapter-agnostic, same as ast-patterns helpers
    const parent = classPath.parentPath;
    const parentType = parent?.node?.type;
    if (parentType === 'ExportNamedDeclaration' || parentType === 'ExportDefaultDeclaration') return true;
    // class expression in `export const C = class {}`: parent VariableDeclarator,
    // grandparent VariableDeclaration, great-grandparent ExportNamedDeclaration
    if (parentType === 'VariableDeclarator' && parent.node.init === classPath.node
      && parent.parentPath?.parentPath?.node?.type === 'ExportNamedDeclaration') return true;
    // separate-spec export: scan program body for `export { C }` / `export { C as X }`
    const className = classBindingName(classPath);
    if (!className) return false;
    const program = findProgramPath(classPath);
    if (!program) return false;
    for (const stmt of program.node.body) {
      if (stmt.type !== 'ExportNamedDeclaration' || !stmt.specifiers) continue;
      for (const spec of stmt.specifiers) {
        if (spec.local?.name === className) return true;
      }
    }
    return false;
  }

  function isNewOfClass(node, className) {
    return t.isNewExpression(node) && t.isIdentifier(node.callee) && node.callee.name === className;
  }

  // does `<expr>` syntactically look like an instance of `className`? matches `new ClassName(...)`
  // or an Identifier bound to such init. user classes don't carry their name through
  // `resolveNodeType` (plain `new C()` resolves to `$Object('Object')`), so we pattern-match
  // directly. factory-returned / reassigned / annotation-only shapes stay outside the scan -
  // under-counting writes is the already-accepted conservative failure mode
  function receiverIsClassInstance(exprPath, className) {
    const { node } = exprPath;
    if (isNewOfClass(node, className)) return true;
    if (!t.isIdentifier(node)) return false;
    const init = exprPath.scope?.getBinding(node.name)?.path?.node?.init;
    return !!init && isNewOfClass(init, className);
  }

  // one pre-filtered write against an instance of `className`. `writePath` comes from the
  // per-program index, so operator/member/field-name filters are already satisfied; here
  // we just apply the instance-identity predicate and resolve the RHS
  function pushIfExternalInstance(writePath, className, out) {
    const objPath = writePath.get('left').get('object');
    if (t.isThisExpression(objPath.node)) return;
    if (!receiverIsClassInstance(objPath, className)) return;
    const rhsType = resolveNodeType(writePath.get('right'));
    if (rhsType) out.push(rhsType);
  }

  // precomputed per-module index for the module-wide flow scan. naive approach does two full
  // traversals per public field (subclasses + external writes), yielding O(fields x N). build
  // once, look up by name, turning the total into a single O(N) pass amortized across every
  // public field query in the module
  let moduleFieldIndexCache = new WeakMap();
  function getModuleFieldIndex(programPath) {
    const cached = moduleFieldIndexCache.get(programPath.node);
    if (cached) return cached;
    const writesByField = new Map();
    const subclassesBySuper = new Map();
    const pushMultimap = (map, key, value) => {
      const list = map.get(key);
      if (list) list.push(value);
      else map.set(key, [value]);
    };
    programPath.traverse({
      'ClassDeclaration|ClassExpression'(p) {
        const sup = p.node.superClass;
        if (t.isIdentifier(sup)) pushMultimap(subclassesBySuper, sup.name, p);
      },
      AssignmentExpression(p) {
        // only pure `=` is type-precise here: RHS value becomes the new field type.
        // compound (`+=` / `||=` / `??=` / `*=` ...) is operator-coerced - the resulting
        // type depends on BOTH operands and the operator's coercion rules, which the
        // candidate-union model can't represent (pushing RHS as a candidate is wrong:
        // for `+= 'x'` the field becomes `string` regardless of init, not `init | string`)
        if (p.node.operator !== '=') return;
        const { left } = p.node;
        if (!t.isMemberExpression(left) || left.computed) return;
        const name = getKeyName(left.property);
        if (name) pushMultimap(writesByField, name, p);
      },
    });
    const index = { writesByField, subclassesBySuper };
    moduleFieldIndexCache.set(programPath.node, index);
    return index;
  }

  // merged class+interface member lookup. interface body's own members first, then parents
  // via `extends` - `interface C extends A` lets `A.x` show up on `C` via declaration merging.
  // resolveMemberFromMembers does the per-member annotation -> type step
  function resolveMergedInterfaceMember(className, scope, name, callPath) {
    const interfaces = findAllTypeDeclarations(className, scope).filter(isInterfaceDeclaration);
    for (const iface of interfaces) {
      // TS: iface.body.body; Flow: iface.body.properties
      const ownBody = iface.body?.body ?? iface.body?.properties;
      const ownHit = resolveMemberFromMembers(ownBody, name, scope, callPath);
      if (ownHit) return ownHit;
      for (const parent of iface.extends ?? []) {
        const expr = extendsId(parent);
        if (!expr) continue;
        const parentRef = expr.type === 'Identifier'
          ? { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) }
          : expr;
        const parentMembers = getTypeMembers(parentRef, scope);
        if (!parentMembers) continue;
        const subst = buildParentSubst(parentRef, scope);
        const hit = resolveMemberFromMembers(
          subst ? parentMembers.map(m => substMemberAnnotations(m, subst)) : parentMembers,
          name, scope, callPath);
        if (hit) return hit;
      }
    }
    return null;
  }

  function resolveMemberFromMembers(members, name, scope, callPath) {
    if (!members) return null;
    for (const member of members) {
      if (member.computed) continue;
      if (!keyMatchesName(member.key, name)) continue;
      if (member.type === 'TSMethodSignature') {
        if (callPath) {
          const returnType = member.returnType ?? member.typeAnnotation;
          return returnType ? resolveTypeAnnotation(returnType, scope) : null;
        }
        return new $Object('Function');
      }
      if (member.type === 'TSPropertySignature' || member.type === 'ObjectTypeProperty') {
        const annotation = member.typeAnnotation ?? member.value;
        return annotation ? resolveTypeAnnotation(annotation, scope) : null;
      }
    }
    return null;
  }

  function findObjectMember(objectPath, name) {
    const properties = objectPath.get('properties');
    for (let i = properties.length - 1; i >= 0; i--) {
      const prop = properties[i];
      if (t.isSpreadElement(prop.node)) return null;
      if (!prop.node.computed && prop.node.kind !== 'set' && keyMatchesName(prop.node.key, name)) return prop;
    }
    return null;
  }

  function resolveObjectMember(objectPath, name, callPath) {
    const prop = findObjectMember(objectPath, name);
    if (!prop) return null;
    // method call: obj.foo()
    const propFn = t.isObjectMethod(prop.node) ? methodFnPath(prop) : null;
    if (callPath) {
      if (propFn) {
        if (prop.node.kind !== 'get') return resolveReturnType(propFn, callPath);
        // getter call: resolve like property - get the returned value, if callable -> call it
        const value = resolveBodyReturnValue(propFn);
        if (t.isFunction(value?.node)) return resolveReturnType(value, callPath);
      } else if (t.isObjectProperty(prop.node)) {
        const value = resolveRuntimeExpression(prop.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath);
      }
      return null;
    }
    // property access: obj.foo
    if (t.isObjectProperty(prop.node)) return resolveNodeType(prop.get('value'));
    // method: getter returns its return type, regular method returns Function
    if (propFn) return prop.node.kind === 'get' ? resolveReturnType(propFn) : new $Object('Function');
    return null;
  }

  // extract the return type annotation from a method/property call signature
  function memberCallReturnAnnotation(member) {
    switch (member.type) {
      // Babel: TSMethodSignature.typeAnnotation; ESTree: TSMethodSignature.returnType
      case 'TSMethodSignature':
        return member.typeAnnotation ?? member.returnType;
      // class methods and declared methods carry returnType directly
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return member.returnType;
      // ESTree class method: function lives on `.value` (FunctionExpression)
      case 'MethodDefinition':
        return member.value?.returnType;
      // property with a function-type annotation: extract its return type
      case 'TSPropertySignature':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.typeAnnotation));
      // Flow: ObjectTypeProperty with FunctionTypeAnnotation value
      case 'ObjectTypeProperty':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
    }
    return null;
  }

  // --- Member calls & runtime member resolution ---
  // resolve a method call's return type from a single (non-union) annotation by walking
  // its members and folding the return types of all matching overloads
  //   1. Skip overloads with unresolvable return types (don't bail the entire merge)
  //   2. Try lenient `foldUnionTypes` over the resolved set
  //   3. If that fails (divergent primitives etc.), fall back to the FIRST resolved overload.
  //      Interface signatures are tried in declaration order; TS picks the first matching one,
  //      so falling back to "first" is a reasonable approximation when we can't run full
  //      argument-type-based overload selection
  function resolveMemberCallReturnFromAnnotation(annotation, name, scope, resolve, depth, subst) {
    const members = getTypeMembers(annotation, scope, depth);
    if (!members) return null;
    const resolvedReturns = [];
    for (const member of members) {
      if (!keyMatchesName(member.key, name)) continue;
      const returnAnnotation = memberCallReturnAnnotation(member);
      if (!returnAnnotation) continue;
      // apply subst so generic alias method returns (`type Box<T> = { get(): T[] }`) bind T
      // through every nested shape (arrays/tuples/unions), not just top-level references
      const substituted = subst ? applyAliasSubstDeep(unwrapTypeAnnotation(returnAnnotation), subst) : returnAnnotation;
      const resolved = resolve(substituted);
      if (resolved) resolvedReturns.push(resolved);
    }
    if (!resolvedReturns.length) return null;
    if (resolvedReturns.length === 1) return resolvedReturns[0];
    return foldUnionTypes(resolvedReturns, r => r) ?? resolvedReturns[0];
  }

  // union/intersection method calls - for `x: A | B` or `x: A & B` calling `x.foo()`,
  // resolve in each branch. union folds per-branch return types; intersection picks the
  // first branch that resolves (intersection members are additive, so any match is valid).
  // mirrors findTypeMember's handling for properties
  function resolveMemberCallReturn(annotation, name, scope, resolve, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    const applySubst = branch => {
      const unwrapped = unwrapTypeAnnotation(branch);
      return subst ? applyAliasSubstDeep(unwrapped, subst) : unwrapped;
    };
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      let result = null;
      for (const branch of aliased.types) {
        const branchResult = resolveMemberCallReturn(applySubst(branch), name, scope, resolve, depth + 1);
        if (!branchResult) return null;
        result = commonType(result, branchResult);
        if (!result) return null;
      }
      return result;
    }
    if (aliased?.type === 'TSIntersectionType' || aliased?.type === 'IntersectionTypeAnnotation') {
      for (const branch of aliased.types) {
        const branchResult = resolveMemberCallReturn(applySubst(branch), name, scope, resolve, depth + 1);
        if (branchResult) return branchResult;
      }
      return null;
    }
    return resolveMemberCallReturnFromAnnotation(aliased ?? annotation, name, scope, resolve, depth, subst);
  }

  // serialize `x`, `this.data`, `obj.a.b` - null for computed / shapes we don't probe
  // `.x` / `?.x` - static dotted property access. MemberExpression and OptionalMemberExpression
  // share the shape; optional-chain short-circuit is orthogonal to the access path
  function isStaticDotAccess(node) {
    return (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')
      && !node.computed && node.property?.type === 'Identifier';
  }

  function pathKey(node) {
    if (node?.type === 'Identifier') return node.name;
    if (node?.type === 'ThisExpression') return 'this';
    if (isStaticDotAccess(node)) {
      const parent = pathKey(node.object);
      return parent === null ? null : `${ parent }.${ node.property.name }`;
    }
    return null;
  }

  // oxc wraps optional chains in ChainExpression (`s?.kind` -> `ChainExpression > Member{optional}`);
  // babel uses OptionalMemberExpression directly. peel both so downstream sees the member node
  function peelParensAndChain(node) {
    node = unwrapParens(node);
    if (node?.type === 'ChainExpression') node = node.expression;
    return node;
  }

  // `<path>.field OP 'value'` where OP is `===` / `==` / `!==` / `!=`; returns null for
  // other shapes. `conditionTrue` flips the sign when the guard sits in an else-branch.
  // peel outer parens + leading `!` UnaryExpression so `if (!(f.kind === 'b'))` narrows
  // identically to `if (f.kind !== 'b')` - mirrors `parseTypeGuard`'s entry handling
  function parseDiscriminantCheck(test, targetKey, conditionTrue) {
    while (test?.type === 'ParenthesizedExpression') test = test.expression;
    if (test?.type === 'UnaryExpression' && test.operator === '!') {
      conditionTrue = !conditionTrue;
      test = test.argument;
      while (test?.type === 'ParenthesizedExpression') test = test.expression;
    }
    if (test?.type !== 'BinaryExpression') return null;
    const isEq = test.operator === '===' || test.operator === '==';
    const isNeq = test.operator === '!==' || test.operator === '!=';
    if (!isEq && !isNeq) return null;
    const left = peelParensAndChain(test.left);
    const right = peelParensAndChain(test.right);
    const pair = memberLiteralPair(left, right, targetKey) ?? memberLiteralPair(right, left, targetKey);
    return pair && { ...pair, positive: isEq === conditionTrue };
  }

  function memberLiteralPair(memberExpr, literalNode, targetKey) {
    if (!isStaticDotAccess(memberExpr)) return null;
    if (pathKey(memberExpr.object) !== targetKey) return null;
    const value = literalKeyValue(literalNode);
    return value === null ? null : { field: memberExpr.property.name, value };
  }

  // narrowing-context: snapshot of varPath's binding-identity + reassignment history that
  // each candidate guard must clear before contributing. extracted into a single record so
  // both walk-up and preceding-exit collectors share one signature
  function buildDiscriminantContext(varPath, targetKey) {
    const [rootName] = targetKey.split('.', 1);
    return {
      rootName,
      objectBinding: rootName === 'this' ? null : varPath.scope?.getBinding(rootName),
      violations: rootName === 'this' ? [] : varPath.scope?.getBinding(rootName)?.constantViolations ?? [],
      objectStart: varPath.node?.start,
    };
  }

  // a guard is valid for narrowing iff (a) `rootName` resolves to the same binding in the
  // guard's enclosing scope as at varPath (rejects inner-shadow leakage), and (b) no
  // reassignment of that binding sits between `testEnd` and the use site (`ctx.objectStart`)
  function discriminantGuardApplies(scope, testEnd, ctx) {
    const { rootName, objectBinding, violations, objectStart } = ctx;
    if (rootName !== 'this' && objectBinding && scope?.getBinding(rootName) !== objectBinding) return false;
    return testEnd === undefined || objectStart === undefined
      || !violations.some(v => v.node?.start > testEnd && v.node?.start < objectStart);
  }

  // flatten `&&` (truthy) / `||` (falsy) chains so a discriminant clause embedded alongside
  // other tests (`if (x && f.kind === 'a')` / `if (!ready || f.kind !== 'b') return;`) still
  // contributes its narrowing. each clause goes through `parseDiscriminantCheck` (which peels
  // its own `!`/parens), survivors append to `out`
  function pushDiscriminantClauses(test, conditionTrue, targetKey, out) {
    const parts = flattenCondition(test, conditionTrue ? '&&' : '||');
    for (const part of parts) {
      const guard = parseDiscriminantCheck(part, targetKey, conditionTrue);
      if (guard) out.push(guard);
    }
  }

  // scan preceding-sibling statements of `current` at its block level; for each one that
  // unconditionally exits (`if (X) return;` / `... else throw ...`), collect the narrowed
  // discriminant form into `out`. mirrors `findPrecedingExitGuards` but for discriminant kinds
  function collectPrecedingExitDiscriminants(current, targetKey, out, ctx) {
    const siblings = getStatementSiblings(current);
    if (!siblings) return;
    for (let i = current.key - 1; i >= 0; i--) {
      const sibling = siblings[i];
      const exitCond = resolveExitCondition(sibling);
      if (exitCond === null) continue;
      if (!discriminantGuardApplies(sibling.scope, sibling.node.test?.end, ctx)) continue;
      pushDiscriminantClauses(sibling.node.test, exitCond, targetKey, out);
    }
  }

  // walk up collecting `<path>.kind === 'a'` / `!==` guards from enclosing if / ternary / `&&`,
  // plus preceding early-exit siblings. `targetKey` covers arbitrary LHS shapes
  // (Identifier / `this.x` / `obj.a.b`). binding-identity + mutation checks (via `ctx`)
  // reject inner-shadow leakage and stale narrowing across reassignments
  function findDiscriminantGuards(varPath, targetKey) {
    const guards = [];
    const ctx = buildDiscriminantContext(varPath, targetKey);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      let test;
      let conditionTrue;
      if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
        if (current.key !== 'consequent' && current.key !== 'alternate') continue;
        conditionTrue = current.key === 'consequent';
        test = parent.node.test;
      } else if (t.isLogicalExpression(parent.node) && parent.node.operator === '&&' && current.key === 'right') {
        conditionTrue = true;
        test = parent.node.left;
      } else {
        collectPrecedingExitDiscriminants(current, targetKey, guards, ctx);
        continue;
      }
      if (!discriminantGuardApplies(parent.scope, test?.end, ctx)) continue;
      pushDiscriminantClauses(test, conditionTrue, targetKey, guards);
    }
    return guards;
  }

  // resolve the binding's identifier name across both runtime path libs (babel exposes
  // `.identifier`, estree-toolkit exposes `.name` directly). fall back to varPath's name
  // when the binding object is shaped without either - covers shorthand/destructured
  function bindingTargetName(binding, varPath) {
    return binding.identifier?.name ?? binding.name ?? varPath.node?.name ?? null;
  }

  // a parent.scope-bearing block context: BlockStatement / Program / StaticBlock children
  // are evaluated in source order, so a preceding sibling assignment is guaranteed to run
  // before the use site. all other parent shapes (IfStatement, function decl headers,
  // expression positions) skip the block-local assignment scan
  function isBlockChildPath(parent, current) {
    return (t.isBlockStatement(parent.node) || t.isProgram(parent.node)
        || (t.isStaticBlock && t.isStaticBlock(parent.node)))
      && current.listKey === 'body' && typeof current.key === 'number';
  }

  // walk varPath's ancestors looking for an `=` assignment at a preceding-sibling statement
  // that's GUARANTEED to have run before varPath. unlike `findLastStraightLineAssignment`,
  // which insists on straight-line reachability all the way to the binding's var-scope, this
  // accepts assignments in any enclosing block of the use site - those are guaranteed because
  // the use site is in the same control-flow path. starts at the closest block-child ancestor
  // and walks outward until the binding's declaration scope
  function findPrecedingBlockAssignment(binding, varPath) {
    if (!binding.constantViolations?.length) return null;
    const targetName = bindingTargetName(binding, varPath);
    if (!targetName) return null;
    const limit = scopeNode(binding.scope);
    for (let current = varPath; current?.parentPath; current = current.parentPath) {
      const parent = current.parentPath;
      if (isBlockChildPath(parent, current)) {
        const siblings = parent.get('body');
        for (let i = current.key - 1; i >= 0; i--) {
          const sib = siblings[i];
          const expr = sib?.node?.type === 'ExpressionStatement' ? sib.node.expression : null;
          if (expr?.type === 'AssignmentExpression' && expr.operator === '='
              && expr.left?.type === 'Identifier' && expr.left.name === targetName) {
            return sib.get('expression');
          }
        }
      }
      if (parent.node === limit) return null;
    }
    return null;
  }

  // collect own non-computed Identifier/StringLiteral-keyed properties whose value is a
  // primitive literal (string / number) - the RHS projection used to discriminate which
  // union branch the assignment shape commits to
  function collectObjectLiteralProps(rhs) {
    const literals = new Map();
    for (const p of rhs.properties) {
      if (!p || p.computed || (p.type !== 'ObjectProperty' && p.type !== 'Property')) continue;
      const keyName = getKeyName(p.key);
      const literalValue = literalKeyValue(p.value);
      if (keyName !== null && literalValue !== null) literals.set(keyName, literalValue);
    }
    return literals;
  }

  // post-filter union assembly: drop on no-narrow / all-pass, unwrap when single branch,
  // otherwise rebuild the union. shared by both narrowing paths (discriminant-guard +
  // assignment-literal) so they emit identical-shape annotations
  function buildNarrowedUnion(filtered, aliased) {
    if (!filtered.length || filtered.length === aliased.types.length) return null;
    return filtered.length === 1 ? unwrapTypeAnnotation(filtered[0]) : { type: aliased.type, types: filtered };
  }

  // narrow a union annotation by inspecting the variable's last preceding `=` assignment:
  // when the RHS is an ObjectExpression whose literal-property values uniquely match one
  // branch's literal-typed members, narrow to that branch. mirrors TS's flow-sensitive
  // "narrowing by assignment" so post-mutation accesses see the new shape rather than the
  // declared union. permissive: branches with non-literal members or missing RHS keys pass
  // through, single-branch result wins
  function narrowUnionByAssignmentLiteral(varPath, annotation, scope) {
    const binding = varPath.scope?.getBinding(varPath.node?.name);
    if (!binding) return null;
    const lastAssign = findPrecedingBlockAssignment(binding, varPath);
    const rhs = lastAssign?.node?.right;
    if (rhs?.type !== 'ObjectExpression') return null;
    const { node: aliased } = followTypeAliasChain(unwrapTypeAnnotation(annotation), scope);
    if (aliased?.type !== 'TSUnionType' && aliased?.type !== 'UnionTypeAnnotation') return null;
    const rhsLiterals = collectObjectLiteralProps(rhs);
    if (rhsLiterals.size === 0) return null;
    const filtered = aliased.types.filter(branch => branchMatchesLiterals(branch, rhsLiterals, scope));
    return buildNarrowedUnion(filtered, aliased);
  }

  // a union branch survives if every literal-typed member with a key present in `rhsLiterals`
  // matches the projected RHS value. members with non-literal types / missing RHS keys /
  // unresolvable types pass through (permissive; same convention as discriminant narrow)
  function branchMatchesLiterals(branch, rhsLiterals, scope) {
    const members = getTypeMembers(unwrapTypeAnnotation(branch), scope);
    if (!members) return true;
    for (const m of members) {
      if (m.type !== 'TSPropertySignature' || m.computed) continue;
      const memberType = m.typeAnnotation && unwrapTypeAnnotation(m.typeAnnotation);
      if (memberType?.type !== 'TSLiteralType') continue;
      const expected = literalKeyValue(memberType.literal);
      const keyName = getKeyName(m.key);
      if (expected === null || keyName === null || !rhsLiterals.has(keyName)) continue;
      if (rhsLiterals.get(keyName) !== expected) return false;
    }
    return true;
  }

  function narrowDiscriminatedUnion(objectPath, annotation, scope) {
    // cheap early exit before `followTypeAliasChain` spins up the alias walker
    const targetKey = pathKey(objectPath.node);
    if (!targetKey) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    if (aliased?.type !== 'TSUnionType' && aliased?.type !== 'UnionTypeAnnotation') return null;
    const guards = findDiscriminantGuards(objectPath, targetKey);
    if (!guards.length) return null;
    // permissive: branches with unresolvable discriminant members pass through
    const filtered = aliased.types.filter(branch => branchMatchesGuards(branch, guards, scope));
    const narrowed = buildNarrowedUnion(filtered, aliased);
    if (!narrowed) return null;
    // preserve accumulated type-param substitutions through the narrowed result - without
    // applying subst, `T[]` inside a surviving branch of `type Foo<T> = { kind: 'a'; val: T[] } | ...`
    // would stay unresolved and downstream dispatch would see Array(null) instead of Array<string>
    return subst ? applyAliasSubstDeep(narrowed, subst) : narrowed;
  }

  // a branch survives discriminant filtering when every guard's expected value agrees with
  // the branch's literal-typed member at the same key - non-literal members pass through
  // (permissive; matches the existing precedent for unresolvable members)
  function branchMatchesGuards(branch, guards, scope) {
    for (const { field, value, positive } of guards) {
      const memberType = findTypeMember(unwrapTypeAnnotation(branch), field, scope);
      if (!memberType) continue;
      const { node: resolvedNode } = followTypeAliasChain(unwrapTypeAnnotation(memberType), scope);
      const literal = resolvedNode?.type === 'TSLiteralType' ? literalKeyValue(resolvedNode.literal) : null;
      if (literal !== null && (literal === value) !== positive) return false;
    }
    return true;
  }

  function resolveTypedMember(objectPath, name, callPath) {
    let annotation, scope;
    if (t.isIdentifier(objectPath.node)) {
      const binding = objectPath.scope?.getBinding(objectPath.node.name);
      if (!binding) return null;
      annotation = unwrapTypeAnnotation(findBindingAnnotation(binding.path));
      scope = binding.path.scope;
    } else {
      // delegate to findExpressionAnnotation for non-identifier shapes so that
      // TS wrappers, call expressions with return annotations, and chain expressions
      // all route through the same annotation lookup (incl. call-site generic subst)
      const info = findExpressionAnnotation(objectPath);
      if (info) {
        annotation = unwrapTypeAnnotation(info.annotation);
        scope = info.scope;
      }
    }
    if (!annotation) return null;
    // discriminated union narrowing: `if (x.kind === 'a') { x.data }` - restrict Foo
    // to the `{ kind:'a'; data: T }` branch. works for any serialisable LHS path
    // (Identifier / `this.x` / `obj.a.b`); computed / call-expression paths bail
    annotation = narrowDiscriminatedUnion(objectPath, annotation, scope) ?? annotation;
    // `x: typeof obj` / `x: typeof fn` - follow TSTypeQuery to runtime binding, delegate there
    if (annotation.type === 'TSTypeQuery') {
      const resolved = resolveTypeQueryBinding(annotation, scope);
      if (resolved?.node) {
        if (t.isObjectExpression(resolved.node)) {
          const result = resolveObjectMember(resolved, name, callPath);
          if (result) return result;
        }
        const ctx = resolveClassContext(resolved);
        if (ctx) return resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath);
        return null;
      }
      // TSEnumDeclaration has no runtime binding path in `resolveTypeQueryBinding`; route
      // through `resolveAnnotatedMember` so `typeof Enum` member access hits the enum branch
      return resolveAnnotatedMember(annotation, name, scope);
    }
    // `x: Cls` where `Cls` is a real `class` declaration in scope - route method calls through
    // `resolveClassMember` (path-based, body-inference-capable) instead of annotation-only lookup,
    // so unannotated methods like `test() { return this.getStr(); }` still resolve their return type
    if (callPath) {
      const classPath = findClassPathForTypeReference(annotation, scope);
      if (classPath) {
        const result = resolveClassMember(classPath, name, false, callPath);
        if (result) return result;
      }
    }
    // lazily resolve default type parameter map for generic types used without explicit type arguments
    let defaultMap;
    const resolve = p => {
      if (defaultMap === undefined) defaultMap = buildDefaultTypeParamMap(annotation, scope);
      return defaultMap ? substituteTypeParams(p, defaultMap, scope, 0) : resolveTypeAnnotation(p, scope);
    };
    // property access (not a call): delegate to findTypeMember
    if (!callPath) {
      const memberType = findTypeMember(annotation, name, scope);
      return memberType ? resolve(memberType) : null;
    }
    // method call: merge return types across overloads, recursing into union branches
    return resolveMemberCallReturn(annotation, name, scope, resolve);
  }

  // resolve `TSTypeReference { typeName: X }` to a NodePath of `class X { ... }` in scope,
  // or null if the reference points at an ambient / interface / non-class
  function findClassPathForTypeReference(annotation, scope) {
    if (annotation?.type !== 'TSTypeReference' || annotation.typeName?.type !== 'Identifier') return null;
    const binding = scope?.getBinding(annotation.typeName.name);
    return binding && t.isClassDeclaration(binding.path.node) ? binding.path : null;
  }

  function resolveFromMemberExpression(path, callPath) {
    const name = resolveMemberPropertyName(path);
    if (!name) return null;
    const originalObjectPath = path.get('object');
    const objectPath = resolveRuntimeExpression(originalObjectPath);
    if (t.isObjectExpression(objectPath.node)) {
      const result = resolveObjectMember(objectPath, name, callPath);
      if (result) return result;
    }
    const ctx = resolveClassContext(objectPath);
    if (ctx) {
      const result = resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath);
      if (result) return result;
    }
    // try typed member on resolved path first, then on original path (in case resolvePath lost annotation)
    return resolveTypedMember(objectPath, name, callPath)
      || (objectPath !== originalObjectPath ? resolveTypedMember(originalObjectPath, name, callPath) : null);
  }

  // arr[0], arr[1] - numeric index access on array literals
  function resolveArrayIndexAccess(path) {
    if (!path.node.computed) return null;
    const resolvedProp = resolveRuntimeExpression(path.get('property'));
    if (babelNodeType(resolvedProp.node) !== 'NumericLiteral') return null;
    const index = resolvedProp.node.value;
    if (!Number.isInteger(index) || index < 0) return null;
    const objectPath = resolveRuntimeExpression(path.get('object'));
    if (!t.isArrayExpression(objectPath.node)) return null;
    return resolveArrayLiteralElement(objectPath, index);
  }

  // convert a normalized hint to a type object
  // objectType (optional) enables resolution of 'element'/'inherit' directives in instance method hints
  function typeFromHint(hint, objectType) {
    if (typeof hint === 'string') {
      if (hint === 'element' || hint === 'inherit') return resolveInnerType(objectType);
      if (PRIMITIVES.has(hint)) return new $Primitive(hint);
      return new $Object(hint);
    }
    if (PRIMITIVES.has(hint.type)) return new $Primitive(hint.type);
    const innerHint = hint.element ?? hint.resolved ?? null;
    const inner = innerHint ? typeFromHint(innerHint, objectType) : null;
    return new $Object(hint.type, inner);
  }

  // resolve the inner (element/resolved) type of a container
  // $Primitive stores inner as a hint string (lazy), $Object stores it as a type object (eager)
  function resolveInnerType(type) {
    if (!type?.inner) return null;
    const { inner } = type;
    return typeof inner === 'string' ? new $Primitive(inner) : inner;
  }

  // recursively unwrap Promise layers: Promise<Promise<T>> -> T
  // Promise without inner (Promise<any>) unwraps to null (unknown) since await resolves to any
  function unwrapPromise(type) {
    let result = type;
    while (result?.type === 'object' && result.constructor === 'Promise') {
      const inner = resolveInnerType(result);
      if (!inner) return null;
      result = inner;
    }
    return result;
  }

  // two-level table lookup: table[key1][key2]
  function lookupNested(table, key1, key2) {
    const group = hasOwn(table, key1) ? table[key1] : null;
    return group && hasOwn(group, key2) ? group[key2] : null;
  }

  // resolve the global object name and property name from a MemberExpression
  function resolveGlobalMember(path) {
    const memberName = resolveMemberPropertyName(path);
    if (!memberName) return null;
    const objectName = resolveGlobalName(path.get('object'));
    return objectName ? { objectName, memberName } : null;
  }

  // resolve return type of a known instance member (method or property) from a lookup table
  // for methods, objectType is passed through to typeFromHint to resolve 'element'/'inherit'
  function resolveKnownInstanceMember(path, table) {
    const name = resolveMemberPropertyName(path);
    if (!name) return null;
    const objectType = resolveNodeType(path.get('object'));
    if (!objectType) return null;
    const key = objectType.primitive ? (PRIMITIVE_WRAPPERS[objectType.type] || null) : objectType.constructor;
    if (!key) return null;
    const hint = lookupNested(table, key, name);
    if (!hint) return null;
    return typeFromHint(hint, objectType);
  }

  function resolveKnownStaticReturnType(callee) {
    if (!isMemberLike(callee)) return null;
    const info = resolveGlobalMember(callee);
    if (!info) return null;
    const hint = lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, info.objectName, info.memberName);
    return hint ? typeFromHint(hint) : null;
  }

  function resolveKnownPropertyReturnType(path) {
    return resolveKnownInstanceMember(path, KNOWN_INSTANCE_PROPERTY_RETURN_TYPES);
  }

  // resolve type of a known global static member (e.g. Math.PI, Number.MAX_SAFE_INTEGER, Math.max)
  // static properties return their known type, static methods return Function
  function resolveGlobalStaticReference(path) {
    const info = resolveGlobalMember(path);
    if (!info) return null;
    const { objectName, memberName } = info;
    const propHint = lookupNested(KNOWN_STATIC_PROPERTY_RETURN_TYPES, objectName, memberName);
    if (propHint) return typeFromHint(propHint);
    return lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, objectName, memberName) ? new $Object('Function') : null;
  }

  // resolve type of a global property or method accessed through a global proxy
  // e.g. globalThis.NaN -> number, window.parseInt -> Function
  function resolveKnownGlobalReference(path) {
    const name = resolveGlobalName(path);
    if (!name) return null;
    if (hasOwn(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_PROPERTY_RETURN_TYPES[name]);
    if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return new $Object('Function');
    return null;
  }

  function resolveMemberCallType(memberPath, callPath) {
    return resolveFromMemberExpression(memberPath, callPath)
      || resolveKnownStaticReturnType(memberPath)
      || resolveKnownInstanceMember(memberPath, KNOWN_INSTANCE_METHOD_RETURN_TYPES);
  }

  function resolveCallReturnType(callee) {
    // method call: obj.method() or obj?.method()
    if (isMemberLike(callee)) {
      // receiver is statically undefined/null/never -> chain is broken at runtime; propagate
      // the same to downstream so `fn(){}; fn().at(0).includes(1)` doesn't half-polyfill
      const receiverType = resolveNodeType(callee.get('object'));
      if (receiverType && isNullableOrNever(receiverType)) return receiverType;
      return resolveMemberCallType(callee, callee.parentPath);
    }
    // direct call: foo() / IIFE: (() => expr)() / ambient TSDeclareFunction follow-through
    const resolved = resolveRuntimeExpression(callee);
    if (isFunctionLike(resolved.node)) return resolveReturnType(resolved, callee.parentPath);
    // indirect call: const fn = obj.method; fn() - resolve through the stored member reference
    if (isMemberLike(resolved)) return resolveMemberCallType(resolved, callee.parentPath);
    // identifier callees that didn't resolve to a function-like via the binding chain may still
    // be reachable through an ambient `declare function` not registered in scope.bindings,
    // or a binding whose annotation is a function-type (`declare const f: () => T`)
    if (!t.isIdentifier(callee.node)) return null;
    const ambient = findAmbientFunctionPath(callee.node.name, callee.scope);
    if (ambient) return resolveReturnType(ambient, callee.parentPath);
    return resolveCallReturnTypeFromAnnotation(callee);
  }

  // Babel TSFunctionType: `typeAnnotation` (TSTypeAnnotation wrapper)
  // oxc TSFunctionType / Flow FunctionTypeAnnotation: `returnType` (raw type)
  function functionTypeReturnAnnotation(node) {
    if (node?.type === 'TSFunctionType' || node?.type === 'TSConstructorType') {
      return node.typeAnnotation ?? node.returnType;
    }
    if (node?.type === 'FunctionTypeAnnotation') return node.returnType;
    return null;
  }

  // extract return type from a binding's function-type annotation:
  //   `declare const f: () => T` / `const f: (x: X) => T = ...` / Flow `(x: X) => T` /
  //   `const f: typeof other` (follow TSTypeQuery to referenced function's return)
  function resolveCallReturnTypeFromAnnotation(callee) {
    const info = findExpressionAnnotation(callee);
    if (!info) return null;
    const annotation = unwrapTypeAnnotation(info.annotation);
    if (annotation?.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(annotation, info.scope);
    const ret = functionTypeReturnAnnotation(annotation);
    return ret ? resolveTypeAnnotation(ret, info.scope) : null;
  }

  // --- Destructuring resolver ---
  // walk ArrayPattern elements for a target binding, returning index-prefixed key path.
  // sentinel conventions:
  //   - null         not found
  //   - [-1]         found in rest (-1 signals "whole tail" slice, not an index)
  //   - [i, ...sub]  found at index i (possibly nested)
  // `findPatternIndex` below uses `-1` with a DIFFERENT meaning ("not found" scalar); the
  // return shape (array vs scalar) disambiguates at call sites
  function findArrayPatternKeyPath(arrayPattern, name, scope) {
    for (let i = 0; i < (arrayPattern.elements?.length ?? 0); i++) {
      const el = arrayPattern.elements[i];
      if (!el) continue;
      // rest: [...x] is always Array - signal via negative index so callers know
      if (el.type === 'RestElement') {
        if (el.argument?.type === 'Identifier' && el.argument.name === name) return [-1];
        continue;
      }
      const unwrapped = el.type === 'AssignmentPattern' ? el.left : el;
      if (unwrapped?.type === 'Identifier' && unwrapped.name === name) return [i];
      if (unwrapped?.type === 'ObjectPattern') {
        const inner = findDestructuredKeyPath(unwrapped, name, scope);
        if (inner) return [i, ...inner];
      }
      if (unwrapped?.type === 'ArrayPattern') {
        const inner = findArrayPatternKeyPath(unwrapped, name, scope);
        if (inner) return [i, ...inner];
      }
    }
    return null;
  }

  // `{ a: { b: c } }`, target `c` -> `['a', 'b']`. nested ObjectPatterns walked recursively
  function findDestructuredKeyPath(objectPattern, name, scope) {
    for (const prop of objectPattern.properties) {
      if (babelNodeType(prop) !== 'ObjectProperty') continue;
      const key = prop.computed ? resolveComputedKeyName(prop.key, scope) : getKeyName(prop.key);
      if (key === null) continue;
      const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      if (value?.type === 'Identifier' && value.name === name) return [key];
      if (value?.type === 'ObjectPattern') {
        const inner = findDestructuredKeyPath(value, name, scope);
        if (inner) return [key, ...inner];
      }
      if (value?.type === 'ArrayPattern') {
        const arrResult = findArrayPatternKeyPath(value, name, scope);
        if (arrResult) return [key, ...arrResult];
      }
    }
    return null;
  }

  // resolve the type of a destructuring default: const { items = [] } = obj or const [a = []] = arr.
  // recurses into nested ObjectPatterns / ArrayPatterns - `const { a: { b = [] } } = obj`
  // resolving `b` finds the depth-2 default that one-level walk missed
  function resolveDestructuringDefault(pattern, varName, bindingPath) {
    const patternPath = bindingPath.node === pattern ? bindingPath
      : bindingPath.node.id === pattern ? bindingPath.get('id')
      : bindingPath.node.left === pattern ? bindingPath.get('left') : null;
    if (!patternPath) return null;
    return walkDestructuringForDefault(patternPath, pattern, varName);
  }

  function walkDestructuringForDefault(patternPath, pattern, varName) {
    const children = patternPath.get(pattern.properties ? 'properties' : 'elements');
    for (const child of children) {
      if (!child.node) continue;
      const valuePath = babelNodeType(child.node) === 'ObjectProperty' ? child.get('value') : child;
      if (t.isAssignmentPattern(valuePath.node)) {
        if (valuePath.node.left?.type === 'Identifier' && valuePath.node.left.name === varName) {
          return resolveNodeType(valuePath.get('right'));
        }
        // `{ a: { b = [] } = {} }` - the inner pattern is on `valuePath.left`, recurse there
        const innerLeft = valuePath.get('left');
        if (innerLeft.node?.type === 'ObjectPattern' || innerLeft.node?.type === 'ArrayPattern') {
          const found = walkDestructuringForDefault(innerLeft, innerLeft.node, varName);
          if (found) return found;
        }
      } else if (valuePath.node?.type === 'ObjectPattern' || valuePath.node?.type === 'ArrayPattern') {
        const found = walkDestructuringForDefault(valuePath, valuePath.node, varName);
        if (found) return found;
      }
    }
    return null;
  }

  function resolveDestructuredType(objectPattern, name, scope) {
    const keyPath = findDestructuredKeyPath(objectPattern, name, scope);
    if (!keyPath) return null;
    return resolveAnnotatedMemberPath(objectPattern.typeAnnotation, keyPath, scope);
  }

  // resolve the element type of a collection from its type annotation
  function resolveElementType(node, scope, depth) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      // string[] -> element type
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return resolveTypeAnnotation(node.elementType, scope, depth + 1);
      // [string, number] -> common element type if all same
      case 'TSTupleType':
      case 'TupleTypeAnnotation': {
        const elements = tupleElements(node);
        return elements?.length
          ? resolveTupleInner(elements, e => resolveTypeAnnotation(e, scope, depth + 1))
          : null;
      }
      // Array<T>, Set<T>, Map<K,V>, Iterable<T>, Generator<T>, user type aliases
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (!name) return null;
        const params = getTypeArgs(node)?.params;
        if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return params?.[0] ? resolveTypeAnnotation(params[0], scope, depth + 1) : null;
        if (name === 'Map' || name === 'ReadonlyMap') return new $Object('Array');
        return resolveUserTypeElement(name, scope, depth, resolveElementType);
      }
      // iterating a string yields characters (strings)
      case 'TSStringKeyword':
      case 'StringTypeAnnotation':
        return new $Primitive('string');
      // union: strip null/undefined, check remaining
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types?.length) return null;
        let result = null;
        for (const member of types) {
          const resolved = resolveTypeAnnotation(member, scope, depth + 1);
          if (!resolved) return null;
          if (isNullableOrNever(resolved)) continue;
          const elemType = resolveElementType(member, scope, depth + 1);
          if (!elemType) return null;
          result = commonType(result, elemType);
          if (!result) return null;
        }
        return result;
      }
      // transparent wrappers: readonly T[], (T[])
      case 'TSTypeOperator':
        return node.operator !== 'keyof' ? resolveElementType(node.typeAnnotation, scope, depth + 1) : null;
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return resolveElementType(node.typeAnnotation, scope, depth + 1);
    }
    return null;
  }

  // follow user-defined type aliases and interface extends chain using a parameterized resolver
  function resolveUserTypeElement(name, scope, depth, resolver) {
    const decl = findTypeDeclaration(name, scope);
    if (isTypeAlias(decl)) return resolver(typeAliasBody(decl), scope, depth + 1);
    if (!isInterfaceDeclaration(decl) || !decl.extends?.length) return null;
    for (const parent of decl.extends) {
      const expr = extendsId(parent);
      if (expr.type !== 'Identifier') continue;
      const parentRef = { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) };
      const result = resolver(parentRef, scope, depth + 1);
      if (result) return result;
    }
    return null;
  }

  // extract the raw element annotation node (not resolved) from a collection type
  function extractElementAnnotation(node, scope, depth) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return node.elementType;
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (!name) return null;
        if (SINGLE_ELEMENT_COLLECTIONS.has(name)) return getTypeArgs(node)?.params[0] ?? null;
        // Map/ReadonlyMap iterate as [K, V] - synthesize a TSTupleType so `findTupleElement`
        // can pick up K or V by index
        if (name === 'Map' || name === 'ReadonlyMap') {
          const params = getTypeArgs(node)?.params;
          return params?.length >= 2 ? { type: 'TSTupleType', elementTypes: [params[0], params[1]] } : null;
        }
        return resolveUserTypeElement(name, scope, depth, extractElementAnnotation);
      }
      case 'TSTypeOperator':
        return node.operator !== 'keyof' ? extractElementAnnotation(node.typeAnnotation, scope, depth + 1) : null;
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return extractElementAnnotation(node.typeAnnotation, scope, depth + 1);
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types?.length) return null;
        let result = null;
        for (const member of types) {
          const resolved = resolveTypeAnnotation(member, scope, depth + 1);
          if (!resolved) return null;
          if (isNullableOrNever(resolved)) continue;
          if (result) return null; // multiple non-null collection members -> ambiguous
          result = extractElementAnnotation(member, scope, depth + 1);
          if (!result) return null;
        }
        return result;
      }
    }
    return null;
  }

  // resolve the type of a variable destructured from an ArrayPattern
  function resolveArrayPatternBinding(arrayPattern, varName, annotation, scope) {
    const index = findPatternIndex(arrayPattern, varName);
    if (index < 0) return null;
    const unwrapped = unwrapTypeAnnotation(annotation);
    if (!unwrapped) return null;
    const tupleElem = findTupleElement(unwrapped, index, scope);
    if (tupleElem) return resolveTypeAnnotation(tupleElem, scope);
    return resolveElementType(unwrapped, scope, 0);
  }

  // resolve obj.prop annotation by chaining through the object's type, applying generic subst
  function resolveMemberAnnotation(path, depth) {
    // caller (`findExpressionAnnotation`) filters `computed` / non-Identifier property -
    // defensive guard here so direct callers (tests, future patches) don't crash on `obj['x']`
    if (path.node.computed || path.node.property?.type !== 'Identifier') return null;
    const objInfo = findExpressionAnnotation(path.get('object'), depth + 1);
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const members = aliased ? getTypeMembers(aliased, objInfo.scope) : null;
    if (!members) return null;
    const propName = path.node.property.name;
    for (const m of members) {
      if (!keyMatchesName(m.key, propName)) continue;
      // getters are TSMethodSignature with kind:'get' but semantically read the return
      // type, not a function. regular methods fall through to the method-signature node
      // so downstream sees a function type for `const fn = obj.method`
      const isMethodProper = m.type === 'TSMethodSignature' && m.kind !== 'get';
      const raw = m.typeAnnotation ?? m.returnType ?? (isMethodProper ? m : null);
      if (!raw) continue;
      return { annotation: subst ? applyAliasSubstDeep(raw, subst) : raw, scope: objInfo.scope };
    }
    return null;
  }

  // find the raw type annotation of an expression (follows bindings and const chains)
  function findExpressionAnnotation(path, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    // ESTree preserves ParenthesizedExpression - unwrap
    if (path.node.type === 'ParenthesizedExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    // ESTree wraps optional chains in ChainExpression (babel inlines); peel so the
    // inner MemberExpression hits its own branch below and resolves through the object
    if (path.node.type === 'ChainExpression') return findExpressionAnnotation(path.get('expression'), depth + 1);
    if (path.node.type === 'TSAsExpression' || path.node.type === 'TSSatisfiesExpression'
      || path.node.type === 'TSTypeAssertion' || path.node.type === 'TypeCastExpression') {
      return { annotation: path.node.typeAnnotation, scope: path.scope };
    }
    if (path.node.type === 'TSNonNullExpression' || path.node.type === 'TSInstantiationExpression') {
      return findExpressionAnnotation(path.get('expression'), depth + 1);
    }
    if (t.isIdentifier(path.node)) {
      const binding = path.scope?.getBinding(path.node.name);
      if (!binding) return null;
      const annotation = findBindingAnnotation(binding.path);
      if (annotation) {
        // narrow declared union via the last straight-line assignment's literal-property
        // shape: TS treats `let f: Foo = init; f = { kind: 'b', ... }` as narrowing `f`
        // to FooB after the assignment. without this `f.data` after the assignment
        // resolves on the declared union and emits the generic polyfill
        const narrowed = narrowUnionByAssignmentLiteral(path, annotation, binding.path.scope);
        return { annotation: narrowed ?? annotation, scope: binding.path.scope };
      }
      if (!binding.constantViolations?.length && t.isVariableDeclarator(binding.path.node)) {
        const init = binding.path.get('init');
        if (init.node) return findExpressionAnnotation(init, depth + 1);
      }
    }
    // obj.prop / obj?.prop - resolve property type through the object's annotation chain,
    // carrying generic substitutions so `Wrapper<string>.inner.value()` resolves T -> string
    if ((path.node.type === 'MemberExpression' || path.node.type === 'OptionalMemberExpression')
      && !path.node.computed && path.node.property?.type === 'Identifier') {
      const result = resolveMemberAnnotation(path, depth);
      if (result) return result;
    }
    // direct `f()`: pull the callee's declared return type and substitute explicit call-site
    // type args (`makeBox<number>()`) so downstream member lookups see concrete types
    const callType = babelNodeType(path.node);
    if (callType === 'CallExpression' || callType === 'OptionalCallExpression') {
      const fnPath = resolveRuntimeExpression(path.get('callee'));
      if (isFunctionLike(fnPath.node) && fnPath.node.returnType) {
        // explicit `<...>` args first; fall through to argument inference when caller
        // omitted them (`makeBox(arr)` -> infer T from arr's annotation), then declared
        // defaults via `buildCallSiteSubst`. inferred path bridges the gap babel itself
        // covers via TS's structural inference - without it, `function makeBox<T>(t: T): {value: T}`
        // returned `{value: T}` unsubstituted, dropping array narrowing on `b.value.at(0)`
        const subst = inferCallSiteSubst(fnPath.node, path, depth) ?? buildCallSiteSubst(fnPath.node, path.node);
        const annotation = subst
          ? applyAliasSubstDeep(unwrapTypeAnnotation(fnPath.node.returnType), subst)
          : fnPath.node.returnType;
        return { annotation, scope: fnPath.scope };
      }
      // typed method call: w.inner.value() - resolve callee's annotation, extract return type
      const callee = path.get('callee');
      if (callee.node.type === 'MemberExpression' || callee.node.type === 'OptionalMemberExpression') {
        const memberInfo = findExpressionAnnotation(callee, depth + 1);
        if (memberInfo) {
          const unwrappedMember = unwrapTypeAnnotation(memberInfo.annotation);
          // TSFunctionType -> extract return type; TSMethodSignature's typeAnnotation
          // is already the return type (not a function wrapper), use it directly
          const ret = functionTypeReturnAnnotation(unwrappedMember) ?? unwrappedMember;
          if (ret) return { annotation: ret, scope: memberInfo.scope };
        }
      }
    }
    return null;
  }

  // call-site explicit type args (`makeBox<number>()`) -> {paramName -> argNode}
  function buildCallSiteSubst(fnNode, callNode) {
    return buildSubstMap(fnNode.typeParameters?.params, getTypeArgs(callNode)?.params);
  }

  // infer {paramName -> argAnnotation} from runtime argument annotations when caller
  // omitted explicit `<...>` (`makeBox(arr)` with `function makeBox<T>(t: T)`: lift arr's
  // annotation onto T). limited to direct `T` param shapes (not container wrappers like
  // `T[]` / `Array<T>` / `Promise<T>`) so this stays cheap and doesn't rebuild
  // `buildTypeParamMap`'s full container-aware inference. depth threading prevents
  // recursion blowup when the arg's annotation lookup recurses through chained calls
  function inferCallSiteSubst(fnNode, callPath, depth) {
    if (getTypeArgs(callPath.node)?.params?.length) return null;
    const fnTypeParams = fnNode.typeParameters?.params;
    if (!fnTypeParams?.length) return null;
    const paramNames = new Set(fnTypeParams.map(typeParamName).filter(Boolean));
    const args = callPath.get('arguments');
    const { params } = fnNode;
    const subst = new Map();
    const limit = Math.min(params.length, args.length);
    for (let i = 0; i < limit; i++) {
      if (!params[i] || !args[i]) continue;
      const { param } = effectiveParam(params[i]);
      const paramAnnotation = unwrapTypeAnnotation(param?.typeAnnotation);
      const name = paramAnnotation && typeRefName(paramAnnotation);
      if (!name || !paramNames.has(name) || subst.has(name)) continue;
      const argInfo = findExpressionAnnotation(args[i], depth + 1);
      const argAnnot = argInfo?.annotation && unwrapTypeAnnotation(argInfo.annotation);
      if (argAnnot) subst.set(name, argAnnot);
    }
    return subst.size ? subst : null;
  }

  // traverse from a binding to its enclosing for-in/for-of statement (if any)
  // binding must be a VariableDeclarator without init, declared in the loop header
  function findForLoopParent(bindingPath) {
    if (!t.isVariableDeclarator(bindingPath?.node) || bindingPath.node.init) return null;
    const declarationPath = bindingPath.parentPath;
    if (!t.isVariableDeclaration(declarationPath?.node)) return null;
    const forPath = declarationPath.parentPath;
    if (!forPath || forPath.node.left !== declarationPath.node) return null;
    return forPath;
  }

  // find the index of a variable in an ArrayPattern, accounting for holes and defaults.
  // sentinel: scalar `-1` means "not found" (contrast with `findArrayPatternKeyPath` whose
  // `[-1]` array signals "found in rest"); `RestElement` matches are skipped here because
  // callers use this fn only for positional-tuple lookups where rest is a distinct case
  function findPatternIndex(arrayPattern, varName) {
    const { elements } = arrayPattern;
    if (!elements) return -1;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element || element.type === 'RestElement') continue;
      const id = element.type === 'AssignmentPattern' ? element.left : element;
      if (id?.type === 'Identifier' && id.name === varName) return i;
    }
    return -1;
  }

  // resolve the type of a specific element in an ArrayExpression by index
  // arrayPath must already be a resolved ArrayExpression path
  function resolveArrayLiteralElement(arrayPath, index) {
    const { elements } = arrayPath.node;
    if (index < 0 || index >= elements.length) return null;
    // bail if any spread at or before target index - positions become unpredictable
    for (let i = 0; i <= index; i++) {
      if (elements[i]?.type === 'SpreadElement') return null;
    }
    if (!elements[index]) return null; // hole
    return resolveNodeType(arrayPath.get('elements')[index]);
  }

  // resolve common element type from an ArrayExpression if all elements share the same type
  // arrayPath must already be a resolved ArrayExpression path
  function resolveArrayLiteralCommonType(arrayPath) {
    const { elements } = arrayPath.node;
    if (elements.length === 0) return null;
    let common = null;
    for (let i = 0; i < elements.length; i++) {
      // bail on holes and spreads - can't determine element types
      if (!elements[i] || elements[i].type === 'SpreadElement') return null;
      const resolved = resolveNodeType(arrayPath.get('elements')[i]);
      if (!resolved) return null;
      common = commonType(common, resolved);
      if (!common) return null; // mixed types
    }
    return common;
  }

  // resolve element type from a runtime iterable (follows variables via resolvePath)
  // handles: string literals (chars) and homogeneous array literals (common element type)
  function resolveRuntimeIterableElement(path) {
    return resolveInnerType(resolveNodeType(resolveRuntimeExpression(path)));
  }

  function findBindingAnnotation(bindingPath) {
    const { node } = bindingPath;
    return node.typeAnnotation
      || node.id?.typeAnnotation
      || node.param?.typeAnnotation
      || (t.isAssignmentPattern(bindingPath.node) && node.left?.typeAnnotation);
  }

  // resolve array destructuring from any annotation source: pattern, init, or for-of iterable
  function resolveArrayBinding(arrayPattern, varName, bindingPath) {
    // array rest: const [a, ...rest] = items -> rest is always Array
    if (isRestBinding(arrayPattern.elements || [], varName)) return new $Object('Array');
    // annotation on the pattern itself: function foo([a]: string[]) or const [a]: string[] = ...
    if (arrayPattern.typeAnnotation) {
      const result = resolveArrayPatternBinding(arrayPattern, varName, arrayPattern.typeAnnotation, bindingPath.scope);
      if (result) return result;
    }
    // annotation on the init expression: const [a] = typedArr
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      const initInfo = findExpressionAnnotation(bindingPath.get('init'));
      if (initInfo) {
        const initResult = resolveArrayPatternBinding(arrayPattern, varName, initInfo.annotation, initInfo.scope);
        if (initResult) return initResult;
      }
      // runtime init: resolve through variables to the actual value
      const initPath = resolveRuntimeExpression(bindingPath.get('init'));
      const index = findPatternIndex(arrayPattern, varName);
      if (index >= 0) {
        // direct element: const [a] = typedArr -> resolve inner type or literal element
        const initType = resolveNodeType(initPath);
        const inner = resolveInnerType(initType);
        if (inner) return inner;
        if (t.isArrayExpression(initPath.node)) {
          const elemType = resolveArrayLiteralElement(initPath, index);
          if (elemType) return elemType;
        }
      } else {
        // nested pattern: const [{ a }] = [{ a: 'x' }] or const [[b]] = [['x']]
        const arrPath = findArrayPatternKeyPath(arrayPattern, varName, bindingPath.scope);
        if (arrPath) {
          const result = resolveObjectMemberPath(initPath, arrPath);
          if (result) return result;
        }
      }
    }
    // for-of iterable: for (const [a] of typedArr)
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) {
      const elemResult = resolveArrayPatternBinding(arrayPattern, varName, elemInfo.annotation, elemInfo.scope);
      if (elemResult) return elemResult;
    }
    // runtime: for (const [a] of 'hello') or for (const [k, v] of urlParams.entries())
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node)) {
      // resolve for-of element, then unwrap one more level for array destructuring
      const inner = resolveInnerType(resolveForOfResolvedElement(forOfPath));
      if (inner) return inner;
    }
    // fallback: resolve from destructuring default value: const [a = []] = arr
    return resolveDestructuringDefault(arrayPattern, varName, bindingPath);
  }

  function resolveAnnotatedMember(annotation, keyName, scope) {
    const unwrapped = unwrapTypeAnnotation(annotation);
    if (!unwrapped) return null;
    // `typeof Enum` in annotation position - member access on the enum object yields the
    // enum value kind. findTypeMember doesn't walk TSTypeQuery bodies, so dispatch here
    if (unwrapped.type === 'TSTypeQuery') {
      const segments = collectQualifiedSegments(unwrapped.exprName);
      const rootName = segments?.[0];
      if (rootName && segments.length === 1) {
        const typeDecl = findTypeDeclaration(rootName, scope);
        if (typeDecl?.type === 'TSEnumDeclaration') {
          const type = resolveEnumMemberType(typeDecl, keyName);
          if (type) return type;
        }
      }
    }
    const memberType = findTypeMember(unwrapped, keyName, scope);
    if (!memberType) return null;
    const defaultMap = buildDefaultTypeParamMap(unwrapped, scope);
    return defaultMap
      ? substituteTypeParams(memberType, defaultMap, scope, 0)
      : resolveTypeAnnotation(memberType, scope);
  }

  // step through `['a', 'b']` against the annotation; final step goes through resolveAnnotatedMember
  function resolveAnnotatedMemberPath(annotation, keyPath, scope) {
    if (!keyPath?.length) return null;
    let current = annotation;
    for (let i = 0; i < keyPath.length - 1; i++) {
      const unwrapped = unwrapTypeAnnotation(current);
      if (!unwrapped) return null;
      const next = findTypeMember(unwrapped, keyPath[i], scope);
      if (!next) return null;
      current = next;
    }
    return resolveAnnotatedMember(current, keyPath.at(-1), scope);
  }

  // recursively unwrap Promise<T> annotation to T for for-await-of element types
  // mirrors runtime `await` semantics: Promise<Promise<T>> -> T
  function unwrapPromiseAnnotation(node) {
    let result = unwrapTypeAnnotation(node);
    while ((result?.type === 'TSTypeReference' || result?.type === 'GenericTypeAnnotation') && typeRefName(result) === 'Promise') {
      const inner = getTypeArgs(result)?.params[0];
      if (!inner) break;
      const unwrapped = unwrapTypeAnnotation(inner);
      if (!unwrapped) break;
      result = unwrapped;
    }
    return result ?? node;
  }

  // resolve the raw element annotation of a for-of iterable from its type annotation
  function resolveForOfElementAnnotation(path) {
    const forOfPath = findForLoopParent(path);
    if (!t.isForOfStatement(forOfPath?.node)) return null;
    const annotationInfo = findExpressionAnnotation(forOfPath.get('right'));
    if (!annotationInfo) return null;
    let elemAnnotation = extractElementAnnotation(annotationInfo.annotation, annotationInfo.scope, 0);
    // for-await-of unwraps Promise elements: Iterable<Promise<T>> -> T
    if (elemAnnotation && forOfPath.node.await) elemAnnotation = unwrapPromiseAnnotation(elemAnnotation);
    return elemAnnotation ? { annotation: elemAnnotation, scope: annotationInfo.scope } : null;
  }

  // resolve the element type of a for-of iterable, unwrapping Promise for for-await-of
  function resolveForOfResolvedElement(forOfPath) {
    const isAwait = forOfPath.node.await;
    const annotationInfo = findExpressionAnnotation(forOfPath.get('right'));
    if (annotationInfo) {
      const annotatedType = resolveElementType(annotationInfo.annotation, annotationInfo.scope, 0);
      if (annotatedType) return isAwait ? unwrapPromise(annotatedType) : annotatedType;
    }
    const runtimeType = resolveRuntimeIterableElement(forOfPath.get('right'));
    if (runtimeType) return isAwait ? unwrapPromise(runtimeType) : runtimeType;
    return null;
  }

  // { a: [{ b: 'x' }] } with path ['a', 0, 'b'] -> resolveObjectMember for 'x'
  // string keys resolve object properties, number keys resolve array elements
  function resolveObjectMemberPath(objPath, keyPath) {
    if (keyPath.length === 0) return resolveNodeType(objPath);
    const [step] = keyPath;
    const rest = keyPath.slice(1);
    if (typeof step === 'number') {
      // -1 = rest element, always Array
      if (step < 0) return new $Object('Array');
      if (!t.isArrayExpression(objPath.node) || objPath.node.elements.length <= step) return null;
      return resolveObjectMemberPath(resolveRuntimeExpression(objPath.get('elements')[step]), rest);
    }
    if (!t.isObjectExpression(objPath.node)) return null;
    if (!rest.length) return resolveObjectMember(objPath, step);
    const prop = findObjectMember(objPath, step);
    if (!prop || !t.isObjectProperty(prop.node)) return null;
    const next = resolveRuntimeExpression(prop.get('value'));
    return resolveObjectMemberPath(next, rest);
  }

  // try runtime object literal, then annotation-based resolution for a destructured member
  function resolveDestructuredMember(exprPath, keyPath) {
    const runtimeResult = resolveObjectMemberPath(resolveRuntimeExpression(exprPath), keyPath);
    if (runtimeResult) return runtimeResult;
    const info = findExpressionAnnotation(exprPath);
    if (info) return resolveAnnotatedMemberPath(info.annotation, keyPath, info.scope);
    return null;
  }

  // walk from a nested pattern up through parent wrappers, collecting the key path
  // { a: [{ b }] } -> from ObjectPattern({ b }) up to stop: ['a', 0]
  function collectPatternKeyPath(startPath, stop) {
    const result = [];
    let prev = startPath;
    let cur = startPath.parentPath;
    while (cur && cur !== stop && PATTERN_WRAPPERS.has(babelNodeType(cur.node))) {
      const type = babelNodeType(cur.node);
      if (type === 'ObjectProperty' || type === 'Property') {
        const key = cur.node.computed
          ? resolveComputedKeyName(cur.node.key, cur.scope ?? startPath.scope)
          : getKeyName(cur.node.key);
        if (key === null) return null;
        result.unshift(key);
      } else if (type === 'ArrayPattern') {
        const idx = cur.node.elements?.indexOf(prev.node);
        if (idx === undefined || idx < 0) return null;
        result.unshift(idx);
      }
      prev = cur;
      cur = cur.parentPath;
    }
    return result;
  }

  function resolveObjectBinding(objectPattern, varName, bindingPath) {
    // object rest: const { a, ...rest } = obj -> rest is always Object
    if (isRestBinding(objectPattern.properties, varName)) return new $Object('Object');
    // annotation on the pattern: const { items }: { items: number[] } = ...
    if (objectPattern.typeAnnotation) {
      const result = resolveDestructuredType(objectPattern, varName, bindingPath.scope);
      if (result) return result;
    }
    const keyPath = findDestructuredKeyPath(objectPattern, varName, bindingPath.scope);
    if (!keyPath) return null;
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      // build full path through nested patterns: { a: [{ b }] } = init -> ['a', 0, 'b']
      const prefix = collectPatternKeyPath(objectPattern, bindingPath);
      const fullPath = prefix?.length ? [...prefix, ...keyPath] : keyPath;
      const result = resolveDestructuredMember(bindingPath.get('init'), fullPath);
      if (result) return result;
    }
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) return resolveAnnotatedMemberPath(elemInfo.annotation, keyPath, elemInfo.scope);
    // runtime: for (const { name } of [{ name: [1,2,3] }])
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node)) {
      const iterPath = resolveRuntimeExpression(forOfPath.get('right'));
      if (t.isArrayExpression(iterPath.node) && iterPath.node.elements.length) {
        const firstElem = resolveRuntimeExpression(iterPath.get('elements')[0]);
        const result = resolveObjectMemberPath(firstElem, keyPath);
        if (result) return result;
      }
    }
    return resolveDestructuringDefault(objectPattern, varName, bindingPath);
  }

  function findBindingPattern(node, type) {
    if (node.type === type) return node;
    if (node.id?.type === type) return node.id;
    if (node.left?.type === type) return node.left;
    return null;
  }

  function resolveBindingType(path) {
    if (!t.isIdentifier(path.node)) return null;
    const binding = path.scope?.getBinding(path.node.name);
    if (!binding) return null;
    const { path: bindingPath } = binding;
    const { name } = path.node;
    const { node } = bindingPath;
    // rest-param: `function f(...xs) { xs.at(0) }` - `xs` is always an Array at runtime
    // regardless of call-site. annotated form (`...xs: T[]`) flows through the annotation
    // branch below; unannotated falls here. without this, `.at(0)` on `xs` dispatches the
    // generic polyfill instead of the array-specific helper
    if (node?.type === 'RestElement') {
      const annotated = findBindingAnnotation(bindingPath);
      if (annotated) return resolveTypeAnnotation(annotated, bindingPath.scope);
      return new $Object('Array');
    }
    // destructured object: for (const { a } of ...) or const { a } = ...
    const objectPattern = findBindingPattern(node, 'ObjectPattern');
    if (objectPattern) return resolveObjectBinding(objectPattern, name, bindingPath);
    // destructured array: for (const [a] of ...) or const [a] = ...
    const arrayPattern = findBindingPattern(node, 'ArrayPattern');
    if (arrayPattern) return resolveArrayBinding(arrayPattern, name, bindingPath);
    // direct annotation: function foo(x: T) or const x: T = ... or (x: T = default)
    // must NOT be reached for destructured bindings - their pattern-level annotation
    // describes the container type, not the element type
    const typeAnnotation = findBindingAnnotation(bindingPath);
    if (typeAnnotation) return resolveTypeAnnotation(typeAnnotation, bindingPath.scope);
    // for-in / for-of (only for direct bindings - destructured bindings return early above)
    const forLoopParent = findForLoopParent(bindingPath);
    if (forLoopParent) {
      // for-in: iteration variable is always a string per ECMAScript spec
      if (t.isForInStatement(forLoopParent.node)) return new $Primitive('string');
      // for-of / for-await-of: infer element type from the iterable
      if (t.isForOfStatement(forLoopParent.node)) return resolveForOfResolvedElement(forLoopParent);
    }
    // mutable binding: resolve from the last straight-line assignment before usage
    const lastAssign = findLastStraightLineAssignment(binding, path);
    if (lastAssign) {
      // `+=` / `-=` / ... - the assignment node's own type captures the result
      if (lastAssign.node.type === 'AssignmentExpression' && lastAssign.node.operator !== '=') {
        return resolveNodeType(lastAssign);
      }
      const left = assignLeft(lastAssign.node);
      const rightKey = assignRightKey(lastAssign.node);
      // destructuring: `({ a: { b } } = ...)` or `var { a: { b } } = ...`
      if (left?.type === 'ObjectPattern') {
        const keyPath = findDestructuredKeyPath(left, name, lastAssign.scope);
        if (!keyPath) return null;
        return resolveDestructuredMember(lastAssign.get(rightKey), keyPath);
      }
      // array destructuring: `[x] = ['hello']`, `var [{ a }] = [{ a: 'x' }]`
      if (left?.type === 'ArrayPattern') {
        const arrPath = findArrayPatternKeyPath(left, name, lastAssign.scope);
        if (arrPath) {
          const initPath = resolveRuntimeExpression(lastAssign.get(rightKey));
          return resolveObjectMemberPath(initPath, arrPath);
        }
        return null;
      }
      return resolveNodeType(lastAssign.get(rightKey));
    }
    // no assignment found - resolve from init when either const or all mutations are after usage
    if (t.isVariableDeclarator(node) && node.init) {
      const violations = binding.constantViolations;
      if (!violations?.length) return resolveNodeType(bindingPath.get('init'));
      const usagePos = path.node.start;
      if (usagePos !== undefined && violations.every(v => (v.node.start ?? -1) >= usagePos)) {
        return resolveNodeType(bindingPath.get('init'));
      }
    }
    return null;
  }

  // normalize a constantViolation path to its "assignment-like" ancestor. covers:
  //   - `x = y` / `({x} = y)`                          -> AssignmentExpression
  //   - `var x = y` redeclaration (subsequent `var`)    -> VariableDeclarator
  // Babel: violation IS the AssignmentExpression or the redeclared VariableDeclarator.
  // estree-toolkit: violation is the LHS Identifier - walk up through Property/ObjectPattern.
  // depth scales with destructuring nesting
  function violationToAssignment(v) {
    let p = v;
    for (let i = 0; i < MAX_DEPTH && p; i++) {
      const type = babelNodeType(p.node);
      if (type === 'AssignmentExpression' || type === 'VariableDeclarator') return p;
      if (type === 'ExpressionStatement' || type === 'Program') return null;
      p = p.parentPath;
    }
    return null;
  }

  // node-shape adapters: AssignmentExpression has left/right/operator; VariableDeclarator has id/init
  const assignLeft = n => n.type === 'VariableDeclarator' ? n.id : n.left;
  const assignRightKey = n => n.type === 'VariableDeclarator' ? 'init' : 'right';

  // if `path` is inside a synchronous IIFE within `targetScope`, return the CallExpression
  // path. matches `(() => { x = 1 })()` but NOT `setTimeout(() => { x = 1 })`
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
      if (cur.node.async || cur.node.generator) return null;
      // walk past parens and `(0, fn)` sequence wrappers
      let callee = cur;
      while (callee.parentPath?.node.type === 'ParenthesizedExpression'
        || (callee.parentPath?.node.type === 'SequenceExpression'
          && callee.node === callee.parentPath.node.expressions.at(-1))) {
        callee = callee.parentPath;
      }
      const call = callee.parentPath;
      if (call && (call.node.type === 'CallExpression' || call.node.type === 'OptionalCallExpression')
        && call.node.callee === callee.node) return call;
      return null;
    }
    return null;
  }

  // the AST node a scope is anchored to; Babel exposes `.block`, estree-toolkit - `.path.node`
  const scopeNode = s => s.block ?? s.path?.node;

  // scope is inside bindingScope's var-scope - same object, or nested through plain blocks
  // without crossing a function/StaticBlock boundary. lets us treat `var` writes in inner
  // BlockStatements as writes to the hoisted function-scope binding
  function isInBindingVarScope(scope, bindingScope) {
    for (let s = scope; s; s = s.parent) {
      if (s === bindingScope) return true;
      const node = scopeNode(s);
      if (t.isFunction(node) || t.isStaticBlock?.(node)) return false;
    }
    return false;
  }

  // every wrapping statement up to varScopeBody is a plain BlockStatement / Program /
  // StaticBlock - reject if / switch / loop / try / etc. that make execution conditional
  function reachesVarScopeStraightLine(startPath, varScopeBody) {
    for (let p = startPath; p; p = p.parentPath) {
      if (p.node === varScopeBody) return true;
      const { type } = p.node;
      if (type !== 'BlockStatement' && type !== 'Program' && type !== 'StaticBlock') return false;
    }
    return false;
  }

  const ASSIGN_LEFT_TYPES = new Set(['Identifier', 'ObjectPattern', 'ArrayPattern']);

  // lazy per-binding cache: valid assignments pre-filtered, sorted by pos; binary-searched per query
  let sortedAssignmentCache = new WeakMap();

  function buildSortedAssignments(binding) {
    const { scope: bindingScope, constantViolations } = binding;
    const bindingScopeNode = scopeNode(bindingScope);
    const varScopeBody = bindingScopeNode.type === 'Program' ? bindingScopeNode : bindingScopeNode.body;
    const out = [];
    for (const v of constantViolations) {
      const ap = violationToAssignment(v);
      if (!ap) continue;
      const isVarDecl = ap.node.type === 'VariableDeclarator';
      // `var x;` without init is a no-op at runtime - binding keeps its previous value
      if (isVarDecl && !ap.node.init) continue;
      if (!ASSIGN_LEFT_TYPES.has(assignLeft(ap.node)?.type)) continue;
      // lift through nested synchronous IIFE wrappers until we land in binding's var-scope
      let effectiveAp = ap;
      while (effectiveAp && !isInBindingVarScope(effectiveAp.scope, bindingScope)) {
        effectiveAp = findEnclosingIIFE(effectiveAp, bindingScope);
      }
      if (!effectiveAp) continue;
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null) continue;
      // walk to the directly-wrapping statement:
      //   AssignmentExpression -> ExpressionStatement
      //   VariableDeclarator -> VariableDeclaration (one step up)
      const stmtType = isVarDecl ? 'VariableDeclaration' : 'ExpressionStatement';
      let stmt = effectiveAp;
      while (stmt && stmt.node.type !== stmtType) stmt = stmt.parentPath;
      if (!stmt || !reachesVarScopeStraightLine(stmt.parentPath, varScopeBody)) continue;
      out.push({ ap, pos });
    }
    out.sort((a, b) => a.pos - b.pos);
    return out;
  }

  // find the last straight-line assignment before usagePath:
  // `x = value`, `x += value`, `({ x } = value)`, or a `var x = value` redeclaration -
  // same var-scope (possibly nested through plain blocks / synchronous IIFEs).
  // O(V) build per binding (cached), O(log V) per query
  function findLastStraightLineAssignment(binding, usagePath) {
    const beforePos = usagePath.node.start;
    if (beforePos === undefined || beforePos === null) return null;
    if (!binding.constantViolations?.length) return null;
    if (!isInBindingVarScope(usagePath.scope, binding.scope)) return null;

    let sortedAssigns = sortedAssignmentCache.get(binding);
    if (!sortedAssigns) {
      sortedAssigns = buildSortedAssignments(binding);
      sortedAssignmentCache.set(binding, sortedAssigns);
    }
    if (!sortedAssigns.length) return null;

    // largest entry with pos < beforePos
    let lo = 0;
    let hi = sortedAssigns.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedAssigns[mid].pos < beforePos) lo = mid + 1;
      else hi = mid;
    }
    return lo > 0 ? sortedAssigns[lo - 1].ap : null;
  }

  // --- Guard parsing & narrowing ---
  function matchesTypeofValue(resolved, value) {
    if (value === 'object') return (!resolved.primitive && resolved.constructor !== 'Function') || resolved.type === 'null';
    if (value === 'function') return resolved.constructor === 'Function';
    return resolved.primitive && resolved.type === value;
  }

  function matchesGuard(resolved, guard) {
    if (guard.kind === 'typeof') return matchesTypeofValue(resolved, guard.value);
    if (guard.kind === 'typeof-or') {
      for (const value of guard.values) if (matchesTypeofValue(resolved, value)) return true;
      return false;
    }
    return !resolved.primitive && resolved.constructor === guard.constructorName;
  }

  function isTypeofVar(node, varName) {
    if (node?.type !== 'UnaryExpression' || node.operator !== 'typeof') return false;
    const arg = unwrapParens(node.argument);
    return arg?.type === 'Identifier' && arg.name === varName;
  }

  // guard shape builders - single point of truth for the guard descriptor literal
  const typeofGuard = (value, negated) => ({ kind: 'typeof', value, negated });
  const instanceofGuard = (constructorName, negated) => ({ kind: 'instanceof', constructorName, negated });

  // hint convention: lowercase -> typeof guard (primitive), capitalized -> instanceof guard (object)
  function guardFromHint(hint, negated) {
    return PRIMITIVES.has(hint.type) ? typeofGuard(hint.type, negated) : instanceofGuard(hint.type, negated);
  }

  // convert a resolved type back to a typeof / instanceof guard. types that can't be
  // coerced to a primitive or named constructor are dropped (the guard wouldn't help
  // polyfill hint inference anyway).
  function guardFromResolvedType(resolved, negated) {
    if (!resolved) return null;
    if (resolved.primitive && PRIMITIVES.has(resolved.type)) return typeofGuard(resolved.type, negated);
    if (resolved.constructor) return instanceofGuard(resolved.constructor, negated);
    return null;
  }

  // resolve a callee identifier to a guard descriptor when the callee is a function whose
  // return type is a `TSTypePredicate`. `asserts` flag picks between the two predicate forms:
  //   `x is T`         - narrows only inside the truthy branch; callers pass `asserts=false`
  //   `asserts x is T` - narrows after the call completes normally; callers pass `asserts=true`
  // three annotation locations for a predicate:
  //   function isStr(x): x is string { ... }   -> FunctionDeclaration.returnType
  //   const isStr = (x): x is string => ...    -> init ArrowFunctionExpression.returnType
  //   const isStr: (x) => x is string = impl   -> VariableDeclarator.id.typeAnnotation.TSFunctionType
  // the last form is common when `impl` has no inline annotation (e.g. `const f: T = other`).
  // babel quirk: TSFunctionType stores the return type under `.typeAnnotation`, not `.returnType`
  function resolveBindingReturnType(declNode) {
    if (t.isFunction(declNode)) return unwrapTypeAnnotation(declNode.returnType);
    if (!t.isVariableDeclarator(declNode)) return null;
    if (declNode.init && t.isFunction(declNode.init)) {
      const inline = unwrapTypeAnnotation(declNode.init.returnType);
      if (inline) return inline;
    }
    const bindingAnnotation = unwrapTypeAnnotation(declNode.id?.typeAnnotation);
    if (bindingAnnotation?.type !== 'TSFunctionType') return null;
    return unwrapTypeAnnotation(bindingAnnotation.typeAnnotation ?? bindingAnnotation.returnType);
  }

  function resolvePredicateGuard(callee, scope, negated, asserts) {
    if (!scope || callee.type !== 'Identifier') return null;
    const binding = scope.getBinding(callee.name);
    if (!binding) return null;
    const returnType = resolveBindingReturnType(binding.path.node);
    if (returnType?.type !== 'TSTypePredicate' || !!returnType.asserts !== asserts) return null;
    const resolved = resolveTypeAnnotation(returnType.typeAnnotation, binding.path.scope);
    return guardFromResolvedType(resolved, negated);
  }

  // user-defined type predicate: `function isStr(x): x is string`, arrow form, or method
  // assigned to a const
  function parseUserPredicateGuard(callee, scope, negated) {
    return resolvePredicateGuard(callee, scope, negated, false);
  }

  // `assertArray(x)` as a statement - `asserts x is T` narrows x from that point forward.
  // only the first argument participates (TS doesn't support asserts on non-first params)
  function parseAssertionStatementGuard(sibling, varName) {
    if (sibling.node?.type !== 'ExpressionStatement') return null;
    const call = sibling.node.expression;
    if (call?.type !== 'CallExpression' || !call.arguments?.length) return null;
    const arg = unwrapParens(call.arguments[0]);
    if (arg?.type !== 'Identifier' || arg.name !== varName) return null;
    const guard = resolvePredicateGuard(call.callee, sibling.scope, false, true);
    if (guard) guard.positive = true;
    return guard;
  }

  function parseTypeGuard(testNode, varName, scope) {
    let negated = false;
    let test = testNode;
    // ESTree (oxc-parser) preserves ParenthesizedExpression - unwrap
    while (test.type === 'ParenthesizedExpression') test = test.expression;
    if (test.type === 'UnaryExpression' && test.operator === '!') {
      negated = true;
      test = test.argument;
      while (test.type === 'ParenthesizedExpression') test = test.expression;
    }
    if (test.type === 'BinaryExpression') {
      const { operator } = test;
      // unwrap parens + ChainExpression + TS wrappers so `(x as any) instanceof Array`
      // and `x! instanceof Array` narrow the same as bare `x instanceof Array`
      const left = unwrapRuntimeExpr(test.left);
      const right = unwrapRuntimeExpr(test.right);
      const isNegatedOp = operator === '!==' || operator === '!=';
      if (isNegatedOp || operator === '===' || operator === '==') {
        if (isNegatedOp) negated = !negated;
        // pick the `typeof varName` side explicitly so `typeof a === typeof b` doesn't misfire
        const leftIsTypeof = isTypeofVar(left, varName);
        const rightIsTypeof = !leftIsTypeof && isTypeofVar(right, varName);
        if (leftIsTypeof || rightIsTypeof) {
          const literalSide = leftIsTypeof ? right : left;
          if (babelNodeType(literalSide) === 'StringLiteral') return typeofGuard(literalSide.value, negated);
          // template literal with no expressions: `object` === typeof x
          if (literalSide.type === 'TemplateLiteral' && literalSide.expressions.length === 0) {
            return typeofGuard(literalSide.quasis[0].value.cooked, negated);
          }
        }
      }
      if (operator === 'instanceof'
        && left.type === 'Identifier' && left.name === varName) {
        const constructorName = right.type === 'Identifier' ? right.name : globalProxyMemberName(right);
        if (constructorName) return instanceofGuard(constructorName, negated);
      }
    }
    if (test.type === 'CallExpression' && test.arguments?.length === 1) {
      const arg = unwrapParens(test.arguments[0]);
      if (arg.type === 'Identifier' && arg.name === varName) {
        const { callee } = test;
        if (callee.type === 'MemberExpression' && !callee.computed
          && callee.object.type === 'Identifier' && callee.property.type === 'Identifier') {
          const hint = lookupNested(KNOWN_STATIC_TYPE_GUARDS, callee.object.name, callee.property.name);
          if (hint) return guardFromHint(hint, negated);
        }
        const userGuard = parseUserPredicateGuard(callee, scope, negated);
        if (userGuard) return userGuard;
      }
    }
    return null;
  }

  const EXIT_STATEMENTS = new Set([
    'BreakStatement',
    'ContinueStatement',
    'ReturnStatement',
    'ThrowStatement',
  ]);

  function nodeAlwaysExits(node, depth = 0) {
    if (depth > MAX_DEPTH) return false;
    if (EXIT_STATEMENTS.has(node.type)) return true;
    if (node.type === 'BlockStatement') {
      const { body } = node;
      for (let i = 0; i < body.length; i++) if (nodeAlwaysExits(body[i], depth + 1)) return true;
      return false;
    }
    if (node.type === 'IfStatement') {
      return node.alternate
        && nodeAlwaysExits(node.consequent, depth + 1)
        && nodeAlwaysExits(node.alternate, depth + 1);
    }
    // finally exit overrides; otherwise need both try and catch (if any) to exit
    if (node.type === 'TryStatement') {
      if (node.finalizer && nodeAlwaysExits(node.finalizer, depth + 1)) return true;
      if (!nodeAlwaysExits(node.block, depth + 1)) return false;
      return !node.handler || nodeAlwaysExits(node.handler.body, depth + 1);
    }
    return false;
  }

  function blockAlwaysExits(block, depth = 0) {
    return nodeAlwaysExits(block.node, depth);
  }

  function canFallThrough($case) {
    const { consequent } = $case;
    for (let i = 0; i < consequent.length; i++) if (nodeAlwaysExits(consequent[i])) return false;
    return true;
  }

  // flatten a && b && c when condition is true, or a || b || c when condition is false
  // only flattens the matching operator; mixed operators stay as opaque nodes
  function flattenCondition(node, operator) {
    const result = [];
    const stack = [unwrapParens(node)];
    while (stack.length) {
      const current = unwrapParens(stack.pop());
      if (current.type === 'LogicalExpression' && current.operator === operator) {
        stack.push(current.right, current.left);
      } else {
        result.push(current);
      }
    }
    return result;
  }

  // parse an OR group of typeof guards: typeof x === 'a' || typeof x === 'b' (conditionTrue=true)
  // or De Morgan form: typeof x !== 'a' && typeof x !== 'b' (conditionTrue=false)
  function parseTypeofOrGuard(node, varName, conditionTrue) {
    const operator = conditionTrue ? '||' : '&&';
    const expectNegated = !conditionTrue;
    node = unwrapParens(node);
    if (node.type !== 'LogicalExpression' || node.operator !== operator) return null;
    const parts = flattenCondition(node, operator);
    const values = new Set();
    for (const part of parts) {
      // user predicates are unrelated to typeof - pass null scope to keep this fast
      const guard = parseTypeGuard(part, varName, null);
      if (!guard || guard.kind !== 'typeof' || guard.negated !== expectNegated) return null;
      values.add(guard.value);
    }
    return values.size >= 2 ? { kind: 'typeof-or', values, negated: expectNegated } : null;
  }

  // extract guards for varName from a condition, applying && / || flattening.
  // scope is the lookup scope for resolving user-defined type predicate functions.
  function parseGuardsFromCondition(testNode, conditionTrue, varName, scope) {
    const parts = flattenCondition(testNode, conditionTrue ? '&&' : '||');
    const guards = [];
    for (const part of parts) {
      const guard = parseTypeGuard(part, varName, scope) || parseTypeofOrGuard(part, varName, conditionTrue);
      if (guard) {
        guard.positive = conditionTrue !== guard.negated;
        guards.push(guard);
      }
    }
    return guards;
  }

  // if / ternary / && / || - unified: parse guards from condition, determine polarity
  function findConditionalGuards(current, varName) {
    const parent = current.parentPath;
    if (!parent) return [];
    let conditionTrue, testNode;
    if (t.isIfStatement(parent.node) || t.isConditionalExpression(parent.node)) {
      const { key } = current;
      if (key !== 'consequent' && key !== 'alternate') return [];
      conditionTrue = key === 'consequent';
      testNode = parent.node.test;
    } else if (t.isLogicalExpression(parent.node) && current.key === 'right') {
      const { operator } = parent.node;
      if (operator !== '&&' && operator !== '||') return [];
      conditionTrue = operator === '&&';
      testNode = parent.node.left;
    } else return [];
    return parseGuardsFromCondition(testNode, conditionTrue, varName, current.scope);
  }

  // resolve a string value from a case test: StringLiteral directly or constant Identifier binding
  function caseTestStringValue(test, scope) {
    if (!test) return null;
    if (babelNodeType(test) === 'StringLiteral') return test.value;
    if (test.type === 'Identifier') {
      const bindingPath = constantBindingPath(test.name, scope);
      if (t.isVariableDeclarator(bindingPath?.node)) {
        const { init } = bindingPath.node;
        if (babelNodeType(init) === 'StringLiteral') return init.value;
      }
    }
    return null;
  }

  // switch (typeof x) { case 'string': ... ; default: ... }
  function findSwitchCaseGuards(current, varName) {
    if (!t.isSwitchCase(current.parentPath?.node)) return [];
    const switchCase = current.parentPath;
    const switchStmt = switchCase.parentPath;
    if (!t.isSwitchStatement(switchStmt?.node)) return [];
    if (!isTypeofVar(switchStmt.node.discriminant, varName)) return [];
    const { cases } = switchStmt.node;
    const { scope } = switchCase;
    const caseIndex = cases.indexOf(switchCase.node);
    const caseValue = caseTestStringValue(switchCase.node.test, scope);
    // specific case: typeof value is known
    if (caseValue !== null) {
      // collect fall-through predecessors into a typeof-or group
      const values = new Set([caseValue]);
      for (let i = caseIndex - 1; i >= 0; i--) {
        if (!canFallThrough(cases[i])) break;
        // bail if default or non-resolvable test in the fall-through chain
        const predValue = caseTestStringValue(cases[i].test, scope);
        if (predValue === null) return [];
        values.add(predValue);
      }
      if (values.size === 1) return [{ kind: 'typeof', value: caseValue, positive: true, negated: false }];
      return [{ kind: 'typeof-or', values, negated: false, positive: true }];
    }
    // default case: none of the explicit cases matched -> negative guards for each
    if (switchCase.node.test === null) {
      // bail if a preceding case can fall through to default - negative guards would be unsound
      if (caseIndex > 0 && canFallThrough(cases[caseIndex - 1])) return [];
      const guards = [];
      for (const $case of cases) {
        const value = caseTestStringValue($case.test, scope);
        if (value !== null) guards.push({ kind: 'typeof', value, positive: false, negated: false });
      }
      return guards;
    }
    return [];
  }

  // if (...) return; -> false (consequent exits, condition was true -> narrowed type is !condition)
  // if (...) {} else return; -> true (alternate exits, condition was true -> narrowed type is condition)
  function resolveExitCondition(sibling) {
    if (!t.isIfStatement(sibling.node)) return null;
    if (blockAlwaysExits(sibling.get('consequent'))) return false;
    if (sibling.node.alternate && blockAlwaysExits(sibling.get('alternate'))) return true;
    return null;
  }

  // if (typeof x === 'string') return; -> x is narrowed after the if
  // `assertArray(x)` -> x is narrowed after the call (asserts-predicate shape)
  // collects ALL preceding guards, including && / || flattening
  function findPrecedingExitGuards(siblings, index, varName) {
    const guards = [];
    for (let i = index - 1; i >= 0; i--) {
      const sibling = siblings[i];
      const conditionTrue = resolveExitCondition(sibling);
      if (conditionTrue !== null) {
        guards.push(...parseGuardsFromCondition(sibling.node.test, conditionTrue, varName, sibling.scope));
        continue;
      }
      const assertionGuard = parseAssertionStatementGuard(sibling, varName);
      if (assertionGuard) guards.push(assertionGuard);
    }
    return guards;
  }

  // get the statement list containing `current` if it's a numbered member of a block-like parent
  function getStatementSiblings(current) {
    if (typeof current.key !== 'number') return null;
    const parent = current.parentPath;
    if (current.listKey === 'body' && (t.isBlockStatement(parent.node) || t.isProgram(parent.node))) return parent.get('body');
    if (current.listKey === 'consequent' && t.isSwitchCase(parent.node)) return parent.get('consequent');
    return null;
  }

  // hot path: walked repeatedly from both findEnclosingTypeGuards and hasMutationAfterGuards
  // as they climb parent paths. same (pathNode, varName) pair is hit many times across
  // sibling identifier walks; WeakMap keyed on the path node avoids re-scanning siblings
  let earlyExitGuardsCache = new WeakMap();
  function findEarlyExitGuards(current, varName) {
    const node = current?.node;
    if (!node) return [];
    const byVar = getOrInitMap(earlyExitGuardsCache, node);
    if (byVar.has(varName)) return byVar.get(varName);
    const siblings = getStatementSiblings(current);
    const result = siblings ? findPrecedingExitGuards(siblings, current.key, varName) : [];
    byVar.set(varName, result);
    return result;
  }

  // shadow check: a guard's test lives in the enclosing scope (parent of `current` in the
  // walk, sibling-aware for early-exit). when that scope's `varName` resolves to a different
  // binding than the inner usage's, the guard refers to a shadowed identifier and must not
  // narrow our binding. shared by findEnclosingTypeGuards and hasMutationAfterGuards
  function guardAppliesToBinding(testScope, varName, binding) {
    return !binding || testScope?.getBinding(varName) === binding;
  }

  // collect ALL type guards along the AST path for cumulative narrowing.
  // const bindings can't be reassigned - function boundaries don't invalidate guards
  function findEnclosingTypeGuards(path, varName, isConst = false, binding = null) {
    const guards = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      if (t.isFunction(current.node) && !isConst) break;
      if (!guardAppliesToBinding(current.parentPath?.scope, varName, binding)) continue;
      guards.push(
        ...findConditionalGuards(current, varName),
        ...findSwitchCaseGuards(current, varName),
        ...findEarlyExitGuards(current, varName),
      );
    }
    return guards.length ? guards : null;
  }

  // resolve the type a guard implies: typeof 'string' -> $Primitive('string'), instanceof Array -> $Object('Array')
  function resolveGuardType(guard) {
    if (guard.kind === 'typeof') {
      if (PRIMITIVES.has(guard.value)) return new $Primitive(guard.value);
      if (guard.value === 'function') return new $Object('Function');
      // 'object' is too ambiguous - could be Array, Map, Set, Date, null, etc.
      return null;
    }
    if (guard.kind === 'instanceof') return resolveKnownConstructor(guard.constructorName);
    return null;
  }

  // filter candidate types by guards, return the unique surviving type or null
  function narrowByGuards(candidates, guards) {
    let result = null;
    for (const resolved of candidates) {
      if (!resolved) continue;
      if (isNullableOrNever(resolved)) continue;
      if (!guards.every(guard => matchesGuard(resolved, guard) === guard.positive)) continue;
      result = commonType(result, resolved);
      if (!result) return null;
    }
    return result;
  }

  // check whether any reassignment of binding could execute between a guard check and usagePath
  function hasMutationAfterGuards(binding, usagePath, varName) {
    const { constantViolations } = binding;
    const usageStart = usagePath.node.start;
    const isDescendant = (v, scope) => {
      for (let p = v; p; p = p.parentPath) if (p === scope) return true;
      return false;
    };
    // any mutation inside scope
    const violates = scope => constantViolations.some(v => isDescendant(v, scope));
    // only mutations inside scope that are positionally before usagePath
    // if either position is missing (synthetic AST nodes), conservatively assume mutation is before usage
    const isBefore = v => v.node.start === null || v.node.start === undefined
      || usageStart === null || usageStart === undefined || v.node.start < usageStart;
    const violatesBefore = scope => constantViolations.some(v => isDescendant(v, scope) && isBefore(v));
    for (let current = usagePath, parent; (parent = current.parentPath) && !t.isFunction(parent.node); current = parent) {
      if (!guardAppliesToBinding(parent.scope, varName, binding)) continue;
      if (findConditionalGuards(current, varName).length && violatesBefore(current)) return true;
      if (findSwitchCaseGuards(current, varName).length && violatesBefore(parent)) return true;
      if (findEarlyExitGuards(current, varName).length) {
        const siblings = getStatementSiblings(current);
        for (let i = current.key - 1; i >= 0; i--) {
          const conditionTrue = resolveExitCondition(siblings[i]);
          if (conditionTrue === null) continue;
          if (!parseGuardsFromCondition(siblings[i].node.test, conditionTrue, varName, siblings[i].scope).length) continue;
          // check ALL exit guards, not just the nearest - a weaker guard closer to usage
          // does not invalidate mutations that occurred after a stronger guard further away
          for (let j = i + 1; j < current.key; j++) if (violates(siblings[j])) return true;
          if (violatesBefore(siblings[current.key])) return true;
        }
      }
    }
    return false;
  }

  // shared prologue: find guards for an identifier binding, cached per AST node
  let guardsCache = new WeakMap();

  function findGuardsForBinding(path) {
    if (!t.isIdentifier(path.node)) return null;
    const { node } = path;
    if (guardsCache.has(node)) return guardsCache.get(node);
    const { name } = node;
    const binding = path.scope?.getBinding(name);
    let result = null;
    if (binding) {
      // classify the annotation BEFORE collecting guards - a concrete (closed) annotation
      // can't be refined by typeof/instanceof, and neither caller uses guards in that case.
      // skipping the parent-path walk here is the main win (guard collection is O(depth))
      const classification = classifyGuardAnnotation(binding);
      if (classification.kind !== 'closed') {
        const isConst = !binding.constantViolations?.length;
        const guards = findEnclosingTypeGuards(path, name, isConst, binding);
        if (guards && (isConst
            || (!hasMutationAfterGuards(binding, path, name)
              && !hasMutationInCapturedFunction(binding)))) {
          // stash the classification on the result - callers reuse it instead of re-deriving
          result = { binding, guards, classification };
        }
      }
    }
    guardsCache.set(node, result);
    return result;
  }

  // bail narrowing if any reassignment lives inside a nested function - that function may
  // be invoked between the guard and the usage, breaking type narrowing
  function hasMutationInCapturedFunction({ constantViolations, scope }) {
    if (!constantViolations?.length) return false;
    return constantViolations.some(v => {
      for (let p = v.parentPath; p && p !== scope.path; p = p.parentPath) {
        if (t.isFunction(p.node)) return true;
      }
      return false;
    });
  }

  // classify a binding's annotation for the guard-based narrowing path:
  //   'none'   - no annotation; guards produce the type from scratch
  //   'union'  - union annotation; guards filter its branches (types/subst provided)
  //   'open'   - unknown/any/object/mixed; guards may refine it to a concrete type
  //   'closed' - any other annotation; guards can't meaningfully refine it
  function classifyGuardAnnotation(binding) {
    const annotation = findBindingAnnotation(binding.path);
    if (!annotation) return { kind: 'none' };
    const { scope } = binding.path;
    const { node: resolved, subst } = followTypeAliasChain(annotation, scope);
    if (resolved?.type === 'TSUnionType' || resolved?.type === 'UnionTypeAnnotation') {
      return { kind: 'union', types: resolved.types, subst, scope };
    }
    // TS `unknown`/`any`/`object`, Flow `mixed`/`any` are wide-open enough that
    // typeof / instanceof guards can refine them - `unknown` is the canonical place
    // users put guards and `object` still accepts Array.isArray() / instanceof
    if (resolved?.type === 'TSUnknownKeyword' || resolved?.type === 'TSAnyKeyword'
      || resolved?.type === 'TSObjectKeyword' || resolved?.type === 'AnyTypeAnnotation'
      || resolved?.type === 'MixedTypeAnnotation') return { kind: 'open' };
    return { kind: 'closed' };
  }

  function resolveTypeGuardNarrowing(path) {
    const info = findGuardsForBinding(path);
    if (!info) return null;
    const { guards, classification } = info;
    if (classification.kind === 'union') {
      const { types, subst, scope } = classification;
      if (!types?.length) return null;
      return narrowByGuards(types.map(member => resolveTypeAnnotation(applyAliasSubstDeep(member, subst), scope)), guards);
    }
    // 'closed' is already filtered by findGuardsForBinding - only 'none', 'open', 'union' reach here
    return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType), guards);
  }

  // --- Entry / public API ---
  let resolveCache = new WeakMap();

  // rebuild per-file to bound memory and drop retained entries from previous parses
  // (WeakMap is GC-safe, but rebuilding makes the memory footprint deterministic)
  function reset() {
    typeParamArgPaths = new WeakMap();
    sortedAssignmentCache = new WeakMap();
    guardsCache = new WeakMap();
    earlyExitGuardsCache = new WeakMap();
    ambientDeclCache = new WeakMap();
    resolveCache = new WeakMap();
    typeDeclCache = new WeakMap();
    classFieldTypeCache = new WeakMap();
    classExportedCache = new WeakMap();
    moduleFieldIndexCache = new WeakMap();
  }

  function resolveNodeType(path) {
    const { node } = path;
    if (!node) return null;
    if (resolveCache.has(node)) return resolveCache.get(node);
    // sentinel before recursion: circular references (e.g. `const a = b.x(); const b = a.x();`)
    // resolve to null (unknown type) instead of causing infinite recursion
    resolveCache.set(node, null);
    let result;
    try {
      result = resolveNodeTypeExpression(path);
      if (!result) {
        // guards win over the raw binding type: for open annotations and unannotated
        // bindings they yield the most specific type, otherwise we fall back.
        result = resolveTypeGuardNarrowing(path) || resolveBindingType(path);
      } else if (!result.inner && t.isIdentifier(path.node)) {
        // when runtime resolution determined the outer type but not the inner type (e.g. `new Set()` -> Set),
        // check if a type annotation provides a richer type with the same outer but known inner
        // (e.g. `const s: Set<string> = new Set()` -> Set<string>)
        const annotated = resolveBindingType(path);
        if (annotated?.inner && typesEqual(result, annotated)) result = annotated;
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

  const DOM_COLLECTION_CONSTRUCTORS = assign(create(null), {
    DOMTokenList: 'domcollection',
    HTMLCollection: 'domcollection',
    NodeList: 'domcollection',
  });

  function toHint(type) {
    if (!type) return null;
    if (type.primitive) return type.type === 'unknown' ? null : type.type;
    const name = type.constructor;
    if (!name) return null;
    if (hasOwn(DOM_COLLECTION_CONSTRUCTORS, name)) return DOM_COLLECTION_CONSTRUCTORS[name];
    return name.toLowerCase();
  }

  // intersect a whitelist set with another hint set
  // if included is null, returns a fresh copy of the hints
  function intersectHintSets(included, hints) {
    if (!included) return new Set(hints);
    for (const hint of included) if (!hints.has(hint)) included.delete(hint);
    return included;
  }

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

  return { resolvePropertyObjectType, resolveGuardHints, resolveNodeType, toHint, isString, isObject, reset };
}

export { createResolveNodeType, TYPE_HINTS };
