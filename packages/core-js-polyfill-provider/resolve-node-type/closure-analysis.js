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
import {
  CLASS_FIELD_TYPES,
  VALUE_FLOW_ASSIGN_OPS,
  forEachPatternWriteMember,
  hasDeferredContextAncestor,
  isMemberAccessNode,
  isTSTypeOnlyIdentifierPath,
  peelParenAndTSParentPath,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
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
  // an anonymous object (no binding name) normally gets an EMPTY closure - a sound zero-external-write
  // scan (init + this-writes only), since there is no name through which external writes can target it.
  // but two positions hand a REFERENCE to external code directly, so `<ref>.field = ...` writes become
  // UNKNOWN (not empty) and the field type would type-lock unsoundly: `export default {...}` (importers
  // get the object) and a call / new ARGUMENT (the callee may store + mutate it). bail to null there,
  // like an escaping named binding. other positions (a declarator init, an assignment, an object-literal
  // property value) keep the object module-local and stay on the empty-closure scan. named bindings
  // delegate to the generic closure builder (which may itself return null on leak / reassignment).
  // cached per ObjectExpression node: a single literal can have many distinct field reads but the
  // closure is field-agnostic
  let objectAliasClosureCache = new WeakMap();
  // the object's value reaches `parent` unchanged through a value-preserving position - the object
  // escapes iff the node now CARRYING its value does, so return that carrier's path to re-test one
  // level up. covers structural carriers (array element, object-property value, spread) and pure
  // forwarders (conditional branch, logical operand, sequence tail); paren / TS wrappers are already
  // peeled by `peelParenAndTSParentPath`. null when this position is not value-preserving
  function valueFlowCarrier(parent, parentPath, valueNode) {
    switch (parent.type) {
      case 'ArrayExpression':
      case 'SpreadElement':
        return parentPath;
      case 'ObjectProperty':
      case 'Property':
        return unwrapRuntimeExpr(parent.value) === valueNode && parentPath.parentPath?.node?.type === 'ObjectExpression'
          ? parentPath.parentPath : null;
      case 'ConditionalExpression':
        return unwrapRuntimeExpr(parent.consequent) === valueNode || unwrapRuntimeExpr(parent.alternate) === valueNode
          ? parentPath : null;
      case 'LogicalExpression':
        return unwrapRuntimeExpr(parent.left) === valueNode || unwrapRuntimeExpr(parent.right) === valueNode
          ? parentPath : null;
      case 'SequenceExpression':
        return unwrapRuntimeExpr(parent.expressions.at(-1)) === valueNode ? parentPath : null;
      default:
        return null;
    }
  }
  // the carrier (with the object inside) is bound to a NAME - via a declarator (`const x = [...]`) or a
  // `=` assignment (`x = [...]`). the object escapes iff that binding LEAKS: reuse the bound-path leak
  // analysis, where a member-read (`x[0]` / `x.f`) is trivial/local but `return x` / `f(x)` / `export
  // { x }` leaks (-> null closure). only the leak verdict is used - the closure tracks `x.field` writes,
  // not the bound element's, which stay a known field-flow limit
  // `fieldPath` (non-empty) is the anon's nesting path inside the bound carrier (`[{index}]` array slot /
  // `[{key}]` object field), so the leak analysis can leak only the anon's OWN slot (`a[i]` / `o.wrap`) when
  // held, not every member read of the binding. null/empty -> the binding's own generic leak analysis
  function carrierBindingLeaks(scope, name, anchorPath, fieldPath) {
    return computeAliasClosureFromBinding({ rootBinding: scope?.getBinding(name), rootName: name, anchorPath, fieldPath }) === null;
  }
  // loop-variable Identifier name of a `for (... of iterable)` head: `for (const x of ...)` (single
  // Identifier declarator) or `for (x of ...)` (bare Identifier). null for a destructure / member target
  // (`for (const { a } of ...)` / `for (o.f of ...)`) - not a single leak-analyzable binding
  function forOfLoopVarName(left) {
    if (left?.type === 'VariableDeclaration') {
      const id = left.declarations?.length === 1 ? left.declarations[0].id : null;
      return id?.type === 'Identifier' ? id.name : null;
    }
    return left?.type === 'Identifier' ? left.name : null;
  }
  // a destructuring LHS (`{ x: obj.f }` / `[obj.f]`) with a MEMBER target slot: the destructure stores a
  // matched value into that member - a member store with an uncertain holder. shared `forEachPatternWriteMember`
  // enumerates the member targets the bare-Identifier checks miss (same surface the module-field index uses)
  function destructureHasMemberTarget(leftPath) {
    let found = false;
    forEachPatternWriteMember(leftPath, () => { found = true; });
    return found;
  }
  // leftmost Identifier of a member chain (`obj.a.b` / `obj[k].f` -> `obj`); null for a non-binding
  // root (`this.f`, `getObj().f`) whose escape is a separate (class-instance / value) analysis
  function memberRootName(node) {
    let cur = node;
    while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') cur = unwrapRuntimeExpr(cur.object);
    return cur?.type === 'Identifier' ? cur.name : null;
  }
  // `obj.f = [{...}]` stores the object into a member slot - it escapes iff the chain ROOT binding is
  // externally reachable. a LOCAL var (const / let / var) is reachable only when it leaks (export /
  // return / arg), so route to the bound-path leak analysis. a PARAM / undeclared GLOBAL is held by the
  // caller / outer realm so it escapes unconditionally - and that bound-path analysis is not parser-
  // reliable for a param binding anyway, so the kind gate also keeps babel / unplugin in agreement.
  // a NON-binding root (`this.f`, `getObj().f`, `this[k]`) has no enumerable local binding to prove
  // module-local: `this` is the surrounding instance (could be exposed), a call result is an outside-held
  // object - so an uncertain holder escapes (bail generic), not stays local
  const LOCAL_VAR_KINDS = new Set(['const', 'let', 'var']);
  function memberStoreEscapes(rootName, scope, anchorPath) {
    if (!rootName) return true;
    const binding = scope?.getBinding(rootName);
    if (!binding || !LOCAL_VAR_KINDS.has(binding.kind)) return true;
    return carrierBindingLeaks(scope, rootName, anchorPath);
  }
  function anonymousObjectEscapes(objectPath) {
    let valuePath = objectPath;
    // the anon's nesting path inside the eventual carrier binding (outermost-first): an array adds a wildcard
    // slot, an object property adds its static key, value-forwarders (conditional / logical / sequence) add
    // nothing. a computed key / spread can't be tracked -> null (the carrier falls back to its generic leak)
    let fieldPath = [];
    for (;;) {
      const parentPath = peelParenAndTSParentPath(valuePath);
      const parent = parentPath?.node;
      if (!parent) return false;
      // value flows into a container / forwarder (`return [{...}]`, `f({ k: {...} })`) - escape is
      // decided at the OUTERMOST carrier, not the immediate parent, so climb and re-test
      const carrier = valueFlowCarrier(parent, parentPath, valuePath.node);
      if (carrier) {
        if (fieldPath) {
          switch (parent.type) {
            case 'ArrayExpression':
              fieldPath.unshift({ index: true });
              break;
            case 'ObjectProperty':
            case 'Property': {
              const key = parent.computed ? null : getKeyName(parent.key);
              if (key === null || key === undefined) fieldPath = null;
              else fieldPath.unshift({ key: String(key) });
              break;
            }
            case 'SpreadElement':
              fieldPath = null;
              break;
            // ConditionalExpression / LogicalExpression / SequenceExpression: value-forwarders, no slot step
          }
        }
        valuePath = carrier;
        continue;
      }
      switch (parent.type) {
        // the object's value is handed straight to external code - the module default export, a return /
        // yield / await argument / an arrow's expression body (the call/arrow's caller receives it), or a
        // throw (the value propagates to a catch handler) - so an outside holder can write its fields
        case 'ExportDefaultDeclaration':
        case 'ReturnStatement':
        case 'YieldExpression':
        case 'AwaitExpression':
        case 'ArrowFunctionExpression':
        case 'ThrowStatement':
          return true;
        // a TAGGED template substitution is handed raw to the tag function (`tag`${obj}`` -> tag(s, obj));
        // an untagged template string-coerces the value, keeping it local
        case 'TemplateLiteral':
          return parentPath.parentPath?.node?.type === 'TaggedTemplateExpression';
        // a call / new ARGUMENT (not the callee) - the callee receives a reference and may store + mutate it
        case 'CallExpression':
        case 'NewExpression':
        case 'OptionalCallExpression':
          return !!parent.arguments?.some(arg => unwrapRuntimeExpr(arg) === valuePath.node);
        // the carrier is bound to a name (`const x = [...]` / `const o = { f: {...} }`) - escape iff the
        // binding leaks, OR (for a nested anon) a held read of the anon's own slot aliases it out
        case 'VariableDeclarator':
          return parent.id?.type === 'Identifier' && unwrapRuntimeExpr(parent.init) === valuePath.node
            && carrierBindingLeaks(parentPath.scope, parent.id.name, objectPath, fieldPath);
        // `x = <carrier>` (locally rebinds x) / `obj.f = <carrier>` (member store) AND forwards the value.
        // a logical-assign (`x ||= ...` / `obj.f ??= ...`) stores the RHS by reference too - same routing;
        // a coercing compound (`+=`, ...) is filtered by REF_STORING_ASSIGN_OPS and stays local.
        // escape if the target leaks - x via the bound-path leak analysis, `obj.f` via its root binding -
        // OR the assignment's own value-position escapes (`return (x = [...])` / `f(obj.f = [...])`).
        // a destructuring LHS (`({ x: f } = { x: {...} })` / `[f] = [...]`) binds the value to a TARGET
        // var, not a member slot - its escape is the target binding's leak (a separate analysis), so keep
        // it module-local here and let the value-position forward decide; do NOT route it as a member store
        case 'AssignmentExpression': {
          if (!VALUE_FLOW_ASSIGN_OPS.has(parent.operator) || unwrapRuntimeExpr(parent.right) !== valuePath.node) return false;
          const left = unwrapRuntimeExpr(parent.left);
          let leaks = false;
          if (left.type === 'Identifier') {
            leaks = carrierBindingLeaks(parentPath.scope, left.name, objectPath, fieldPath);
          } else if (isMemberAccessNode(left)) {
            leaks = memberStoreEscapes(memberRootName(left), parentPath.scope, objectPath);
          // a destructuring LHS with a member target slot (`({ x: obj.f } = ...)` / `[obj.f] = ...`) stores
          // the matched value into that member - a member store with an uncertain holder, so escape
          } else if (destructureHasMemberTarget(parentPath.get('left'))) leaks = true;
          if (leaks) return true;
          valuePath = parentPath;
          continue;
        }
        // `for (const x of [{...}]) {}` / `for (x of [{...}])`: the iterated array's ELEMENTS bind to the
        // loop variable each round, so the object escapes iff that binding leaks (`sink(x)`). a for-IN
        // iterates KEYS (strings), never the elements, so it never exposes the object (stays the `default`
        // local). a non-Identifier loop target (destructure / member) can't be leak-analyzed -> escape.
        // the iteration consumes the leading array slot, so the loop var carries the anon's path WITHIN the
        // element (`for (o of [{ wrap: {...} }]) sink(o.wrap)` -> the element's `wrap` slot is held)
        case 'ForOfStatement': {
          if (unwrapRuntimeExpr(parent.right) !== valuePath.node) return false;
          const loopVar = forOfLoopVarName(parent.left);
          return loopVar ? carrierBindingLeaks(parentPath.scope, loopVar, objectPath, fieldPath?.slice(1)) : true;
        }
        // the object is a DEFAULT value (`function f(o = {...})` param default / `const { x = {...} } = src`
        // destructure default). it binds to the default's TARGET, so a held read of the nested anon's slot
        // (`sink(o.wrap)`) still aliases it out while a dereference keeps it local - the same field-path leak
        // as a bound carrier. a non-Identifier target (nested pattern) can't be leak-analyzed -> escape
        case 'AssignmentPattern':
          if (unwrapRuntimeExpr(parent.right) !== valuePath.node) return false;
          return parent.left?.type === 'Identifier'
            ? carrierBindingLeaks(parentPath.scope, parent.left.name, objectPath, fieldPath) : true;
        // member receiver etc. keep the object module-local -> empty closure. a class field
        // initializer VALUE (`class C { f = {...} }` / static / private / accessor) stores the object into
        // `this.<field>` (or `C.<field>` for static) at construction / class-eval - this cheap local scan
        // cannot prove the instance / class binding stays unexposed, so an uncertain holder escapes (bail
        // generic). only the VALUE position escapes; a computed key (`{ [{...}]: 1 }`) is consumed.
        // CLASS_FIELD_TYPES is the canonical cross-parser field-node set (shared with deferral / class-SE)
        default:
          return CLASS_FIELD_TYPES.has(parent.type) && unwrapRuntimeExpr(parent.value) === valuePath.node;
      }
    }
  }
  function computeObjectAliasClosure(objectPath) {
    return memoize(objectAliasClosureCache, objectPath.node, () => {
      const rootName = objectBindingName(objectPath);
      if (rootName) {
        return computeAliasClosureFromBinding({ rootBinding: objectPath.scope?.getBinding(rootName), rootName, anchorPath: objectPath });
      }
      return anonymousObjectEscapes(objectPath) ? null : EMPTY_CLOSURE;
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
  //   'call'       - direct method call `<name>.<X>(...)` - extends call bound to the call's
  //                  END (post-args position): arguments evaluate before the method body runs,
  //                  so a write nested in the bounding call's own arg list is still observed
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
    if (!isMemberAccessNode(memberNode)
      || unwrapRuntimeExpr(memberNode.object) !== p.node) return { kind: 'extraction' };
    const ctx = peelParenAndTSParentPath(memberPath)?.node;
    if ((ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression') && unwrapRuntimeExpr(ctx.callee) === memberNode) {
      // a `<name>.<X>(...)` call nested in a DEFERRED context fires whenever that context runs, not
      // at the call's source position, so its position cannot bound external writes - treat it as an
      // extraction (Infinity bound). deferred = a function body OR an instance class-field initializer
      // value (runs at `new`-time): `class C { f = obj.at(0) }` sees writes that happen before the
      // construction even when they sit after the field's source position. `p` is the call's receiver
      // root, so a deferred context on its ancestor chain defers the call. canonical predicate shared
      // with the write-side deferral
      if (hasDeferredContextAncestor(t, p)) return { kind: 'extraction' };
      return { kind: 'call', end: ctx.end };
    }
    if (ctx?.type === 'AssignmentExpression' && ctx.operator === '='
      && unwrapRuntimeExpr(ctx.left) === memberNode) return { kind: 'write' };
    if (ctx?.type === 'UpdateExpression' && unwrapRuntimeExpr(ctx.argument) === memberNode) return { kind: 'write' };
    return { kind: 'extraction' };
  }

  // per-program index of classified Identifier refs (grouped by binding) + direct
  // `new <Name>().<X>(...)` chain-call starts (grouped by constructor name). built once via
  // `buildProgramIndex`, not re-walked per closure (that would be O(C * N) on N-statement programs).
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
          // `isMemberRecv` guarantees `wrapperPath.parent` is the `.X` member on the
          // wrapper-peeled new-expression; peel paren / TS up to the call exactly like
          // `classifyClosureRef` so a wrapped chain receiver (`(new C() as any).m()`, oxc-preserved
          // parens) is recognised - reading the raw new-expr parent here lands one level short
          const memberPath = entry.wrapperPath.parentPath;
          const ctx = peelParenAndTSParentPath(memberPath)?.node;
          if ((ctx?.type !== 'CallExpression' && ctx?.type !== 'OptionalCallExpression')
            || unwrapRuntimeExpr(ctx.callee) !== memberPath.node) continue;
          let ends = newCallsByName.get(name);
          if (!ends) newCallsByName.set(name, ends = []);
          // a deferred-context call (function body / instance field initializer) fires at an unknown
          // time, so it can observe writes anywhere - record Infinity (extraction) so the fold
          // widens, exactly as the bound-binding call path returns `{ kind: 'extraction' }`. a
          // straight-line call bounds only writes up to its own end position
          ends.push(hasDeferredContextAncestor(t, entry.wrapperPath) ? Infinity : ctx.end);
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
  //   numeric    - latest END of `<closure-name>.<X>(...)` direct call expression
  //   `-Infinity` - no calls AND no extractions: closure methods are never invoked
  // shared between object-literal and class-instance closures. cached by closure Map identity
  let closureTemporalBoundCache = new WeakMap();
  function getClosureTemporalBound(closure, programPath) {
    return memoize(closureTemporalBoundCache, closure, () => {
      const { classifiedByBinding } = buildProgramClosureIndex(programPath);
      let latestCallEnd = -Infinity;
      for (const binding of closure.keys()) {
        const refs = classifiedByBinding.get(binding);
        if (!refs) continue;
        for (const cls of refs) {
          if (cls.kind === 'extraction') return Infinity;
          if (cls.end > latestCallEnd) latestCallEnd = cls.end;
        }
      }
      return latestCallEnd;
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
      let latestCallEnd = base;
      for (const name of classNames) {
        const ends = newCallsByName.get(name);
        if (!ends) continue;
        for (const end of ends) if (end > latestCallEnd) latestCallEnd = end;
      }
      return latestCallEnd;
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

  // constructor-name set for matching `new <X>()` against this class: class + transitive subclasses
  // PLUS const-alias binding names of the class (`const D = C`) AND of each subclass (`const D = Sub`).
  // single source so the instance-closure collection, the external-write predicate, and the temporal
  // bound recognise an aliased `new D()` the same as `new C()`. mirrors the static-field path: a
  // descendant whose binding leaks (aliases unenumerable) means an unknown alias could write the
  // inherited field, so bail to null and let the caller skip the narrow. base-class leak is already
  // caught upstream (earlyBail on export / the closure collection's own alias-walk bail), so a null
  // base closure just contributes no aliases. memoized by class node so the set keeps stable identity
  // (the temporal bound caches by it)
  let classConstructorNamesCache = new WeakMap();
  function getClassConstructorNames(classPath, programPath) {
    return memoize(classConstructorNamesCache, classPath.node, () => {
      const desc = collectClassDescendantPaths(classPath, programPath);
      const names = new Set(desc?.names);
      const baseClosure = getClassBindingClosure(classPath, programPath);
      if (baseClosure) for (const aliasName of baseClosure.values()) names.add(aliasName);
      for (const sub of desc?.paths ?? []) {
        if (sub === classPath) continue;
        const subClosure = getClassBindingClosure(sub, programPath);
        if (subClosure === null) return null;
        for (const aliasName of subClosure.values()) names.add(aliasName);
      }
      return names;
    });
  }

  function collectClassInstanceClosure(classPath, programPath) {
    const desc = collectClassDescendantPaths(classPath, programPath);
    if (!desc) return null;
    const { newExprByName } = buildProgramIndex(programPath);
    const closure = new Map();
    const constructorNames = getClassConstructorNames(classPath, programPath);
    if (constructorNames === null) return null;
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
  // skips narrow emission - mirrors instance closure semantics. a minimal `{className: binding}`
  // fallback would silently retain the narrow even when an unenumerable channel could have
  // mutated the field at runtime
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
      // index member-write targets reachable through a destructuring-assignment LHS
      // (`({ k: o.field } = src)`) or a for-of/for-in head (`for (o.field of iter)`). these
      // rebind `o.field` to a destructuring-source / iteration value of indeterminate type, but
      // the member never appears as an AssignmentExpression `.left`, so the bare-member visitors
      // miss them. push the member PATH itself - `writePathContributedType` returns `unknown` for
      // a non-`=` write, widening the field flow (the sound direction for an opaque write)
      function indexPatternWriteMembers(leftPath) {
        forEachPatternWriteMember(leftPath, mp => {
          const name = memberWriteFieldName(mp.node);
          if (name) pushMultimap(writesByField, name, mp);
        });
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
          if (name) {
            pushMultimap(writesByField, name, p);
            return;
          }
          // destructuring-assignment LHS (`({ k: o.field } = src)` / `[o.field] = src`) carries
          // member write targets the bare-member name check above misses
          const leftType = p.node.left?.type;
          if (leftType === 'ObjectPattern' || leftType === 'ArrayPattern') indexPatternWriteMembers(p.get('left'));
        },
        UpdateExpression(p) {
          const name = memberWriteFieldName(p.node.argument);
          if (name) pushMultimap(writesByField, name, p);
        },
        // `for (o.field of iter)` / `for (o.field in obj)` rebind `o.field` each iteration. a
        // VariableDeclaration head binds a fresh local (not a member write), so skip it
        'ForOfStatement|ForInStatement'(p) {
          if (p.node.left.type !== 'VariableDeclaration') indexPatternWriteMembers(p.get('left'));
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
    classConstructorNamesCache = new WeakMap();
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
    getClassConstructorNames,
    extendsClauseName,
    collectClassDescendantPaths,
    pushIfWriteMatches,
    getModuleFieldIndex,
    reset,
  };
}
