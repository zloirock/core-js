// Module-wide closure + temporal-flow tracking for class / object field-flow inference.
// builds the alias closure of every binding through which a class instance / static binding
// / object literal can be referenced, then computes the temporal bound after which no
// observable invocation can fire - any `<receiver>.<field> = Y` past that bound is provably
// dead and excluded from the field-flow union. also indexes all `<expr>.<field>` writes +
// subclass relationships per program node for O(1) per-field lookup.
//
// Public surface:
//   getClassInstanceClosure(class, prog)        - cached instance alias union | null on leak
//   getClassBindingClosure(class, anchor)       - cached class-name binding closure | null
//   computeObjectAliasClosure(obj)              - cached object-literal alias closure | null
//   getClosureTemporalBound(closure, prog, ...) - cached upper-bound source position
//   getClassInstanceTemporalBound(closure, names, prog) - class flavor (adds new C().method)
//   isReceiverInClosure(objPath, closure)       - identity-based receiver predicate
//   pushIfWriteMatches(writePath, pred, out)    - generic write folder
//   getModuleFieldIndex(prog)                   - cached {writesByField, subclassesBySuper}
//   reset()                                     - per-file cache invalidation
//
// Service object carries factory helpers + binding-analysis cluster outputs. The Babel
// scope adapter (`BABEL_BINDING_ADAPTER`) feeds `globalProxyMemberName` /
// `walkStaticReceiverChain` for `extends NS.Inner.Class` lookups
import { EMPTY_CLOSURE, EXTENDS_CHILD_RESOLVERS } from './base.js';
import { createMemberWriteShape, memberWriteTargetPath } from './class-member-shapes.js';
import { unwrapRuntimeExpr } from '../helpers/ast-patterns.js';
import { globalProxyMemberName } from '../helpers/class-walk.js';
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';

export function createClosureAnalysis({
  t,
  babelBindingAdapter,
  memoize,
  getKeyName,
  objectBindingName,
  computeAliasClosureFromBinding,
  classBindingName,
  classBindingRefClassifier,
  isNewOfClass,
  resolveNodeType,
}) {
  // anonymous objects (no stable binding name) get an empty closure rather than null bail:
  // there's no name through which external writes can target them, so the empty closure's
  // write filter matches zero writes - safe partial scan from init + this-writes only.
  // named bindings delegate to the generic closure builder (which may itself return null
  // on leak / reassignment). cached per ObjectExpression node: a single literal can have
  // many distinct field reads (`this.a`, `this.b`, ...) but the closure is field-agnostic
  let objectAliasClosureCache = new WeakMap();
  function computeObjectAliasClosure(objectPath) {
    return memoize(objectAliasClosureCache, objectPath.node, () => {
      const rootName = objectBindingName(objectPath);
      return rootName
        ? computeAliasClosureFromBinding({ rootBinding: objectPath.scope?.getBinding(rootName), rootName, anchorPath: objectPath })
        : EMPTY_CLOSURE;
    });
  }

  // does the write's receiver Identifier resolve (via scope-binding identity) to a name in
  // the alias closure? matches `o.x = ...`, `alias.x = ...` etc. for any `alias` in the
  // closure (`Map<name, binding>` from `computeObjectAliasClosure` / `collectClassInstanceClosure`).
  // shadowed same-name bindings in nested scopes are rejected by the scope-binding identity
  // check. shared between object-literal and class-instance write filters
  function isReceiverInClosure(objPath, closure) {
    if (!t.isIdentifier(objPath.node)) return false;
    const trackedBinding = closure.get(objPath.node.name);
    if (!trackedBinding) return false;
    return objPath.scope?.getBinding(objPath.node.name) === trackedBinding;
  }

  // classify a closure-binding-name reference's contribution to temporal-flow bounding:
  //   null         - declaration site or alias-creation (no temporal contribution)
  //   'call'       - direct method call `<name>.<X>(...)` - extends call bound to ctx.start
  //   'write'      - assignment / update on `<name>.<X>` - external write, fold separately
  //   'extraction' - any other use (`f(name)`, `name.X.Y`, `name.X.bind(...)`, ...) - the
  //                  binding's value escapes, deferred invocation can happen at any time
  // shared between object-literal closure and class-instance closure walkers
  function classifyClosureRef(p) {
    const { parent } = p;
    if (parent?.type === 'VariableDeclarator' && parent.id === p.node) return null;
    if (parent?.type === 'VariableDeclarator' && parent.init === p.node) return null;
    if ((parent?.type !== 'MemberExpression' && parent?.type !== 'OptionalMemberExpression')
      || parent.object !== p.node) return { kind: 'extraction' };
    const ctx = p.parentPath?.parent;
    if ((ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression') && ctx.callee === parent) {
      return { kind: 'call', start: ctx.start };
    }
    if (ctx?.type === 'AssignmentExpression' && ctx.left === parent && ctx.operator === '=') return { kind: 'write' };
    if (ctx?.type === 'UpdateExpression' && ctx.argument === parent) return { kind: 'write' };
    return { kind: 'extraction' };
  }

  // latest source position where any closure binding could be invoked. used to bound the
  // external-write fold by temporal flow: writes whose start >= this bound happen after
  // every observable invocation, so they cannot be observed at any call site of any method
  // on the closure. returns:
  //   `Infinity` - method extraction detected; deferred invocation can happen any time, so
  //                no temporal benefit applies and all writes are folded as before
  //   numeric    - latest start of `<closure-name>.<X>(...)` direct call expression
  //   `-Infinity` - no calls AND no extractions: closure methods are never invoked, so all
  //                writes happen after their (non-existent) observable time and are excluded
  // shared between object-literal and class-instance closures. `extraVisitorsFactory`
  // optionally supplies additional traversal visitors (class case adds NewExpression to
  // catch direct `new C().method(...)` chain calls, which don't go through closure bindings)
  // cached by closure Map identity. closures are themselves cached upstream (per class /
  // object node), so the same Map instance is reused across multiple field queries on the
  // same anchor - one program walk per closure instead of one per field. for the class case
  // `extraVisitorsFactory` captures classNames derived from the same class as the closure,
  // so the bound is determined entirely by closure identity (class with N instance fields:
  // N walks -> 1 walk + N - 1 cache hits)
  let closureTemporalBoundCache = new WeakMap();
  function getClosureTemporalBound(closure, programPath, extraVisitorsFactory) {
    return memoize(closureTemporalBoundCache, closure, () => {
      let latestCallStart = -Infinity;
      let extracted = false;
      function noteCall(start) {
        if (start !== null && start !== undefined && start > latestCallStart) latestCallStart = start;
      }
      const visitors = {
        Identifier(p) {
          if (extracted || !closure.has(p.node.name)) return;
          const binding = closure.get(p.node.name);
          if (p.scope?.getBinding(p.node.name) !== binding) return;
          const cls = classifyClosureRef(p);
          if (cls === null || cls.kind === 'write') return;
          if (cls.kind === 'extraction') extracted = true;
          else noteCall(cls.start);
        },
      };
      if (extraVisitorsFactory) {
        Object.assign(visitors, extraVisitorsFactory({
          noteCall,
          markExtraction: () => { extracted = true; },
          isExtracted: () => extracted,
        }));
      }
      programPath.traverse(visitors);
      return extracted ? Infinity : latestCallStart;
    });
  }

  // class-side temporal bound: closure refs PLUS direct `new C().method(...)` chain calls
  // that aren't captured by any binding. `(new C()).x = Y` writes are similarly handled
  // separately by `isReceiverNewOfClass` in the write-filter predicate. `classNames` is the
  // descendant-names Set so subclass invocations also extend the bound
  function getClassInstanceTemporalBound(closure, classNames, programPath) {
    return getClosureTemporalBound(closure, programPath, ({ noteCall, isExtracted }) => ({
      NewExpression(p) {
        if (isExtracted()) return;
        if (!isNewOfClass(p.node, classNames)) return;
        const { parent } = p;
        if (parent?.type !== 'MemberExpression' || parent.object !== p.node) return;
        const ctx = p.parentPath?.parent;
        if ((ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression')
          && ctx.callee === parent) noteCall(ctx.start);
      },
    }));
  }

  // collect base class + every transitive subclass path. used by instance flow scan to
  // include subclass instances in the closure (since `class Sub extends C; const s = new
  // Sub(); s.x = Y` writes affect C's inherited field slot) and to scan subclass methods'
  // `this.<field>` writes recursively (not just direct subclasses). cached per class node:
  // the instance pipeline reads `.names` in programGate and `.paths` in programWritesPush;
  // `collectClassInstanceClosure` reads `.names` again - one walk amortized
  let classDescendantPathsCache = new WeakMap();
  function collectClassDescendantPaths(classPath, programPath) {
    return memoize(classDescendantPathsCache, classPath.node, () => {
      const className = classBindingName(classPath);
      if (!className) return null;
      const index = getModuleFieldIndex(programPath);
      const names = new Set([className]);
      const paths = [classPath];
      const queue = [className];
      while (queue.length) {
        const name = queue.shift();
        for (const sub of index.subclassesBySuper.get(name) ?? []) {
          const subName = classBindingName(sub);
          if (!subName || names.has(subName)) continue;
          names.add(subName);
          paths.push(sub);
          queue.push(subName);
        }
      }
      return { names, paths };
    });
  }

  // build the union alias closure across every `new <ClassName>()`-bound instance in the
  // module, where ClassName is the base class OR any transitive subclass (subclass instance
  // writes affect base's inherited field slot). each bound declarator's chain (via
  // `computeAliasClosureFromBinding`) becomes part of the union; anonymous instance bindings
  // (destructured ids, etc.) and direct `new C()` in unsafe positions (function arg /
  // return / spread / ...) signal "unmonitored channel" and the entire closure bails to null.
  // anonymous classes (no `className`) bail unconditionally - external writes via instance
  // are unenumerable without a stable name. returned `Map<name, binding>` plugs into
  // `isReceiverInClosure` and `getClosureTemporalBound` the same way the object closure does
  function collectClassInstanceClosure(classPath, programPath) {
    const desc = collectClassDescendantPaths(classPath, programPath);
    if (!desc) return null;
    const closure = new Map();
    let leaked = false;
    programPath.traverse({
      VariableDeclarator(p) {
        if (leaked) return;
        if (!isNewOfClass(p.node.init, desc.names)) return;
        const { id } = p.node;
        if (id?.type !== 'Identifier') {
          leaked = true;
          return;
        }
        const binding = p.scope?.getBinding(id.name);
        const sub = computeAliasClosureFromBinding({ rootBinding: binding, rootName: id.name, anchorPath: p });
        if (sub === null) {
          leaked = true;
          return;
        }
        for (const [name, b] of sub) closure.set(name, b);
      },
      NewExpression(p) {
        if (leaked) return;
        if (!isNewOfClass(p.node, desc.names)) return;
        const { parent } = p;
        // safe positions for direct `new C()`:
        //   - VariableDeclarator init (already handled by VariableDeclarator visitor above)
        //   - bare ExpressionStatement (`new C();`) - value discarded, no channel
        //   - MemberExpression where the new is the receiver (`new C().x`) - field accessed
        //     once, instance dies; no later mutation channel
        if (parent?.type === 'VariableDeclarator' && parent.init === p.node) return;
        if (parent?.type === 'ExpressionStatement') return;
        if (parent?.type === 'MemberExpression' && parent.object === p.node) return;
        leaked = true;
      },
    });
    return leaked ? null : closure;
  }

  // cached wrapper of `collectClassInstanceClosure`. mirrors `objectAliasClosureCache`:
  // a class with N fields would otherwise re-walk the program N times during candidate
  // collection. cache by class node identity. distinguish `null` (cached as "leaked") from
  // `undefined` (not yet computed) via `cache.has`. reset alongside other module-scoped
  // caches in the cache-reset hook
  let classInstanceClosureCache = new WeakMap();
  function getClassInstanceClosure(classPath, programPath) {
    return memoize(classInstanceClosureCache, classPath.node,
      () => collectClassInstanceClosure(classPath, programPath));
  }

  // class binding closure: the class identifier itself (`C`) and all `const A = C` aliases.
  // `C.x = Y` and `A.x = Y` writes match this closure for static-field external writes.
  // built via `computeAliasClosureFromBinding` with the relaxed `classBindingRefClassifier`
  // so `new C()` / `extends C` / `instanceof C` / TS type-positions don't trigger leak.
  // cached per class node identity. on alias-walk leak (e.g. `f(C)` passes the binding to
  // a user function that may mutate static fields opaquely), bail to null so the caller
  // skips narrow emission - mirrors instance closure semantics. previously fell back to
  // the minimal `{className: binding}` set, which silently retained narrow even when an
  // unenumerable channel could have mutated the field at runtime
  let classBindingClosureCache = new WeakMap();
  function getClassBindingClosure(classPath, anchorPath) {
    return memoize(classBindingClosureCache, classPath.node, () => {
      const className = classBindingName(classPath);
      const binding = className ? classPath.scope?.getBinding(className) : null;
      if (!binding) return null;
      return computeAliasClosureFromBinding({
        rootBinding: binding, rootName: className, anchorPath, classifier: classBindingRefClassifier,
      });
    });
  }

  // canonical name for an `extends` clause node. Identifier returns its name; non-computed
  // MemberExpression resolves through proxy-global walk (`globalThis.X.Foo` chains) OR
  // walkStaticReceiverChain (const-bound `NS.Inner.Foo` chains, with class-leaf accept).
  // walks the member chain into root + walkPath, so multi-hop user namespaces work the
  // same as single-hop. returns null for any unsupported shape - registering under a wrong
  // name would WIDEN the base's field-type fold with non-subclass writes, so safe miss
  // preferred over false-positive
  function extendsClauseName(superClass, scope) {
    if (superClass?.type === 'Identifier') {
      // walk const-alias chain: `class Sub extends Alias` with `const Alias = Base` must
      // register under canonical 'Base' name so subclass writes reach Base's flow tracker.
      // single-hop Identifier inits only (TS cast peeled); member-shape inits fall through
      // to the existing globalProxyMemberName / walkStaticReceiverChain paths above
      let { name } = superClass;
      const seen = new Set();
      while (!seen.has(name)) {
        seen.add(name);
        const init = unwrapRuntimeExpr(scope?.getBinding?.(name)?.path?.node?.init);
        if (init?.type !== 'Identifier') break;
        name = init.name;
      }
      return name;
    }
    if (superClass?.type !== 'MemberExpression' || superClass.computed) return null;
    const proxy = globalProxyMemberName({ node: superClass, scope, adapter: babelBindingAdapter, path: null });
    if (proxy) return proxy;
    const path = [];
    let cur = superClass;
    while (cur?.type === 'MemberExpression' && !cur.computed) {
      const k = getKeyName(cur.property);
      if (!k) return null;
      path.unshift(k);
      cur = cur.object;
    }
    if (cur?.type !== 'Identifier') return null;
    return walkStaticReceiverChain({ receiverNode: cur, walkPath: path, scope, adapter: babelBindingAdapter });
  }

  // multi-name variant of `extendsClauseName` for the module-field index. canonical-name
  // callers (`findParentClassDecl`, type-position `parentRef` builder) need ONE answer
  // for "what's the parent class type"; ambiguous shapes (`extends mix(Base)` /
  // `extends cond ? Base : Other`) have no single answer and bail to null. but the
  // module index only needs "which base names should this subclass be registered under"
  // - over-registration is the SAFE direction (writes through the subclass widen the
  // base's field type, conservative polyfill emit). unrecognised shapes bail silently -
  // over-registration on a NON-class binding is benign (associates a subclass with a name
  // nobody reads back, no false-positive widens)
  function collectExtendsCandidateNames(superClass, scope, out = []) {
    superClass = unwrapRuntimeExpr(superClass);
    if (!superClass) return out;
    const single = extendsClauseName(superClass, scope);
    if (single) {
      out.push(single);
      return out;
    }
    const children = EXTENDS_CHILD_RESOLVERS[superClass.type]?.(superClass);
    if (children) for (const child of children) collectExtendsCandidateNames(child, scope, out);
    return out;
  }

  // shared shape predicates for `<expr>.<field> = ...` / `<expr>.<field>++` writes -
  // see `./class-member-shapes.js` for the unified implementation. instantiated here so
  // `t` / `getKeyName` / `resolveNodeType` dispatch stays inside the cluster's closure
  const { memberWriteFieldName, writePathContributedType } =
    createMemberWriteShape({ t, getKeyName, resolveNodeType });

  // generic write-folder: `writePath` is a pre-filtered `<expr>.<fieldName> = Y` from the
  // module index (operator / member / field-name already satisfied). caller supplies a
  // `predicate(objPath)` that decides whether this write's receiver belongs to the field's
  // monitored set. `this.<fieldName> = ...` writes are scanned separately by the per-owner
  // this-writes index (`getInstanceMethodThisWrites` / `getStaticMethodThisWrites`), so
  // they're skipped here to avoid double-counting
  function pushIfWriteMatches(writePath, predicate, out) {
    const objPath = memberWriteTargetPath(writePath).get('object');
    if (t.isThisExpression(objPath.node)) return;
    if (!predicate(objPath)) return;
    const contributed = writePathContributedType(writePath);
    if (contributed) out.push(contributed);
  }

  // precomputed per-module index for the module-wide flow scan. naive approach does two full
  // traversals per public field (subclasses + external writes), yielding O(fields x N). build
  // once, look up by name, turning the total into a single O(N) pass amortized across every
  // public field query in the module
  let moduleFieldIndexCache = new WeakMap();
  function getModuleFieldIndex(programPath) {
    return memoize(moduleFieldIndexCache, programPath.node, () => {
      const writesByField = new Map();
      const subclassesBySuper = new Map();
      function pushMultimap(map, key, value) {
        const list = map.get(key);
        if (list) list.push(value);
        else map.set(key, [value]);
      }
      programPath.traverse({
        'ClassDeclaration|ClassExpression'(p) {
          // collect EVERY candidate base name reachable through the superClass shape:
          //   - Identifier / MemberExpression: canonical name (single)
          //   - CallExpression `mix(Base)`: each arg as candidate (mixin pattern)
          //   - ConditionalExpression / LogicalExpression: both branches
          //   - TS wrappers (`as` / `!` / `<>`) / ParenthesizedExpression: unwrap
          // over-registration on the subclass side is the safe direction - it WIDENS
          // base's field-flow with subclass writes, falling back to generic dispatch
          // (the conservative outcome). silent bail on unrecognized shapes is benign
          const names = collectExtendsCandidateNames(p.node.superClass, p.scope);
          // dedupe: `extends cond ? Base : Base` would otherwise register subclass twice
          // under the same key, double-counting writes through the subclass instance
          const seen = new Set();
          for (const name of names) {
            if (seen.has(name)) continue;
            seen.add(name);
            pushMultimap(subclassesBySuper, name, p);
          }
        },
        // index ALL `<expr>.<fieldName> <op>= ...` and `<expr>.<fieldName>++` / `--` writes
        // regardless of operator. `pushIfWriteMatches` distinguishes pure `=` (push RHS Type)
        // from compound / Update (push `unknown`) at consume time via `writePathContributedType`
        AssignmentExpression(p) {
          const name = memberWriteFieldName(p.node.left);
          if (name) pushMultimap(writesByField, name, p);
        },
        UpdateExpression(p) {
          const name = memberWriteFieldName(p.node.argument);
          if (name) pushMultimap(writesByField, name, p);
        },
      });
      return { writesByField, subclassesBySuper };
    });
  }

  function reset() {
    objectAliasClosureCache = new WeakMap();
    closureTemporalBoundCache = new WeakMap();
    classInstanceClosureCache = new WeakMap();
    classBindingClosureCache = new WeakMap();
    classDescendantPathsCache = new WeakMap();
    moduleFieldIndexCache = new WeakMap();
  }

  return {
    computeObjectAliasClosure,
    isReceiverInClosure,
    getClosureTemporalBound,
    getClassInstanceTemporalBound,
    getClassInstanceClosure,
    getClassBindingClosure,
    extendsClauseName,
    collectClassDescendantPaths,
    pushIfWriteMatches,
    getModuleFieldIndex,
    reset,
  };
}
