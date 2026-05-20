// Class / object field-flow type inference. mutable fields can't be typed from their init
// alone (`#x = null` + later `this.#x = arr()` would mis-narrow to nullable). this cluster
// gathers every type that could flow into a field via:
//   1. init expression                                (always)
//   2. `this.<field> = Y` writes inside own methods   (instance / static)
//   3. subclass `this.<field>` writes                  (instance flow only)
//   4. module-wide `<receiver>.<field> = Y` writes     (when receiver matches the closure)
// folds the candidate set via `commonType` skipping nullable/never. null result signals
// "writer set not enumerable" (exported binding, leak, anonymous-class anchor) - caller
// treats as no inference.
//
// Public surface:
//   resolveClassFieldType(member)              - cached folded type for `class.field`
//   resolveObjectFieldFlow(objPath, name, ...) - cached folded type for `obj.field`
//   collectClassDescendantPaths(class, prog)   - {names, paths} of class + transitive subs
//   reset()                                    - per-file cache invalidation
//
// Service object passes ~22 factory helpers + cluster outputs. The biggest dep is
// `resolveNodeType` (factory's main entry) - threaded through a thunk because it's defined
// later in the factory body and recursive. Module-internal state (5 caches) reset together.
import {
  createClassMemberShape,
  createMemberWriteShape,
  memberWriteTargetPath,
} from './class-member-shapes.js';
import { unwrapRuntimeExpr } from '../helpers/ast-patterns.js';

export function createClassFields({
  t,
  getKeyName,
  memoize,
  findProgramPath,
  methodFnPath,
  findObjectMember,
  resolveObjectMember,
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
}) {
  // member-kind predicates - see `./class-member-shapes.js` for the shared definitions.
  // field-flow scan needs both shapes - methods own `this.<X>` writes, properties are the
  // field targets
  const { isMethodMember, isPropertyMember } = createClassMemberShape({ t });

  // shared resolve-fold-cache shape for class-field and object-field flow scans. caches
  // by prop-node identity, seeds a `null` sentinel before invoking `candidatesFn` so
  // cross-referencing writes (`this.a = this.b; this.b = this.a`) bail to unknown instead
  // of recursing forever, then folds the candidate list to a single union type.
  // delete-on-throw mirrors `resolveNodeType`'s `resolveCache` convention: if
  // `candidatesFn()` throws (e.g. transient cycle in walker), drop the sentinel so a
  // future query may retry instead of seeing stale `null`
  function resolveFieldFlow(propNode, cache, candidatesFn) {
    if (cache.has(propNode)) return cache.get(propNode);
    cache.set(propNode, null);
    let result;
    try {
      const candidates = candidatesFn();
      result = candidates ? foldNonNullableCommon(candidates) : null;
    } catch (error) {
      cache.delete(propNode);
      throw error;
    }
    cache.set(propNode, result);
    return result;
  }

  // mutable field - init alone is unsound (sentinel `#x = null` + later `this.#x = arr()`).
  // fold init + every assignment to the field; all-nullable collapses to unknown so the
  // nullable-receiver short-circuit in `resolveCallReturnType` doesn't skip polyfill emission.
  // private (`#x`) is scope-closed; public / auto-accessor are externally writable, so we also
  // fold subclass `this.<field>` writes and module-wide `<expr>.<field> = Y` whose receiver
  // looks like `new ClassName(...)`. anonymous class expressions bail to unknown
  let classFieldTypeCache = new WeakMap();
  function resolveClassFieldType(member) {
    const fieldName = getKeyName(member.node.key);
    if (!fieldName) return null;
    return resolveFieldFlow(member.node, classFieldTypeCache, () => collectClassFieldCandidates(member, fieldName));
  }

  // shared shape of class-field and object-field flow scans. phases:
  //   1. earlyBail (anonymous binding, exported binding) -> null candidates, no inference
  //   2. initPath value type -> seed candidate
  //   3. internalThisScan (own methods of class / object) -> `this.<field> = ...` writes
  //   4. private gate (class-private fields are scope-closed: external scan skipped)
  //   5. programGate (leak detection: instances escaping via fn-arg / return / spread) -> bail
  //   6. programWritesPush (subclass `this.X = ...` + module-wide `<expr>.X = Y` writes)
  // null result signals "writer set not enumerable" - caller treats as no inference
  function collectFieldCandidates(opts) {
    if (opts.earlyBail?.()) return null;
    const candidates = [];
    if (opts.initPath?.node) {
      const initType = resolveNodeType(opts.initPath);
      if (initType) candidates.push(initType);
    }
    opts.internalThisScan?.(candidates);
    if (opts.isPrivate) return candidates;
    const program = findProgramPath(opts.anchor);
    if (!program) return candidates;
    if (opts.programGate?.(program)) return null;
    opts.programWritesPush?.(program, candidates);
    return candidates;
  }

  // walk module-wide `<expr>.<fieldName> = Y` writes (already filtered to `fieldName` via
  // `getModuleFieldIndex`), drop those past the temporal `bound`, fold remaining receivers
  // matching `predicate` into `out`. shared between class and object external-write phases
  function foldExternalWrites({ fieldName, predicate, bound, program, out }) {
    const index = getModuleFieldIndex(program);
    for (const writePath of index.writesByField.get(fieldName) ?? []) {
      if ((writePath.node.start ?? Infinity) >= bound) continue;
      pushIfWriteMatches(writePath, predicate, out);
    }
  }

  // `collectClassDescendantPaths` lives in `closure-analysis.js` (uses the same per-program
  // module-field index and is consumed by both the class-fields flow scan and the
  // class-instance closure builder)

  // private class members ARE scope-closed: `#foo` is only reachable from inside the class
  // body, so external write tracking can be skipped. covers all three private shapes:
  //   - `#foo = init;` (ClassPrivateProperty in babel, PropertyDefinition with
  //     PrivateIdentifier key in ESTree)
  //   - `#foo() {}` (private method - not used as field)
  //   - `accessor #foo = init;` (TC39 stage-3 ClassAccessorProperty with PrivateIdentifier
  //     key in babel; ESTree shape varies). `t.isClassPrivateProperty` matches only the
  //     babel ClassPrivateProperty shape, so the PrivateIdentifier-key check catches the
  //     accessor variant + the ESTree PropertyDefinition shape uniformly
  function isPrivateMember(node) {
    if (t.isClassPrivateProperty?.(node)) return true;
    return node?.key?.type === 'PrivateIdentifier';
  }

  // dispatch to static-vs-instance pipeline. static fields are mutated via the class
  // binding (`C.x = Y`); instance fields are mutated via instance bindings (`<inst>.x = Y`)
  // including subclass instances. private fields skip external scan entirely
  function collectClassFieldCandidates(member, fieldName) {
    const classPath = member.parentPath.parentPath;
    const isPrivate = isPrivateMember(member.node);
    if (!isPrivate && !classBindingName(classPath)) return null;
    return member.node.static
      ? collectStaticFieldCandidates({ member, fieldName, classPath, isPrivate })
      : collectInstanceFieldCandidates({ member, fieldName, classPath, isPrivate });
  }

  // class binding escapes externally when its closure (relaxed classifier: trivial for
  // member-access / new / extends / instanceof / type-position / known-non-mutating call
  // arg) returns null. covers ALL outbound mutation channels in one check:
  //   - decl-as-export `export class C` / `export const C = class {}`
  //   - separate-spec `export { C }` / destructure-rename `export const { C: D } = ...`
  //   - bare default `export default C`
  //   - function-arg leak `f(C)`
  //   - object-property value `const wrapper = { C }`
  //   - array element `const arr = [C]`
  // any of these means external code can do `C.prototype.X = Y` / install a setter /
  // replace a method, which affects instance reads downstream. broader than
  // `isClassExported` (binding-name-only) - the export-name check stays as a cheap
  // earlyBail short-circuit; this is the comprehensive fallback
  function classBindingEscapes(classPath, program) {
    return getClassBindingClosure(classPath, program) === null;
  }

  // static field flow: writes via `<class-binding>.<field> = Y` from anywhere in the module,
  // plus `this.<field> = Y` writes inside static methods AND static blocks (`this` there is
  // the class itself). class-binding closure includes the class identifier and any
  // `const Alias = ClassName` aliases. without this split, static external writes through
  // class binding (`C.x = Y`) would fail the instance predicate and stay unsound, emitting
  // narrow polyfills that break at runtime when the field has been mutated to a different type
  function collectStaticFieldCandidates({ member, fieldName, classPath, isPrivate }) {
    let closure = null;
    return collectFieldCandidates({
      earlyBail: () => !isPrivate && isClassExported(classPath),
      initPath: member.get('value'),
      internalThisScan: candidates => appendThisWritesFor(getStaticMethodThisWrites(classPath), fieldName, candidates),
      isPrivate,
      anchor: classPath,
      programGate: program => {
        if (isPrivate) return false;
        closure = getClassBindingClosure(classPath, program);
        return closure === null;
      },
      programWritesPush: (program, candidates) => {
        // static-field temporal narrow not yet modeled (any `<C>.<X>` use could be a deferred
        // call observing static state). bound = Infinity keeps the existing fold-all behavior
        foldExternalWrites({ fieldName, predicate: p => isReceiverInClosure(p, closure), bound: Infinity, program, out: candidates });
      },
    });
  }

  // instance field flow: writes via `<inst-binding>.<field> = Y` from any instance binding
  // of the class OR any subclass (transitively), plus `this.<field> = Y` writes inside
  // non-static methods of base + subclasses. instance closure now includes subclass `new
  // Sub()` bindings to fix the case where `class Sub extends Base; const s = new Sub();
  // s.x = "string"` was missed by the base-only closure check.
  // class-binding-escape gate fires BEFORE instance closure build: any escape channel
  // means external `C.prototype.<field>` install can affect instance reads (see
  // `classBindingEscapes` doc for the channel list)
  function collectInstanceFieldCandidates({ member, fieldName, classPath, isPrivate }) {
    let closure = null;
    let descendant = null;
    return collectFieldCandidates({
      earlyBail: () => !isPrivate && isClassExported(classPath),
      initPath: member.get('value'),
      internalThisScan: candidates => appendThisWritesFor(getInstanceMethodThisWrites(classPath), fieldName, candidates),
      isPrivate,
      anchor: classPath,
      programGate: program => {
        if (isPrivate) return false;
        if (classBindingEscapes(classPath, program)) return true;
        descendant = collectClassDescendantPaths(classPath, program);
        if (!descendant) return true;
        closure = getClassInstanceClosure(classPath, program);
        return closure === null;
      },
      programWritesPush: (program, candidates) => {
        const bound = getClassInstanceTemporalBound(closure, descendant.names, program);
        // every descendant's non-static methods - subclass `this.X = Y` writes affect the
        // inherited field slot. recursive via descendant set, not just direct subclasses;
        // skip the base classPath since `internalThisScan` already covered it
        for (const sub of descendant.paths) {
          if (sub === classPath) continue;
          appendThisWritesFor(getInstanceMethodThisWrites(sub), fieldName, candidates);
        }
        const predicate = p => isReceiverInClosure(p, closure) || isReceiverNewOfClass(p, descendant.names);
        foldExternalWrites({ fieldName, predicate, bound, program, out: candidates });
      },
    });
  }

  // mirror of `resolveClassFieldType` for object-literal property reads through `this.<name>`.
  // returns the folded RHS-union type for a regular data property, threading flow scans
  // through both inside-method `this.<name> = ...` writes and module-wide
  // `<binding>.<name> = ...` external writes (when the literal has a stable binding name).
  // method/getter/function-valued properties defer to `resolveObjectMember` for their existing
  // call/return semantics. anonymous (no binding name) objects: still scan inside-method
  // writes - external write set is just empty, not unknown. exported objects bail entirely
  let objectFieldTypeCache = new WeakMap();
  function resolveObjectFieldFlow(objectPath, fieldName, callPath) {
    const prop = findObjectMember(objectPath, fieldName);
    if (!prop) return null;
    // method-shaped or function-valued -> existing semantics handle call/return correctly
    if (t.isObjectMethod?.(prop.node)) return resolveObjectMember(objectPath, fieldName, callPath);
    if (t.isObjectProperty?.(prop.node) && t.isFunction?.(prop.node.value)) {
      return resolveObjectMember(objectPath, fieldName, callPath);
    }
    return resolveFieldFlow(prop.node, objectFieldTypeCache, () => collectObjectFieldCandidates(objectPath, prop, fieldName));
  }

  // gather every type that could flow into `fieldName` on `objectPath` via the unified
  // candidate collector. null signals "unknown writer set" (exported binding, anonymous
  // literal with an unsupported leak shape, or aliasing through unenumerable channels) -
  // caller treats as no inference. unlike class-side, object-literal aliasing is enumerated
  // through scope references, so trace-through-alias writes are folded into the union too.
  // closure builder's post-build check also catches the export case, so a null closure
  // subsumes both the historical `isObjectExported` early-bail AND in-walk leak detection
  function collectObjectFieldCandidates(objectPath, prop, fieldName) {
    const closure = computeObjectAliasClosure(objectPath);
    if (!closure) return null;
    return collectFieldCandidates({
      initPath: t.isObjectProperty?.(prop.node) ? prop.get('value') : null,
      internalThisScan: candidates => appendThisWritesFor(getInstanceMethodThisWrites(objectPath), fieldName, candidates),
      isPrivate: false,
      anchor: objectPath,
      programWritesPush: (program, candidates) => {
        const bound = getClosureTemporalBound(closure, program);
        foldExternalWrites({ fieldName, predicate: p => isReceiverInClosure(p, closure), bound, program, out: candidates });
      },
    });
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

  // shared shape predicates for `<expr>.<field> = ...` / `<expr>.<field>++` writes -
  // see `./class-member-shapes.js`. `memberWriteFieldName` accepts literal-string / -number
  // computed keys (`o['items']`, `o[0]`) via `getKeyName`; truly dynamic computed keys
  // (variable / call / template-with-expr) -> null. `writePathContributedType` returns
  // RHS resolution for `=`; operator-coerced compound / update -> `unknown` sentinel
  const { memberWriteFieldName, writePathContributedType } =
    createMemberWriteShape({ t, getKeyName, resolveNodeType });

  // walk method bodies once and build a Map<fieldName, types[]> of every `this.<X> = Y`
  // / `++this.<X>` write contained within. lets per-field candidate scans become O(1)
  // lookups instead of O(N field) full method walks. caller passes the BODY container
  // path (not the method path) so the traversal root is the body and adapters that visit
  // roots don't fire the FunctionExpression / ClassMethod skip rule on the entry point.
  // StaticBlock has `body: Statement[]` directly on the node and is traversed in-place.
  // `this`-receiver check peels Paren / TS_EXPR_WRAPPERS so `(this).x = Y` and
  // `(this as any).x = Y` resolve identically to bare `this.x = Y`. arrow expression-body
  // class fields (`class C { f = () => this.x = "y" }`) need explicit root-visit because
  // `path.traverse` only walks descendants - the body IS the AssignmentExpression and
  // would be skipped without the post-traverse root handle
  function buildThisWritesIndex(methodPaths) {
    const index = new Map();
    const handle = p => {
      const target = memberWriteTargetPath(p).node;
      if (!t.isThisExpression(unwrapRuntimeExpr(target?.object))) return;
      const fieldName = memberWriteFieldName(target);
      if (!fieldName) return;
      let types = index.get(fieldName);
      if (!types) index.set(fieldName, types = []);
      const contributed = writePathContributedType(p);
      if (contributed) types.push(contributed);
    };
    // skip ANY function-shaped sub-tree whose body rebinds `this`: FunctionDeclaration /
    // Expression / ObjectMethod / class wrappers. nested ClassMethod / ClassPrivateMethod /
    // MethodDefinition are reached only through their enclosing Class node, which is
    // already in the skip set, so they don't need explicit entries (and adding babel-
    // incompatible ESTree names like `MethodDefinition` crashes babel-traverse).
    // Arrow functions inherit outer `this`, so they're NOT skipped
    const visitors = {
      'FunctionDeclaration|FunctionExpression|ObjectMethod|ClassDeclaration|ClassExpression'(p) {
        p.skip();
      },
      AssignmentExpression: handle,
      UpdateExpression: handle,
    };
    for (const path of methodPaths) {
      if (!path?.node) continue;
      const target = path.node.type === 'StaticBlock' ? path : path.get('body');
      if (!target?.node) continue;
      target.traverse(visitors);
      // arrow expression-body root: body IS the AssignmentExpression / UpdateExpression
      // and isn't visited by path.traverse (which walks descendants only)
      if (target.node.type === 'AssignmentExpression' || target.node.type === 'UpdateExpression') {
        handle(target);
      }
    }
    return index;
  }

  // cached this-writes index for the owner's instance methods (non-static class methods +
  // object-literal methods). a class with N fields would otherwise re-walk all methods N
  // times via per-field scans; one-time index build + per-field Map.get is O(M*B) instead
  // of O(N*M*B). cache by owner node identity (class or object literal AST node)
  let instanceMethodThisWritesCache = new WeakMap();
  function getInstanceMethodThisWrites(ownerPath) {
    return memoize(instanceMethodThisWritesCache, ownerPath.node, () => buildThisWritesIndex(ownerMethodFns(ownerPath)));
  }

  // cached this-writes index for the class's static surface (static methods + StaticBlocks).
  // mirrors `getInstanceMethodThisWrites` shape; separate cache because static methods scan
  // a different method set than instance methods on the same class
  let staticMethodThisWritesCache = new WeakMap();
  function getStaticMethodThisWrites(classPath) {
    return memoize(staticMethodThisWritesCache, classPath.node, () => buildThisWritesIndex(staticOwnerMethodFns(classPath)));
  }

  // append cached this-writes types for `fieldName` from `index` to `out`. nullish entry
  // means "no this-write to this field name in the indexed method set" - no-op
  function appendThisWritesFor(index, fieldName, out) {
    const types = index.get(fieldName);
    if (!types) return;
    for (const type of types) out.push(type);
  }

  // ArrowFunctionExpression / FunctionExpression valued class field: `this.X = ...` writes
  // inside such fields contribute to the field-flow scan exactly like writes inside regular
  // methods. for static fields, `this` at init time IS the class; arrow captures it. for
  // instance fields, `this` at init (inside constructor) IS the instance; arrow captures it.
  // FE-valued is included conservatively - call-site `this` may not be class/instance, but
  // any write that DOES fire under the expected receiver still mutates the field
  function fieldFunctionPath(memberPath) {
    const value = memberPath.get('value');
    if (value?.node?.type === 'ArrowFunctionExpression'
      || value?.node?.type === 'FunctionExpression') return value;
    return null;
  }

  // class-static counterpart to `ownerMethodFns`: returns paths whose `this` binds to the
  // class itself - static methods + StaticBlock paths + static fn-valued fields. used by
  // static-field flow scan (instance fields use `ownerMethodFns(classPath)` which excludes
  // static)
  function staticOwnerMethodFns(classPath) {
    const paths = [];
    for (const bodyMember of classPath.get('body').get('body')) {
      // static initialization block - body is a Statement[] array directly on the node;
      // path.traverse() walks the descendants (statements + nested expressions) the same
      // way it walks a method's body; `this` here is the class itself
      if (bodyMember.node?.type === 'StaticBlock') {
        paths.push(bodyMember);
        continue;
      }
      if (!bodyMember.node?.static) continue;
      if (isMethodMember(bodyMember.node)) {
        paths.push(methodFnPath(bodyMember));
        continue;
      }
      if (isPropertyMember(bodyMember.node)) {
        const fnPath = fieldFunctionPath(bodyMember);
        if (fnPath) paths.push(fnPath);
      }
    }
    return paths;
  }

  // collect every method-function path that owns a `this` binding within the given owner
  // (a Class or an ObjectExpression). class side: non-static class methods (static `this`
  // refers to the class object itself). object side: ObjectMethod (`{m(){}}`) and
  // FunctionExpression-valued properties (`{m: function(){}}`); arrow-valued properties
  // share outer `this` and are excluded. getter shorthand (`get x(){}`) is a property
  // accessor not a write surface for `this.x`, also excluded
  function ownerMethodFns(ownerPath) {
    const methodFns = [];
    if (t.isClass(ownerPath.node)) {
      for (const bodyMember of ownerPath.get('body').get('body')) {
        if (bodyMember.node.static) continue;
        if (isMethodMember(bodyMember.node)) {
          methodFns.push(methodFnPath(bodyMember));
          continue;
        }
        // arrow / FE-valued instance fields: `this` is the instance (captured at constructor
        // run), so internal `this.X = ...` writes mutate the field-flow surface
        if (isPropertyMember(bodyMember.node)) {
          const fnPath = fieldFunctionPath(bodyMember);
          if (fnPath) methodFns.push(fnPath);
        }
      }
    } else if (t.isObjectExpression(ownerPath.node)) {
      for (const propPath of ownerPath.get('properties')) {
        const propNode = propPath.node;
        if (!propNode || t.isSpreadElement(propNode)) continue;
        // getters DO contribute writes to OTHER fields: `get foo() { this.bar = "x"; ... }`
        // reads `foo` but side-effects `bar`. previously skipped getters lost these writes,
        // narrowing `bar` on stale init type. mirror class-side which includes getters via
        // `isMethodMember`. only setter ARGUMENT-named field doesn't matter for THIS-write
        // detection (setter body still scans `this.<other> = Y` writes the same way)
        if (t.isObjectMethod?.(propNode)) {
          methodFns.push(methodFnPath(propPath));
          continue;
        }
        if (t.isObjectProperty?.(propNode) && t.isFunctionExpression?.(propNode.value)) {
          methodFns.push(propPath.get('value'));
        }
      }
    }
    return methodFns;
  }

  function reset() {
    classFieldTypeCache = new WeakMap();
    objectFieldTypeCache = new WeakMap();
    instanceMethodThisWritesCache = new WeakMap();
    staticMethodThisWritesCache = new WeakMap();
  }

  return {
    resolveClassFieldType,
    resolveObjectFieldFlow,
    reset,
  };
}
