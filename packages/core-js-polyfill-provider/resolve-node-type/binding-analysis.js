// Module-level binding analysis for closure / mutation tracking. classifies every
// reference of a class / object / instance binding into trivial (member-access receiver,
// destructure source, non-mutating call arg, type-position) vs alias (`const aliasName =
// existingBinding`) vs leak (any other escape). closure builder walks alias chains until
// every reachable name resolves to a trivial / alias use - leaks return null which the
// caller propagates as "can't safely narrow this binding".
//
// Public surface:
//   getExportedNames(programPath)            - module-exported name Set, cached per program
//   isBindingExportedByName(name, program)   - quick predicate
//   classBindingName(classPath)              - declarator name (preferred) | class id | null
//   isClassExported(classPath)               - whether the class binding is module-exported
//   isNewOfClass / isReceiverNewOfClass      - `new <Name>()` recognizers
//   objectBindingName(objectPath)            - declarator name (only stable form) | null
//   isMemberRefReceiver(parent, refNode)     - `<name>.X` / `<name>?.X` receiver predicate
//   resolveStaticCalleePair(callee, scope)   - `(constructor, method)` pair from various
//                                              member-access shapes
//   resolveKnownStaticEntry(callee, refPath) - registry lookup via the resolved pair
//   isReflectConstructCallee(callee, scope)  - non-shadowed Reflect.construct recognizer
//   isKnownNonMutatingCallSite               - SpreadElement-aware non-mutating arg check
//   collectBindingReferences                 - babel referencePaths or estree-toolkit walk
//   defaultAliasRefClassifier                - trivial / alias / leak classifier
//   classBindingRefClassifier                - relaxed for `new C`, `extends C`, etc.
//   isTypePositionParent(parentType)         - TS / Flow type-position recognizer
//   computeAliasClosureFromBinding           - the main closure walker
//
// Service object passes factory helpers (`memoize`, `findProgramPath`, `getDeclaratorBindingName`,
// `staticPairFromPolyfillEntry`, `lookupNested`, `KNOWN_STATIC_METHOD_RETURN_TYPES`) and the
// Babel/ESTree type adapter `t`. Module-level state (`exportedNamesCache`) ships with `reset()`.
import { PATTERN_WRAPPERS } from './base.js';
import {
  FUNCTION_LIKE_NODE_TYPES,
  isBindingPosition,
  isForXStatement,
  isMemberAccessNode,
  isMemberWriteHost,
  isNonReferencePosition,
  isTSTypeOnlyIdentifierPath,
  memberReadKeyName,
  objectOwnThisMethodInfo,
  ownThisMethodKeyMatches,
  peelTransparentExprAncestorPath,
  propertyKeyName,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
  walkPatternIdentifiers,
} from '../helpers/ast-patterns.js';
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';

// walk up from an Identifier through destructuring pattern wrappers to the enclosing binding / assign
// host. returns { host, node } where node is the outermost pattern reached (or the identifier itself
// when not in a pattern); null when the identifier is a property KEY (esp. computed `{ [ref]: x }`, a
// real reference) or has no parent. lets callers mirror what babel's `referencePaths` excludes -
// declaration slots AND destructuring-write targets - which the estree-toolkit walk would otherwise
// over-collect since patterns nest arbitrarily
function patternSlotHost(refNode, refPath) {
  if (!refPath) return null;
  let node = refNode;
  let cur = refPath.parentPath;
  while (cur && PATTERN_WRAPPERS.has(cur.node.type)) {
    const { node: w } = cur;
    // only a property VALUE is a slot; a key (esp. computed `{ [ref]: x }`) is a reference
    if ((w.type === 'Property' || w.type === 'ObjectProperty') && w.value !== node) return null;
    // only the LEFT of a default is a slot; the default VALUE (`x = C` / `{ a = C }`) is a real
    // reference (`C` is read when the slot is absent), which babel's referencePaths keeps - excluding
    // it as a declaration would drop `C`'s escaping read and unsoundly narrow `C`'s type
    if (w.type === 'AssignmentPattern' && w.right === node) return null;
    node = w;
    cur = cur.parentPath;
  }
  return cur ? { host: cur.node, node } : null;
}

// is this Identifier a binding DECLARATION rather than a reference? `isBindingPosition` covers the
// simple slots (declarator / function-class id / catch param); destructuring-pattern slots and
// function params nest arbitrarily, so walk to the binding host - a slot rooted at a declarator id,
// catch param, or function param is a declaration. mirrors babel's `referencePaths` exclusion so a
// param / destructure binding's own declaration is not mis-collected as a leak-classified reference
function isBindingDeclarationPath(p) {
  if (isBindingPosition(p.parent, p.node)) return true;
  const slot = patternSlotHost(p.node, p);
  if (!slot) return false;
  const { host, node } = slot;
  if (host.type === 'VariableDeclarator') return host.id === node;
  if (host.type === 'CatchClause') return host.param === node;
  if (FUNCTION_LIKE_NODE_TYPES.has(host.type)) return Array.isArray(host.params) && host.params.includes(node);
  return false;
}

export function createBindingAnalysis({
  t,
  memoize,
  findProgramPath,
  getDeclaratorBindingName,
  staticPairFromPolyfillEntry,
  namespaceFromPolyfillBinding,
  lookupNested,
  KNOWN_STATIC_METHOD_RETURN_TYPES,
}) {
  // every module-level export name as a Set: covers `export const X`, `export class X`,
  // `export function X`, `export default class X`, `export default function X`,
  // `export const {a, b: {c}, d = 1, ...rest} = src` destructured forms, `export default <Ident>`
  // bare-identifier form, and the separate-specifier forms `export { X }` / `export { X as Y }`.
  // cached per program node. used by closure builders to bail on any closure binding whose
  // name is exported - an importer with `import { X }` then `X.field = Y` mutates state we
  // can't enumerate. re-export specifiers `export { X } from 'mod'` don't bind locally and
  // are skipped via the `stmt.source` filter
  let exportedNamesCache = new WeakMap();
  function getExportedNames(programPath) {
    if (!programPath) return null;
    return memoize(exportedNamesCache, programPath.node, () => {
      const names = new Set();
      for (const stmt of programPath.node.body) {
        if (stmt.type === 'ExportNamedDeclaration') {
          // type-only exports (`export type { X }` / `export type X = ...`) are tsc-elided
          // at runtime - importers see nothing, so the binding isn't externally reachable
          // and shouldn't bail closure-narrow. covers both declaration-level `exportKind`
          // and per-specifier `exportKind` (TS allows mixed `export { type X, Y }`)
          if (stmt.exportKind === 'type') continue;
          // re-export (`export { X } from 'mod'`) doesn't reference a local binding;
          // `spec.local` points at the source module's name. skip to avoid false-positive
          // export marks on coincidentally-named locals
          if (stmt.specifiers && !stmt.source) {
            for (const spec of stmt.specifiers) {
              if (spec.exportKind === 'type') continue;
              // local is Identifier for in-module specs; defensive `?.type` check handles
              // any future parser shapes where the field is StringLiteral or missing
              if (spec.local?.type === 'Identifier') names.add(spec.local.name);
            }
          }
          const decl = stmt.declaration;
          if (decl?.type === 'VariableDeclaration') {
            // destructured exports: `export const {a, b: {c}, d = 1, ...rest} = src` -
            // `walkPatternIdentifiers` enumerates EVERY binding leaf the pattern introduces
            // so closure-analyzer sees all exported names, not just the trivial Identifier form
            for (const d of decl.declarations ?? []) walkPatternIdentifiers(d.id, id => names.add(id.name));
          } else if (decl?.id?.name) names.add(decl.id.name);  // ClassDeclaration / FunctionDeclaration
        } else if (stmt.type === 'ExportDefaultDeclaration') {
          const exported = stmt.declaration;
          // `export default class X {}` / `export default function X() {}` - the named form
          // both exposes `default` to importers AND retains the local binding `X`. anonymous
          // default declarations (`export default {...}`) carry no in-module name, so caller
          // already had no enumerable name to track. bare `export default X;` re-exports the
          // existing local binding `X` under the `default` name - the local IS reachable
          // externally via `import D from 'mod'` followed by `D.field = Y`
          if (exported?.id?.name) names.add(exported.id.name);
          else if (exported?.type === 'Identifier') names.add(exported.name);
        } else if (stmt.type === 'TSExportAssignment' && stmt.expression?.type === 'Identifier') {
          // TS CJS interop: `export = X` makes X module.exports. just like named export,
          // X is reachable externally - any importer can mutate its public fields, so
          // closure-narrow must bail (otherwise unsound polyfill emit on a binding the
          // outside world can rewrite). non-Identifier expressions (`export = { ... }`)
          // expose the literal but not any enumerable in-module name to track
          names.add(stmt.expression.name);
        }
      }
      return names;
    });
  }

  function isBindingExportedByName(name, programPath) {
    return !!name && (getExportedNames(programPath)?.has(name) ?? false);
  }

  // canonical name for the OUTER binding through which the class is reachable from peer
  // module code. for `const C = class XYZ {}` the inner `XYZ` is a class-body-only binding;
  // every external reference (`new C()`, `extends C`, `C.staticField = ...`) uses `C`. so
  // declarator name wins over class id; class id is only the fallback for declaration-form
  // (`class XYZ {}`) or unbound class expressions where no outer binding exists
  function classBindingName(classPath) {
    return getDeclaratorBindingName(classPath) ?? classPath.node.id?.name ?? null;
  }

  // is this class reachable from outside the module? exported classes lose external-write
  // tracking - any importer can mutate public fields. all named-export forms are covered
  // by `getExportedNames` (decl-as-export `export class C {}` / `export const C = class {}`,
  // separate spec `export { C }`, default-named `export default class C {}`). anonymous
  // classes have no `classBindingName` so caller bails before reaching here.
  // CommonJS (`module.exports.C = C`) currently NOT detected - usage-pure flows assume ESM
  function isClassExported(classPath) {
    return isBindingExportedByName(classBindingName(classPath), findProgramPath(classPath));
  }

  // is the node `new <X>(...)` for any X in the accepted names Set? callee is unwrapped
  // from ParenthesizedExpression and TS expression wrappers so `new (C)()` / `new (C as any)()`
  // parser-preserved shapes still match. instance flow scan passes the inheritance-descendant
  // name set so `new Sub()` is recognized as instantiating a Base-derived class
  function isNewOfClass(node, classNames) {
    if (!t.isNewExpression(node)) return false;
    const callee = unwrapRuntimeExpr(node.callee);
    if (!callee || callee.type !== 'Identifier') return false;
    return classNames.has(callee.name);
  }

  // does `<expr>` look like a direct `new <X>(...)` write target (`(new C()).x = Y`)?
  // class closure tracks bound instances; this predicate covers the residual shape where
  // an unbound instance immediately receives a write via member access. peels the receiver
  // expression through ParenthesizedExpression + TS expression wrappers so user-written
  // `(new C() as any).x = Y` / `(new C() satisfies T).x = Y` shapes still match - both are
  // runtime no-ops over the same NewExpression. without the peel, the outer wrapper masks
  // the new-expression and the external write silently drops from field-flow narrowing
  function isReceiverNewOfClass(objPath, classNames) {
    return isNewOfClass(unwrapRuntimeExpr(objPath.node), classNames);
  }

  // object-literal binding name for identity matching in the external-write scan. only
  // declarator-init form (`const o = {...}` / `let o = {...}`) - other shapes (function
  // arg, return value, property value) carry no stable name through which external writes
  // can be enumerated. anonymous literals -> null (caller bails)
  function objectBindingName(objectPath) {
    return getDeclaratorBindingName(objectPath);
  }

  // is the parent of an Identifier reference a member-access where the identifier is the
  // receiver (object slot)? `o.x` / `o?.x` / `o.x = y` / `o[expr]` all qualify. used to
  // distinguish trivial member access from any other use (alias, call arg, return value,
  // computed-key on another receiver, ...) that constitutes an escape channel
  function isMemberRefReceiver(parent, refNode) {
    return (parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression')
      && parent.object === refNode;
  }

  // resolve a callee node to its (constructor, method) pair if it's a known-static call.
  // covers four shapes:
  //   1. bare member access `Object.assign(...)` - object is a no-local-shadow Identifier
  //   2. proxy-global wrap `globalThis.Object.assign(...)` / `self.Object.assign(...)` -
  //      outer is a proxy-global, peel it and treat inner property as the constructor name
  //   3. post-rewrite polyfill alias `_Object$assign` - identifier resolves through the
  //      injector's binding hint via `staticPairFromPolyfillEntry`
  //   4. Reflect.construct etc - handled identically by the same shapes
  // returns `{ constructor, method }` or null. computed callees and non-Identifier slots
  // bail uniformly. callers add their own table lookup (`KNOWN_STATIC_METHOD_RETURN_TYPES`)
  // or pair match (Reflect.construct) on top of the resolved pair
  function resolveStaticCalleePair(callee, scope) {
    if (!callee) return null;
    if (callee.type === 'MemberExpression' || callee.type === 'OptionalMemberExpression') {
      if (callee.computed) return null;
      if (callee.property?.type !== 'Identifier') return null;
      if (callee.object?.type === 'Identifier') {
        // post-rewrite namespace / constructor VALUE alias first (`_Math.max(...)` after the
        // value swap): the polyfill-import registry names the global the binding carries. it
        // is consulted before the scope lookup - scope registration of a freshly injected
        // import can lag behind the AST substitution (babel); user bindings are unknown to
        // the registry and fall through to the shadow bail exactly as before
        const aliased = namespaceFromPolyfillBinding(scope, callee.object.name);
        if (aliased) return { constructor: aliased, method: callee.property.name };
        if (scope?.getBinding?.(callee.object.name)) return null;
        return { constructor: callee.object.name, method: callee.property.name };
      }
      if ((callee.object?.type === 'MemberExpression' || callee.object?.type === 'OptionalMemberExpression')
        && !callee.object.computed
        && callee.object.object?.type === 'Identifier'
        && callee.object.property?.type === 'Identifier'
        && POSSIBLE_GLOBAL_OBJECTS.has(callee.object.object.name)
        && !scope?.getBinding?.(callee.object.object.name)) {
        return { constructor: callee.object.property.name, method: callee.property.name };
      }
      return null;
    }
    if (callee.type === 'Identifier' && scope) return staticPairFromPolyfillEntry(scope, callee.name);
    return null;
  }

  // resolve callee to the entry from `KNOWN_STATIC_METHOD_RETURN_TYPES` (mutation profile,
  // return-type hint, ...). null when callee is not a known static or the (constructor,
  // method) pair has no registered entry
  function resolveKnownStaticEntry(callee, refPath) {
    const pair = resolveStaticCalleePair(callee, refPath?.scope);
    return pair ? lookupNested(KNOWN_STATIC_METHOD_RETURN_TYPES, pair.constructor, pair.method) : null;
  }

  // is `callee` a (non-shadowed) reference to `Reflect.construct`? same shape coverage as
  // `resolveKnownStaticEntry` (member / proxy-global / post-rewrite alias) - the pair just
  // gates on a fixed `(Reflect, construct)` match instead of a registry lookup
  function isReflectConstructCallee(callee, scope) {
    const pair = resolveStaticCalleePair(callee, scope);
    return pair?.constructor === 'Reflect' && pair?.method === 'construct';
  }

  // is `refNode` at a non-mutating slot of a known call? SpreadElement is unwrapped first:
  // `f(...o)` re-targets argIndex computation to the spread node within `f`'s arg list,
  // `[...o]` / `{...o}` shortcut to true since the value-source containers have no callee
  // that could mutate `o`. leading SpreadElement before the slot perturbs the runtime index
  // (`f(...rest, o)` - o lands at unknown position), so we bail. for spread refs we widen
  // the mutation check to "any annotated index >= argIndex" since spread expands into
  // runtime positions [argIndex, argIndex+1, ...] (covers Reflect.set's [0,3] receiver-slot
  // mutation reachable via `Reflect.set(t, k, ...o)`). resolveKnownStaticEntry handles both
  // pre-rewrite member (`Object.assign`) and post-rewrite alias (`_Object$assign`)
  function isKnownNonMutatingCallSite(parent, refNode, refPath) {
    if (parent?.type === 'SpreadElement') {
      const container = refPath?.parentPath?.parent;
      if (container?.type === 'ArrayExpression' || container?.type === 'ObjectExpression') return true;
      refNode = parent;
      parent = container;
    }
    // NewExpression with a known-static MemberExpression callee (`new Reflect.X(o)`,
    // `new Object.create(o)`-style) routes through the same resolveKnownStaticEntry as
    // a regular call - the entry's `mutatesArgument` profile applies identically. bare
    // constructor callees (`new Set(o)`) need their entries in the registry to benefit;
    // without them the resolver returns null and the call falls through to leak as before
    if (parent?.type !== 'CallExpression' && parent?.type !== 'OptionalCallExpression'
      && parent?.type !== 'NewExpression') return false;
    const argIndex = parent.arguments?.indexOf(refNode) ?? -1;
    if (argIndex === -1) return false;
    for (let i = 0; i < argIndex; i++) if (parent.arguments[i]?.type === 'SpreadElement') return false;
    const entry = resolveKnownStaticEntry(parent.callee, refPath);
    if (entry === null) return false;
    const mutates = entry.mutatesArgument;
    if (!Array.isArray(mutates)) return true;
    return refNode.type === 'SpreadElement'
      ? !mutates.some(idx => idx >= argIndex)
      : !mutates.includes(argIndex);
  }

  // `let c; c = new C();` as ExpressionStatement-direct AssignmentExpression: assignment is the
  // binding's SOLE source (caller's gate on let-with-no-init + single constantViolation lives
  // in `resolveInstanceBindingName`). returns the LHS Identifier name or null when the shape
  // doesn't qualify
  function assignmentInitNameOf(effectivePath) {
    const parent = effectivePath.parentPath?.node;
    if (parent?.type !== 'AssignmentExpression' || parent.operator !== '=') return null;
    if (parent.right !== effectivePath.node || parent.left?.type !== 'Identifier') return null;
    if (effectivePath.parentPath?.parentPath?.node?.type !== 'ExpressionStatement') return null;
    return parent.left.name;
  }

  // classify the effective parent context of a `new C()` so `collectClassInstanceClosure` /
  // temporal-bound consumers decide leak / declarator-init / chain semantics without re-walking.
  // `isMemberRecv` carries the parent MemberExpression for `new C().X(...)` chain detection (the
  // bound consumer needs both the call's start AND that `.X(...)` follows the new-expression).
  // `assignmentInitName` recovers narrow for `let c; c = new C()` shapes - bare-let with single
  // assignment-init binding mirrors declarator-init semantics (see comment on `assignmentInitNameOf`)
  function classifyNewExprPosition(originalPath, effectivePath) {
    const effective = effectivePath.node;
    const parent = effectivePath.parentPath?.node;
    const isDeclaratorInit = parent?.type === 'VariableDeclarator' && parent.init === effective;
    const isExprStmt = parent?.type === 'ExpressionStatement' && parent.expression === effective;
    // babel models `new C()?.m()` with the new-expr parent as OptionalMemberExpression; oxc as
    // MemberExpression{optional:true}. accept both so a transient optional-chain receiver classifies
    // identically across parsers (a read-only transient can't mutate, so the narrow stays sound)
    const isMemberRecv = isMemberAccessNode(parent) && parent.object === effective;
    const assignmentInitName = assignmentInitNameOf(effectivePath);
    return {
      path: originalPath,
      // wrapperPath is the outermost transparent-wrapper path (or `originalPath` when no wrappers
      // present). consumers reach the effective declarator / member-receiver parent without
      // re-walking. `effectivePath !== originalPath` is the only signal that peel changed the
      // position, but consumers can read `wrapperPath.parentPath` uniformly
      wrapperPath: effectivePath,
      isDeclaratorInit,
      isLeakPosition: !isDeclaratorInit && !isExprStmt && !isMemberRecv && !assignmentInitName,
      isMemberRecv,
      assignmentInitName,
    };
  }

  // shared per-program index: one walk builds both the `Identifier`-by-binding map (used by
  // `collectBindingReferences` for estree-toolkit fallback and by `closure-analysis` temporal
  // bound classification) AND the `NewExpression`-by-callee-name map (used by `closure-analysis`
  // class-instance closure collection and temporal-bound `new C().method(...)` chain
  // detection). without this, N bindings or C classes would each trigger their own O(N) program
  // walk, turning closure construction into O(N^2)
  let programIndexCache = new WeakMap();
  function buildProgramIndex(programPath) {
    return memoize(programIndexCache, programPath.node, () => {
      const identifierByBinding = new Map();
      const newExprByName = new Map();
      function pushByKey(map, key, value) {
        let list = map.get(key);
        if (!list) map.set(key, list = []);
        list.push(value);
      }
      programPath.traverse({
        Identifier(p) {
          // declaration-id slots are NOT references (mirrors babel's `referencePaths`).
          // estree-toolkit also walks identifier-shaped name positions that babel's reference
          // walker skips: object property keys, class method names, import / export specifier
          // ident-slots, member-property names, label-statement labels. without
          // `isNonReferencePosition`, those would slip through as false references against a
          // closure-binding of the same name and force `defaultAliasRefClassifier` to fall
          // through to `'leak'`, disabling the narrow
          if (isBindingDeclarationPath(p)) return;
          if (isNonReferencePosition(p.parent, p.node)) return;
          const binding = p.scope?.getBinding(p.node.name);
          if (!binding) return;
          pushByKey(identifierByBinding, binding, p);
        },
        NewExpression(p) {
          const callee = unwrapRuntimeExpr(p.node.callee);
          if (!callee || callee.type !== 'Identifier') return;
          const effectivePath = peelTransparentExprAncestorPath(p);
          pushByKey(newExprByName, callee.name, classifyNewExprPosition(p, effectivePath));
        },
      });
      return { identifierByBinding, newExprByName };
    });
  }

  // collect every reference path of `binding` (excluding the declarator id slot). babel
  // exposes the canonical `binding.referencePaths`; estree-toolkit doesn't - fall back to
  // the shared per-program index. null result signals "couldn't enumerate" (no program path)
  function collectBindingReferences(binding, name, anchorPath) {
    if (Array.isArray(binding.referencePaths)) return binding.referencePaths;
    const program = findProgramPath(anchorPath);
    if (!program) return null;
    return buildProgramIndex(program).identifierByBinding.get(binding) ?? [];
  }

  // ref classifier used during alias-closure construction. categories:
  //   'trivial' - reference is a member-access receiver (`<name>.X` / `<name>?.X` / `<name>[expr]`)
  //               or any other shape that doesn't escape the binding's value
  //   'alias'   - `const <newName> = <ref>` declarator; closure absorbs `newName` and recurses
  //   'leak'    - everything else; opens an unmonitored mutation channel
  // default classifier is used by object-literal and class-instance closures (binding holds an
  // object-shape value). class-binding closure swaps in `classBindingRefClassifier` which also
  // accepts `new ClassName()`, `class Sub extends ClassName`, `x instanceof ClassName` -
  // those uses don't escape the binding's value (the class) for static-state mutation purposes
  // computed member key that's a compile-time constant - a write through it touches a KNOWN
  // field, so field-flow can fold or ignore it. dynamic keys (`o[i]`, `o[f()]`) are unknowable
  function isStaticComputedKey(property) {
    const type = property?.type;
    // ONLY a string / number literal key (`o['f']`, `o[0]`) names a field field-flow can fold or
    // ignore. babel: StringLiteral / NumericLiteral. estree (oxc): a `Literal` whose value is a
    // string or number. BigInt / boolean / null / regex / template keys are treated as DYNAMIC
    // (their fold isn't reliable, so the write stays a leak that bails the narrow) - this also
    // keeps the parsers aligned on the bool case (a bare `type === 'Literal'` check would admit
    // it on oxc, while babel has no BooleanLiteral entry)
    if (type === 'StringLiteral' || type === 'NumericLiteral') return true;
    return type === 'Literal' && (typeof property.value === 'string' || typeof property.value === 'number');
  }

  // `o[k] = v` / `o[k]++` / `delete o[k]` with a dynamic key: an unmonitored write to ANY field
  // (k could equal a tracked field name at runtime) that field-flow can't enumerate - a leak.
  // `parent` is the member node; `refPath.parentPath.parent` is the assignment / update / delete above it
  function isDynamicComputedKeyWrite(parent, refNode, refPath) {
    if (parent?.type !== 'MemberExpression' && parent?.type !== 'OptionalMemberExpression') return false;
    if (parent.object !== refNode || !parent.computed || isStaticComputedKey(parent.property)) return false;
    // a dynamic computed-key member (`c[k]`) writes when it is the target of its host; the host
    // enumeration (assignment / update / delete / destructure slot / for-x head) is the canonical
    // `isMemberWriteHost`. `refPath.parentPath` is the `c[k]` MemberExpression path
    return isMemberWriteHost(refPath?.parentPath);
  }

  function defaultAliasRefClassifier(parent, refNode, refPath) {
    // a dynamic computed-key write is an unenumerable mutation channel - leak before the
    // member-receiver shortcut would otherwise treat it as trivial
    if (isDynamicComputedKeyWrite(parent, refNode, refPath)) return 'leak';
    if (isMemberRefReceiver(parent, refNode)) return 'trivial';
    // type-only positions (`export type { X }` / `export { type X }`, `class implements
    // Foo<X>` heritage) are tsc-elided at runtime - reference doesn't escape the module so
    // closure-narrow stays in scope. shared helper covers both declaration-level and
    // per-specifier `exportKind` and the implements-heritage walk
    if (refPath && isTSTypeOnlyIdentifierPath(refPath)) return 'trivial';
    if (parent?.type === 'VariableDeclarator' && parent.init === refNode && parent.id?.type === 'Identifier') {
      return 'alias';
    }
    // VariableDeclarator destructure init `const {x} = o` / `const [x] = o` - destructure
    // only reads named/indexed properties off `o`, no mutation channel. equivalent to a
    // bag of `o.x` / `o[N]` member-receiver reads
    if (parent?.type === 'VariableDeclarator' && parent.init === refNode
      && (parent.id?.type === 'ObjectPattern' || parent.id?.type === 'ArrayPattern')) return 'trivial';
    // for-of / for-in iteration source: `for (const x of o) {}` invokes
    // `o[Symbol.iterator]()`; `for (const k in o) {}` reads enumerable keys. neither
    // mutates `o` through any standard channel
    if (isForXStatement(parent) && parent.right === refNode) return 'trivial';
    // obj is the target of a WRITE that rebinds the binding, not a leaking read - a constantViolation
    // babel drops from `referencePaths` (the estree-toolkit program-index collects writes, so neutralize
    // to match). covers any AssignmentExpression LHS: direct (`o = v`, `o += v`, `o ||= v`) or
    // destructuring (`({ o } = v)`, `([o] = v)`), operator irrelevant - a compound write still coerces +
    // rebinds. a for-of / for-in head counts ONLY when it destructures (`for ({ o } of v)`); babel keeps
    // a simple head (`for (o of v)`) as a reference, so that path stays a leak
    const writeSlot = patternSlotHost(refNode, refPath);
    if (writeSlot && writeSlot.host.left === writeSlot.node) {
      const hostType = writeSlot.host.type;
      if (hostType === 'AssignmentExpression'
        || (writeSlot.node !== refNode && (hostType === 'ForOfStatement' || hostType === 'ForInStatement'))) {
        return 'trivial';
      }
    }
    // pass-through to a known-built-in static at a non-mutating arg slot doesn't escape:
    // `JSON.stringify(obj)`, `Object.keys(obj)`, `Object.assign(target, obj)`, `f(...obj)`,
    // `[...obj]`, `{...obj}` - all routed through the helper which unwraps SpreadElement
    // and consults the callee's mutatesArgument profile
    if (isKnownNonMutatingCallSite(parent, refNode, refPath)) {
      // identity-returning callees (`Object.freeze(o)` returns o) alias the argument through the
      // call RESULT: a held result re-exposes the object outside the closure's name set (writes
      // and method extraction through it are invisible), so only a discarded call stays trivial
      return heldIdentityReturningResult(parent, refNode, refPath) ? 'leak' : 'trivial';
    }
    return 'leak';
  }

  // known callees that RETURN their first argument. `Object.assign` / `defineProperty` also do,
  // but their target slot is already a mutating-arg leak - only the non-mutating identity
  // returners need the held-result check. `Reflect.setPrototypeOf` returns a boolean - excluded
  const IDENTITY_RETURNING_STATIC_CALLEES = new Set([
    'Object.freeze',
    'Object.preventExtensions',
    'Object.seal',
    'Object.setPrototypeOf',
  ]);
  function heldIdentityReturningResult(parent, refNode, refPath) {
    if (parent?.type !== 'CallExpression' && parent?.type !== 'OptionalCallExpression') return false;
    // `refNode` is the walker-peeled OUTERMOST wrapper - the argument node itself
    if (parent.arguments?.[0] !== refNode) return false;
    const pair = resolveStaticCalleePair(parent.callee, refPath?.scope);
    if (!pair || !IDENTITY_RETURNING_STATIC_CALLEES.has(`${ pair.constructor }.${ pair.method }`)) return false;
    const ctx = peelTransparentExprAncestorPath(refPath?.parentPath)?.parentPath?.node;
    if (ctx?.type === 'ExpressionStatement') return false;
    if (ctx?.type === 'UnaryExpression' && ctx.operator === 'void') return false;
    return true;
  }

  function classBindingRefClassifier(parent, refNode, refPath) {
    const base = defaultAliasRefClassifier(parent, refNode, refPath);
    if (base !== 'leak') return base;
    if (parent?.type === 'NewExpression' && parent.callee === refNode) return 'trivial';
    if ((parent?.type === 'ClassDeclaration' || parent?.type === 'ClassExpression')
      && parent.superClass === refNode) return 'trivial';
    if (parent?.type === 'BinaryExpression' && parent.operator === 'instanceof' && parent.right === refNode) return 'trivial';
    // type-position references are erased at runtime - they don't mutate static state.
    // covers TS (`Config<T>`, `typeof Config.items`, `Config | string`, ...) and Flow
    // (`Config<T>` GenericTypeAnnotation, `NS.Config` QualifiedTypeIdentifier, `typeof Config`
    // TypeofTypeAnnotation, `class implements Config`, `Declare*` id slots, etc.).
    // TS_EXPR_WRAPPERS (TSAsExpression / Flow's TypeCastExpression / etc.) wrap RUNTIME
    // expressions and ARE write channels - excluded from the type-position set
    if (isTypePositionParent(parent?.type)) return 'trivial';
    return 'leak';
  }

  // stricter classifier for the ARRAY-ELEMENT narrow (`const a = [{...}]`, the tracked object is an
  // ELEMENT). the default treats `a[i]` as a trivial member-receiver - true for the array binding, but the
  // READ RESULT `a[i]` IS the tracked element: if it is HELD (`sink(a[i])` / `return a[i]` / `b = a[i]`)
  // the element escapes, even though reading the array doesn't leak the array binding. `a[i].m()` keeps it
  // local (the element is dereferenced, not held). computed-only - `a.length` / `a.map` are not elements.
  // NOT usable as the default: an OBJECT-field read `foo(obj[k])` must stay trivial (the field VALUE
  // escapes, not `obj`) - only an array's element-read aliases the tracked object out
  // is a member access the callee of a DIRECT call (`o.read(...)` / `o.read?.()` / `(o.read as any)()`)?
  // that is the only use of an own-this method read that keeps `this` bound to the receiver: a held
  // read, `.call/.apply/.bind` chains and a sequence-detached callee (`(0, o.read)()`) all rebind.
  // `memberPath` is the member's path; wrappers above it peel like `classifyClosureRef`'s call check
  function memberUseIsDirectCall(memberPath) {
    const outer = peelTransparentExprAncestorPath(memberPath);
    const ctx = outer?.parentPath?.node;
    // the callee slot may hold the wrapper (`(o.read as any)()`) - unwrap DOWN to the member for
    // the identity check; a reference-preserving paren / cast callee keeps `this` = the receiver
    return (ctx?.type === 'CallExpression' || ctx?.type === 'OptionalCallExpression')
      && unwrapRuntimeExpr(ctx.callee) === memberPath?.node;
  }
  // does a member READ off the tracked object hand out an own-this method? a resolvable key leaks
  // when it names a method and the read is neither a direct call nor discarded; a dynamic key could
  // name ANY method, so it applies whenever the object has one (or hides one behind an untrackable
  // key). a DISCARDED read (`c[k];` statement / `void c[k]`) cannot hold the function - no rebind
  function methodReadLeaks(memberNode, memberPath, methodInfo) {
    if (!ownThisMethodKeyMatches(methodInfo, memberReadKeyName(memberNode))) return false;
    if (memberUseIsDirectCall(memberPath)) return false;
    const ctx = peelTransparentExprAncestorPath(memberPath)?.parentPath?.node;
    if (ctx?.type === 'ExpressionStatement') return false;
    if (ctx?.type === 'UnaryExpression' && ctx.operator === 'void') return false;
    return true;
  }
  // does a destructuring pattern bind an own-this method at its TOP level (`const { read } = o` /
  // `{ read: m }` target / a rest that scoops the remaining props / an untrackable computed key)?
  // deeper pattern levels index into FIELD values and cannot reach the object's methods
  function patternBindsMethodKey(pattern, methodInfo) {
    if (pattern?.type !== 'ObjectPattern') return false;
    for (const p of pattern.properties ?? []) {
      if (p.type === 'RestElement' || p.type === 'SpreadElement') return true;
      const key = propertyKeyName(p);
      // an untrackable pattern key could name any method; a resolvable key only a known one
      if (key === null || key === undefined) {
        if (methodInfo.methodKeys.size || methodInfo.unknownKey) return true;
      } else if (methodInfo.methodKeys.has(key)) return true;
    }
    return false;
  }
  // callee -> argument indices at which an object's function-valued properties can neither
  // escape nor be reached through the call: pure key / flag readers, string serialization
  // (functions are skipped; `toJSON` runs with the object itself as `this`), and prototype
  // surgery TARGET slots. positions matter: `Object.setPrototypeOf(x, o)` with o as the PROTO
  // arg makes x inherit o's methods (`x.read()` rebinds `this`), so only the target slot is
  // safe. any other callee / slot a method-bearing object reaches may hand a method out
  // (`Object.values` exposes property values, `Object.assign` copies them onto the target, a
  // descriptor read exposes accessor functions) - the base's non-mutating trivial is
  // overridden in the bias-safe direction
  const METHOD_SAFE_STATIC_CALLEE_SLOTS = new Map([
    // value / replacer / space: functions are skipped, a replacer array is read as key strings
    ['JSON.stringify', [0, 1, 2]],
    ['Object.freeze', [0]],
    ['Object.getOwnPropertyNames', [0]],
    ['Object.getOwnPropertySymbols', [0]],
    ['Object.getPrototypeOf', [0]],
    ['Object.keys', [0]],
    ['Object.preventExtensions', [0]],
    ['Object.seal', [0]],
    ['Object.setPrototypeOf', [0]],
    ['Reflect.getPrototypeOf', [0]],
    ['Reflect.has', [0, 1]],
    ['Reflect.ownKeys', [0]],
    ['Reflect.setPrototypeOf', [0]],
  ]);
  // wrap a base classifier with the own-this method-extraction gate: any channel that can HOLD one
  // of the object's methods rebinds `this` at a later invocation, so the this-field narrow premise
  // breaks and the closure must die. gated channels: a held method read (dotted / static-computed /
  // dynamic), a top-level destructure of a method key or rest, an object-spread copy (`{ ...o }`
  // shares the method bodies with a foreign receiver - array / call spread only ITERATES, which
  // cannot reach named methods), and call / new argument positions outside the method-safe table.
  // `prototypeInfo` (class flavor) gates the `C.prototype` hop the same way: a held
  // `C.prototype.<instanceMethod>` read - or `C.prototype` itself held - hands instance methods out
  function makeMethodAwareRefClassifier(base, { methodInfo, prototypeInfo }) {
    return function (parent, refNode, refPath) {
      if (isMemberRefReceiver(parent, refNode)) {
        if (methodInfo && methodReadLeaks(parent, refPath?.parentPath, methodInfo)) return 'leak';
        if (prototypeInfo && memberReadKeyName(parent) === 'prototype'
          && prototypeReadLeaks(refPath?.parentPath, prototypeInfo)) return 'leak';
      }
      if (!methodInfo) return base(parent, refNode, refPath);
      if (parent?.type === 'SpreadElement' && (methodInfo.methodKeys.size || methodInfo.unknownKey)
        && refPath?.parentPath?.parent?.type === 'ObjectExpression') return 'leak';
      if (parent?.type === 'VariableDeclarator' && parent.init === refNode
        && patternBindsMethodKey(parent.id, methodInfo)) return 'leak';
      // the walker hands `refNode` as the OUTERMOST wrapper, so a cast-wrapped argument
      // (`Object.setPrototypeOf(x, o as any)`) IS the argument node - compare by identity
      if ((parent?.type === 'CallExpression' || parent?.type === 'NewExpression'
        || parent?.type === 'OptionalCallExpression')
        && parent.arguments?.includes(refNode)) {
        const pair = resolveStaticCalleePair(parent.callee, refPath?.scope);
        const safeSlots = pair && METHOD_SAFE_STATIC_CALLEE_SLOTS.get(`${ pair.constructor }.${ pair.method }`);
        if (!safeSlots) return 'leak';
        const argIndex = parent.arguments.indexOf(refNode);
        // a preceding spread shifts runtime positions - the slot cannot be proven safe
        for (let i = 0; i < argIndex; i++) if (parent.arguments[i]?.type === 'SpreadElement') return 'leak';
        if (!safeSlots.includes(argIndex)) return 'leak';
      }
      return base(parent, refNode, refPath);
    };
  }
  // `C.prototype` read on a method-bearing class: a member continuation runs the method-read gate
  // against the INSTANCE method set (`C.prototype.read` held -> leak, direct call / discard / other
  // key -> local); a non-member use holds the prototype object itself (`const p = C.prototype` /
  // an argument) - every instance method is then one read away, so leak unless discarded
  function prototypeReadLeaks(protoMemberPath, prototypeInfo) {
    const outer = peelTransparentExprAncestorPath(protoMemberPath);
    const next = outer?.parentPath?.node;
    if (isMemberRefReceiver(next, outer?.node)) return methodReadLeaks(next, outer.parentPath, prototypeInfo);
    if (!prototypeInfo.methodKeys.size && !prototypeInfo.unknownKey) return false;
    if (next?.type === 'ExpressionStatement') return false;
    if (next?.type === 'UnaryExpression' && next.operator === 'void') return false;
    return true;
  }
  // classifier for a NESTED anon: `fieldPath` is its slot path inside the carrier binding (`[{index}]` array
  // slot / `[{key}]` object field, outermost-first). the anon stays local ONLY when its OWN slot read
  // (`a[i]` / `o.wrap` / `a[i][j]` / `o.a.b`) is DEREFERENCED to a member / call (`a[i].m()` / `o.wrap.read()`);
  // a HELD slot read (`sink(a[i])` / `sink(o.wrap)`) aliases it out. a reference that does NOT follow the slot
  // path could still expose the whole carrier - iteration, spread, a destructure, a method call on the
  // binding; a structural read / a DIFFERENT field doesn't reach the anon, so the shared default decides
  function makeNestedAnonAliasRefClassifier(fieldPath, methodInfo) {
    return function (parent, refNode, refPath) {
      let access = refPath;
      let matched = true;
      for (const step of fieldPath) {
        // paren / TS wrappers between steps (`(o.a as any).b` - both parsers; `(o.a).b` - oxc keeps the
        // paren) are runtime-transparent: peel so the interposed cast doesn't drop the slot match and
        // fall a held read through to the default's trivial member-receiver verdict
        const outer = peelTransparentExprAncestorPath(access);
        const member = outer?.parentPath?.node;
        // a COMPUTED read (`a[i]` array slot / `o["wrap"]` / `o[0]` / dynamic `o[k]`) could extract this slot,
        // so it matches conservatively; a DOTTED read matches only its own key, keeping a different field
        // (`o.count`) provably-local
        const stepOk = isMemberRefReceiver(member, outer?.node) && (member.computed
          || (!step.index && member.property?.type === 'Identifier' && member.property.name === step.key));
        if (!stepOk) {
          matched = false;
          break;
        }
        access = outer.parentPath;
      }
      if (matched) {
        const outer = peelTransparentExprAncestorPath(access);
        const use = outer?.parentPath?.node;
        // the matched slot as the target of a plain `=` (the store that placed the anon there / a later
        // overwrite) doesn't READ the slot - the stored value's own escape is analyzed at its source.
        // compound / logical assigns also produce the slot's value, so they stay on the held-read verdict
        if (use?.type === 'AssignmentExpression' && use.operator === '=' && use.left === outer?.node) return 'trivial';
        if (!isMemberRefReceiver(use, outer?.node)) return 'leak';
        // the continuation member reads a member of the ANON itself: a held own-this method read
        // hands out a this-rebindable function - same gate as the named-object classifier
        if (methodInfo && methodReadLeaks(use, outer.parentPath, methodInfo)) return 'leak';
        // a WRITE through the matched slot (`o.a.data = 5` / `o.a.data++` / `delete o.a.data` / a deeper
        // chain ending in a write) mutates the anon from OUTSIDE its this-scan - the zero-external-write
        // premise of the local narrow breaks, so bail; read-only dereferences stay local
        let memberPath = outer.parentPath;
        for (;;) {
          if (isMemberWriteHost(memberPath)) return 'leak';
          const memberOuter = peelTransparentExprAncestorPath(memberPath);
          if (!isMemberRefReceiver(memberOuter?.parentPath?.node, memberOuter?.node)) break;
          memberPath = memberOuter.parentPath;
        }
        return 'trivial';
      }
      if (isForXStatement(parent) && parent.right === refNode) return 'leak';
      if (parent?.type === 'SpreadElement') return 'leak';
      if (parent?.type === 'VariableDeclarator' && parent.init === refNode
        && (parent.id?.type === 'ObjectPattern' || parent.id?.type === 'ArrayPattern')) return 'leak';
      if (isMemberRefReceiver(parent, refNode)) {
        const memberOuter = peelTransparentExprAncestorPath(refPath?.parentPath);
        const use = memberOuter?.parentPath?.node;
        if ((use?.type === 'CallExpression' || use?.type === 'OptionalCallExpression') && use.callee === memberOuter?.node) {
          return 'leak';
        }
      }
      // the WHOLE carrier passed to a function (`Object.values(o)` / `Object.assign(t, o)` / `sink(o)`) may
      // hand the nested anon - or its values - out. this overrides the default's non-MUTATING trivials
      // (`Object.values` / `Object.entries` / `Object.assign`-source EXPOSE values without mutating), at the
      // cost of over-bailing a rare non-exposing call (`JSON.stringify(o)`) - the bias-safe direction
      if ((parent?.type === 'CallExpression' || parent?.type === 'NewExpression'
        || parent?.type === 'OptionalCallExpression') && parent.arguments?.includes(refNode)) return 'leak';
      return defaultAliasRefClassifier(parent, refNode, refPath);
    };
  }

  // recognise type-position parent node types where an Identifier child is a TYPE reference
  // (TS or Flow). TS shares a common `TS`-prefix; Flow uses suffix-based naming
  // (`*TypeAnnotation` / `*TypeIdentifier`) plus a small explicit set of declaration sites
  function isTypePositionParent(parentType) {
    if (!parentType || TS_EXPR_WRAPPERS.has(parentType)) return false;
    if (parentType.startsWith('TS')) return true;
    if (parentType.endsWith('TypeAnnotation') || parentType.endsWith('TypeIdentifier')) return true;
    if (parentType.startsWith('Declare')) return true;
    return parentType === 'ClassImplements'
      || parentType === 'InterfaceExtends'
      || parentType === 'TypeAlias'
      || parentType === 'OpaqueType'
      || parentType === 'InterfaceDeclaration'
      || parentType === 'TypeParameterDeclaration'
      || parentType === 'TypeParameterInstantiation';
  }

  // build the alias closure starting from `(rootBinding, rootName)`: every binding reachable
  // via `const alias = <existing-name-in-closure>` chains. returns Map<binding, name> on
  // success or null when a leak is detected (any reference of a closure name that isn't a
  // member-access AND isn't an alias-creation AND isn't a rebinding-to-the-binding-itself -
  // call args, returns, spread, `x[name]`, ... open mutation channels we can't enumerate)
  // OR when any closure name is module-exported (importer can mutate from outside).
  // `classifier` parametrizes what counts as trivial / alias / leak so class binding (relaxed
  // for `new C()` / `extends C` / `instanceof C` / TS types) and object-literal / instance
  // binding (strict) share the same walker.
  // binding identity (not name) is the cycle-guard and merge key: two sibling scopes both
  // declaring `const c = obj` would collide on name but each gets its own binding, so the
  // closure tracks both. shadow-loss avoided
  function computeAliasClosureFromBinding({
    rootBinding, rootName, anchorPath, classifier = defaultAliasRefClassifier, fieldPath = null,
    methodInfo, prototypeMethodInfo = null,
  }) {
    if (!rootBinding) return null;
    // the extraction gate needs the narrow target's own-this method set: the object literal itself
    // when the anchor IS one (named object / nested anon flows), or an explicit `methodInfo` from
    // the class-instance / class-static walkers whose anchor is the instance binding, not the shape
    const ownThisInfo = methodInfo ?? objectOwnThisMethodInfo(unwrapRuntimeExpr(anchorPath?.node));
    // a nested anon (`const a = [{...}]` / `const o = { f: {...} }`) is held by a slot of the binding, so a
    // held read of THAT slot aliases it out even though the binding stays local - swap in the path classifier
    if (fieldPath?.length) classifier = makeNestedAnonAliasRefClassifier(fieldPath, ownThisInfo);
    else if (ownThisInfo || prototypeMethodInfo) {
      classifier = makeMethodAwareRefClassifier(classifier, { methodInfo: ownThisInfo, prototypeInfo: prototypeMethodInfo });
    }
    const closure = new Map([[rootBinding, rootName]]);
    const queue = [{ name: rootName, binding: rootBinding }];
    while (queue.length) {
      const { name, binding } = queue.shift();
      const refs = collectBindingReferences(binding, name, anchorPath);
      if (!refs) return null;
      for (const ref of refs) {
        // peel TS expression wrappers AND ParenthesizedExpression between the ref and its
        // semantic context. for `(c as any).x`, ref.parent is TSAsExpression but the
        // SEMANTIC parent (which decides member-receiver / alias-init / leak) is the
        // outer MemberExpression; oxc additionally preserves the outer parens as
        // ParenthesizedExpression. walk upward through both runtime-transparent shapes
        // so the classifier sees the post-peel (parent, refNode) pair regardless of
        // wrapper choice, and TS-wrapped receivers / alias-inits don't fall through to 'leak'
        let refNode = ref.node;
        let refContext = ref;
        let { parent } = refContext;
        while (parent && (TS_EXPR_WRAPPERS.has(parent.type) || parent.type === 'ParenthesizedExpression')) {
          refNode = parent;
          refContext = refContext.parentPath;
          if (!refContext) break;
          parent = refContext.parent;
        }
        const kind = classifier(parent, refNode, refContext);
        if (kind === 'trivial') continue;
        if (kind === 'alias') {
          const aliasName = parent.id.name;
          const aliasBinding = refContext.scope?.getBinding(aliasName);
          if (!aliasBinding) return null;
          if (closure.has(aliasBinding)) continue;
          closure.set(aliasBinding, aliasName);
          queue.push({ name: aliasName, binding: aliasBinding });
          continue;
        }
        return null;
      }
    }
    // any closure binding declared via decl-as-export (`export const X = ...`) or named
    // `export default class X` exposes `X` to importers, who can mutate fields outside our
    // scan window. classifier-level leak detection only catches separate-spec exports
    // (`export { X }`) via the ExportSpecifier reference; declarator-id slots are excluded
    // from `binding.referencePaths`, so this post-build check covers the gap. soundness
    // contract: any export -> bail to no-narrow rather than emit unsound polyfill
    const exported = getExportedNames(findProgramPath(anchorPath));
    if (exported) {
      for (const name of closure.values()) if (exported.has(name)) return null;
    }
    return closure;
  }

  function reset() {
    exportedNamesCache = new WeakMap();
    programIndexCache = new WeakMap();
  }

  // cluster-private helpers (used only by other cluster functions, not by the factory
  // or other clusters): `getExportedNames` / `isBindingExportedByName` / `isMemberRefReceiver` /
  // `resolveStaticCalleePair` / `resolveKnownStaticEntry` / `isKnownNonMutatingCallSite` /
  // `defaultAliasRefClassifier` / `isTypePositionParent`
  return {
    buildProgramIndex,
    collectBindingReferences,
    classBindingName,
    isClassExported,
    isNewOfClass,
    isReceiverNewOfClass,
    objectBindingName,
    isReflectConstructCallee,
    classBindingRefClassifier,
    computeAliasClosureFromBinding,
    methodReadLeaks,
    reset,
  };
}
