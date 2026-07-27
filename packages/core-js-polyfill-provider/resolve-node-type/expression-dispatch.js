// Expression-position dispatch: the big switch that maps a runtime AST node kind to a
// resolved Type object. handles every literal kind, MemberExpression / NewExpression /
// CallExpression / TaggedTemplate, unary / binary / assignment / conditional / logical
// operators, TS as / satisfies / TypeAssertion casts, AwaitExpression, YieldExpression.
//
// Public surface:
//   resolveNodeTypeExpression(path)  - main switch dispatcher (called by the factory's
//                                      `resolveNodeType` entry after cache lookup)
//
// Cluster-internal: `resolveNewExpressionType`, `resolveCallExpressionType`,
// `resolveYieldExpressionType`. extracted into helpers to keep the switch under the
// max-statements lint threshold; called only from `resolveNodeTypeExpression`.
//
// resolvedTypeCache short-circuit lives at the top of the entry to avoid round-trip info
// loss when a sibling polyfill plugin stashes a pre-mutation Type for the rewritten node.
// WeakMap (vs node-attached property) keeps the side-channel opaque to AST-cloning libs.
import { $Object, $Primitive } from './base.js';
import {
  NO_PROTOTYPE_VALUE, installedPrototypeValueAt, objectLiteralPrototypeValue,
  peelTransparentExprAncestorPath, prototypeValueMayDispatch, prototypeWriteHostPath,
} from '../helpers/ast-patterns.js';
import { unaryOperatorResultKind } from './value-ops.js';

const { hasOwn } = Object;

export function createExpressionDispatch({
  t,
  isMutatedStatic,
  getScopeBinding,
  collectBindingReferences,
  resolveStaticCalleePair,
  babelNodeType,
  KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  getCachedType,
  resolvePath,
  resolveNodeType,
  resolveBindingType,
  resolveRuntimeExpression,
  unwrapTypeAnnotation,
  resolveGlobalName,
  resolveConstructorType,
  resolveConstructorCallType,
  resolveCallReturnType,
  typeFromHint,
  resolveArrayLiteralCommonType,
  resolveThisClass,
  resolveExpressionToClassPath,
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
}) {
  function resolveNewExpressionType(path) {
    const callee = path.get('callee');
    const name = resolveGlobalName(callee);
    // a known global / class name resolves to its constructor type directly. an ambient binding
    // (`declare const Ctor: new () => T`) also resolves via resolveGlobalName to its bare name but
    // is NOT a known constructor (resolveConstructorType -> null) - fall through to the class /
    // construct-signature fallbacks below instead of short-circuiting to a foreign $Object(name)
    if (name) {
      const ctorType = resolveConstructorType(name, path);
      if (ctorType) return ctorType;
    }
    // a class callee yields the instance type via the inheritance walk. `resolveExpressionToClassPath`
    // covers the runtime class AND the ambient `declare class` form (no runtime value binding on Babel,
    // so a bare Identifier degrades to the foreign nominal `$Object('X')` and misses an `extends
    // Array`/`Set` base without the ambient-index fallback estree-toolkit gets from `scope.bindings`)
    const classPath = resolveExpressionToClassPath(callee);
    // resolveClassInheritance now distinguishes base-less (-> `Object`) from unknowable super (-> null /
    // generic), so no `|| $Object('Object')` floor - that would re-suppress the unknowable case
    if (classPath) return resolveClassInheritance(classPath);
    const resolved = resolveRuntimeExpression(callee);
    // callee resolves to a TSConstructorType signature (or TSFunctionType - they share the
    // `returnType` slot and `functionTypeReturnAnnotation` treats both identically). example:
    // `const Ctor = wrap('a')` where `wrap<T>(): new (...) => string[]` - Ctor's annotation
    // walks through binding init -> call return -> TSConstructorType; `new Ctor(...)` yields
    // the constructor's return type. without this fallback, `new` on a binding with no
    // direct class shape produces unknown ($Object(null)) and downstream narrows degrade
    const ctorReturn = resolveCallReturnType(callee, 'construct');
    if (ctorReturn) {
      // a plain function VALUE discards a primitive return at `new` time (yields a fresh object);
      // only an object return survives (`function f(){ return [1]; }`). a construct signature
      // (`new () => T`) resolves through an annotation, not a function-value node, and declares
      // the instance type directly - trusted as-is even when the declared return is primitive
      if (t.isFunction(resolved.node) && ctorReturn.primitive) return new $Object('Object');
      return ctorReturn;
    }
    // a resolved global name with no constructor type and no construct-signature fallback keeps its
    // foreign nominal ($Object(name)); a fully unresolvable callee stays unknown ($Object(null))
    return new $Object(name ?? null);
  }

  function resolveCallExpressionType(path) {
    // resolvedTypeCache short-circuit handled at the top of resolveNodeTypeExpression
    const callee = path.get('callee');
    const name = resolveGlobalName(callee);
    if (name) {
      // known constructor called without `new`: String(), Array(), etc.
      const known = resolveConstructorCallType(name, path);
      if (known) return known;
      // known global function: parseInt(), parseFloat(), etc.
      if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name)) return typeFromHint(KNOWN_GLOBAL_METHOD_RETURN_TYPES[name]);
    }
    // `Object.create` with a prototype that cannot dispatch (null gives a prototype-less object, any
    // other primitive throws) yields nothing a polyfill could serve - the same verdict the
    // `__proto__:` channels carry for those values. an argument that MAY be an object installs a
    // prototype the resolver does not follow, so the call stays unmodelled and keeps typeless dispatch
    // the inert verdict below models the NATIVE `Object.create`; a user-replaced static may return
    // anything, so a mutated slot keeps the call unmodelled (the mutated-static invariant)
    const calleePair = resolveStaticCalleePair(callee.node, callee.scope);
    if (calleePair?.constructor === 'Object' && calleePair.method === 'create'
      && !isMutatedStatic('Object', 'create')
      && !prototypeValueMayDispatch(path.node.arguments?.[0], !!getScopeBinding(path.scope, 'undefined', path))) {
      return new $Object('Object');
    }
    if (t.isImport(callee.node)) return new $Object('Promise');
    return resolveCallReturnType(callee);
  }

  function resolveYieldExpressionType(path) {
    const fnPath = path.getFunctionParent();
    if (!fnPath?.node.generator) return null;
    // yield* delegates to an iterable; result is the delegated iterator's TReturn (params[1])
    if (path.node.delegate) return resolveGeneratorTypeParam(path.get('argument'), 1);
    // yield evaluates to the value passed to generator.next(value) = TNext (params[2])
    const params = generatorTypeParams(unwrapTypeAnnotation(fnPath.node.returnType), fnPath.scope);
    if (params?.[2]) return resolveTypeAnnotation(params[2], fnPath.scope);
    return null;
  }

  // both channels that give an object literal a foreign dispatcher: the `__proto__:` property on the
  // literal itself, and a post-creation write through the binding it initializes (`o.__proto__ = X`,
  // `Object.setPrototypeOf(o, X)`). the binding scan runs only for a declarator-initializing literal -
  // a literal used inline has no binding to write through. unenumerable references prove nothing
  // an object carrying ANY installed prototype is no plain `Object` for typing. an unenumerable
  // reference set answers the same way: an install may hide in it
  function objectDispatchesForeignPrototype(path) {
    const values = installedPrototypeValuePaths(path);
    return values === null || values.length > 0;
  }

  // the FAMILY an installed prototype dispatches, for the receiver-hint channel: an object whose
  // prototype is `Array.prototype` inherits the ARRAY methods and can inherit no other family's, so
  // naming the family drops every variant the receiver provably cannot reach. only a prototype the
  // canonical static-member pair resolves counts - that resolution rejects a shadowed `Array` and
  // follows a proxy-global hop, so the hint is never read off a name alone
  function prototypeValueFamily(valuePath) {
    if (!valuePath?.node || valuePath.node === NO_PROTOTYPE_VALUE) return null;
    // the general resolver, not a `X.prototype` shape match: an object installed as a prototype
    // hands down its OWN chain, so an instance (`{ __proto__: /re/ }`) names its family exactly as
    // the prototype object does. it also rejects a shadowed constructor and follows a proxy hop
    const type = resolveNodeType(valuePath);
    return type?.constructor ?? null;
  }

  // every prototype installed on the object `path`, as the value PATHS the channels write. null when
  // the reference set itself cannot be enumerated - an install may then exist that this never saw.
  // the ONE walk of the install channels: both the "is any prototype installed" question and the
  // family read below run off it, so the channel list cannot drift between them
  function installedPrototypeValuePaths(path) {
    const undefinedShadowed = !!getScopeBinding(path.scope, 'undefined', path);
    const values = [];
    if (path.node?.type === 'ObjectExpression') {
      const literalValue = objectLiteralPrototypeValue(path.node, undefinedShadowed);
      // located by node IDENTITY off the same literal, so the property-shape rules stay in the canon
      if (literalValue) values.push(path.get('properties').find(p => p.node?.value === literalValue)?.get('value') ?? NO_PROTOTYPE_VALUE);
    }
    // `Object.create(P)` installs P directly; a non-dispatching argument is already inert upstream
    const created = createdPrototypeArgumentPath(path);
    if (created) values.push(created);
    const host = peelTransparentExprAncestorPath(path);
    const declarator = host.parentPath?.node;
    if (declarator?.type !== 'VariableDeclarator' || declarator.init !== host.node
      || declarator.id?.type !== 'Identifier') return values;
    const binding = getScopeBinding(host.scope, declarator.id.name, host);
    if (!binding) return values;
    const refs = collectBindingReferences(binding, host);
    if (refs === null) return null;
    for (const ref of refs) {
      const installed = installedPrototypeValuePathAt(ref, undefinedShadowed);
      if (installed) values.push(installed);
    }
    return values;
  }

  // the FAMILIES those prototypes dispatch. null when any of them cannot be named - the receiver then
  // keeps the full dispatch, since an unnamed prototype may carry any family's methods
  function installedPrototypeFamilies(path) {
    const values = installedPrototypeValuePaths(path);
    if (values === null) return null;
    const families = new Set();
    for (const valuePath of values) {
      const family = prototypeValueFamily(valuePath);
      if (!family) return null;
      families.add(family);
    }
    return families;
  }

  // the value PATH of a reference's prototype install: the canon decides WHETHER the reference
  // installs, this only re-reads the value slot it matched off the same host
  function installedPrototypeValuePathAt(ref, undefinedShadowed) {
    const valueNode = installedPrototypeValueAt(ref, isProtoSetterCallee, undefinedShadowed);
    if (!valueNode || valueNode === NO_PROTOTYPE_VALUE) return valueNode ? NO_PROTOTYPE_VALUE : null;
    // the SAME host climb the canon matched on - transparent wrappers plus sequence-VALUE positions.
    // re-deriving it with a narrower walk dropped every install made through a sequence
    const host = prototypeWriteHostPath(ref);
    const parent = host?.parentPath;
    // `o.__proto__ = P` - the write sits above the member; `setPrototypeOf(o, P)` - the PROTO slot
    if (parent?.node?.type === 'MemberExpression' || parent?.node?.type === 'OptionalMemberExpression') {
      return parent.parentPath?.get('right');
    }
    return parent?.get('arguments')?.[1] ?? null;
  }

  // the PROTOTYPE argument PATH of a native `Object.create` call, null when the call is anything else
  function createdPrototypeArgumentPath(path) {
    if (path.node?.type !== 'CallExpression' && path.node?.type !== 'OptionalCallExpression') return null;
    const callee = path.get('callee');
    const pair = resolveStaticCalleePair(callee.node, callee.scope);
    if (pair?.constructor !== 'Object' || pair.method !== 'create' || isMutatedStatic('Object', 'create')) return null;
    return path.get('arguments')?.[0] ?? null;
  }

  // `Object.setPrototypeOf` / `Reflect.setPrototypeOf` only - a same-named method on any other object
  // installs nothing, and the owner is resolved (not name-matched) so a shadowed `Object` is rejected.
  // usage-pure polyfills `setPrototypeOf` itself, so the call may already read as the injected static
  // binding by the time a later receiver is typed; those are minted `_<Ctor>$<method>` (plus babel's
  // collision suffix), a namespace the plugin reserves
  // `Object.setPrototypeOf` / `Reflect.setPrototypeOf` only. the canonical callee resolver handles
  // every spelling this needs - the source member form (with its shadow bail), a proxy-global hop,
  // and the plugin's own injected static binding after usage-pure rewrites the call - so identity is
  // RESOLVED rather than name-matched at every one of them
  function isProtoSetterCallee(calleePath) {
    const pair = resolveStaticCalleePair(calleePath.node, calleePath.scope);
    return pair?.method === 'setPrototypeOf' && (pair.constructor === 'Object' || pair.constructor === 'Reflect');
  }

  function resolveNodeTypeExpression(path) {
    // polyfill-side transformations (memoized optional-chain refs, chained conditional
    // wrappers, destructure-extracted helpers) stash a pre-mutation Type object in the
    // `resolvedTypeCache` WeakMap so downstream type resolution can recover the original
    // receiver type even after the expression has been rewritten. check the cached type
    // BEFORE resolvePath - synthesized refs (`_ref` from babel-compat optional-chain
    // memoization) carry it via the cloned Identifier; if resolvePath ever found a
    // meaningful binding init, the type stashed on the cloned identifier itself would be
    // lost. storing the Type object directly (not a hint string) avoids round-trip info
    // loss: `toHint($Object('Array'))` -> 'array' -> `typeFromHint('array')` ->
    // `$Object('array')` (lowercase) breaks downstream KNOWN_*_RETURN_TYPES lookups which
    // key on capitalized constructor names. WeakMap (vs node-attached property) keeps the
    // side-channel opaque to sibling plugins / AST-cloning libraries
    const cached = getCachedType(path.node);
    if (cached) return cached;
    const entryNode = path.node;
    path = resolvePath(path);
    const cachedAfter = getCachedType(path.node);
    if (cachedAfter) return cachedAfter;

    switch (babelNodeType(path.node)) {
      // ESTree wraps optional chains in ChainExpression, preserves parentheses - unwrap
      case 'ChainExpression':
      case 'ParenthesizedExpression':
      case 'TSNonNullExpression':
      case 'TSInstantiationExpression':
        return resolveNodeType(path.get('expression'));
      case 'Identifier':
        // the value-follow landed on a DIFFERENT binding (an assignment RHS / alias init):
        // the runtime value IS that binding's value, so its declared annotation types it
        // exactly like a direct use would (`x = arr; x.includes(1)` types by arr's
        // `number[]`). without this the caller's fallback annotates only the ORIGINAL
        // identifier, and a value-backed follow to an annotation-only binding lost the type
        return resolvePrototypeAsInstance(path) || resolveKnownGlobalReference(path)
          || (path.node !== entryNode ? resolveBindingType(path) : null);
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
        // an object whose prototype is not `Object.prototype` INHERITS that prototype's methods, so
        // it is not a plain `Object`: typing it as one narrows the receiver to a family whose
        // descriptor has no variant and drops the injection the inherited method needs. the installed
        // prototype is not resolved here (it can be any expression) - the receiver stays unknown,
        // which keeps the typeless dispatch and is over-inject-safe
        return objectDispatchesForeignPrototype(path) ? null : new $Object('Object');
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
        if (!context) return null;
        // static-context `this` IS the constructor value, not an instance: instance-flavored
        // narrowing rewrote static aliases of `class C extends Array` to instance helpers
        // (native TypeError became a silent undefined)
        if (context.isStatic) return new $Object('Function');
        // base-less `this` -> Object; unknowable super -> null (generic), not a re-suppressing Object floor
        return resolveClassInheritance(context.classPath);
      }
      case 'NewExpression':
        return resolveNewExpressionType(path);
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        return resolveFromMemberExpression(path)
          || resolveArrayIndexAccess(path)
          || resolveEnumMemberAccess(path)
          || resolveKnownPropertyReturnType(path)
          || resolveGlobalStaticReference(path)
          || resolvePrototypeAsInstance(path)
          || resolveKnownGlobalReference(path);
      case 'CallExpression':
      case 'OptionalCallExpression':
        return resolveCallExpressionType(path);
      // ESTree: import('foo') is ImportExpression (not CallExpression with Import callee)
      case 'ImportExpression':
        return new $Object('Promise');
      // tagged templates are semantically calls: String.raw`foo` ==== String.raw(...)
      case 'TaggedTemplateExpression':
        return resolveCallReturnType(path.get('tag'));
      case 'UnaryExpression': {
        // the shared operator table decides; `-` / `~` preserve Number vs BigInt, read
        // through `resolveNumericType`'s binding descent only when the table asks
        const kind = unaryOperatorResultKind(path.node.operator,
          () => resolveNumericType(path.get('argument')).type);
        return kind ? new $Primitive(kind) : null;
      }
      case 'UpdateExpression':
        // ++ and -- work on both Number and BigInt, preserving the type
        return resolveNumericType(path.get('argument'));
      case 'BinaryExpression':
        // comparisons included - the shared operator table reports them as boolean
        // without resolving operands
        return resolveBinaryOperatorType(path.node.operator, path.get('left'), path.get('right'));
      case 'SequenceExpression': {
        const expressions = path.get('expressions');
        return expressions.length ? resolveNodeType(expressions.at(-1)) : null;
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
        // transpilers desugar destructuring defaults to a self-ternary - positive
        // (`_ref === void 0 ? D : _ref`), inverse (`_ref !== void 0 ? _ref : D`),
        // and loose-eq (`_ref == null ? D : _ref`). when one branch is the same identifier as
        // the nullish-check argument, fold the default and self-ref via their common type,
        // collapsing to the default only when the ref is statically nullish
        return resolveDesugarDefaultTernary(path)
          || resolveUnionType(path.get('consequent'), path.get('alternate'), '?:');
      case 'LogicalExpression':
        return resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
      case 'TSAsExpression':
      case 'TSTypeAssertion':
      case 'TypeCastExpression':
        return resolveTypeAnnotation(path.node.typeAnnotation, path.scope) || resolveNodeType(path.get('expression'));
      case 'TSSatisfiesExpression':
        return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation, path.scope);
      case 'AwaitExpression':
        return resolveAwaitExpressionType(path);
      case 'YieldExpression':
        return resolveYieldExpressionType(path);
    }
    return null;
  }

  return {
    installedPrototypeFamilies,
    resolveNodeTypeExpression,
  };
}
