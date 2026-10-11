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
// max-statements lint threshold; called only from that switch (`resolveRuntimeNodeType`).
//
// resolvedTypeCache short-circuit lives at the top of the entry to avoid round-trip info
// loss when a sibling polyfill plugin stashes a pre-mutation Type for the rewritten node.
// WeakMap (vs node-attached property) keeps the side-channel opaque to AST-cloning libs.
import { $Object, $Primitive } from './base.js';
import {
  NO_PROTOTYPE_VALUE,
  ancestorChainDetached,
  bindingLoopAnchor,
  cachedContainerPaths,
  installedPrototypeValueAt,
  isTaggedTemplateQuasiPosition,
  noReassignmentReachesUsage,
  objectLiteralPrototypeValue,
  peelTransparentExprAncestorPath,
  prototypeValueMayDispatch,
  prototypeWriteHostPath,
  reassignmentDominatesUsage,
  writeNeverRuns,
} from '../helpers/ast-patterns.js';
import { unaryOperatorResultKind } from './value-ops.js';

const { hasOwn } = Object;

export function createExpressionDispatch({
  t,
  isMutatedStatic,
  getScopeBinding,
  collectBindingReferences,
  resolveStaticCalleePair,
  protoSetterCalleeArms,
  globalNamedThroughOwnImport,
  babelNodeType,
  KNOWN_GLOBAL_METHOD_RETURN_TYPES,
  getCachedType,
  resolvePath,
  resolveNodeType,
  resolveBindingType,
  unwrapTypeAnnotation,
  resolveGlobalName,
  resolveConstructorType,
  resolveConstructorCallType,
  resolveCallReturnType,
  typeFromHint,
  resolveArrayLiteralCommonType,
  elementContainerType,
  resolveThisAnchor,
  computeObjectAliasClosure,
  thisAnchorIsProvable,
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
  ownCtorNarrowAlternatePath,
  polyfillHintGlobalName,
  resolveNumericType,
  resolveTypeAnnotation,
  resolveAwaitExpressionType,
  generatorTypeParams,
  resolveGeneratorTypeParam,
  decidedOperandPath,
  spellsMemberKey,
  getDecisionAdapter,
}) {
  function resolveNewExpressionType(path) {
    const callee = path.get('callee');
    // the callee names its global through our own binding too: `new _Map()` is what a pass over our
    // own output reads where the source wrote `new Map()`, and taking it for an unknown value cost
    // the receiver its whole type - every method the ponyfill's prototype already carries was
    // dispatched again on the next pass
    const name = resolveGlobalName(callee) ?? polyfillHintGlobalName(callee);
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
    // callee resolves to a TSConstructorType signature (or TSFunctionType - they share the
    // `returnType` slot and `functionTypeReturnAnnotation` treats both identically). example:
    // `const Ctor = wrap('a')` where `wrap<T>(): new (...) => string[]` - Ctor's annotation
    // walks through binding init -> call return -> TSConstructorType; `new Ctor(...)` yields
    // the constructor's return type. without this fallback, `new` on a binding with no
    // direct class shape produces unknown ($Object(null)) and downstream narrows degrade.
    // the `construct` kind carries the ES rule that a primitive return is discarded, and the call
    // lane applies it to every RUNTIME answer - tested on the resolved callee's node shape here it
    // reached only the function-value lane, letting an ambient head and a call-signature past
    const ctorReturn = resolveCallReturnType(callee, 'construct');
    if (ctorReturn) return ctorReturn;
    // a resolved global name with no constructor type and no construct-signature fallback keeps its
    // foreign nominal ($Object(name)); a fully unresolvable callee stays unknown ($Object(null))
    return new $Object(name ?? null);
  }

  // the type a CALL evaluates to: the known static / global / instance-method return tables, the
  // `Object.create` / `Object.setPrototypeOf` prototype model, user functions and class constructors
  // through their own resolvers
  function resolveCallExpressionType(path) {
    // resolvedTypeCache short-circuit handled at the top of resolveNodeTypeExpression
    const callee = path.get('callee');
    const name = globalNamedThroughOwnImport(callee);
    if (name) {
      // known constructor called without `new`: String(), Array(), etc.
      const known = resolveConstructorCallType(name, path);
      if (known) return known;
      // known global function: parseInt(), parseFloat(), etc. gated on the same mutated-slot
      // invariant the `Object.create` arm below states and the two static-registry arms already
      // apply: a replaced global returns whatever the patch returns, so the known narrow drops to
      // generic. reading the slot directly handed a type-specific helper to a foreign value
      if (hasOwn(KNOWN_GLOBAL_METHOD_RETURN_TYPES, name) && !isMutatedStatic('globalThis', name)) {
        return typeFromHint(KNOWN_GLOBAL_METHOD_RETURN_TYPES[name]);
      }
    }
    // `Object.create` with a prototype that cannot dispatch (null gives a prototype-less object, any
    // other primitive throws) yields nothing a polyfill could serve - the same verdict the
    // `__proto__:` channels carry for those values. an argument that MAY be an object installs a
    // prototype the resolver does not follow, so the call stays unmodelled and keeps typeless dispatch
    // the inert verdict below models the NATIVE `Object.create`; a user-replaced static may return
    // anything, so a mutated slot keeps the call unmodelled (the mutated-static invariant)
    const calleePair = resolveStaticCalleePair({ node: callee.node, ctx: { scope: callee.scope, path: callee } }, { method: 'create' });
    if (calleePair?.constructor === 'Object'
      && !isMutatedStatic('Object', 'create')
      && !prototypeValueMayDispatch(path.node.arguments?.[0], !!getScopeBinding({ scope: path.scope, name: 'undefined', path }))) {
      return new $Object('Object');
    }
    // `Object.setPrototypeOf(o, P)` hands `o` back over P: a P that may dispatch leaves it no instance of
    // what `o` was, the argument directive's answer, so it stays unmodelled like `Object.create(P)` and
    // the install channel names its family (`installedPrototypeFamilies`)
    const installed = resultPrototypeArgumentPath(path, 'setPrototypeOf');
    if (installed && prototypeValueMayDispatch(installed.node, !!getScopeBinding({
      scope: path.scope,
      name: 'undefined',
      path,
    }))) return null;
    // `import(...)` as a CallExpression with an `Import` callee is the babel@7 spelling and the only
    // one that reaches here: babel@8 and the ESTree pipeline both emit `ImportExpression`, which the
    // node-type switch below answers on its own. Live on that leg, so not dead - and never widen the
    // predicate to `ImportExpression`, which is the whole call: it would type `import('x')(1)` as the
    // promise instead of as the unmodelled value calling one yields
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
    if (!valuePath?.node) return null;
    // the general resolver, not a `X.prototype` shape match: an object installed as a prototype
    // hands down its OWN chain, so an instance (`{ __proto__: /re/ }`) names its family exactly as
    // the prototype object does. it also rejects a shadowed constructor and follows a proxy hop
    const type = resolveNodeType(valuePath);
    return type?.constructor ?? null;
  }

  // every prototype installed on the object `path`, as the value PATHS the channels write. null when
  // the reference set itself cannot be enumerated - an install may then exist that this never saw.
  // the ONE walk of the install channels: both the "is any prototype installed" question and the
  // family read below run off it, so the channel list cannot drift between them. the walks are
  // remembered per literal for the file: every reference to a binding resolves to its ONE initializer,
  // and walking that binding's references again for each of them is quadratic in the references
  let prototypeInstalls = new WeakMap();
  function installedPrototypeValuePaths(path) {
    let own = prototypeInstalls.get(path.node);
    if (!own) prototypeInstalls.set(path.node, own = ownPrototypeInstalls(path));
    const found = bindingPrototypeInstalls(path, own.undefinedShadowed);
    return found && [...own.values, ...found.installs.map(({ value }) => value)];
  }

  // ... the installs the object's own expression makes: a `__proto__:` property of a literal, and the
  // prototype `Object.create(P)` / `Object.setPrototypeOf(o, P)` hand an object back over
  function ownPrototypeInstalls(path) {
    const undefinedShadowed = !!getScopeBinding({ scope: path.scope, name: 'undefined', path });
    const values = [];
    if (path.node?.type === 'ObjectExpression') {
      const literalValue = objectLiteralPrototypeValue(path.node, undefinedShadowed);
      // located by node IDENTITY off the same literal, so the property-shape rules stay in the canon
      if (literalValue) {
        values.push(cachedContainerPaths(path, 'properties').find(p => p.node?.value === literalValue)?.get('value')
          ?? NO_PROTOTYPE_VALUE);
      }
    }
    // a non-dispatching argument is already inert upstream
    const created = resultPrototypeArgumentPath(path, 'create') ?? resultPrototypeArgumentPath(path, 'setPrototypeOf');
    if (created) values.push(created);
    return { values, undefinedShadowed };
  }

  // ... its half over the references of the binding a declarator's initializer `path` fills: `{ binding,
  // installs }`, each install a `{ value, ref, absorbable, partial }` that may run - one in an arm the build
  // never takes is none (`writeNeverRuns`), and a partial one lands only where a setter arm of its callee
  // runs (`installCalleeArms`). the reference walk is remembered per initializer, and every ask
  // checks that each install a render may take out of the tree still stands there: pure's guard over the
  // owners of an open selection replaces the call carrying one, and an answer kept from before that render
  // would make a later read take it after an earlier read alone. a render never puts one back, so a
  // detached install is dropped for good. an initializer typed by its own node asks this half alone
  // (`initGainsDispatchingPrototype`)
  let bindingInstalls = new WeakMap();
  function bindingPrototypeInstalls(path, undefinedShadowed = null) {
    let found = bindingInstalls.get(path.node);
    if (found === undefined) bindingInstalls.set(path.node, found = findBindingPrototypeInstalls(path, undefinedShadowed));
    if (found?.installs.some(({ ref, absorbable }) => absorbable && ancestorChainDetached(ref))) {
      found.installs = found.installs.filter(({ ref, absorbable }) => !absorbable || !ancestorChainDetached(ref));
    }
    return found;
  }

  // ... the reference walk itself, once per initializer
  function findBindingPrototypeInstalls(path, undefinedShadowed) {
    const host = peelTransparentExprAncestorPath(path);
    const declarator = host.parentPath?.node;
    const binding = declarator?.type === 'VariableDeclarator' && declarator.init === host.node
      && declarator.id?.type === 'Identifier' ? getScopeBinding({ scope: host.scope, name: declarator.id.name, path: host }) : null;
    const refs = binding ? collectBindingReferences(binding, host) : [];
    if (!refs) return null;
    const shadowed = undefinedShadowed ?? (refs.length ? !!getScopeBinding({ scope: path.scope, name: 'undefined', path }) : false);
    const adapter = getDecisionAdapter();
    const installs = [];
    for (const ref of refs) {
      const value = installedPrototypeValuePathAt(ref, shadowed);
      if (!value || writeNeverRuns({ write: ref.node, usagePath: ref, adapter })) continue;
      const arms = installCalleeArms(ref);
      installs.push({ value, ref, absorbable: arms === 'every' || arms === 'some', partial: arms === 'some' });
    }
    return { binding, installs, undefinedShadowed: shadowed };
  }

  // ... how the setter call carrying this install spells its callee (`protoSetterCalleeArms`), null for a
  // `__proto__` write, which is no call. a render may take the call out of the tree where it is spelled
  // through a selection, which pure's guard over its owners replaces whole - the lone canonical spelling
  // stays a call of the setter, whatever a rewrite makes of its callee - and one only some arm of which is
  // a setter installs only where such an arm runs
  function installCalleeArms(ref) {
    const call = prototypeWriteHostPath(ref)?.parentPath;
    const isCall = call?.node?.type === 'CallExpression' || call?.node?.type === 'OptionalCallExpression';
    return isCall ? protoSetterCalleeArms(call.get('callee')) : null;
  }

  // an object a declarator's initializer builds and the binding later hands a dispatching prototype
  // (`const m = new Map(); Object.setPrototypeOf(m, Array.prototype)`) is no instance of what the
  // initializer built, as a literal is not (that one answers for itself): the install channel names
  // its family. a read of the binding (`readPath`) takes an install only where it may run before the
  // read, as a write of the binding reaches it (`noReassignmentReachesUsage`): one the read precedes in
  // its own frame, re-run by no loop, leaves the read the initializer's type. the reference walk is the
  // cost, so it runs only in a file whose identifier-rooted member chains spell an install's key
  // (`spellsMemberKey`): a file that spells its installs without one (a destructured setter alone)
  // leaves the initializer's type
  function initGainsDispatchingPrototype(path, readPath = null) {
    if (path.node?.type === 'ObjectExpression' || !spellsMemberKey('setPrototypeOf') && !spellsMemberKey('__proto__')) return false;
    const found = bindingPrototypeInstalls(path);
    if (found === null) return true;
    const { binding, installs } = found;
    return installs.some(({ ref }) => !readPath || !noReassignmentReachesUsage({
      reassignmentNodes: [ref.node],
      usagePath: readPath,
      bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node ?? null,
      bindingAnchor: bindingLoopAnchor(binding),
    }));
  }

  // the FAMILIES those prototypes dispatch. null when any of them cannot be named - the receiver then
  // keeps the full dispatch, since an unnamed prototype may carry any family's methods. a read
  // (`readPath`) no install provably runs before - one a loop re-runs past it, one in a closure created
  // ahead of it, one under a condition it does not share, one through a selection only some arm of which
  // is a setter - may still see the object its initializer built, so that family joins them
  function installedPrototypeFamilies(path, readPath = null) {
    const values = installedPrototypeValuePaths(path);
    if (values === null) return null;
    const families = new Set();
    for (const valuePath of values) {
      const family = prototypeValueFamily(valuePath);
      if (!family) return null;
      families.add(family);
    }
    if (!families.size || !readPath || installRunsBeforeRead(path, readPath)) return families;
    const own = resolveRuntimeNodeType(path, path.node)?.constructor;
    if (!own) return null;
    families.add(own);
    return families;
  }

  // ... does an install provably run before the read: the object's own expression installs as it builds
  // the object, and a binding's install that dominates the read has run by it (`reassignmentDominatesUsage`)
  // unless it is partial: its call runs where no setter arm does as well
  function installRunsBeforeRead(path, readPath) {
    if (prototypeInstalls.get(path.node)?.values.length) return true;
    const installs = bindingPrototypeInstalls(path)?.installs ?? [];
    return reassignmentDominatesUsage({
      reassignmentNodes: installs.filter(({ partial }) => !partial).map(({ ref }) => ref.node),
      usagePath: readPath,
      adapter: getDecisionAdapter(),
      climb: true,
    });
  }

  // the value PATH of a reference's prototype install: the canon decides WHETHER the reference
  // installs, this only re-reads the value slot it matched off the same host
  function installedPrototypeValuePathAt(ref, undefinedShadowed) {
    const valueNode = installedPrototypeValueAt(ref, protoSetterCalleeArms, undefinedShadowed);
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

  // the PROTOTYPE argument PATH of a native `Object[method]` call whose RESULT is an object over it,
  // null when the call is anything else: `Object.create(P)` builds one, `Object.setPrototypeOf(o, P)`
  // hands an object `o` back over P - a primitive `o` comes back as itself, and the `Reflect` twin
  // answers a boolean. a user-replaced static may return anything, so a mutated slot stays unmodelled
  function resultPrototypeArgumentPath(path, method) {
    if (path.node?.type !== 'CallExpression' && path.node?.type !== 'OptionalCallExpression') return null;
    const callee = path.get('callee');
    const pair = resolveStaticCalleePair({ node: callee.node, ctx: { scope: callee.scope, path: callee } }, { method });
    if (pair?.constructor !== 'Object' || isMutatedStatic('Object', method)) return null;
    const args = path.get('arguments') ?? [];
    if (method === 'create') return args[0] ?? null;
    const target = args[0]?.node ? resolveNodeType(args[0]) : null;
    return target && !target.primitive ? args[1] ?? null : null;
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
    const entryPath = path;
    path = resolvePath(path);
    const cachedAfter = getCachedType(path.node);
    if (cachedAfter) return cachedAfter;
    const type = resolveRuntimeNodeType(path, entryNode);
    // a value reached through a binding is read where the binding was asked
    return type && !type.primitive && initGainsDispatchingPrototype(path, path.node === entryNode ? null : entryPath) ? null : type;
  }

  // the switch over the runtime node the value-follow landed on; `entryNode` is the node first asked
  function resolveRuntimeNodeType(path, entryNode) {
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
        return new $Primitive('string');
      case 'TemplateLiteral':
        // in the quasi slot the same node is the tag's strings ARRAY (a frozen `string[]`), and
        // that slot becomes readable the moment a tagged template is enumerated as a call
        return isTaggedTemplateQuasiPosition(path.parentPath?.node, path.node)
          ? new $Object('Array', new $Primitive('string')) : new $Primitive('string');
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
      case 'ArrayExpression': {
        // an EMPTY literal constrains no element, exactly as the bare `Array` shorthand does.
        // Elements that WERE written and did not fold to one type leave the same hole, and left
        // unconfessed two of them compare EQUAL - `[1, 'x']` and `[true, 1]` answered TRUE where
        // tsc weighs the element types and says FALSE
        const elements = resolveArrayLiteralCommonType(path);
        if (!elements && !path.node.elements.length) return new $Object('Array');
        return elementContainerType(new $Object('Array'), null, elements);
      }
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'ObjectMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'ClassExpression':
      case 'ClassDeclaration':
        return new $Object('Function');
      case 'ThisExpression': {
        // the anchor answers BOTH arms, and the two thin wrappers over it each re-climb the whole
        // ancestor chain - by construction at most one of them can return non-null
        const anchor = resolveThisAnchor(path);
        // `this` inside an object-literal method IS that literal - the same assumption the field
        // read through `this` already makes, taken under the same gate: an enumerable closure means
        // no method of the object can be handed out and re-bound to a foreign receiver. re-entering
        // the dispatcher on the literal keeps the foreign-prototype guard. without it the receiver
        // stays untyped and a member whose name matches a built-in instance method (`this.entries`
        // reading an own data property) injects a polyfill a plain object can never need
        if (anchor?.kind !== 'class') {
          const objAnchor = anchor?.kind === 'object' ? anchor.objectPath : null;
          return objAnchor && computeObjectAliasClosure(objAnchor) ? resolveNodeType(objAnchor) : null;
        }
        // static-context `this` IS the constructor value, not an instance: instance-flavored
        // narrowing rewrote static aliases of `class C extends Array` to instance helpers
        // (native TypeError became a silent undefined)
        if (anchor.isStatic) return new $Object('Function');
        // an instance method extracted off the prototype and re-invoked (`C.prototype.m.call(arr)`)
        // runs the same body with a foreign `this`, so the lexical class answers for the receiver
        // only while no own-this method of the hierarchy can be handed out - the gate the field read
        // through `this` already applies. same question, same answer as the object-literal flavor
        if (!thisAnchorIsProvable(anchor.classPath)) return null;
        // base-less `this` -> Object; unknowable super -> null (generic), not a re-suppressing Object floor
        return resolveClassInheritance(anchor.classPath);
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
      case 'ConditionalExpression': {
        // our own ctor-identity narrow reads as the member read it guards - see the runtime
        // expression canon, which descends the same way
        const ownNarrow = ownCtorNarrowAlternatePath(path);
        if (ownNarrow) return resolveNodeType(ownNarrow);
        const decided = decidedOperandPath(path);
        if (decided) return resolveNodeType(decided);
        // transpilers desugar destructuring defaults to a self-ternary - positive
        // (`_ref === void 0 ? D : _ref`), inverse (`_ref !== void 0 ? _ref : D`),
        // and loose-eq (`_ref == null ? D : _ref`). when one branch is the same identifier as
        // the nullish-check argument, fold the default and self-ref via their common type,
        // collapsing to the default only when the ref is statically nullish
        return resolveDesugarDefaultTernary(path)
          || resolveUnionType(path.get('consequent'), path.get('alternate'), '?:');
      }
      case 'LogicalExpression': {
        const decided = decidedOperandPath(path);
        return decided ? resolveNodeType(decided) : resolveUnionType(path.get('left'), path.get('right'), path.node.operator);
      }
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
    objectDispatchesForeignPrototype,
    resolveNodeTypeExpression,
    reset() {
      prototypeInstalls = new WeakMap();
      bindingInstalls = new WeakMap();
    },
  };
}
