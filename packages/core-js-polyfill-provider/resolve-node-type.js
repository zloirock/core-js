import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName } from './helpers.js';

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

const { assign, create, entries, hasOwn, keys } = Object;

// shared recursion budget for all resolvers - alias chains, runtime walks, guard traversals
const MAX_DEPTH = 64;

const PRIMITIVE_WRAPPERS = assign(create(null), {
  bigint: 'BigInt',
  boolean: 'Boolean',
  number: 'Number',
  string: 'String',
  symbol: 'Symbol',
});

const PRIMITIVE_HINTS = new Set(keys(PRIMITIVE_WRAPPERS));

const UNBOXED_PRIMITIVES = create(null);
for (const [primitive, constructor] of entries(PRIMITIVE_WRAPPERS)) UNBOXED_PRIMITIVES[constructor] = primitive;

const PRIMITIVES = new Set([
  ...PRIMITIVE_HINTS,
  'null',
  'undefined',
]);

const TYPE_HINTS = new Set([
  ...PRIMITIVE_HINTS,
  'array',
  'asynciterator',
  'date',
  'domcollection',
  'function',
  'iterator',
  'object',
  'promise',
  'regexp',
]);

// lack of boxed primitives - acceptable assumption
const TYPEOF_HINT_GROUPS = [...keys(PRIMITIVE_WRAPPERS), 'function'].reduce((memo, type) => {
  memo[type] = new Set([type]);
  return memo;
}, create(null));

// object group: all hints not covered by explicit typeof groups
TYPEOF_HINT_GROUPS.object = new Set([...TYPE_HINTS].filter(h => {
  for (const group of Object.values(TYPEOF_HINT_GROUPS)) if (group.has(h)) return false;
  return true;
}));

// collection types whose first type parameter is the element type
const SINGLE_ELEMENT_COLLECTIONS = new Set([
  'Array',
  'ReadonlyArray',
  'Set',
  'ReadonlySet',
  'Iterable',
  'IterableIterator',
  'Iterator',
  'AsyncIterable',
  'AsyncIterableIterator',
  'AsyncIterator',
  'Generator',
  'AsyncGenerator',
]);

function $Primitive(type) {
  this.type = type;
  this.constructor = null;
  // inner stored as a hint string, resolved lazily via resolveInnerType
  this.inner = type === 'string' ? 'string' : null;
}

$Primitive.prototype.primitive = true;

function $Object(constructor, inner) {
  this.type = 'object';
  this.constructor = constructor;
  this.inner = inner ?? null;
}

$Object.prototype.primitive = false;

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
    return literalKeyValue(key);
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

  // Babel does not register ambient `declare function f(): T` declarations in `scope.bindings`,
  // so a plain `getBinding(name)` lookup misses them. Walk enclosing scopes' bodies to find one
  function findAmbientFunctionPath(name, scope) {
    for (let cur = scope; cur; cur = cur.parent) {
      const bodyPaths = cur.path?.get('body');
      if (!Array.isArray(bodyPaths)) continue;
      for (const stmtPath of bodyPaths) {
        const { type } = stmtPath.node ?? {};
        const declPath = type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration'
          ? stmtPath.get('declaration') : stmtPath;
        const { node } = declPath;
        if ((node?.type === 'TSDeclareFunction' || node?.type === 'DeclareFunction')
          && node.id?.name === name) return declPath;
      }
    }
    return null;
  }

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

  // detect the trivial passthrough mapped type `{ [K in keyof T]: T[K] }` and return T;
  // anything more complex (renames, conditional bodies, key remap, etc.) returns null
  function unwrapMappedTypePassthrough(node) {
    if (!node || node.type !== 'TSMappedType') return null;
    if (node.nameType || node.optional || node.readonly || !node.typeAnnotation) return null;
    const param = node.typeParameter;
    if (!param || param.constraint?.type !== 'TSTypeOperator' || param.constraint.operator !== 'keyof') return null;
    // typeParameter.name is a bare string in babel-parser ASTs and an Identifier in oxc/ESTree
    const paramName = typeof param.name === 'string' ? param.name : param.name?.name;
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
    node = unwrapTypeAnnotation(node);
    while (depth-- && (node?.type === 'TSTypeReference' || node?.type === 'GenericTypeAnnotation')) {
      const refName = typeRefName(node);
      if (!refName) break;
      const decl = findTypeDeclaration(refName, scope);
      if (!isTypeAlias(decl)) break;
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
      if (passthrough) node = unwrapTypeAnnotation(subst ? applyAliasSubst(passthrough, subst) : passthrough);
    }
    return { node, subst };
  }

  // substitute direct type parameter references through a subst map from followTypeAliasChain
  function applyAliasSubst(node, subst) {
    if (!subst) return node;
    const name = typeRefName(node);
    return name && subst.has(name) ? subst.get(name) : node;
  }

  // deep variant of applyAliasSubst: recurses into refs/args/arrays/tuples/unions so
  // interface-extends args reach inherited members after getTypeMembers flattens them
  function substSlot(node, slot, subst) {
    const next = applyAliasSubstDeep(node[slot], subst);
    return next === node[slot] ? node : { ...node, [slot]: next };
  }
  function substList(node, slot, subst) {
    const list = node[slot];
    if (!list?.length) return node;
    const next = list.map(el => applyAliasSubstDeep(el, subst));
    return next.every((el, i) => el === list[i]) ? node : { ...node, [slot]: next };
  }
  function applyAliasSubstDeep(node, subst) {
    if (!subst || !node || typeof node !== 'object') return node;
    switch (node.type) {
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const name = typeRefName(node);
        if (name && subst.has(name)) return subst.get(name);
        const args = getTypeArgs(node);
        if (!args?.params?.length) return node;
        const next = args.params.map(p => applyAliasSubstDeep(p, subst));
        if (next.every((p, i) => p === args.params[i])) return node;
        const argsKey = node.typeParameters ? 'typeParameters' : 'typeArguments';
        return { ...node, [argsKey]: { ...args, params: next } };
      }
      case 'TSTypeAnnotation':
      case 'TypeAnnotation':
      case 'TSParenthesizedType':
      case 'TSOptionalType':
      case 'NullableTypeAnnotation': return substSlot(node, 'typeAnnotation', subst);
      case 'TSArrayType':
      case 'ArrayTypeAnnotation': return substSlot(node, 'elementType', subst);
      case 'TSTupleType': return substList(node, 'elementTypes', subst);
      case 'TupleTypeAnnotation':
      case 'TSUnionType':
      case 'UnionTypeAnnotation':
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation': return substList(node, 'types', subst);
      case 'TSTypeLiteral': {
        let changed = false;
        const members = node.members?.map(m => {
          const ta = m.typeAnnotation ? applyAliasSubstDeep(m.typeAnnotation, subst) : m.typeAnnotation;
          const rt = m.returnType ? applyAliasSubstDeep(m.returnType, subst) : m.returnType;
          if (ta === m.typeAnnotation && rt === m.returnType) return m;
          changed = true;
          return { ...m, typeAnnotation: ta, returnType: rt };
        });
        return changed ? { ...node, members } : node;
      }
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

  // typeof obj.prop - resolve a qualified member access from a binding
  function resolveTypeofQualifiedMember(objectName, memberName, scope) {
    const bindingPath = constantBindingPath(objectName, scope);
    if (!bindingPath) return null;
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
    const annotation = findBindingAnnotation(bindingPath);
    if (annotation) return resolveAnnotatedMember(annotation, memberName, scope);
    return null;
  }

  function resolveTypeQuery(node, scope) {
    const { exprName } = node;
    // typeof obj.prop - qualified name (one level deep)
    if (exprName?.type === 'TSQualifiedName') {
      const { left, right } = exprName;
      if (left.type !== 'Identifier' || right.type !== 'Identifier') return null;
      return resolveTypeofQualifiedMember(left.name, right.name, scope);
    }
    if (exprName?.type !== 'Identifier') return null;
    return resolveTypeofBinding(exprName.name, scope);
  }

  // resolve an enum declaration to a primitive type
  // string enum -> $Primitive('string'), numeric enum -> $Primitive('number'), mixed/empty -> null
  function resolveEnumMemberKind(initializer) {
    if (!initializer) return 'number'; // implicit numeric
    if (babelNodeType(initializer) === 'StringLiteral') return 'string';
    if (babelNodeType(initializer) === 'NumericLiteral' || initializer.type === 'UnaryExpression') return 'number';
    return null; // template literal, expression, etc.
  }

  function resolveEnumType(declaration) {
    // ESTree (oxc-parser): members under body.members; Babel: directly on declaration
    const members = declaration.members ?? declaration.body?.members;
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

  // unwrap a top-level statement past `export {Named,Default}Declaration` wrappers, returning
  // the inner declaration node (or null if there's no `declaration` to unwrap to)
  function unwrapExportedDeclaration(statement) {
    if (statement?.type === 'ExportNamedDeclaration' || statement?.type === 'ExportDefaultDeclaration') {
      return statement.declaration ?? null;
    }
    return statement;
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

  function findTypeDeclaration(name, scope) {
    return walkScopesForDecl(name, scope, null);
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

  // ESTree (oxc-parser TS-ESTree): uses typeArguments; Babel: uses typeParameters
  function getTypeArgs(node) {
    return node?.typeParameters ?? node?.typeArguments;
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
  // resolve type arguments at a usage site and map them to a declaration's type parameters
  // when typeParamMap is provided, extends it; when null, builds from scratch
  // e.g. for `type Foo<T> = Array<T>` used as `Foo<string>`, maps { T: $Primitive('string') }
  function resolveTypeArgs(decl, node, typeParamMap, scope, depth) {
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
        ? substituteTypeParams(arg, localMap, scope, depth + 1)
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

  // resolve a user-defined type alias or interface, optionally substituting type parameters
  // typeParamMap: when provided (from generic function substitution or parent type args), propagates substitutions
  // when null, type arguments at usage site (e.g. Foo<string>) are resolved and propagated automatically
  function resolveUserDefinedType(name, node, scope, depth, typeParamMap) {
    if (depth > MAX_DEPTH) return null;
    // type parameters shadow type declarations with the same name
    const typeParam = findTypeParameter(name, scope);
    if (typeParam) {
      const annotation = typeParam.constraint ?? typeParam.default;
      if (!annotation) return null;
      return typeParamMap
        ? substituteTypeParams(annotation, typeParamMap, typeParam.scope, depth + 1)
        : resolveTypeAnnotation(annotation, typeParam.scope, depth + 1);
    }
    const declaration = findTypeDeclaration(name, scope);
    if (!declaration) return null;
    typeParamMap = resolveTypeArgs(declaration, node, typeParamMap, scope, depth);
    const resolve = typeParamMap
      ? p => substituteTypeParams(p, typeParamMap, scope, depth + 1)
      : p => resolveTypeAnnotation(p, scope, depth + 1);
    if (isTypeAlias(declaration)) return resolve(typeAliasBody(declaration));
    if (declaration.type === 'TSEnumDeclaration') return resolveEnumType(declaration);
    if (isInterfaceDeclaration(declaration)) {
      const parents = declaration.extends;
      if (parents?.length) {
        for (const parent of parents) {
          const base = extendsId(parent);
          if (base.type !== 'Identifier') continue;
          const constructor = resolveKnownConstructor(base.name);
          const result = resolveKnownContainerType(base.name, constructor, parent, resolve)
            || resolveUserDefinedType(base.name, parent, scope, depth + 1, typeParamMap);
          if (result) return result;
        }
      }
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
    if (!isInterfaceDeclaration(decl)) return null;
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

  function getTypeMembers(objectType, scope, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    if (objectType.type === 'TSTypeLiteral') return objectType.members;
    if (objectType.type === 'ObjectTypeAnnotation') return objectType.properties;
    // intersection: collect members from all parts
    if (objectType.type === 'TSIntersectionType' || objectType.type === 'IntersectionTypeAnnotation') {
      const all = [];
      for (const member of objectType.types) {
        const members = getTypeMembers(unwrapTypeAnnotation(member), scope, depth + 1);
        if (members) for (const m of members) all.push(m);
      }
      return all.length ? all : null;
    }
    // handle dotted refs (`NS.Data`) by passing the segment path through
    const segments = typeRefSegments(objectType);
    if (!segments) return null;
    // fast path first; only re-walk for the rare interface-merging case
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    if (isInterfaceDeclaration(declaration)) {
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
          const parentMembers = getTypeMembers(parentRef, scope, depth + 1);
          if (!parentMembers) continue;
          const parentSubst = buildParentSubst(parentRef, scope);
          for (const m of parentMembers) all.push(parentSubst ? substMemberAnnotations(m, parentSubst) : m);
        }
      }
      return all.length ? all : null;
    }
    if (isClassLikeDeclaration(declaration)) {
      // class as type: instance members are non-static class body entries.
      // findTypeMember handles ClassProperty / ClassMethod / TSDeclareMethod uniformly.
      return declaration.body?.body?.filter(m => !m?.static) ?? null;
    }
    if (isTypeAlias(declaration)) {
      return getTypeMembers(unwrapTypeAnnotation(typeAliasBody(declaration)), scope, depth + 1);
    }
    return null;
  }

  function findTypeMember(objectType, key, scope, depth = 0) {
    if (!objectType || depth > MAX_DEPTH) return null;
    // unions: recurse per branch (with subst applied), fold matches into a synthetic union.
    // unwrap wrapper before subst since applyAliasSubst only looks at top-level type name
    const { node: aliased, subst } = followTypeAliasChain(objectType, scope);
    const withSubst = node => {
      if (!node) return node;
      const unwrapped = unwrapTypeAnnotation(node);
      return subst ? applyAliasSubst(unwrapped, subst) : unwrapped;
    };
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      const found = [];
      for (const member of aliased.types) {
        const substituted = withSubst(unwrapTypeAnnotation(member));
        const memberType = findTypeMember(substituted, key, scope, depth + 1);
        if (memberType) found.push(memberType);
      }
      if (!found.length) return null;
      if (found.length === 1) return found[0];
      return { type: aliased.type, types: found };
    }
    // tuple numeric index: `type Pair<T> = [T[], string]` / `Pair<number>[0]` -> `number[]`
    if (aliased?.type === 'TSTupleType' || aliased?.type === 'TupleTypeAnnotation') {
      const index = typeof key === 'number' ? key : Number(key);
      if (!Number.isInteger(index) || index < 0) return null;
      const element = findTupleElement(aliased, index, scope);
      return element ? (subst ? applyAliasSubstDeep(element, subst) : element) : null;
    }
    // walk through trivial mapped passthroughs / aliases when looking up members
    const members = getTypeMembers(aliased ?? objectType, scope, depth);
    if (!members) return null;
    let indexSignatureType = null;
    for (const member of members) {
      switch (member.type) {
        case 'TSPropertySignature':
        case 'TSMethodSignature':
          if (keyMatchesName(member.key, key)) {
            return member.type === 'TSMethodSignature' ? { type: 'TSFunctionType' } : withSubst(member.typeAnnotation);
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
        // ESTree (MethodDefinition) and Babel (ClassMethod) class methods -> generic function type
        case 'ClassMethod':
        case 'ClassPrivateMethod':
        case 'TSDeclareMethod':
        case 'MethodDefinition':
          if (!member.computed && keyMatchesName(member.key, key)) return { type: 'TSFunctionType' };
          break;
        case 'TSIndexSignature':
          if (!indexSignatureType && member.typeAnnotation) indexSignatureType = member.typeAnnotation;
          break;
      }
    }
    if (indexSignatureType) return withSubst(indexSignatureType);
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
      return flowSubst ? applyAliasSubst(indexerValue, flowSubst) : indexerValue;
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

  function findTupleElement(objectType, index, scope) {
    const { node: tuple, subst } = followTypeAliasChain(objectType, scope);
    if (tuple?.type !== 'TSTupleType' && tuple?.type !== 'TupleTypeAnnotation') return null;
    const elements = tupleElements(tuple);
    if (!elements?.length || index < 0) return null;
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
    if (typesEqual(candidate, target)) return true;
    // any non-primitive is assignable to object / Object
    if (!candidate.primitive && !target.primitive && (!target.constructor || target.constructor === 'Object')) return true;
    return false;
  }

  function resolveExtractExclude(first, second, scope, depth, keep) {
    const target = resolveTypeAnnotation(second, scope, depth + 1);
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
      const resolved = resolveTypeAnnotation(substituted, scope, depth + 1);
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
      // ESTree Property{method:true} wraps FunctionExpression in .value
      if (t.isObjectMethod(property.node)) return property.get('value')?.node ? property.get('value') : property;
    }
    if (t.isClass(containerPath.node)) {
      const member = findClassMember(containerPath, name, true);
      if (!member) return null;
      if (t.isClassMethod(member.node)) return member.get('value')?.node ? member.get('value') : member;
      if (t.isClassProperty(member.node) || t.isClassAccessorProperty(member.node)) {
        const value = member.get('value');
        return value.node ? resolveRuntimeExpression(value) : null;
      }
    }
    return null;
  }

  // resolve TSTypeQuery (typeof x or typeof x.y) to the runtime path of the target
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
    const bindingPath = constantBindingPath(exprName.name, scope);
    if (!bindingPath) return null;
    if (t.isFunctionDeclaration(bindingPath.node) || t.isClassDeclaration(bindingPath.node)) return bindingPath;
    if (t.isVariableDeclarator(bindingPath.node)) {
      const init = bindingPath.get('init');
      return init.node ? resolveRuntimeExpression(init) : null;
    }
    return null;
  }

  function resolveReturnTypeFromTypeQuery(param, scope) {
    const resolved = resolveTypeQueryBinding(param, scope);
    return t.isFunction(resolved?.node) ? resolveReturnType(resolved) : null;
  }

  // resolve inner type from the first type parameter for container types
  // (Array, Set, Iterator, Promise, etc.) using the provided resolver
  // e.g. Array<string> -> $Object('Array', $Primitive('string'))
  // e.g. Promise<number[]> -> $Object('Promise', $Object('Array', ...))
  function resolveKnownContainerType(name, base, node, innerResolver) {
    if (!base) return null;
    const params = getTypeArgs(node)?.params;
    if (params?.[0] && (SINGLE_ELEMENT_COLLECTIONS.has(name) || name === 'Promise')) {
      const inner = innerResolver(params[0]);
      if (inner && !isNullableOrNever(inner)) return new $Object(base.constructor, inner);
    }
    return base;
  }

  // resolve a known constructor with type parameters from a runtime expression
  // e.g. new Set<string>() -> $Object('Set', $Primitive('string'))
  function resolveConstructorType(name, path) {
    return resolveKnownContainerType(name, resolveKnownConstructor(name), path.node, p => resolveTypeAnnotation(p, path.scope));
  }

  // resolve a known constructor CALL (without `new`) with type parameters
  // e.g. Array<string>() -> $Object('Array', $Primitive('string')), String() -> $Primitive('string')
  function resolveConstructorCallType(name, path) {
    if (!hasOwn(KNOWN_CONSTRUCTORS, name)) return null;
    const callResult = typeFromHint(KNOWN_CONSTRUCTORS[name].call);
    if (callResult.primitive) return callResult;
    return resolveKnownContainerType(name, callResult, path.node, p => resolveTypeAnnotation(p, path.scope));
  }

  function resolveNamedType(name, node, scope, depth) {
    const known = resolveKnownContainerType(name, resolveKnownConstructor(name), node, p => resolveTypeAnnotation(p, scope, depth + 1));
    if (known) return known;
    switch (name) {
      // well-known utility types -> Object
      // Flow: $ReadOnly, $Shape, $Diff, $Rest, $ObjMap, $ObjMapi, $ObjMapConst
      case 'Record':
      case 'Partial':
      case 'Required':
      case 'Pick':
      case 'Omit':
      case 'Readonly':
      case '$ReadOnly':
      case '$Shape':
      case '$Diff':
      case '$Rest':
      case '$ObjMap':
      case '$ObjMapi':
      case '$ObjMapConst':
        return new $Object('Object');
      // well-known utility types -> Array
      case 'Parameters':
      case 'ConstructorParameters':
        return new $Object('Array');
      // well-known utility types -> string
      // Flow: $Keys
      case 'Uppercase':
      case 'Lowercase':
      case 'Capitalize':
      case 'Uncapitalize':
      case '$Keys':
        return new $Primitive('string');
      // well-known utility types - transparent wrappers resolving type parameter
      // Flow: $Exact
      case 'NoInfer':
      case '$Exact': {
        const arg = getTypeArgs(node)?.params[0];
        return arg ? resolveTypeAnnotation(arg, scope, depth + 1) : null;
      }
      // well-known utility types - resolve type parameter, strip nullable/never
      // Flow: $NonMaybeType
      case 'NonNullable':
      case '$NonMaybeType': {
        const arg = getTypeArgs(node)?.params[0];
        return arg ? resolveNonNullableAnnotation(arg, scope, depth) : null;
      }
      case 'Awaited': {
        const param = getTypeArgs(node)?.params[0];
        if (!param) return null;
        return unwrapPromise(resolveTypeAnnotation(param, scope, depth + 1));
      }
      // well-known utility types - resolve via function return type
      case 'ReturnType': {
        const arg = getTypeArgs(node)?.params[0];
        return arg ? resolveReturnTypeFromTypeQuery(arg, scope) : null;
      }
      case 'InstanceType': {
        const param = getTypeArgs(node)?.params[0];
        if (!param) return null;
        const resolved = resolveTypeQueryBinding(param, scope);
        if (t.isClass(resolved?.node)) return resolveClassInheritance(resolved) || new $Object('Object');
        return null;
      }
      case 'Extract':
      case 'Exclude': {
        const params = getTypeArgs(node)?.params;
        return params?.length >= 2 ? resolveExtractExclude(params[0], params[1], scope, depth, name === 'Extract') : null;
      }
      // Flow $ReadOnlyArray<T> -> Array with inner type (equivalent to ReadonlyArray<T>)
      case '$ReadOnlyArray': {
        const typeArgs = getTypeArgs(node);
        const inner = typeArgs?.params[0]
          ? resolveNonNullableAnnotation(typeArgs.params[0], scope, depth) : null;
        return new $Object('Array', inner);
      }
      // Flow utility types (conservative: unknown)
      case '$Values':
      case '$ElementType':
      case '$PropertyType':
      case '$Call':
        return null;
    }
    // resolve user-defined type aliases and interfaces via scope chain
    return resolveUserDefinedType(name, node, scope, depth);
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
      // TS `{}` without members = any non-nullish (includes primitives) - treat as unknown
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
      // Flow typeof in type position: `typeof variable`
      case 'TypeofTypeAnnotation': {
        const arg = node.argument;
        if (arg?.type !== 'GenericTypeAnnotation') return null;
        // typeof obj.prop - qualified access (one level deep)
        if (arg.id?.type === 'QualifiedTypeIdentifier') {
          const { qualification, id: right } = arg.id;
          if (qualification?.type !== 'Identifier' || right?.type !== 'Identifier') return null;
          return resolveTypeofQualifiedMember(qualification.name, right.name, scope);
        }
        if (arg.id?.type === 'Identifier') return resolveTypeofBinding(arg.id.name, scope);
        return null;
      }
      // TS template literal type: `prefix_${string}`
      case 'TSTemplateLiteralType':
        return new $Primitive('string');
      // TS type predicate: `x is string` -> boolean
      case 'TSTypePredicate':
        return new $Primitive('boolean');
      // TS conditional type: T extends U ? X : Y - resolve if both branches have the same type, or one is `never`
      case 'TSConditionalType':
        return resolveConditionalBranches(
          resolveTypeAnnotation(node.trueType, scope, depth + 1),
          resolveTypeAnnotation(node.falseType, scope, depth + 1));
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
      if (!binding || binding.constantViolations?.length) break;
      const { path: bindingPath } = binding;
      if (t.isVariableDeclarator(bindingPath.node)) {
        // don't follow destructured bindings - the init is the whole collection, not the individual element
        const { id } = bindingPath.node;
        if (id?.type === 'ObjectPattern' || id?.type === 'ArrayPattern') break;
        const init = bindingPath.get('init');
        if (init.node) {
          path = init;
          continue;
        }
      }
      if (isFunctionOrClassDeclaration(bindingPath.node)) return bindingPath;
      break;
    }
    return path;
  }

  function resolveNumericType(path) {
    const resolved = resolveNodeType(path);
    // `number` if resolving is not possible - acceptable assumption within `core-js`
    return new $Primitive(primitiveTypeOf(resolved) === 'bigint' ? 'bigint' : 'number');
  }

  // resolve property name from a MemberExpression, handling both
  // non-computed (obj.prop), string/numeric literal (obj['prop'], obj[0]),
  // and constant binding (const key = 'prop'; obj[key])
  function resolveMemberPropertyName(path) {
    const { property, computed } = path.node;
    if (!computed) return property.type === 'Identifier' ? property.name : null;
    return literalKeyValue(property)
      ?? literalKeyValue(resolveRuntimeExpression(path.get('property')).node);
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
  function resolveNonNullableAnnotation(node, scope, depth) {
    if (!node) return null;
    const resolved = resolveTypeAnnotation(node, scope, depth + 1);
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

  function resolveUnionType(leftPath, rightPath) {
    const left = resolveNodeType(leftPath);
    const right = resolveNodeType(rightPath);
    return left && right ? commonType(left, right) : null;
  }

  // recognize Babel's destructuring default desugaring: _ref === void 0 ? DEFAULT : _ref
  // and resolve to the type of DEFAULT (the consequent branch)
  function resolveDesugarDefaultTernary(path) {
    const { test, alternate } = path.node;
    if (test.type !== 'BinaryExpression' || test.operator !== '===') return null;
    const { left, right } = test;
    // pattern: _ref === void 0 ? DEFAULT : _ref
    if (!isVoidZero(right) || left.type !== 'Identifier') return null;
    if (alternate.type !== 'Identifier' || alternate.name !== left.name) return null;
    return resolveNodeType(path.get('consequent'));
  }

  function isVoidZero(node) {
    return node.type === 'UnaryExpression' && node.operator === 'void'
      && babelNodeType(node.argument) === 'NumericLiteral' && node.argument.value === 0;
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

  function resolveClassInheritance(classPath) {
    let current = classPath;
    let depth = MAX_DEPTH;
    while (depth--) {
      if (!current.node.superClass) return null;
      const superPath = current.get('superClass');
      const name = resolveGlobalName(superPath);
      if (name) return resolveKnownConstructor(name);
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
    return params.map(p => applyAliasSubst(p, subst));
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
    path = resolvePath(path);

    switch (babelNodeType(path.node)) {
      // ESTree wraps optional chains in ChainExpression, preserves parentheses - unwrap
      case 'ChainExpression':
        return resolveNodeType(path.get('expression'));
      case 'Identifier':
        return resolveKnownGlobalReference(path);
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
          || resolveKnownGlobalReference(path);
      case 'CallExpression':
      case 'OptionalCallExpression': {
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
      // tagged templates are semantically calls: String.raw`foo` ≡ String.raw(…)
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
            return resolveUnionType(path.get('left'), path.get('right'));
          default:
            return resolveBinaryOperatorType(path.node.operator.slice(0, -1), path.get('left'), path.get('right'));
        }
      case 'ConditionalExpression':
        // Babel desugars destructuring defaults as: _ref === void 0 ? DEFAULT : _ref
        // when one branch is a void-0 check and the other is the same identifier, resolve to the default branch
        return resolveDesugarDefaultTernary(path)
          || resolveUnionType(path.get('consequent'), path.get('alternate'));
      case 'LogicalExpression':
        return resolveUnionType(path.get('left'), path.get('right'));
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
        }
        return false;
      case 'TSFunctionType':
      case 'FunctionTypeAnnotation':
        return hasTypeParamReference(node.returnType ?? node.typeAnnotation, typeParamNames, depth + 1);
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

  // build a Map<string, Type> of type parameter bindings from call-site arguments
  function buildTypeParamMap(typeParamNames, fnPath, callPath) {
    const typeParamMap = new Map();
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
      if (params[i].type === 'RestElement') continue;
      const param = params[i].type === 'AssignmentPattern' ? params[i].left : params[i];
      const paramAnnotation = unwrapTypeAnnotation(param.typeAnnotation);
      if (!paramAnnotation) continue;
      const name = typeRefName(paramAnnotation);
      // direct: param type is exactly T
      if (name && typeParamNames.has(name) && !typeParamMap.has(name)) {
        const resolved = resolveNodeType(args[i]);
        if (resolved) typeParamMap.set(name, resolved);
        continue;
      }
      // container wrapper: param type is T[], Array<T>, Set<T>, Promise<T>, etc.
      const elementParamName = innerTypeParamName(paramAnnotation, name);
      if (elementParamName && typeParamNames.has(elementParamName) && !typeParamMap.has(elementParamName)) {
        const elementType = resolveInnerType(resolveNodeType(args[i]));
        if (elementType) typeParamMap.set(elementParamName, elementType);
      }
    }
    // phase 2: constraint / default fallback for unresolved type params
    for (const typeParam of fnPath.node.typeParameters.params) {
      const name = typeParamName(typeParam);
      if (typeParamMap.has(name)) continue;
      const annotation = typeParam.constraint ?? typeParam.default;
      if (annotation) {
        const resolved = resolveTypeAnnotation(annotation, fnPath.scope);
        if (resolved) typeParamMap.set(name, resolved);
      }
    }
    return typeParamMap;
  }

  // resolve a type annotation substituting type parameters from the map
  function substituteTypeParams(node, typeParamMap, scope, depth) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    // direct type parameter reference or known type with substituted inner
    if (node.type === 'TSTypeReference' || node.type === 'GenericTypeAnnotation') {
      const name = typeRefName(node);
      if (name && typeParamMap.has(name)) return typeParamMap.get(name);
      if (name) {
        // substitute type params in container inner types: Array<T>, Promise<T>, etc.
        const ctor = resolveKnownConstructor(name);
        const known = resolveKnownContainerType(name, ctor, node, p => substituteTypeParams(p, typeParamMap, scope, depth + 1));
        if (known) return known;
        // user-defined type alias / interface: propagate type parameter substitutions
        return resolveUserDefinedType(name, node, scope, depth, typeParamMap) ?? resolveNamedType(name, node, scope, depth);
      }
      return null;
    }
    // union: T | null, T | undefined - strip nullable, substitute T
    if (node.type === 'TSUnionType' || node.type === 'UnionTypeAnnotation') {
      return foldUnionTypes(node.types, member => substituteTypeParams(member, typeParamMap, scope, depth + 1));
    }
    // intersection: T & { extra: boolean } - skip plain $Object('Object') from type literals, rest must agree
    if (node.type === 'TSIntersectionType' || node.type === 'IntersectionTypeAnnotation') {
      return foldIntersectionTypes(node.types, member => substituteTypeParams(member, typeParamMap, scope, depth + 1));
    }
    // transparent wrappers: (T), T?, readonly T[], etc.
    if (node.type === 'TSOptionalType' || node.type === 'TSParenthesizedType' || node.type === 'NullableTypeAnnotation'
      || (node.type === 'TSTypeOperator' && node.operator !== 'keyof')) {
      return substituteTypeParams(node.typeAnnotation, typeParamMap, scope, depth + 1);
    }
    // conditional type: T extends U ? X : Y - substitute in branches
    if (node.type === 'TSConditionalType') {
      return resolveConditionalBranches(
        substituteTypeParams(node.trueType, typeParamMap, scope, depth + 1),
        substituteTypeParams(node.falseType, typeParamMap, scope, depth + 1));
    }
    // T[] -> Array with substituted element type
    if (node.type === 'TSArrayType' || node.type === 'ArrayTypeAnnotation') {
      const inner = substituteTypeParams(node.elementType, typeParamMap, scope, depth + 1);
      return new $Object('Array', inner && !isNullableOrNever(inner) ? inner : null);
    }
    // [T, U] - resolve to Array, compute inner type if all elements agree
    if (node.type === 'TSTupleType' || node.type === 'TupleTypeAnnotation') {
      const elements = tupleElements(node);
      return new $Object('Array', elements?.length
        ? resolveTupleInner(elements, e => substituteTypeParams(e, typeParamMap, scope, depth + 1))
        : null);
    }
    // T["key"] or T[number] - resolve indexed access, substituting type params in the object type
    if (node.type === 'TSIndexedAccessType') {
      // if objectType references a type parameter, try the substituted type first, then fall back to constraint
      const objParamName = typeRefName(node.objectType);
      if (objParamName && typeParamMap.has(objParamName)) {
        // T[number] - extract element type from the substituted type directly
        if (node.indexType?.type === 'TSNumberKeyword') {
          const inner = resolveInnerType(typeParamMap.get(objParamName));
          if (inner) return inner;
        }
        const paramInfo = findTypeParameter(objParamName, scope);
        if (paramInfo?.constraint) {
          const syntheticNode = { type: 'TSIndexedAccessType', objectType: paramInfo.constraint, indexType: node.indexType };
          return resolveTypeAnnotation(syntheticNode, paramInfo.scope, depth);
        }
      }
      return resolveTypeAnnotation(node, scope, depth);
    }
    // function type: (x: T) => R - always Function regardless of type parameters
    if (node.type === 'TSFunctionType' || node.type === 'FunctionTypeAnnotation') return new $Object('Function');
    // mapped type: { [K in keyof T]: V } - structural, can't derive concrete type
    if (node.type === 'TSMappedType') {
      const passthrough = unwrapMappedTypePassthrough(node);
      if (passthrough) return resolveTypeAnnotation(passthrough, scope, depth + 1);
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
    return null;
  }

  function findClassMember(classPath, name, isStatic, depth = 0) {
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
    const superClass = classPath.get('superClass');
    if (superClass.node) {
      const resolved = resolveRuntimeExpression(superClass);
      if (t.isClass(resolved.node)) return findClassMember(resolved, name, isStatic, depth + 1);
    }
    return null;
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
    if (!member) return null;
    // method call: foo.bar()
    // ESTree MethodDefinition wraps FunctionExpression in .value - unwrap for return type resolution
    const methodFn = t.isClassMethod(member.node) ? (member.get('value')?.node ? member.get('value') : member) : null;
    if (callPath) {
      if (methodFn) {
        if (member.node.kind !== 'get') return resolveReturnType(methodFn, callPath);
        // getter call: resolve like property - get the returned value, if callable -> call it
        const value = resolveBodyReturnValue(methodFn);
        if (t.isFunction(value?.node)) return resolveReturnType(value, callPath);
      } else if (t.isClassProperty(member.node) || t.isClassAccessorProperty(member.node)) {
        const value = resolveRuntimeExpression(member.get('value'));
        if (value.node && t.isFunction(value.node)) return resolveReturnType(value, callPath);
      }
      return null;
    }
    // property access: foo.bar
    if (t.isClassProperty(member.node) || t.isClassAccessorProperty(member.node)) {
      if (member.node.typeAnnotation) return resolveTypeAnnotation(member.node.typeAnnotation, member.scope);
      const value = member.get('value');
      return value.node ? resolveNodeType(value) : null;
    }
    // method: getter returns its return type, regular method returns Function
    if (methodFn) return member.node.kind === 'get' ? resolveReturnType(methodFn) : new $Object('Function');
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
    // ESTree Property{method:true} wraps FunctionExpression in .value - unwrap for return type resolution
    const propFn = t.isObjectMethod(prop.node) ? (prop.get('value')?.node ? prop.get('value') : prop) : null;
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

  // union method calls - for `x: A | B` calling `x.foo()`, resolve in each branch
  // and fold the per-branch return types. mirrors findTypeMember's union handling for properties
  function resolveMemberCallReturn(annotation, name, scope, resolve, depth = 0) {
    if (depth > MAX_DEPTH) return null;
    const { node: aliased, subst } = followTypeAliasChain(annotation, scope);
    if (aliased?.type === 'TSUnionType' || aliased?.type === 'UnionTypeAnnotation') {
      let result = null;
      for (const branch of aliased.types) {
        // apply subst so generic alias branches (`type Foo<T> = A | B<T>`) keep their bindings
        const substituted = subst ? applyAliasSubstDeep(unwrapTypeAnnotation(branch), subst) : unwrapTypeAnnotation(branch);
        const branchResult = resolveMemberCallReturn(substituted, name, scope, resolve, depth + 1);
        if (!branchResult) return null;
        result = commonType(result, branchResult);
        if (!result) return null;
      }
      return result;
    }
    return resolveMemberCallReturnFromAnnotation(aliased ?? annotation, name, scope, resolve, depth, subst);
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
    // `x: typeof obj` / `x: typeof fn` - follow TSTypeQuery to runtime binding, delegate there
    if (annotation.type === 'TSTypeQuery') {
      const resolved = resolveTypeQueryBinding(annotation, scope);
      if (!resolved?.node) return null;
      if (t.isObjectExpression(resolved.node)) {
        const result = resolveObjectMember(resolved, name, callPath);
        if (result) return result;
      }
      const ctx = resolveClassContext(resolved);
      return ctx ? resolveClassMember(ctx.classPath, name, ctx.isStatic, callPath) : null;
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
  // `{ a: { b: c } }`, target `c` -> `['a', 'b']`. nested ObjectPatterns walked recursively
  function findDestructuredKeyPath(objectPattern, name) {
    for (const prop of objectPattern.properties) {
      if (babelNodeType(prop) !== 'ObjectProperty') continue;
      const key = getKeyName(prop.key);
      if (key === null) continue;
      const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      if (value?.type === 'Identifier' && value.name === name) return [key];
      if (value?.type === 'ObjectPattern') {
        const inner = findDestructuredKeyPath(value, name);
        if (inner) return [key, ...inner];
      }
    }
    return null;
  }

  // resolve the type of a destructuring default: const { items = [] } = obj or const [a = []] = arr
  function resolveDestructuringDefault(pattern, varName, bindingPath) {
    const patternPath = bindingPath.node === pattern ? bindingPath
      : bindingPath.node.id === pattern ? bindingPath.get('id')
      : bindingPath.node.left === pattern ? bindingPath.get('left') : null;
    if (!patternPath) return null;
    const children = patternPath.get(pattern.properties ? 'properties' : 'elements');
    for (const child of children) {
      if (!child.node) continue;
      const valuePath = babelNodeType(child.node) === 'ObjectProperty' ? child.get('value') : child;
      if (!t.isAssignmentPattern(valuePath.node)) continue;
      if (valuePath.node.left?.type === 'Identifier' && valuePath.node.left.name === varName) {
        return resolveNodeType(valuePath.get('right'));
      }
    }
    return null;
  }

  function resolveDestructuredType(objectPattern, name, scope) {
    const keyPath = findDestructuredKeyPath(objectPattern, name);
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
      const raw = m.typeAnnotation ?? m.returnType ?? (m.type === 'TSMethodSignature' ? m : null);
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
      if (annotation) return { annotation, scope: binding.path.scope };
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
        const subst = buildCallSiteSubst(fnPath.node, path.node);
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

  // find the index of a variable in an ArrayPattern, accounting for holes and defaults
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
      const initType = resolveNodeType(initPath);
      const inner = resolveInnerType(initType);
      if (inner) return inner;
      // array literal -> resolve element by index: const [a, b] = ['hello', 42]
      if (t.isArrayExpression(initPath.node)) {
        const index = findPatternIndex(arrayPattern, varName);
        if (index >= 0) {
          const elemType = resolveArrayLiteralElement(initPath, index);
          if (elemType) return elemType;
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

  function resolveObjectBinding(objectPattern, varName, bindingPath) {
    // object rest: const { a, ...rest } = obj -> rest is always Object
    if (isRestBinding(objectPattern.properties, varName)) return new $Object('Object');
    // annotation on the pattern: const { items }: { items: number[] } = ...
    if (objectPattern.typeAnnotation) {
      const result = resolveDestructuredType(objectPattern, varName, bindingPath.scope);
      if (result) return result;
    }
    const keyPath = findDestructuredKeyPath(objectPattern, varName);
    if (!keyPath) return null;
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      const initPath = resolveRuntimeExpression(bindingPath.get('init'));
      // `const { name } = { name: 'alice' }`; nested runtime walks fall through to annotation
      if (keyPath.length === 1 && t.isObjectExpression(initPath.node)) {
        const result = resolveObjectMember(initPath, keyPath[0]);
        if (result) return result;
      }
      const annotationInfo = findExpressionAnnotation(bindingPath.get('init'));
      if (annotationInfo) {
        const result = resolveAnnotatedMemberPath(annotationInfo.annotation, keyPath, annotationInfo.scope);
        if (result) return result;
      }
    }
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) return resolveAnnotatedMemberPath(elemInfo.annotation, keyPath, elemInfo.scope);
    // runtime: for (const { name } of [{ name: [1,2,3] }]) or similar runtime-resolvable iterables
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node)) {
      const iterPath = resolveRuntimeExpression(forOfPath.get('right'));
      // array literal iterable -> resolve the property from the first object element
      if (keyPath.length === 1 && t.isArrayExpression(iterPath.node) && iterPath.node.elements.length) {
        const firstElem = resolveRuntimeExpression(iterPath.get('elements')[0]);
        if (t.isObjectExpression(firstElem.node)) {
          const result = resolveObjectMember(firstElem, keyPath[0]);
          if (result) return result;
        }
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
      if (lastAssign.node.operator !== '=') return resolveNodeType(lastAssign);
      // destructuring: `({ name } = { name: 'alice' })` - resolve member from RHS
      if (lastAssign.node.left?.type === 'ObjectPattern') {
        const keyPath = findDestructuredKeyPath(lastAssign.node.left, name);
        if (!keyPath) return null;
        if (keyPath.length === 1) {
          const initPath = resolveRuntimeExpression(lastAssign.get('right'));
          if (t.isObjectExpression(initPath.node)) return resolveObjectMember(initPath, keyPath[0]);
        }
        const info = findExpressionAnnotation(lastAssign.get('right'));
        if (info) return resolveAnnotatedMemberPath(info.annotation, keyPath, info.scope);
        return null;
      }
      return resolveNodeType(lastAssign.get('right'));
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

  // normalize a constantViolation path to the enclosing AssignmentExpression.
  // Babel: violation IS the AssignmentExpression. estree-toolkit: violation is the LHS
  // Identifier - walk up through Property/ObjectPattern to reach the AssignmentExpression
  function violationToAssignment(v) {
    let p = v;
    for (let i = 0; i < 4 && p; i++) {
      if (babelNodeType(p.node) === 'AssignmentExpression') return p;
      p = p.parentPath;
    }
    return null;
  }

  // if `path` is inside a synchronous IIFE within `targetScope`, return the CallExpression
  // path. matches `(() => { x = 1 })()` but NOT `setTimeout(() => { x = 1 })`
  function findEnclosingIIFE(path, targetScope) {
    for (let cur = path; cur; cur = cur.parentPath) {
      if (cur.scope === targetScope) return null;
      if (!t.isFunction(cur.node)) continue;
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

  // find the last straight-line assignment before usagePath:
  // `x = value`, `x += value`, or `({ x } = value)` - same scope, direct statement in block
  function findLastStraightLineAssignment(binding, usagePath) {
    if (!binding.constantViolations?.length || binding.scope !== usagePath.scope) return null;
    const beforePos = usagePath.node.start;
    if (beforePos === undefined || beforePos === null) return null;
    let best = null;
    for (const v of binding.constantViolations) {
      const ap = violationToAssignment(v);
      if (!ap) continue;
      const { left } = ap.node;
      if (left?.type !== 'Identifier' && left?.type !== 'ObjectPattern') continue;
      // different scope: allow if the enclosing function is a synchronous IIFE
      let effectiveAp = ap;
      if (ap.scope !== binding.scope) {
        const iife = findEnclosingIIFE(ap, binding.scope);
        if (!iife) continue;
        effectiveAp = iife;
      }
      const pos = effectiveAp.node.start;
      if (pos === undefined || pos === null || pos >= beforePos) continue;
      // walk to ExpressionStatement — past parens, void, sequence, unary wrappers
      let stmt = effectiveAp;
      while (stmt && stmt.node.type !== 'ExpressionStatement') stmt = stmt.parentPath;
      if (!stmt) continue;
      const block = stmt.parentPath;
      if (block?.node.type !== 'BlockStatement' && block?.node.type !== 'Program') continue;
      if (!best || pos > best.node.start) best = ap;
    }
    return best;
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

  // user-defined type predicate: `function isStr(x): x is string`, arrow form, or method
  // assigned to a const. turns the `is T` return type into a typeof / instanceof guard so
  // that user predicates fold through the same narrowing pipeline as built-in guards.
  function parseUserPredicateGuard(callee, scope, negated) {
    if (!scope || callee.type !== 'Identifier') return null;
    const binding = scope.getBinding(callee.name);
    if (!binding) return null;
    const declNode = binding.path.node;
    const fnNode = t.isVariableDeclarator(declNode) ? declNode.init : declNode;
    if (!fnNode || !t.isFunction(fnNode)) return null;
    const returnType = unwrapTypeAnnotation(fnNode.returnType);
    if (returnType?.type !== 'TSTypePredicate') return null;
    const resolved = resolveTypeAnnotation(returnType.typeAnnotation, binding.path.scope);
    return guardFromResolvedType(resolved, negated);
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
      // unwrap so `if ((x) instanceof Map)` narrows under ESTree
      const left = unwrapParens(test.left);
      const right = unwrapParens(test.right);
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
  function unwrapParens(node) {
    while (node?.type === 'ParenthesizedExpression') node = node.expression;
    return node;
  }

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
  // collects ALL preceding exit guards, including && / || flattening
  function findPrecedingExitGuards(siblings, index, varName) {
    const guards = [];
    for (let i = index - 1; i >= 0; i--) {
      const conditionTrue = resolveExitCondition(siblings[i]);
      if (conditionTrue !== null) {
        guards.push(...parseGuardsFromCondition(siblings[i].node.test, conditionTrue, varName, siblings[i].scope));
      }
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

  function findEarlyExitGuards(current, varName) {
    const siblings = getStatementSiblings(current);
    return siblings ? findPrecedingExitGuards(siblings, current.key, varName) : [];
  }

  // collect ALL type guards along the AST path for cumulative narrowing.
  // const bindings can't be reassigned - function boundaries don't invalidate guards
  function findEnclosingTypeGuards(path, varName, isConst = false) {
    const guards = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      if (t.isFunction(current.node) && !isConst) break;
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
  function hasMutationAfterGuards({ constantViolations }, usagePath, varName) {
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
  const guardsCache = new WeakMap();

  function findGuardsForBinding(path) {
    if (!t.isIdentifier(path.node)) return null;
    const { node } = path;
    if (guardsCache.has(node)) return guardsCache.get(node);
    const { name } = node;
    const binding = path.scope?.getBinding(name);
    let result = null;
    if (binding) {
      const isConst = !binding.constantViolations?.length;
      const guards = findEnclosingTypeGuards(path, name, isConst);
      if (guards && (isConst
          || (!hasMutationAfterGuards(binding, path, name)
            && !hasMutationInCapturedFunction(binding)))) {
        result = { binding, guards };
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
    const { binding, guards } = info;
    const classification = classifyGuardAnnotation(binding);
    if (classification.kind === 'union') {
      const { types, subst, scope } = classification;
      if (!types?.length) return null;
      return narrowByGuards(types.map(member => resolveTypeAnnotation(applyAliasSubstDeep(member, subst), scope)), guards);
    }
    if (classification.kind === 'closed') return null;
    return narrowByGuards(guards.filter(g => g.positive).map(resolveGuardType), guards);
  }

  // --- Entry / public API ---
  const resolveCache = new WeakMap();

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
    // assignment or variable destructuring - resolve the right-hand side
    const initPath = t.isAssignmentExpression(parent?.node) ? parent.get('right')
      : t.isVariableDeclarator(parent?.node) ? parent.get('init') : null;
    if (initPath?.node) return resolveNodeType(initPath);
    // for-of: walk up through nested patterns to find the enclosing loop
    const PATTERN_WRAPPERS = new Set([
      'ArrayPattern',
      'ObjectPattern',
      'Property',
      'ObjectProperty',
      'AssignmentPattern',
      'RestElement',
    ]);
    let ancestor = parent;
    while (ancestor && PATTERN_WRAPPERS.has(babelNodeType(ancestor.node))) ancestor = ancestor.parentPath;
    const forOfPath = t.isForOfStatement(ancestor?.node) ? ancestor : findForLoopParent(ancestor);
    if (!t.isForOfStatement(forOfPath?.node)) return null;
    return resolveForOfResolvedElement(forOfPath);
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
    const { binding, guards } = info;
    // only unannotated or open (unknown/any/object/mixed) bindings accept hint-based narrowing
    const { kind } = classifyGuardAnnotation(binding);
    if (kind !== 'none' && kind !== 'open') return null;
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

  return { resolvePropertyObjectType, resolveGuardHints, toHint, isString, isObject };
}

export { createResolveNodeType, TYPE_HINTS };
