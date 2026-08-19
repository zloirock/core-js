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
//   getClassInstanceTemporalBound(closure, names, nodes, prog) - class flavor (adds new C().method)
//   isReceiverInClosure(objPath, closure)       - identity-based receiver predicate
//   pushIfWriteMatches(writePath, pred, out)    - generic write folder
//   getModuleFieldIndex(prog)                   - cached {writesByField, subclassesBySuper}
//   reset()                                     - per-file cache invalidation
//
// Service object carries factory helpers + binding-analysis cluster outputs. The Babel
// scope adapter (`BABEL_BINDING_ADAPTER`) feeds `globalProxyMemberName` /
// `walkStaticReceiverChain` for `extends NS.Inner.Class` lookups
import { EMPTY_CLOSURE, EXTENDS_CHILD_RESOLVERS } from './base.js';
import { createMemberWriteShape, memberWriteReceiverPath } from './class-member-shapes.js';
import {
  VALUE_FLOW_ASSIGN_OPS,
  classBodyHoldsSuperMethod,
  classOwnThisMethodInfo,
  forEachPatternWriteMember,
  hasDeferredContextAncestor,
  KNOWN_GLOBAL_CONSTRUCTORS,
  classCarriesDecorators,
  FUNCTION_LIKE_NODE_TYPES,
  isMemberAccessNode,
  mayIterateItself,
  isTSTypeOnlyIdentifierPath,
  mergeOwnThisMethodInfo,
  objectOwnThisMethodInfo,
  peelParenAndTSParentPath,
  aliasTargetName,
  positionDisposition,
  POSITION_CONSUMES,
  POSITION_FORWARDS,
  POSITION_INSPECTS,
  propertyKeyName,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
  walkAstChildren,
  walkPatternIdentifiers,
} from '../helpers/ast-patterns.js';
import { globalProxyMemberName } from '../helpers/class-walk.js';
import { pushMultimap } from '../helpers/pattern-matching.js';
import { walkStaticReceiverChain } from '../detect-usage/destructure.js';

// eslint-disable-next-line max-statements -- factory of the escape / closure analysis
export function createClosureAnalysis({
  resolveStaticCalleePair,
  callArgumentEscapes,
  ownerMethodFns,
  staticOwnerMethodFns,
  getScopeBinding,
  t,
  babelBindingAdapter,
  memoize,
  getKeyName,
  objectBindingName,
  computeAliasClosureFromBinding,
  classBindingName,
  classBindingRefClassifier,
  buildProgramIndex,
  programCensus,
  methodReadLeaks,
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
  // the carrier (with the object inside) is bound to a NAME - via a declarator (`const x = [...]`) or a
  // `=` assignment (`x = [...]`). the object escapes iff that binding LEAKS: reuse the bound-path leak
  // analysis, where a member-read (`x[0]` / `x.f`) is trivial/local but `return x` / `f(x)` / `export
  // { x }` leaks (-> null closure). the CLOSURE is what the caller keeps, not just the verdict: writes
  // through the carrier name (`x.field = Y` / a for-of loop variable) only fold into the field union
  // while that name is in the closure - dropping it to an empty one made such a write invisible
  // `fieldPath` (non-empty) is the anon's nesting path inside the bound carrier (`[{index}]` array slot /
  // `[{key}]` object field), so the leak analysis can leak only the anon's OWN slot (`a[i]` / `o.wrap`) when
  // held, not every member read of the binding. null/empty -> the binding's own generic leak analysis
  function carrierBindingClosure(scope, name, anchorPath, fieldPath) {
    return computeAliasClosureFromBinding({
      rootBinding: getScopeBinding(scope, name, anchorPath), rootName: name, anchorPath, fieldPath,
    });
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
  // a destructuring pattern's bare-var targets (`const [g] = [{...}]` / `({ x: g } = ...)`): each target
  // binding receives a matched value, so the anon escapes iff ANY target binding leaks. one pattern level
  // consumes one fieldPath step (mirrors the for-of element hop); a rest target receives a same-shape
  // container, so its level's step is preserved - `walkPatternIdentifiers` reports that depth per target.
  // a target deeper than the anon's path holds a FIELD of the anon, not the anon - the empty remainder's
  // generic leak analysis over-approximates that safely. a non-pattern LHS shape can't be enumerated -> escape
  function destructureVarTargetLeaks({ pattern, scope, anchorPath, fieldPath }) {
    if (pattern?.type !== 'ObjectPattern' && pattern?.type !== 'ArrayPattern') return true;
    if (patternBindsAnonMethod({ pattern, fieldPath, methodInfo: objectOwnThisMethodInfo(anchorPath?.node) })) return true;
    let leaks = false;
    walkPatternIdentifiers(pattern, (id, depth) => {
      if (!leaks) leaks = carrierBindingClosure(scope, id.name, anchorPath, fieldPath.slice(depth)) === null;
    });
    return leaks;
  }
  // can the pattern BIND one of the anon's own-this methods? a key match at the anon's own level
  // (`const { read } = { read() {...} }` / a deeper pattern following the slot path into the anon),
  // a rest element that scoops the remaining props at that level, or an untrackable computed pattern
  // key all extract a this-rebindable function - conservative escape, mirroring held method reads.
  // levels below the anon index into FIELD values and cannot reach its methods
  function patternBindsAnonMethod({ pattern, fieldPath, methodInfo, level = 0 }) {
    if (!methodInfo) return false;
    // peel transparent wrappers (`(x)`, `x = d`) - they carry the binding through unchanged
    while (pattern?.type === 'ParenthesizedExpression' || pattern?.type === 'AssignmentPattern') {
      pattern = pattern.type === 'ParenthesizedExpression' ? pattern.expression : pattern.left;
    }
    if (pattern?.type === 'ObjectPattern') {
      for (const p of pattern.properties ?? []) {
        if (p.type === 'RestElement' || p.type === 'SpreadElement') {
          if (level === fieldPath.length) return true;
          continue;
        }
        const key = propertyKeyName(p);
        if (level === fieldPath.length) {
          // an untrackable pattern key could name any method; a resolvable key only a known one
          const matches = key === null || key === undefined
            ? methodInfo.methodKeys.size || methodInfo.unknownKey
            : methodInfo.methodKeys.has(key);
          if (matches) return true;
          continue;
        }
        const step = fieldPath[level];
        // descend only through the property that can read the anon's slot: an untrackable pattern
        // key or the matching object-key step (array slots are read by index keys - conservative)
        if ((key === null || key === undefined || step.index || key === step.key)
          && patternBindsAnonMethod({ pattern: p.value, fieldPath, methodInfo, level: level + 1 })) return true;
      }
      return false;
    }
    if (pattern?.type === 'ArrayPattern') {
      // the anon itself destructured as an array binds nothing method-shaped (iterator protocol)
      if (level === fieldPath.length) return false;
      for (const el of pattern.elements ?? []) {
        if (!el) continue;
        if (el.type === 'RestElement' || el.type === 'SpreadElement') {
          if (patternBindsAnonMethod({ pattern: el.argument, fieldPath, methodInfo, level })) return true;
        } else if (patternBindsAnonMethod({ pattern: el, fieldPath, methodInfo, level: level + 1 })) return true;
      }
      return false;
    }
    // an Identifier target binds a VALUE (carrier or the anon itself) - the depth-based leak
    // analysis in the caller covers it
    return false;
  }
  // `obj.f = [{...}]` stores the object into a member slot - it escapes iff the chain ROOT binding is
  // externally reachable. a LOCAL var (const / let / var) is reachable only when it leaks (export /
  // return / arg), so route to the bound-path leak analysis against the anon's COMPOSED slot path
  // (the chain's keys + its path inside the stored carrier) - a held read of the stored slot
  // (`sink(obj.f)`) aliases the anon out even when the root binding itself stays local. a computed
  // chain segment (`obj[k].f = ...`) is an untrackable slot -> escape. a PARAM / undeclared GLOBAL
  // root is held by the caller / outer realm so it escapes unconditionally - and the bound-path
  // analysis is not parser-reliable for a param binding anyway, so the kind gate also keeps babel /
  // unplugin in agreement. a NON-binding root (`this.f`, `getObj().f`, `this[k]`) has no enumerable
  // local binding to prove module-local: `this` is the surrounding instance (could be exposed), a call
  // result is an outside-held object - so an uncertain holder escapes (bail generic), not stays local
  const LOCAL_VAR_KINDS = new Set(['const', 'let', 'var']);
  function memberStoreEscapes({ member, scope, anchorPath, fieldPath }) {
    const steps = [];
    let cur = member;
    while (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') {
      const key = cur.computed ? null : getKeyName(cur.property);
      if (key === null || key === undefined) return true;
      steps.unshift({ key: String(key) });
      cur = unwrapRuntimeExpr(cur.object);
    }
    if (cur?.type !== 'Identifier') return true;
    const binding = getScopeBinding(scope, cur.name);
    if (!binding || !LOCAL_VAR_KINDS.has(binding.kind)) return true;
    return carrierBindingClosure(scope, cur.name, anchorPath, [...steps, ...fieldPath]) === null;
  }

  // does an own method hand `this` ITSELF out? the field scan collects `this.<field> = ...` writes -
  // what a method does INSIDE the object - but a method that passes `this` ON (`sink(this)`,
  // `return this`, `outer = this`) makes the receiver reachable from wherever that value lands, and
  // every write through it happens outside any scan keyed on the object's own name. each `this` is
  // just a value in a position, so the shared enumeration answers it: a consumed position is safe, a
  // forward INTO A NAME is safe while that name's own closure holds, anything else reaches outside

  // NODE-only pass over one method: the answer for almost every `this` is decided by its position
  // alone, and building a path for each of them costs more than the whole question is worth. returns
  // 'escapes', 'local', or 'aliased' - the one case that does need paths, since resolving what a
  // `const self = this` name goes on to do is binding analysis
  function scanThisNodes(rootNode) {
    let aliased = false;
    let escapes = false;
    function visit(node, parent, grandparent) {
      if (escapes || !node) return;
      if (node.type === 'ThisExpression') {
        // the shim carries what a path would: the position one hop above `parent`
        if (positionDisposition(parent, node, { parentPath: { node: grandparent } }) === POSITION_CONSUMES) return;
        if (parent?.type === 'VariableDeclarator' && aliasTargetName(parent)) aliased = true;
        else escapes = true;
        return;
      }
      // a nested non-arrow function re-binds `this` to its own call receiver
      if (node !== rootNode && FUNCTION_LIKE_NODE_TYPES.has(node.type) && node.type !== 'ArrowFunctionExpression') return;
      walkAstChildren(node, child => visit(child, node, parent));
    }
    visit(rootNode, null, null);
    return escapes ? 'escapes' : aliased ? 'aliased' : 'local';
  }

  // the scan is asked once per holder per surface, but a holder is reached from several consumers -
  // the instance closure, the static one, the prototype one, the ancestors-only one - and every
  // ancestor is re-reached from each level below it. without a memo that is quadratic in chain depth
  let ownThisEscapesCache = new WeakMap();
  function ownThisEscapes(ownerPath, statics = false) {
    const node = ownerPath?.node;
    const slots = node ? ownThisEscapesCache.get(node) ?? {} : null;
    const key = statics ? 'static' : 'instance';
    if (slots && key in slots) return slots[key];
    const answer = scanOwnThisBodies(ownerPath, statics);
    if (slots) ownThisEscapesCache.set(node, { ...slots, [key]: answer });
    return answer;
  }

  function scanOwnThisBodies(ownerPath, statics) {
    for (const fnPath of statics ? staticOwnerMethodFns(ownerPath) : ownerMethodFns(ownerPath)) {
      // normalise to the FUNCTION itself: parsers disagree on where a method's function sits (babel
      // puts params and body on the member, estree nests a FunctionExpression under it). scanning the
      // function rather than its body is what brings PARAM DEFAULTS in - `m(a = sink(this))` runs with
      // the same receiver. a StaticBlock and a field initializer carry no params and are scanned as is
      const root = fnPath.node?.params ? fnPath : fnPath.get?.('value')?.node ? fnPath.get('value') : fnPath;
      const verdict = scanThisNodes(root.node);
      if (verdict === 'escapes') return true;
      if (verdict !== 'aliased') continue;
      // the path pass, run only for a method the node pass reported as aliased: a `const self = this`
      // keeps the receiver in only while that name's own closure holds
      let handedOut = false;
      root.traverse({
        'FunctionExpression|FunctionDeclaration|ObjectMethod|ClassMethod'(nested) {
          // one parser visits the traversal root, the other does not, so identity decides
          if (nested.node !== root.node) nested.skip();
        },
        ThisExpression(thisPath) {
          if (handedOut) return;
          const parentPath = peelParenAndTSParentPath(thisPath);
          const parent = parentPath?.node;
          if (!parent || positionDisposition(parent, thisPath.node, parentPath) === POSITION_CONSUMES) return;
          const declared = parent.type === 'VariableDeclarator' && aliasTargetName(parent);
          if (declared && carrierBindingClosure(parentPath.scope, declared, thisPath, []) !== null) return;
          handedOut = true;
        },
      });
      if (handedOut) return true;
    }
    return false;
  }

  // ENTER the container the value just flowed into: returns where the walk resumes, and records the
  // slot the value now occupies so a later read of the container can be matched against it. whether
  // the position forwards at all is the shared enumeration's call - the slot conditions live there,
  // so a computed key or a conditional's test never reaches this. an array adds a wildcard slot, an
  // object property its static key, and the value-forwarders add nothing. null means the flow stops
  // being trackable: a property outside an object literal, or a slot no name can be matched against
  function enterCarrier(parent, parentPath, valueNode, fieldPath) {
    if (positionDisposition(parent, valueNode, parentPath) !== POSITION_FORWARDS) return null;
    switch (parent.type) {
      case 'ArrayExpression':
        fieldPath.unshift({ index: true });
        return parentPath;
      case 'ObjectProperty':
      case 'Property': {
        if (parentPath.parentPath?.node?.type !== 'ObjectExpression') return null;
        const key = parent.computed ? null : getKeyName(parent.key);
        if (key === null || key === undefined) return null;
        fieldPath.unshift({ key: String(key) });
        return parentPath.parentPath;
      }
      case 'ConditionalExpression':
      case 'LogicalExpression':
      case 'SequenceExpression':
        return parentPath;
      default:
        return null;
    }
  }

  // a member read ON the tracked value. three outcomes: `resume` when the read steps INTO the slot
  // that holds the anon (`[{...}][0]` - the read RESULT carries it on and the next round decides held
  // vs dereferenced), `escapes` when it hands something out, and neither when it stays local.
  // while slot steps remain, a dotted read consumes the leading one; a dotted MISMATCH on an object
  // step - or any dotted read on an ARRAY step (`[{...}].map` / `.length`) - reads the carrier's own
  // API or another field instead, and only a direct CALL of that member can expose the elements
  // (`[{...}].map(sink)`). once the path is exhausted the read hits the ANON's own member: an
  // own-this method read is sound only as a direct call, while a plain data-field read stays local -
  // the field VALUE leaves, not the anon
  function readThroughMember(parent, parentPath, valuePath, objectPath, fieldPath) {
    if (unwrapRuntimeExpr(parent.object) !== valuePath.node) return {};
    if (!fieldPath.length) {
      const methodInfo = objectOwnThisMethodInfo(objectPath.node);
      return { escapes: !!methodInfo && methodReadLeaks(parent, parentPath, methodInfo) };
    }
    const [step] = fieldPath;
    const key = parent.computed ? null : getKeyName(parent.property);
    if (!parent.computed && (step.index || key === null || key === undefined || String(key) !== step.key)) {
      const use = peelParenAndTSParentPath(parentPath)?.node;
      return { escapes: (use?.type === 'CallExpression' || use?.type === 'OptionalCallExpression')
        && unwrapRuntimeExpr(use.callee) === parent };
    }
    fieldPath.shift();
    return { resume: parentPath };
  }

  // the TARGET a position binds the value to, and whether that target keeps it reachable. three target
  // shapes, one answer each: a NAME carries the value on under its own closure, a member STORE puts it
  // on a holder whose own reachability decides, and a PATTERN spreads it across the bindings it
  // matches. `closure` comes back only for a name - it is what the caller keeps tracking through
  function bindingTargetClosure(target, targetPath, scope, objectPath, fieldPath) {
    if (target?.type === 'Identifier') {
      const closure = carrierBindingClosure(scope, target.name, objectPath, fieldPath);
      return { leaks: closure === null, closure };
    }
    if (isMemberAccessNode(target)) {
      return { leaks: memberStoreEscapes({ member: target, scope, anchorPath: objectPath, fieldPath }) };
    }
    return {
      leaks: (targetPath ? destructureHasMemberTarget(targetPath) : false)
        || destructureVarTargetLeaks({ pattern: target, scope, anchorPath: objectPath, fieldPath }),
    };
  }

  function anonymousObjectClosure(objectPath) {
    let valuePath = objectPath;
    // the anon's nesting path inside the eventual carrier binding (outermost-first): an array adds a wildcard
    // slot, an object property adds its static key, value-forwarders (conditional / logical / sequence) add
    // nothing. a computed key / spread makes the slot untrackable - ANY read of the carrier could then
    // extract the anon and hand it out, so escape conservatively (over-narrow throws in foreign runtimes;
    // under-narrow only degrades to the generic polyfill)
    const fieldPath = [];
    // a carrier NAME found mid-walk is only the answer once the walk ends locally: `return (x = {...})`
    // binds to `x` AND hands the assignment's value out, so the climb has to finish first
    let pendingCarrier = null;
    // EVERY non-escaping terminal answers through this, never with a bare empty closure: once the
    // climb has passed through a carrier NAME, the object is reachable as that name and writes through
    // it must still fold. an empty closure would claim there are no external writers at all
    function local() {
      return pendingCarrier ?? EMPTY_CLOSURE;
    }
    for (;;) {
      const parentPath = peelParenAndTSParentPath(valuePath);
      const parent = parentPath?.node;
      if (!parent) return local();
      // value flows into a container / forwarder (`return [{...}]`, `f({ k: {...} })`) - escape is
      // decided at the OUTERMOST carrier, not the immediate parent, so climb and re-test
      // a spread is TERMINAL, not a container to enter: it copies the anon's own enumerable props out
      // (field values and method shorthands alike) or iterates it, and the walk cannot follow what the
      // consumer does with them. only an ARRAY spread keeps everything local, and only while the anon
      // cannot iterate itself - with no iterator the spread throws and extracts nothing
      if (parent.type === 'SpreadElement') {
        return parentPath.parentPath?.node?.type === 'ArrayExpression'
          && !mayIterateItself(objectPath.node) ? local() : null;
      }
      const carrier = enterCarrier(parent, parentPath, valuePath.node, fieldPath);
      if (carrier) {
        valuePath = carrier;
        continue;
      }
      switch (parent.type) {
        // a member read on the tracked value: while slot steps remain it consumes the leading one
        // (`[{...}][0]` extracts through the inline carrier - the read RESULT carries the anon on, and
        // the next loop round decides held vs dereferenced); a dotted mismatch on an object-key step
        // reads a DIFFERENT field. once the path is exhausted the read hits the ANON's own member: an
        // own-this method read is sound only as a direct call - a held read hands out a this-rebindable
        // function - while a plain data-field read stays local (the field VALUE escapes, not the anon)
        case 'MemberExpression':
        case 'OptionalMemberExpression': {
          const read = readThroughMember(parent, parentPath, valuePath, objectPath, fieldPath);
          if (read.resume) {
            valuePath = read.resume;
            continue;
          }
          return read.escapes ? null : local();
        }
        // the carrier is bound to a name (`const x = [...]` / `const o = { f: {...} }`) - escape iff the
        // binding leaks, OR (for a nested anon) a held read of the anon's own slot aliases it out.
        // a pattern id (`const [g] = [{...}]`) binds the matched values to TARGET vars - escape iff any
        // target binding leaks against the anon's remainder path inside the value it received
        case 'VariableDeclarator': {
          if (unwrapRuntimeExpr(parent.init) !== valuePath.node) return local();
          const target = bindingTargetClosure(parent.id, parentPath.get('id'), parentPath.scope, objectPath, fieldPath);
          return target.leaks ? null : target.closure ?? local();
        }
        // `x = <carrier>` (locally rebinds x) / `obj.f = <carrier>` (member store) AND forwards the value.
        // a logical-assign (`x ||= ...` / `obj.f ??= ...`) stores the RHS by reference too - same routing;
        // a coercing compound (`+=`, ...) is excluded from `VALUE_FLOW_ASSIGN_OPS` and stays local.
        // escape if the target leaks - x via the bound-path leak analysis, `obj.f` via its root binding -
        // OR the assignment's own value-position escapes (`return (x = [...])` / `f(obj.f = [...])`).
        // a destructuring LHS (`({ x: f } = { x: {...} })` / `[f] = [...]`) binds the matched values to
        // TARGET slots: a member target is a member store with an uncertain holder (escape), a var target
        // escapes iff its binding leaks against the anon's remainder path inside the value it received
        case 'AssignmentExpression': {
          if (!VALUE_FLOW_ASSIGN_OPS.has(parent.operator) || unwrapRuntimeExpr(parent.right) !== valuePath.node) return local();
          const target = bindingTargetClosure(unwrapRuntimeExpr(parent.left), parentPath.get('left'),
            parentPath.scope, objectPath, fieldPath);
          if (target.leaks) return null;
          pendingCarrier ??= target.closure ?? null;
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
          if (unwrapRuntimeExpr(parent.right) !== valuePath.node) return local();
          // the object ITSELF as the iteration source binds nothing: with no iterator of its own the
          // loop throws before the body runs, so the head consumes it exactly like a `for...in` head
          if (!fieldPath.length && !mayIterateItself(objectPath.node)) return local();
          const loopVar = forOfLoopVarName(parent.left);
          return loopVar ? carrierBindingClosure(parentPath.scope, loopVar, objectPath, fieldPath.slice(1)) : null;
        }
        // the object is a DEFAULT value (`function f(o = {...})` param default / `const { x = {...} } = src`
        // destructure default). it binds to the default's TARGET, so a held read of the nested anon's slot
        // (`sink(o.wrap)`) still aliases it out while a dereference keeps it local - the same field-path
        // leak as a bound carrier. a non-Identifier target (nested pattern) can't be leak-analyzed.
        // this is the ONE position where the two walks legitimately part: an object written inline here
        // is reachable ONLY through the holder, which this walk analyzes, while a NAMED object keeps its
        // own binding too and the holder is an extra channel over it - so the named side reports the
        // default-value reference as an escaping read instead
        case 'AssignmentPattern': {
          if (unwrapRuntimeExpr(parent.right) !== valuePath.node) return local();
          if (parent.left?.type !== 'Identifier') return null;
          const target = bindingTargetClosure(parent.left, parentPath.get('left'), parentPath.scope, objectPath, fieldPath);
          return target.leaks ? null : target.closure;
        }
        // every position this walk has no mechanics of its own for is answered by the shared
        // enumeration - the same one the named-holder classifier asks. FORWARDS never reaches here
        // (a carrier was taken above), so the tag is CONSUMES, HANDS_OUT, or an argument slot whose
        // callee decides: a known one that neither mutates the slot nor hands the value back through
        // an identity-returning result keeps it local
        default: {
          const disposition = positionDisposition(parent, valuePath.node, parentPath);
          if (disposition !== POSITION_INSPECTS) return disposition === POSITION_CONSUMES ? local() : null;
          return callArgumentEscapes({
            callNode: parent,
            argNode: parent.arguments.find(arg => unwrapRuntimeExpr(arg) === valuePath.node),
            argPath: valuePath,
            hasOwnThisMethods: !!objectOwnThisMethodInfo(objectPath.node),
          }) ? null : local();
        }
      }
    }
  }
  function computeObjectAliasClosure(objectPath) {
    return memoize(objectAliasClosureCache, objectPath.node, () => {
      if (holderShapeInfo({ paths: [objectPath], anchorPath: objectPath }).handsThisOut) return null;
      const rootName = objectBindingName(objectPath);
      if (rootName) {
        return computeAliasClosureFromBinding({
          rootBinding: getScopeBinding(objectPath.scope, rootName, objectPath), rootName, anchorPath: objectPath,
        });
      }
      // an anon that flows into a NAME keeps that name's closure: writes through it (`x.field = Y`,
      // a for-of loop variable) fold into the field union only while the name is tracked. an anon that
      // never reaches a name has nothing to track and gets the empty closure
      return anonymousObjectClosure(objectPath);
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
    const binding = getScopeBinding(objPath.scope, node.name, objPath);
    return !!binding && closure.has(binding);
  }

  // an INSTANCE slot is also written through the prototype (`C.prototype.m = fn`, or the same
  // target handed to `Object.assign`). the receiver is then a member off a closure binding rather
  // than the binding itself, which the identity predicate above cannot see
  function isReceiverPrototypeInClosure(objPath, closure) {
    const node = unwrapRuntimeExpr(objPath.node);
    if (!t.isMemberExpression(node) || node.computed || node.property?.name !== 'prototype') return false;
    return isReceiverInClosure(objPath.get('object'), closure);
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
          // keep the new-expression path: the map key is the callee NAME, and only the path can
          // prove which class this call actually constructs
          ends.push({ end: hasDeferredContextAncestor(t, entry.wrapperPath) ? Infinity : ctx.end, path: entry.path });
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
  function getClassInstanceTemporalBound(closure, classNames, classNodes, programPath) {
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
        // a same-named class in another scope shares this bucket, and stretching the bound over
        // ITS call would fold writes no instance of ours can observe
        for (const { end, path } of ends) {
          if (classRefLandsOutside(path.node.callee, path.scope, classNodes)) continue;
          if (end > latestCallEnd) latestCallEnd = end;
        }
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
      // the index is keyed by the super's NAME alone, so a class of the same name in another scope
      // hands over ITS subclasses as if they were ours - carry the class NODES to check against
      const nodes = new Set([classPath.node]);
      while (queue.length) {
        const name = queue.shift();
        for (const sub of index.subclassesBySuper.get(name) ?? []) {
          const subName = classBindingName(sub);
          if (!subName || names.has(subName)) continue;
          if (classRefLandsOutside(sub.node.superClass, sub.scope, nodes)) continue;
          nodes.add(sub.node);
          names.add(subName);
          paths.push(sub);
          queue.push(subName);
        }
      }
      return { names, paths, nodes };
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
      if (!isSoleAssignmentSource(getScopeBinding(scope, entry.assignmentInitName))) return { bail: true };
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

  // what does the HOLDER'S OWN SHAPE say about the bodies that can run with it as `this`? one entry
  // point for both holder kinds, so a caller cannot pick the object producer and forget the class
  // facts - which is exactly how the STATIC surface came to be told nothing at all. the channels:
  //   - a literal acquires members it never wrote through a spread, an installed `__proto__`, or a
  //     computed key (folded into the literal's own summary)
  //   - a class acquires them through a DECORATOR, which may replace or install any member, or an
  //     `extends` naming a binding we hold but cannot read as a class. a BARE global base is neither:
  //     its prototype belongs to the engine
  //   - either kind can hand `this` out from a body we DID read, which is not "unread bodies" but a
  //     leaked receiver - reported separately because the caller answers it differently
  // `anchorPath` is a real path: an ancestor entry is a light `{ node, scope }` record, and the scope
  // lookup that separates a bare global from a held binding needs a path to anchor recovery on
  function holderShapeInfo({ paths, statics = false, anchorPath }) {
    let info = null;
    let handsThisOut = false;
    let acquires = false;
    for (const entry of paths) {
      const { node } = entry;
      info = mergeOwnThisMethodInfo(info, node?.type === 'ObjectExpression'
        ? objectOwnThisMethodInfo(node) : classOwnThisMethodInfo(node, statics));
      // an ANCESTOR arrives as a light `{ node, scope, path }` record: its bodies run with OUR
      // receiver just as the own ones do, so they are scanned through the path it carries. no path
      // means the bodies cannot be read at all, which is the same position an unread base leaves us in
      const scanPath = entry.traverse ? entry : entry.path;
      if (!handsThisOut) handsThisOut = scanPath ? ownThisEscapes(scanPath, statics) : true;
      if (acquires || node?.type === 'ObjectExpression') continue;
      if (classCarriesDecorators(node)) acquires = true;
      else if (node?.superClass && !classAncestorPaths(entry).length) {
        const canon = extendsClauseCanonical(node.superClass, entry.scope);
        acquires = !canon || !!getScopeBinding(canon.scope, canon.name, anchorPath)
          || !KNOWN_GLOBAL_CONSTRUCTORS.has(canon.name);
      }
    }
    if (acquires) {
      info = mergeOwnThisMethodInfo(info, {
        methodKeys: new Set(), unknownKey: false, accessors: false, unscannableBodies: true, declaredKeys: new Set(),
      });
    }
    return { info, handsThisOut };
  }

  function collectClassInstanceClosure(classPath, programPath) {
    const desc = collectClassDescendantPaths(classPath, programPath);
    if (!desc) return null;
    const { newExprByName } = buildProgramIndex(programPath);
    const closure = new Map();
    const constructorNames = getClassConstructorNames(classPath, programPath);
    if (constructorNames === null) return null;
    // the instance narrow is shared with every descendant, so the extraction gate unions the
    // own-this method sets across the hierarchy
    // ancestors are part of the hierarchy the instance answers to: an inherited body runs with this
    // instance as `this` exactly as an own one does
    const shape = holderShapeInfo({ paths: [...desc.paths, ...classAncestorPaths(classPath)], anchorPath: classPath });
    if (shape.handsThisOut) return null;
    const methodInfo = shape.info;
    // a HELD `super.<method>` read inside a subclass instance member extracts a base method with
    // NO base-class reference the closure walk could classify - scan the hierarchy bodies directly
    if (methodInfo) {
      for (const cls of desc.paths) {
        if (classBodyHoldsSuperMethod(cls.node, { instanceInfo: methodInfo })) return null;
      }
    }
    for (const name of constructorNames) {
      const entries = newExprByName.get(name);
      if (!entries) continue;
      for (const entry of entries) {
        // same name-keying as the subclass index: a `new X()` of a same-named class in another
        // scope lands in this bucket too, and treating it as one of ours widens the fold with a
        // write that never reaches this class
        if (classRefLandsOutside(entry.path.node.callee, entry.path.scope, desc.nodes)) continue;
        if (entry.isLeakPosition) return null;
        // `const m = new C().read` extracts an own-this method straight off the construction -
        // the held function's `this` rebinds at its later invocation, so the narrow premise dies
        if (methodInfo && entry.isMemberRecv && isMemberAccessNode(entry.wrapperPath.parentPath?.node)
          && methodReadLeaks(entry.wrapperPath.parentPath.node, entry.wrapperPath.parentPath, methodInfo)) return null;
        const source = resolveInstanceBindingName(entry);
        // `bail: true` signals an unsafe shape (mixed-source assignment-init, paren-wrapped
        // declarator with non-Identifier id) that would silently let untracked values into
        // the closure - bail entire closure for soundness. null = not a binding-source at
        // all (e.g., `new C()` as MemberExpression receiver - already tracked elsewhere), skip
        if (source?.bail) return null;
        if (!source) continue;
        const binding = getScopeBinding(source.scope, source.name);
        if (!binding) return null;
        const sub = computeAliasClosureFromBinding({
          rootBinding: binding, rootName: source.name, anchorPath: source.anchorPath, methodInfo,
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

  // the resolvable ANCESTOR classes of this one, nearest first. each hop's `extends` name belongs to
  // THAT ancestor, so it resolves in the scope the ancestor is declared in - the scope advances with
  // the node. reading every hop against the subclass's fixed scope would let an inner shadow of an
  // ancestor's name answer for the real ancestor, and whatever is collected off the wrong class is
  // silently missing. the walk stops at the first hop it cannot resolve or at a cycle
  // the only class-level derivation in this file that had no cache, while sitting on the per-entry
  // hot path of the holder-shape scan: each hop pays an alias-chain walk plus two binding lookups,
  // and the same class is asked once per owner and again per hierarchy query. keyed on the class
  // node in the same row as its neighbours, and dropped by the same `reset()` - the `extends`
  // clause of a USER class is not rewritten by either emitter, so it is stable for the file
  let classAncestorPathsCache = new WeakMap();
  function classAncestorPaths(classPath) {
    return memoize(classAncestorPathsCache, classPath.node, () => {
      const out = [];
      const seen = new Set([classPath.node]);
      for (let cur = { node: classPath.node, scope: classPath.scope }; cur.node?.superClass;) {
        const superCanon = extendsClauseCanonical(cur.node.superClass, cur.scope);
        const superDecl = superCanon ? classDeclFromBindingName(superCanon.name, superCanon.scope) : null;
        if (!superDecl || seen.has(superDecl.node)) break;
        seen.add(superDecl.node);
        out.push(superDecl);
        cur = superDecl;
      }
      return out;
    });
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
      const binding = className ? getScopeBinding(classPath.scope, className, classPath) : null;
      if (!binding) return null;
      const hierarchy = [classPath, ...classAncestorPaths(classPath)];
      // a STATIC member's `this` is the constructor: handing it out opens the same unmonitored
      // write channel on the static surface that an instance method opens on the instance
      const staticShape = holderShapeInfo({ paths: hierarchy, statics: true, anchorPath: classPath });
      if (staticShape.handsThisOut) return null;
      // a HELD `super.<staticMethod>` read in an own STATIC member extracts an ancestor's static with
      // a rebindable `this` and no ancestor-binding reference to classify - scan directly. the set it
      // matches against is the ANCESTORS' alone, so it asks the shape of the chain WITHOUT this class
      // the ancestors are the hierarchy minus this class - `hierarchy` is built as
      // `[classPath, ...ancestors]` one line above, so slicing it re-asks nothing
      const ancestorStatics = holderShapeInfo({
        paths: hierarchy.slice(1), statics: true, anchorPath: classPath,
      }).info;
      if (ancestorStatics && classBodyHoldsSuperMethod(classPath.node, { staticInfo: ancestorStatics })) {
        return null;
      }
      // the `<Class>.prototype` hop exposes the class's OWN instance methods AND the inherited ones
      // (`D.prototype.read` resolves through the prototype chain to the base's method), so the
      // prototype gate unions the super chain's instance sets - and the same acquisition fact the
      // instance side reads, since a decorated or unread-base class owns members nobody scanned on
      // BOTH surfaces
      const prototypeShape = holderShapeInfo({ paths: hierarchy, anchorPath: classPath });
      return computeAliasClosureFromBinding({
        rootBinding: binding, rootName: className, anchorPath, classifier: classBindingRefClassifier,
        // static own-this methods extracted off the class value (`const m = C.make`) rebind `this`
        // away from the constructor at their later invocation - gate like the object-literal flavor.
        // INHERITED statics extract through the subclass binding just the same (`Sub.read` reaches
        // Base.read), so the ancestors' static sets merge in - own-statics-only left a subclass
        // with no own statics ungated (methodInfo null -> no method-aware classifier)
        methodInfo: staticShape.info,
        prototypeMethodInfo: prototypeShape.info,
      });
    });
  }
  // the class-hierarchy indexes are keyed by a bare NAME, so a same-named class in another scope
  // drops its own entries into our bucket. given a reference TO a class (an `extends` clause, a
  // `new` callee) and the scope that reference lives in, is it PROVEN to name a class outside the
  // set? a reference resolving to nothing is not proof and answers false: it can still be a real
  // one at runtime (`extends mix(Base)`, a class-valued binding no declaration backs), and dropping
  // it would hide a real write behind a retained narrow - the unsound direction
  function classRefLandsOutside(refNode, scope, nodes) {
    const canon = extendsClauseCanonical(refNode, scope);
    const decl = canon ? classDeclFromBindingName(canon.name, canon.scope) : null;
    return !!decl && !nodes.has(decl.node);
  }
  // resolve a class-binding NAME to its class node AND the scope that declaration lives in:
  // a ClassDeclaration binding or a declarator whose init is a class expression. the scope
  // travels with the node because a caller walking a chain must read the next hop against the
  // declaration it just landed on, not against wherever the walk started.
  // null for anything else (external / unresolvable base)
  function classDeclFromBindingName(name, scope) {
    const binding = getScopeBinding(scope, name);
    const node = binding?.path?.node;
    const declScope = binding?.path?.scope ?? scope;
    // the PATH comes along for consumers that need to traverse the ancestor body, not just read its
    // node; it is handed over only when it addresses that very node, so a peeled wrapper never
    // silently substitutes a different subtree
    if (node?.type === 'ClassDeclaration') return { node, scope: declScope, path: binding.path };
    if (node?.type === 'VariableDeclarator') {
      const init = unwrapRuntimeExpr(node.init);
      if (init?.type === 'ClassExpression') {
        const initPath = binding.path.get?.('init');
        return { node: init, scope: declScope, path: initPath?.node === init ? initPath : null };
      }
    }
    return null;
  }

  // canonical root of an Identifier's const-alias chain: the NAME plus the scope that name is
  // canonical IN. the two travel together because the walk below advances the scope on every
  // hop - handing the bare name back to a caller that resolves it wherever the walk STARTED
  // reads an inner shadow of the root as the root. `const Alias = Source` walks one hop at a
  // time; `unwrapExpressionChain` peels paren / SE / TS wrappers on the init.
  // cycle or `let A = X; A = Y` reassignment -> null
  function aliasChainCanonicalRoot(name, scope) {
    const seen = new Set();
    while (!seen.has(name)) {
      seen.add(name);
      const binding = getScopeBinding(scope, name);
      if (binding?.constantViolations?.length) return null;
      const init = unwrapExpressionChain(binding?.path?.node?.init);
      if (init?.type !== 'Identifier') return { name, scope };
      // advance scope to the binding's declaration scope so the next hop's `getBinding`
      // hop to the binding's own declaration scope; inner shadows (`const P = Promise`
      // outer; `function f() { const P = X; ... }` inner) would otherwise mis-resolve
      scope = binding.path?.scope ?? scope;
      name = init.name;
    }
    return null;
  }

  // canonical root of an `extends` clause node: the NAME plus the scope it is canonical in, since
  // the Identifier branch may resolve the name in a scope the alias chain climbed to. Identifier ->
  // alias-chain walker; non-computed MemberExpression -> proxy-global (`globalThis.X.Foo`) OR
  // `walkStaticReceiverChain` (const-bound `NS.Inner.Foo`, class-leaf accept). those two answer with
  // a global / qualified name that no local declaration owns, so the caller's own scope stays
  // canonical for them. unsupported shapes return null - over-registration WIDENS the base's field fold
  function extendsClauseCanonical(superClass, scope) {
    superClass = unwrapRuntimeExpr(superClass);
    if (superClass?.type === 'Identifier') return aliasChainCanonicalRoot(superClass.name, scope);
    if (superClass?.type !== 'MemberExpression' || superClass.computed) return null;
    const proxy = globalProxyMemberName({ node: superClass, scope, adapter: babelBindingAdapter, path: null });
    if (proxy) return { name: proxy, scope };
    const path = [];
    let cur = superClass;
    while (cur?.type === 'MemberExpression' && !cur.computed) {
      const k = getKeyName(cur.property);
      if (!k) return null;
      path.unshift(k);
      cur = cur.object;
    }
    if (cur?.type !== 'Identifier') return null;
    const walked = walkStaticReceiverChain({ receiverNode: cur, walkPath: path, scope, adapter: babelBindingAdapter });
    return walked ? { name: walked, scope } : null;
  }
  // name-only view for the callers that resolve the name against their own anchor and never
  // walk a further hop from it
  function extendsClauseName(superClass, scope) {
    return extendsClauseCanonical(superClass, scope)?.name ?? null;
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
    const objPath = memberWriteReceiverPath(writePath);
    if (!objPath?.node) return;
    const peeled = unwrapRuntimeExpr(objPath.node);
    if (t.isThisExpression(peeled)) return;
    if (!predicate(objPath)) return;
    out.push(writePathContributedType(writePath));
  }

  // precomputed per-module index for the module-wide flow scan. naive approach does two full
  // traversals per public field (subclasses + external writes), yielding O(fields x N). build
  // once, look up by name, turning the total into a single O(N) pass amortized across every
  // public field query in the module
  // module-field visitor bundle for the SHARED program census (hosted by binding-analysis):
  // one walk serves this index alongside the reference / new-expression collection, so a
  // first query of either no longer pays its own whole-program traverse
  function moduleFieldCensusCollector() {
    const writesByField = new Map();
    const subclassesBySuper = new Map();
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
    return {
      finish: () => ({ writesByField, subclassesBySuper }),
      visitors: {
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
        // `Object.assign(target, { k: v })` writes `target.k` without a member expression anywhere,
        // so the bare-member visitors above never see it. index each SOURCE PROPERTY under its key -
        // `memberWriteReceiverPath` resolves such an entry back to the call's target, and the
        // contributed type falls to the `unknown` default, which is the sound direction for a write
        // whose value this index does not model. a computed or spread source names no fixed key and
        // is skipped: it can land anywhere, which is the wildcard question, not this one
        CallExpression(p) {
          // through the shared callee resolver, not a name match: by the time the census runs the
          // emitter may already have rewritten the call to its pure alias (`_Object$assign`), and
          // the resolver knows that spelling, the proxy-global one, and the user-shadow bail
          if (resolveStaticCalleePair(p.node.callee, p.scope, 'assign')?.constructor !== 'Object') return;
          const args = p.get('arguments');
          for (let i = 1; i < args.length; i++) {
            if (args[i].node?.type !== 'ObjectExpression') continue;
            for (const prop of args[i].get('properties')) {
              const name = propertyKeyName(prop.node);
              if (name) pushMultimap(writesByField, name, prop);
            }
          }
        },
        // `for (o.field of iter)` / `for (o.field in obj)` rebind `o.field` each iteration. a
        // VariableDeclaration head binds a fresh local (not a member write), so skip it
        'ForOfStatement|ForInStatement'(p) {
          if (p.node.left.type !== 'VariableDeclaration') indexPatternWriteMembers(p.get('left'));
        },
      },
    };
  }

  function getModuleFieldIndex(programPath) {
    const { writesByField, subclassesBySuper } = programCensus(programPath);
    return { writesByField, subclassesBySuper };
  }

  function reset() {
    objectAliasClosureCache = new WeakMap();
    ownThisEscapesCache = new WeakMap();
    closureTemporalBoundCache = new WeakMap();
    classInstanceTemporalBoundCache = new WeakMap();
    classInstanceClosureCache = new WeakMap();
    classBindingClosureCache = new WeakMap();
    classConstructorNamesCache = new WeakMap();
    classDescendantPathsCache = new WeakMap();
    classAncestorPathsCache = new WeakMap();
    programClosureIndexCache = new WeakMap();
  }

  return {
    computeObjectAliasClosure,
    isReceiverInClosure,
    isReceiverPrototypeInClosure,
    moduleFieldCensusCollector,
    getClosureTemporalBound,
    getClassInstanceTemporalBound,
    getClassInstanceClosure,
    getClassBindingClosure,
    classAncestorPaths,
    getClassConstructorNames,
    classRefLandsOutside,
    extendsClauseName,
    collectClassDescendantPaths,
    pushIfWriteMatches,
    getModuleFieldIndex,
    reset,
  };
}
