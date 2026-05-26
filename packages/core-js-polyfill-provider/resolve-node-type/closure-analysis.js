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
import { isTSTypeOnlyIdentifierPath, peelParenAndTSParentPath, unwrapExpressionChain, unwrapRuntimeExpr } from '../helpers/ast-patterns.js';
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
  buildProgramIndex,
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

  // does the write's receiver Identifier resolve (via scope-binding identity) to a binding
  // in the alias closure? matches `o.x = ...`, `alias.x = ...` etc. for any `alias` in
  // the closure (`Map<binding, name>` from `computeObjectAliasClosure` / `collectClassInstanceClosure` -
  // see structure rationale at `computeAliasClosureFromBinding`). TS expression wrappers
  // (`(c as any).x = Y`) peeled so the inner Identifier identity-checks against the closure
  function isReceiverInClosure(objPath, closure) {
    const node = unwrapRuntimeExpr(objPath.node);
    if (!t.isIdentifier(node)) return false;
    const binding = objPath.scope?.getBinding(node.name);
    return !!binding && closure.has(binding);
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
    // type-only positions (`export type { X }` / `export { type X }`, `class implements
    // Foo<X>` heritage) are tsc-elided at runtime - the reference doesn't escape the module
    // so closure-narrow stays in scope. shared helper covers both declaration-level and
    // per-specifier `exportKind` and the implements-heritage walk
    if (isTSTypeOnlyIdentifierPath(p)) return null;
    // peel transparent wrappers between the identifier and its semantic context so
    // `(name as any).X(...)` / `(name)?.X(...)` still classify as 'call' rather than
    // 'extraction'. oxc preserves both shapes; babel strips parens but keeps TS wrappers.
    // identity check uses `unwrapRuntimeExpr` because the member object slot may itself
    // be a wrapped reference to the identifier (`{object: TSAsExpression{expression: p.node}}`)
    const memberPath = peelParenAndTSParentPath(p);
    const memberNode = memberPath?.node;
    if ((memberNode?.type !== 'MemberExpression' && memberNode?.type !== 'OptionalMemberExpression')
      || unwrapRuntimeExpr(memberNode.object) !== p.node) return { kind: 'extraction' };
    const ctx = peelParenAndTSParentPath(memberPath)?.node;
    if ((ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression') && unwrapRuntimeExpr(ctx.callee) === memberNode) {
      return { kind: 'call', start: ctx.start };
    }
    if (ctx?.type === 'AssignmentExpression' && ctx.operator === '='
      && unwrapRuntimeExpr(ctx.left) === memberNode) return { kind: 'write' };
    if (ctx?.type === 'UpdateExpression' && unwrapRuntimeExpr(ctx.argument) === memberNode) return { kind: 'write' };
    return { kind: 'extraction' };
  }

  // per-program index of classified Identifier refs (grouped by binding) + direct
  // `new <Name>().<X>(...)` chain-call starts (grouped by constructor name). built once via
  // `buildProgramIndex`; previously re-walked per closure - O(C * N) on N-statement programs.
  // refs filtered through `classifyClosureRef` so write / decl-id slots drop out
  let programClosureIndexCache = new WeakMap();
  function buildProgramClosureIndex(programPath) {
    return memoize(programClosureIndexCache, programPath.node, () => {
      const { identifierByBinding, newExprByName } = buildProgramIndex(programPath);
      const classifiedByBinding = new Map();
      for (const [binding, paths] of identifierByBinding) {
        const refs = [];
        for (const p of paths) {
          const cls = classifyClosureRef(p);
          if (cls === null || cls.kind === 'write') continue;
          refs.push(cls);
        }
        if (refs.length) classifiedByBinding.set(binding, refs);
      }
      const newCallsByName = new Map();
      for (const [name, entries] of newExprByName) {
        for (const entry of entries) {
          if (!entry.isMemberRecv) continue;
          const ctx = entry.path.parentPath?.parent;
          if (ctx?.type !== 'CallExpression' && ctx?.type !== 'OptionalCallExpression') continue;
          if (ctx.callee !== entry.path.parent) continue;
          let starts = newCallsByName.get(name);
          if (!starts) newCallsByName.set(name, starts = []);
          starts.push(ctx.start);
        }
      }
      return { classifiedByBinding, newCallsByName };
    });
  }

  // latest source position where any closure binding could be invoked. used to bound the
  // external-write fold by temporal flow: writes whose start >= this bound happen after
  // every observable invocation, so they cannot be observed at any call site of any method
  // on the closure. returns:
  //   `Infinity` - method extraction detected; deferred invocation can happen any time
  //   numeric    - latest start of `<closure-name>.<X>(...)` direct call expression
  //   `-Infinity` - no calls AND no extractions: closure methods are never invoked
  // shared between object-literal and class-instance closures. cached by closure Map identity
  let closureTemporalBoundCache = new WeakMap();
  function getClosureTemporalBound(closure, programPath) {
    return memoize(closureTemporalBoundCache, closure, () => {
      const { classifiedByBinding } = buildProgramClosureIndex(programPath);
      let latestCallStart = -Infinity;
      for (const binding of closure.keys()) {
        const refs = classifiedByBinding.get(binding);
        if (!refs) continue;
        for (const cls of refs) {
          if (cls.kind === 'extraction') return Infinity;
          if (cls.start > latestCallStart) latestCallStart = cls.start;
        }
      }
      return latestCallStart;
    });
  }

  // class-side temporal bound: closure refs PLUS direct `new C().method(...)` chain calls.
  // `classNames` is the descendant-names Set so subclass invocations also extend the bound.
  // memoizes by closure identity AND classNames identity: same closure with different
  // descendant sets (rare) gets its own slot; same call site gets a cache hit
  let classInstanceTemporalBoundCache = new WeakMap();
  function getClassInstanceTemporalBound(closure, classNames, programPath) {
    let inner = classInstanceTemporalBoundCache.get(closure);
    if (!inner) classInstanceTemporalBoundCache.set(closure, inner = new WeakMap());
    return memoize(inner, classNames, () => {
      const base = getClosureTemporalBound(closure, programPath);
      if (base === Infinity) return Infinity;
      const { newCallsByName } = buildProgramClosureIndex(programPath);
      let latestCallStart = base;
      for (const name of classNames) {
        const starts = newCallsByName.get(name);
        if (!starts) continue;
        for (const start of starts) if (start > latestCallStart) latestCallStart = start;
      }
      return latestCallStart;
    });
  }

  // class + every transitive subclass: `class Sub extends C; new Sub().x = Y` widens C's
  // inherited field fold, and subclass methods' `this.x = Y` writes also count
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

  // union alias closure across every `new <Name>()` instance bound to a declarator, where
  // `<Name>` is the class OR any transitive subclass / `const A = C` alias. `new C()` in a
  // leak position (function arg, spread, ...) or any non-Identifier declarator id bails to
  // null. returned `Map<binding, name>` is keyed by binding identity so shadowed bindings
  // stay distinct (consumed by `isReceiverInClosure` / `getClosureTemporalBound`)
  // SOLE-source guard for assignment-init bindings: `c = new C()` is treated equivalent to
  // a declarator-init only when the binding's lifetime carries no OTHER value at any source
  // position. requires (a) bare-let declaration (`let c;` with init === null), and (b) single
  // constantViolation entry (this assignment is the only reassignment). without these,
  // `let c = otherValue; c = new C()` or `let c; c = new C(); c = otherValue` would let an
  // unrelated value slip into the instance closure, unsoundly suppressing writes to it
  function isSoleAssignmentSource(binding) {
    if (binding?.kind !== 'let') return false;
    const declNode = binding.path?.node;
    if (declNode?.type !== 'VariableDeclarator' || declNode.init !== null) return false;
    return (binding.constantViolations?.length ?? 0) === 1;
  }

  // resolve the binding holding the constructed instance. shape: `{ name, scope, anchorPath }`
  // when the entry binds an instance to a tracked binding; `{ bail: true }` when the entry's
  // shape pollutes the closure (mixed source - assignment-init with non-bare-let or multiple
  // reassignments, see `isSoleAssignmentSource`); null when the entry isn't tracked and the
  // caller should skip (paren-wrapped declarator with non-Identifier id).
  // for `const c = new C()` the declarator's id is the binding source; for
  // `let c; c = new C();` the LHS Identifier resolves through the scope lookup, gated by
  // `isSoleAssignmentSource`. both viable shapes feed `computeAliasClosureFromBinding`
  function resolveInstanceBindingName(entry) {
    if (entry.assignmentInitName) {
      const assignPath = entry.wrapperPath.parentPath;
      const scope = assignPath?.scope;
      if (!isSoleAssignmentSource(scope?.getBinding(entry.assignmentInitName))) return { bail: true };
      return { name: entry.assignmentInitName, scope, anchorPath: assignPath };
    }
    if (!entry.isDeclaratorInit) return null;
    // wrapperPath is the outermost transparent-wrapper path; its parentPath is the
    // VariableDeclarator regardless of `(new C())` / `new C() as C` / bare `new C()` shape.
    // without the indirection, paren-wrapped init resolves declarator.node.id = undefined
    // (ParenthesizedExpression has no `id` slot) and the closure walk bails
    const declarator = entry.wrapperPath.parentPath;
    const id = declarator?.node?.id;
    if (id?.type !== 'Identifier') return { bail: true };
    return { name: id.name, scope: declarator.scope, anchorPath: declarator };
  }

  function collectClassInstanceClosure(classPath, programPath) {
    const desc = collectClassDescendantPaths(classPath, programPath);
    if (!desc) return null;
    const { newExprByName } = buildProgramIndex(programPath);
    const closure = new Map();
    const constructorNames = new Set(desc.names);
    const bindingClosure = getClassBindingClosure(classPath, programPath);
    if (bindingClosure) for (const aliasName of bindingClosure.values()) constructorNames.add(aliasName);
    for (const name of constructorNames) {
      const entries = newExprByName.get(name);
      if (!entries) continue;
      for (const entry of entries) {
        if (entry.isLeakPosition) return null;
        const source = resolveInstanceBindingName(entry);
        // `bail: true` signals an unsafe shape (mixed-source assignment-init, paren-wrapped
        // declarator with non-Identifier id) that would silently let untracked values into
        // the closure - bail entire closure for soundness. null = not a binding-source at
        // all (e.g., `new C()` as MemberExpression receiver - already tracked elsewhere), skip
        if (source?.bail) return null;
        if (!source) continue;
        const binding = source.scope?.getBinding(source.name);
        if (!binding) return null;
        const sub = computeAliasClosureFromBinding({
          rootBinding: binding, rootName: source.name, anchorPath: source.anchorPath,
        });
        if (sub === null) return null;
        for (const [b, k] of sub) closure.set(b, k);
      }
    }
    return closure;
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

  // canonical root name for an Identifier's const-alias chain. `const Alias = Source`
  // walks one hop at a time; `unwrapExpressionChain` peels paren / SE / TS wrappers on
  // the init. cycle or `let A = X; A = Y` reassignment -> null
  function aliasChainCanonicalName(name, scope) {
    const seen = new Set();
    while (!seen.has(name)) {
      seen.add(name);
      const binding = scope?.getBinding?.(name);
      if (binding?.constantViolations?.length) return null;
      const init = unwrapExpressionChain(binding?.path?.node?.init);
      if (init?.type !== 'Identifier') return name;
      // advance scope to the binding's declaration scope so the next hop's `getBinding`
      // hop to the binding's own declaration scope; inner shadows (`const P = Promise`
      // outer; `function f() { const P = X; ... }` inner) would otherwise mis-resolve
      scope = binding.path?.scope ?? scope;
      name = init.name;
    }
    return null;
  }

  // canonical name for an `extends` clause node. Identifier -> alias-chain walker;
  // non-computed MemberExpression -> proxy-global (`globalThis.X.Foo`) OR
  // `walkStaticReceiverChain` (const-bound `NS.Inner.Foo`, class-leaf accept).
  // unsupported shapes return null - over-registration WIDENS the base's field fold
  function extendsClauseName(superClass, scope) {
    superClass = unwrapRuntimeExpr(superClass);
    if (superClass?.type === 'Identifier') return aliasChainCanonicalName(superClass.name, scope);
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

  // multi-name variant of `extendsClauseName` for the module-field index. ambiguous shapes
  // (`extends mix(Base)`, `extends cond ? A : B`) register under EVERY candidate name -
  // over-registration widens the base's field fold conservatively
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

  // generic write-folder over pre-filtered `<expr>.<field> = Y`. `this.<field>` is handled
  // by the per-owner this-writes index, so peeled-`this` receivers skip here to avoid
  // double-counting. predicate decides whether the receiver belongs to the field's monitored
  // set (closure-membership for instance / static flows)
  function pushIfWriteMatches(writePath, predicate, out) {
    const objPath = memberWriteTargetPath(writePath).get('object');
    const peeled = unwrapRuntimeExpr(objPath.node);
    if (t.isThisExpression(peeled)) return;
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
    classInstanceTemporalBoundCache = new WeakMap();
    classInstanceClosureCache = new WeakMap();
    classBindingClosureCache = new WeakMap();
    classDescendantPathsCache = new WeakMap();
    moduleFieldIndexCache = new WeakMap();
    programClosureIndexCache = new WeakMap();
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
