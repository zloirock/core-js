// Destructuring + for-of binding resolution. given an Identifier inside an ArrayPattern /
// ObjectPattern (potentially nested), walks up to find what type-shape the binding receives.
// sources, tried in order:
//   1. a rest element at any depth (`[...rest]` is Array whatever the source is)
//   2. annotation on the pattern itself (`const { x }: { x: T }`)
//   3. annotation on the init expression (`const { x } = (init as { x: T })`)
//   4. runtime init value (`const [a] = ['x']`)
//   5. for-of iterable element type, annotated then runtime (`for (const { x } of items)`)
// a destructuring default (`const { x = T() } = ...`) is not a source of its own - it folds
// into whichever of the above answered, in `foldWithPatternDefault`
//
// For-of helpers double-duty for both annotated (`Iterable<T>` -> T) and runtime
// (`for (const x of 'hello')` -> string) cases. Promise unwrapping for `for await of`.
//
// Public surface mirrors the previous factory functions - external callers are heavy
// (resolveBindingType, type-query, plus various back-reference paths). `resolveNodeType`
// is late-bound via thunk since the cluster recurses into the main resolver.
import {
  $Object, $Primitive, PATTERN_WRAPPERS, argIndexForParam, canonicalArrayIndex, dropLeadingThisParam,
} from './base.js';
import {
  collectQualifiedSegments, isBareUndefinedIdentifier, isFunctionTypeNode, withMemberModifiers,
} from './ast-shapes.js';
import { assignLeft, assignRightKey, bindingCrossesLoopBackEdge } from './straight-line-flow.js';
import {
  declaratorBindsName,
  isVoidExpression,
  objectLiteralPrototypeValue,
  spreadAtOrBefore,
  effectiveArgsLength,
  patternSlotTarget,
  positionalElementPath,
  resolveCallArgument,
  resolveCallArgumentCoords,
  staleVarRedeclNodes,
  varInitStaleByRedecl,
  isDestructurePattern,
  anyWriteOutrunsUse,
  peelTransparentExprAncestorPath,
  positionDisposition,
  POSITION_CONSUMES,
  unwrapRuntimeExpr,
} from '../helpers/ast-patterns.js';
import { callPairing } from '../detect-usage/mutations.js';

// the class whose CONSTRUCTOR this function is, or null. one climb for both parsers: babel keeps
// the parameters on the `ClassMethod` that carries `kind`, estree nests a `FunctionExpression`
// under a `MethodDefinition` that does - so the member sits zero or one hop above the function
function constructorHostClass(fnPath) {
  for (let member = fnPath, hops = 0; member?.node && hops < 2; member = member.parentPath, hops++) {
    if (member.node.kind !== 'constructor') continue;
    // the member may stand at the top of a chain a caller built: neither hop above it need exist
    const classPath = member.parentPath?.parentPath;
    const type = classPath?.node?.type;
    return type === 'ClassDeclaration' || type === 'ClassExpression' ? classPath : null;
  }
  return null;
}

// the names a CONSTRUCTOR's callers spell. a constructor carries none of its own: every call
// spells the CLASS (`new C(...)`), an ordinary binding this same census reads. a class expression
// holds two, exactly like a named function expression - the inner id binds inside the body only,
// the declarator name is the one the outside uses - so both are scanned and only the outer one
// ACCOUNTS for the outside. a DECORATED class is skipped whole: a decorator returns the value the
// binding then holds, so `new C()` need not reach this constructor at all and the arguments the
// wrapper forwards are not in this file
function constructorCallerNames(fnPath) {
  const classPath = constructorHostClass(fnPath);
  if (!classPath || classPath.node.decorators?.length) return null;
  const sources = [];
  let outerNamed = classPath.node.type === 'ClassDeclaration' && classPath.node.id?.type === 'Identifier';
  if (classPath.node.id?.type === 'Identifier') {
    sources.push({ name: classPath.node.id.name, scope: classPath.scope, anchor: classPath });
  }
  // a class path a rewrite detached has no host to read the outer name off
  const host = classPath.parentPath;
  if (host?.node?.type === 'VariableDeclarator' && host.node.id.type === 'Identifier') {
    sources.push({ name: host.node.id.name, scope: host.scope, anchor: host });
    outerNamed = true;
  }
  return { sources, outerNamed };
}

// the positions from which a value can still reach a CALLER of the function it carries, and so
// the ones this census must not read as the end of it. an INVOCATION host is the case
// `invocationPairingAt` owns; a MEMBER read is the arm the position enumeration hands back to its
// caller, and here it always can hand an invoker out - `f.call` / `f.apply` / `f.bind` invoke the
// function, and `f.prototype.constructor` and an INSTANCE's `.constructor` ARE it. every other
// position the enumeration calls CONSUMES is evaluated where it stands and unreachable
// afterwards, so no call can be spelled through it. asked of a reference to the function and of
// an object the function CONSTRUCTED alike - both carry the same identity onward
const CALLER_REACHING_PARENT_TYPES = new Set([
  'CallExpression',
  'MemberExpression',
  'NewExpression',
  'OptionalCallExpression',
  'OptionalMemberExpression',
]);

function valueIsDroppedAt(path) {
  // the peel runs off the top of the tree, where there is no position left to dispose of the value
  const outer = peelTransparentExprAncestorPath(path);
  const parentPath = outer?.parentPath;
  const parent = parentPath?.node;
  if (!parent || CALLER_REACHING_PARENT_TYPES.has(parent.type)) return false;
  return positionDisposition(parent, outer.node, parentPath) === POSITION_CONSUMES;
}

export function createPatternBindings({
  t,
  getScopeBinding,
  resolveObjectFieldFlow,
  violationToAssignment,
  babelNodeType,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveInnerType,
  commonType,
  foldUnionTypes,
  isNullableOrNever,
  isNullishInit,
  anchorPathScope,
  findAllEnumDeclarations,
  resolveEnumMemberType,
  findTypeMember,
  substituteTypeParams,
  followTypeAliasChain,
  promiseRefInner,
  unwrapPromise,
  unwrapTypeAnnotation,
  findExpressionAnnotation,
  extractElementAnnotation,
  resolveElementType,
  findTupleElement,
  resolveObjectMember,
  resolveMemberOfObjectPath,
  walkObjectLiteralPropertyPath,
  isGetterFreshLiteral,
  resolveTypeAnnotation,
  resolveComputedKeyName,
  getKeyName,
  findLastStraightLineAssignment,
  resolveStaleRedeclSliceType,
  withLookupPath,
  functionTypeParams,
  collectBindingReferences,
  violationRunsDeferred,
  usageRunsDeferred,
}) {
  // dispatch by pattern kind so callers (and the recursive child walks below) don't repeat
  // the type-test pair. unknown kinds return null - caller signals "binding not found here"
  function findPatternKeyPath(pattern, name, scope) {
    if (pattern?.type === 'ObjectPattern') return findDestructuredKeyPath(pattern, name, scope);
    if (pattern?.type === 'ArrayPattern') return findArrayPatternKeyPath(pattern, name, scope);
    return null;
  }

  // does this rest slot bind `name` DIRECTLY? a rest whose argument is a PATTERN
  // (`function f(...[s])`, `const [...{ 0: s }] = a`) does NOT: the name is a slot inside the
  // slice, so answering the slice's own family for it narrows to the wrong one - a string
  // argument read as an Array throws on a target that lacks the method. five sites asked this
  // question by hand and the rest-PARAMETER branch was the one that forgot
  function restBindsNameDirectly(node, name) {
    return node?.type === 'RestElement' && node.argument?.type === 'Identifier'
      && node.argument.name === name;
  }

  // walk ArrayPattern elements for a target binding, returning index-prefixed key path.
  // sentinel conventions:
  //   - null              not found
  //   - [-(i + 1)]        found in the rest element at position i (a slice, not an index)
  //   - [i, ...sub]       found at index i (possibly nested)
  // `findPatternIndex` below uses `-1` with a DIFFERENT meaning ("not found" scalar); the
  // return shape (array vs scalar) disambiguates at call sites
  function findArrayPatternKeyPath(arrayPattern, name, scope) {
    for (let i = 0; i < (arrayPattern.elements?.length ?? 0); i++) {
      const el = arrayPattern.elements[i];
      if (!el) continue;
      // rest: [...x] is always Array - signal via negative index so callers know.
      // `-1` = position-0 rest (may alias the WHOLE RHS); a later-positioned rest binds a
      // SLICE, encoded `-(i + 1)` so a slice can never claim whole-RHS coverage downstream
      if (el.type === 'RestElement') {
        if (restBindsNameDirectly(el, name)) return [-(i + 1)];
        // nested ArrayPattern inside rest (`[a, ...[head]] = arr`). the rest slice has
        // the same element type as the source; an inner positional access at `j` then maps
        // to source index `i + j` (rest starts at outer position `i`)
        if (el.argument?.type === 'ArrayPattern') {
          const inner = findArrayPatternKeyPath(el.argument, name, scope);
          if (inner && typeof inner[0] === 'number' && inner[0] >= 0) {
            return [i + inner[0], ...inner.slice(1)];
          }
        }
        // nested ObjectPattern in rest (`const [...{ length }] = arr`) reads a key off the
        // rest Array. signal `[-(i + 1), ...inner]` - the same slice encoding as above, and the
        // resolver bails on ANY negative head with a non-empty inner path rather than mis-narrow
        // the key as the Array itself (resolving it precisely - e.g. `length` -> number, numeric
        // -> element - needs the source element type)
        if (el.argument?.type === 'ObjectPattern') {
          const inner = findDestructuredKeyPath(el.argument, name, scope);
          if (inner) return [-(i + 1), ...inner];
        }
        continue;
      }
      const unwrapped = patternSlotTarget(el);
      if (unwrapped?.type === 'Identifier' && unwrapped.name === name) return [i];
      const inner = findPatternKeyPath(unwrapped, name, scope);
      if (inner) return [i, ...inner];
    }
    return null;
  }

  // `{ a: { b: c } }`, target `c` -> `['a', 'b']`. nested ObjectPatterns / ArrayPatterns
  // walked through `findPatternKeyPath` so both child kinds use one dispatch path
  function findDestructuredKeyPath(objectPattern, name, scope) {
    for (const prop of objectPattern.properties) {
      if (babelNodeType(prop) !== 'ObjectProperty') continue;
      const key = prop.computed ? resolveComputedKeyName(prop.key, scope) : getKeyName(prop.key);
      if (key === null) continue;
      const value = patternSlotTarget(prop.value);
      if (value?.type === 'Identifier' && value.name === name) return [key];
      const inner = findPatternKeyPath(value, name, scope);
      if (inner) return [key, ...inner];
    }
    return null;
  }

  // resolve the type of a destructuring default: const { items = [] } = obj or const [a = []] = arr.
  // recurses into nested ObjectPatterns / ArrayPatterns - `const { a: { b = [] } } = obj`
  // resolving `b` finds the depth-2 default that one-level walk missed
  function findDestructuringDefaultPath(pattern, varName, bindingPath) {
    const patternPath = bindingPath.node === pattern ? bindingPath
      : bindingPath.node.id === pattern ? bindingPath.get('id')
      : bindingPath.node.left === pattern ? bindingPath.get('left') : null;
    if (!patternPath) return null;
    return walkDestructuringForDefault(patternPath, pattern, varName);
  }

  // the binding's runtime value is `member ?? default`, so its type is the FOLD of both sides
  // (mirroring resolveDesugarDefaultTernary): an unresolvable side keeps the generic dispatch -
  // returning the default's type alone narrowed a foreign-typed member to the default's flavor
  // (dropped es.string.at for a string member with an array default), and the member's type
  // alone dropped the default's flavor symmetrically
  function foldWithPatternDefault(memberType, pattern, varName, bindingPath) {
    const defaultPath = findDestructuringDefaultPath(pattern, varName, bindingPath);
    if (!defaultPath) return memberType;
    const presence = staticMemberPresence(pattern, varName, bindingPath);
    // a statically PRESENT member (`const [a = 0] = ['x']`) keeps the default DEAD - the
    // member's type alone is precise. `staticMemberPresence` is purely SYNTACTIC (any
    // non-`undefined` value node reads as present), so a mayBeNullish member value
    // (`{ a: maybe }` with `maybe: string | undefined`) must not shortcut here - at runtime
    // the default still fires on the nullish path, and the member's type alone narrows to
    // the wrong family; fall through to the member x default fold instead
    if (memberType && presence === 'present' && !memberType.mayBeNullish) return memberType;
    const defaultType = resolveNodeType(defaultPath);
    // a statically ABSENT member (`const [a = 'x'] = []`, `const { a = 'x' } = {}`) means the
    // default always fires - its type alone is precise
    if (defaultType && presence === 'absent') return defaultType;
    if (!memberType || !defaultType) return null;
    if (isNullableOrNever(memberType)) return defaultType;
    return commonType(memberType, defaultType);
  }

  // TOP-LEVEL literal inits only: decide whether the member is statically PRESENT (a direct
  // literal carries a defined value at the slot - the default is dead) or statically ABSENT
  // (out of range / hole / missing key - the default always fires). a literal `undefined`
  // value counts as absent. nested patterns, spreads, computed keys and dynamic inits stay
  // undecided (null -> the member x default fold)
  function staticMemberPresence(pattern, varName, bindingPath) {
    if (!t.isVariableDeclarator(bindingPath.node)) return null;
    const { init } = bindingPath.node;
    // a SHADOWED `undefined` is an ordinary value, so the slot is present and its default stays
    // dead - the same scope gate every other bare-`undefined` read in this file applies
    const undefinedShadowed = !!getScopeBinding(bindingPath.scope, 'undefined');
    function valuePresence(value) {
      if (!value) return 'absent';
      if (isBareUndefinedIdentifier(value) && !undefinedShadowed) return 'absent';
      if (isVoidExpression(value)) return 'absent';
      return 'present';
    }
    if (pattern.type === 'ArrayPattern' && init?.type === 'ArrayExpression') {
      const index = findPatternIndex(pattern, varName);
      if (index < 0) return null;
      if (!resolveCallArgumentCoords(init.elements, index)) return spreadAtOrBefore(init.elements, index) ? null : valuePresence(undefined);
      return valuePresence(resolveCallArgument(init.elements, index));
    }
    if (pattern.type === 'ObjectPattern' && init?.type === 'ObjectExpression') {
      const keyPath = findDestructuredKeyPath(pattern, varName, bindingPath.scope);
      if (keyPath?.length !== 1 || typeof keyPath[0] !== 'string') return null;
      if (init.properties.some(prop => prop.type === 'SpreadElement' || prop.computed)) return null;
      // a literal that installs a PROTOTYPE can supply the key without owning it, so a missing own
      // property is no longer proof the default fires - the same reason a spread leaves this
      // undecided one line above. answering 'absent' there took the default's flavor over the
      // inherited value's, which is a wrong family rather than a coarse one
      if (objectLiteralPrototypeValue(init)) return null;
      // match via the SAME canonical `getKeyName` the pattern side used to build `keyPath`, so a
      // numeric key `{ 0: ... }` (stringified to `'0'` by getKeyName) matches its path entry - a raw
      // `prop.key.value` probe compared the number `0` against the string `'0'` and judged it absent.
      // findLast honours ECMAScript last-property-wins for duplicate keys. deliberately NOT
      // findObjectMember: that one answers "which node supplies the read TYPE" and hands back the
      // getter paired with a trailing setter, while the question here is "is a defined value
      // present", which an accessor leaves undecided (handled just below)
      const match = init.properties.findLast(prop => getKeyName(prop.key) === keyPath[0]);
      // a method / accessor property (babel ObjectMethod; estree Property with a get / set /
      // method kind) carries a defined value the plain `.value` probe cannot see - stay
      // undecided so the member x default fold keeps both sides (a false 'absent' narrowed a
      // getter-supplied array to the default's string flavor)
      if (match && (match.type === 'ObjectMethod' || match.method === true || (match.kind && match.kind !== 'init'))) return null;
      return valuePresence(match?.value);
    }
    return null;
  }

  function walkDestructuringForDefault(patternPath, pattern, varName) {
    const children = patternPath.get(pattern.properties ? 'properties' : 'elements');
    for (const child of children) {
      if (!child.node) continue;
      const valuePath = babelNodeType(child.node) === 'ObjectProperty' ? child.get('value') : child;
      if (t.isAssignmentPattern(valuePath.node)) {
        if (valuePath.node.left?.type === 'Identifier' && valuePath.node.left.name === varName) {
          return valuePath.get('right');
        }
        // `{ a: { b = [] } = {} }` - the inner pattern is on `valuePath.left`, recurse there
        const innerLeft = valuePath.get('left');
        if (isDestructurePattern(innerLeft.node)) {
          const found = walkDestructuringForDefault(innerLeft, innerLeft.node, varName);
          if (found) return found;
        }
      } else if (isDestructurePattern(valuePath.node)) {
        const found = walkDestructuringForDefault(valuePath, valuePath.node, varName);
        if (found) return found;
      }
    }
    return null;
  }

  // resolve the type of a variable destructured from an ArrayPattern against an annotation.
  // covers two shapes uniformly:
  //   - top-level Identifier element: `[a]` -> findPatternIndex + tuple/array element type
  //   - nested pattern (`[{x}]`, `[[y]]`): top-level scan misses varName; key-path walk via
  //     `findArrayPatternKeyPath` against the same annotation reaches the leaf. without this
  //     branch, `for (const [{ x }] of items)` falls through to generic .at fallback while
  //     the symmetric object-outer / array-inner case (`for (const { arr: [x] } of items)`)
  //     resolves through resolveObjectBinding's collectPatternKeyPath
  // `index` is the caller's positional scan: it is pure in (pattern, name) while the key-path walk
  // below is not (a computed nested key reads `scope`), so only this half is shared across the
  // annotation sources the caller tries in turn
  function resolveArrayPatternBinding({ arrayPattern, varName, annotation, scope, index }) {
    if (index >= 0) {
      const unwrapped = unwrapTypeAnnotation(annotation);
      if (!unwrapped) return null;
      const tupleElem = findTupleElement(unwrapped, index, scope);
      if (tupleElem) return resolveTypeAnnotation(tupleElem, scope);
      return resolveElementType(unwrapped, scope, 0);
    }
    const keyPath = findArrayPatternKeyPath(arrayPattern, varName, scope);
    if (!keyPath) return null;
    return resolveAnnotatedMemberPath(annotation, keyPath, scope);
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
      const id = patternSlotTarget(element);
      if (id?.type === 'Identifier' && id.name === varName) return i;
    }
    return -1;
  }

  // resolve the type of a specific element in an ArrayExpression by index
  // arrayPath must already be a resolved ArrayExpression path
  function resolveArrayLiteralElement(arrayPath, index) {
    const element = positionalElementPath(arrayPath, index);
    return element ? resolveNodeType(element) : null;
  }

  // resolve common element type from an ArrayExpression if all elements share the same type
  // arrayPath must already be a resolved ArrayExpression path
  function resolveArrayLiteralCommonType(arrayPath) {
    const length = effectiveArgsLength(arrayPath.node.elements);
    if (!length) return null;
    let common = null;
    for (let i = 0; i < length; i++) {
      // a hole reads as no element - no common type through it
      const element = positionalElementPath(arrayPath, i);
      const resolved = element && resolveNodeType(element);
      if (!resolved) return null;
      common = commonType(common, resolved);
      if (!common) return null; // mixed types
    }
    return common;
  }

  // fold a destructured key's type across EVERY element of a for-of array-literal iterable, not
  // just the first: `for (const { x } of [{ x: "a" }, { x: [1] }])` must surface `x` as the common
  // type, else narrowing to the leading string would unsoundly drop the array element's polyfill.
  // holes / spreads / an unresolvable element / mixed types -> null (caller bails to speculative)
  function resolveArrayLiteralMemberCommonType(arrayPath, keyPath) {
    const length = effectiveArgsLength(arrayPath.node.elements);
    if (!length) return null;
    let common = null;
    for (let i = 0; i < length; i++) {
      const element = positionalElementPath(arrayPath, i);
      if (!element) return null;
      // ... elements stay on the init-only read: the flow resolver has no alias closure for a slot
      // inside an array literal, so asking it there declines every narrow, held container or not
      const member = resolveObjectMemberPath(resolveRuntimeExpression(element), keyPath);
      if (!member) return null;
      common = commonType(common, member);
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

  // classify a rest binding at any depth of an array OR object destructuring: an array-rest (`[...v]`,
  // `[[...v]]`) always yields Array, an object-rest (`{...v}`, `[{...v}]`) always yields Object -
  // independent of the source type. recurses through BOTH pattern kinds symmetrically, so a rest
  // nested under the OTHER kind (`{ x: [{ ...v }] }`, `[{ y: [...v] }]`) is still classified; without
  // it such a rest falls through to the init / for-of element fallback and is mis-typed as the source
  function nestedRestType(pattern, varName) {
    if (pattern?.type === 'ObjectPattern') {
      for (const prop of pattern.properties) {
        if (restBindsNameDirectly(prop, varName)) {
          return new $Object('Object');
        }
        if (babelNodeType(prop) !== 'ObjectProperty') continue;
        const nested = nestedRestType(patternSlotTarget(prop.value), varName);
        if (nested) return nested;
      }
      return null;
    }
    if (pattern?.type !== 'ArrayPattern') return null;
    for (const el of pattern.elements ?? []) {
      if (!el) continue;
      let nested;
      if (el.type === 'RestElement') {
        if (restBindsNameDirectly(el, varName)) return new $Object('Array');
        nested = nestedRestType(el.argument, varName);
      } else {
        nested = nestedRestType(patternSlotTarget(el), varName);
      }
      if (nested) return nested;
    }
    return null;
  }

  // resolve array destructuring from any annotation source: pattern, init, or for-of iterable.
  // `resolveArrayPatternBinding` handles top-level Identifier AND nested-pattern element
  // shapes against a single annotation, so each annotation source needs just one call
  function resolveArrayBinding(arrayPattern, varName, bindingPath) {
    // array/object rest at any depth: `[...rest]`, `[[...rest]]`, `[{...rest}]` - depth-independent,
    // resolve before the init / for-of fallbacks which would mis-type it as the element type
    const restType = nestedRestType(arrayPattern, varName);
    if (restType) return restType;
    // ONE positional scan for every lane below - each annotation source re-derived it inside
    // `resolveArrayPatternBinding`, and the two runtime lanes scanned again on their own
    const index = findPatternIndex(arrayPattern, varName);
    // annotation on the pattern itself: function foo([a]: string[]) or const [a]: string[] = ...
    if (arrayPattern.typeAnnotation) {
      const result = resolveArrayPatternBinding({
        arrayPattern, varName, annotation: arrayPattern.typeAnnotation, scope: bindingPath.scope, index,
      });
      if (result) return result;
    }
    // annotation on the init expression: const [a] = typedArr
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      const initInfo = findExpressionAnnotation(bindingPath.get('init'));
      if (initInfo) {
        const initResult = resolveArrayPatternBinding({
          arrayPattern, varName, annotation: initInfo.annotation, scope: initInfo.scope, index,
        });
        if (initResult) return initResult;
      }
      // runtime init: resolve through variables to the actual value
      const initPath = resolveRuntimeExpression(bindingPath.get('init'));
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
    // for-of iterable: for (const [a] of typedArr) / nested: for (const [{ x }] of typedArr)
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) {
      const elemResult = resolveArrayPatternBinding({
        arrayPattern, varName, annotation: elemInfo.annotation, scope: elemInfo.scope, index,
      });
      if (elemResult) return elemResult;
    }
    // runtime: for (const [a] of 'hello') or for (const [k, v] of urlParams.entries()). the
    // element's inner type is the binding type only for a DIRECT positional element - a nested
    // or rest binding (rest handled above) must not pick up the iterable element type here
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node) && index >= 0) {
      // resolve for-of element, then unwrap one more level for array destructuring
      const inner = resolveInnerType(resolveForOfResolvedElement(forOfPath));
      if (inner) return inner;
    }
    return null;
  }

  function resolveAnnotatedMember(annotation, keyName, scope, depth = 0) {
    const unwrapped = unwrapTypeAnnotation(annotation);
    if (!unwrapped) return null;
    // `typeof Enum` in annotation position - member access on the enum object yields the
    // enum value kind. findTypeMember doesn't walk TSTypeQuery bodies, so dispatch here
    if (unwrapped.type === 'TSTypeQuery') {
      const segments = collectQualifiedSegments(unwrapped.exprName);
      const rootName = segments?.[0];
      if (rootName && segments.length === 1) {
        // TS merges enum blocks - the member may live in any block
        const type = resolveEnumMemberType(findAllEnumDeclarations(rootName, scope), keyName);
        if (type) return type;
      }
    }
    const memberType = findTypeMember({ objectType: unwrapped, key: keyName, scope });
    if (!memberType) return null;
    // key the subst by the CHAIN's terminal alias (capture-avoiding), not the top alias: a
    // destructured member of `Outer<string>` where `type Outer<A> = Inner<A>` belongs to Inner, so
    // its default must resolve in Inner's scope instead of being captured by Outer's `A` binding
    const defaultMap = followTypeAliasChain(unwrapped, scope).subst;
    return defaultMap
      ? substituteTypeParams(memberType, defaultMap, scope, depth + 1)
      : resolveTypeAnnotation(memberType, scope, depth + 1);
  }

  // walk an annotation down a destructure key path, member by member, and stop at the annotation.
  // the Type-domain path below walks the same prefix and then resolves the LAST key into a Type;
  // the annotation lane in `call-resolution` walks the WHOLE path and keeps the annotation - the
  // two differ only in what the final step produces, so the walk itself lives here once
  function annotationAtKeyPath(annotation, keyPath, scope) {
    let current = annotation;
    for (const key of keyPath) {
      const unwrapped = unwrapTypeAnnotation(current);
      if (!unwrapped) return null;
      current = findTypeMember({ objectType: unwrapped, key, scope });
      if (!current) return null;
    }
    return current;
  }

  // step through `['a', 'b']` against the annotation; final step goes through resolveAnnotatedMember.
  // `depth` is the caller's remaining budget: an annotation reached through a member chain can name
  // the chain's own host (`declare const o: { p: typeof o.p }`), and only the budget ends that loop
  function resolveAnnotatedMemberPath(annotation, keyPath, scope, depth = 0) {
    if (!keyPath?.length) return null;
    const prefix = annotationAtKeyPath(annotation, keyPath.slice(0, -1), scope);
    return prefix === null ? null : resolveAnnotatedMember(prefix, keyPath.at(-1), scope, depth);
  }

  // recursively unwrap Promise<T> annotation to T for for-await-of element types
  // mirrors runtime `await` semantics: Promise<Promise<T>> -> T. peel structural-Promise
  // synonyms (PromiseLike / Thenable) the same way - PROMISE_SYNONYMS aliases them at the
  // type-resolver level, but raw AST consumers (for-await-of element annotation, destructure)
  // need parallel peel so `for await (const x of asyncIter<PromiseLike<T>>)` reaches T
  function unwrapPromiseAnnotation(node) {
    let result = unwrapTypeAnnotation(node);
    while (true) {
      const inner = promiseRefInner(result);
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
  // `sourcePath`: the UNRESOLVED path the literal was reached through. an Identifier there means a
  // BINDING (`const { y: { at } } = box`), whose slots a writer or a holder can reach - and then the
  // read has to ask the same flow-aware resolver a member read of that slot asks. an inline literal
  // (a for-of element, a call argument) has no binding for a writer to go through, and there the
  // init type is the whole truth. the rule lives HERE, once, so no caller can spell it differently
  function resolveObjectMemberPath(objPath, keyPath, sourcePath = null) {
    // ... and a binding reached MID-WALK counts the same: an array WRAPPER hands the pattern an
    // element (`[{ y: { at } }] = [box]`), and the slot below that element is as reachable to a
    // writer as one below a binding named at the top. tracked as the walk descends, or the wrapper
    // spelling keeps the init's narrow where every other spelling of the same read folds the write
    let flowAware = sourcePath?.node?.type === 'Identifier';
    // the UNRESOLVED path the current container was reached through - what a member read of it
    // would stand on, for the step that has no literal to walk
    let rawPath = sourcePath ?? objPath;
    while (true) {
      if (keyPath.length === 0) return resolveNodeType(objPath);
      const [step] = keyPath;
      const rest = keyPath.slice(1);
      if (typeof step === 'number') {
        // -1 = rest element. with no further keys the binding IS the rest Array; a remaining
        // key-path (`const [...{ length }] = a`) reads off that Array, but resolving it precisely
        // needs the source element type - bail so the member doesn't mis-resolve as the Array
        if (step < 0) return rest.length ? null : new $Object('Array');
        if (!t.isArrayExpression(objPath.node)) return null;
        // the positional read `resolveArrayLiteralElement` makes, so this nested path matches the
        // top-level extraction semantics
        const elementPath = positionalElementPath(objPath, step);
        if (!elementPath) return null;
        flowAware ||= elementPath.node.type === 'Identifier';
        rawPath = elementPath;
        objPath = resolveRuntimeExpression(elementPath);
        keyPath = rest;
        continue;
      }
      // a STRING step may still name an array SLOT: the pattern side stringifies a numeric key
      // (`{ 0: ... }` -> '0') and the language reads that property off an array host. fold it back to
      // the index and re-enter, so the element read above - with its bounds and spread guards - is the
      // one place that resolves a slot, whichever spelling reached it
      const asIndex = canonicalArrayIndex(step);
      if (asIndex !== null && t.isArrayExpression(objPath.node)) {
        keyPath = [asIndex, ...rest];
        continue;
      }
      // no literal to walk: the container is a VALUE - a class instance, a call result, an annotated
      // binding - and the hop reads its member exactly as the flat spelling `c.data` does, so the
      // member canon answers for both. a hop PAST such a container has no path to descend and stays
      // unresolved, which is the member spelling's own answer for its second hop
      if (!t.isObjectExpression(objPath.node)) {
        return rest.length || !rawPath?.node ? null : resolveMemberOfObjectPath(rawPath, step, null);
      }
      // the FINAL slot read asks the flow-aware resolver, exactly as a member read of the same slot
      // does (`{ y: { at } } = box` reads what `box.y` reads): it folds every reachable write and
      // refuses a narrow the writer set makes unsound. reading the literal's own init here instead
      // made the nested spelling resolve NARROWER than the flat one - same source, two answers,
      // and the two emitters shipped different dispatchers once a route rewrote one into the other
      // ... and a literal a GETTER builds fresh per read is read off ITSELF: the writer fold has no
      // earlier caller to account for, which is the same answer the member spelling gives
      if (!rest.length) {
        return flowAware && !isGetterFreshLiteral(objPath.node)
          ? resolveObjectFieldFlow(objPath, step)
          : resolveObjectMember(objPath, step);
      }
      // the canonical stepper owns which slots are walkable - a plain value, and a getter through
      // its inline return; a hand-rolled `.value` read here answered null for every getter hop
      const valuePath = walkObjectLiteralPropertyPath(objPath, step);
      if (!valuePath?.node) return null;
      flowAware ||= valuePath.node.type === 'Identifier';
      rawPath = valuePath;
      objPath = resolveRuntimeExpression(valuePath);
      keyPath = rest;
    }
  }

  // try runtime object literal, then annotation-based resolution for a destructured member.
  // a BINDING source asks the flow-aware slot read for the same reason the nested pattern walk
  // does: `const { y } = box; y.at(0)` reads the slot `box.y.at(0)` reads, and a writer or a
  // holder of `box` unseats the narrow for both spellings or for neither
  function resolveDestructuredMember(exprPath, keyPath) {
    const runtimeResult = resolveObjectMemberPath(resolveRuntimeExpression(exprPath), keyPath, exprPath);
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
        // a REST element is not the value at its position - it collects a SLICE, so its
        // positive index would key the wrong element type (`[...{ at }]` read element 0).
        // the `-1` sentinel makes element-keyed consumers bail and rest-aware ones
        // resolve the slice as Array
        result.unshift(prev.node?.type === 'RestElement' ? -1 : idx);
      }
      prev = cur;
      cur = cur.parentPath;
    }
    return result;
  }

  function resolveObjectBinding(objectPattern, varName, bindingPath) {
    // a rest at any depth binds a fixed type independent of the source: `{ ...rest }` / `{ x: {...rest} }`
    // an Object, `{ x: [...rest] }` an Array, `{ x: [{ ...rest }] }` an Object. `nestedRestType` recurses
    // both pattern kinds; a single-level check would miss the array-nested forms and fall through to the
    // keyPath logic, leaving `rest` null. the narrowed type lets an `arg-is-object` / `arg-is-array` filter
    // subsume the polyfill when the user passes a provably non-primitive rest binding
    const restType = nestedRestType(objectPattern, varName);
    if (restType) return restType;
    // ONE key-path walk feeds the annotation lane and every runtime lane below it - the wrapper
    // this replaces re-asked the same (pattern, name, scope) question one line earlier
    const keyPath = findDestructuredKeyPath(objectPattern, varName, bindingPath.scope);
    if (!keyPath) return null;
    // annotation on the pattern: const { items }: { items: number[] } = ...
    if (objectPattern.typeAnnotation) {
      const result = resolveAnnotatedMemberPath(objectPattern.typeAnnotation, keyPath, bindingPath.scope);
      if (result) return result;
    }
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      // findDestructuredKeyPath already walks INTO nested ObjectPattern / ArrayPattern
      // children so the path is complete from the outer (declarator-id) pattern down to
      // the binding leaf. no prefix walk needed - the outer pattern IS the declarator's id
      const result = resolveDestructuredMember(bindingPath.get('init'), keyPath);
      if (result) return result;
    }
    const elemInfo = resolveForOfElementAnnotation(bindingPath);
    if (elemInfo) return resolveAnnotatedMemberPath(elemInfo.annotation, keyPath, elemInfo.scope);
    // runtime: for (const { name } of [{ name: [1,2,3] }])
    const forOfPath = findForLoopParent(bindingPath);
    if (t.isForOfStatement(forOfPath?.node)) {
      const iterPath = resolveRuntimeExpression(forOfPath.get('right'));
      if (t.isArrayExpression(iterPath.node)) {
        const folded = resolveArrayLiteralMemberCommonType(iterPath, keyPath);
        if (folded) return folded;
      }
    }
    return null;
  }

  function findBindingPattern(node, type) {
    if (node.type === type) return node;
    if (node.id?.type === type) return node.id;
    if (node.left?.type === type) return node.left;
    return null;
  }

  // the destructuring pattern a binding node carries, either kind, or null for a plain binding.
  // the annotation written on such a pattern describes the CONTAINER, so a consumer asking what
  // the BINDING is must walk the destructure key path instead of reading that annotation
  function bindingDestructuringPattern(node) {
    return findBindingPattern(node, 'ObjectPattern') ?? findBindingPattern(node, 'ArrayPattern');
  }

  // callback-param inference for unannotated arrow / function params passed as a call argument.
  // shape: `recv.method(arg => arg.X)` where `recv: Alias<Arg>` with `method(cb: (a: ParamT) => void)`.
  // `findTypeMember` deep-substitutes the receiver's alias type-args into the returned method
  // node, so the callback parameter slot already carries the concrete type before unwrap.
  // non-Identifier callee property, non-method member, or positional mismatch bail to null
  function inferCallbackParamType(bindingPath) {
    const fnPath = bindingPath.parentPath;
    if (!fnPath?.node || !t.isFunction(fnPath.node)) return null;
    // index in the this-dropped cb params, to align with the this-dropped cb-type param slots below
    const paramIndex = dropLeadingThisParam(fnPath.node.params)?.indexOf(bindingPath.node) ?? -1;
    if (paramIndex < 0) return null;
    const callPath = fnPath.parentPath;
    if (!callPath?.node) return null;
    const callType = babelNodeType(callPath.node);
    if (callType !== 'CallExpression' && callType !== 'OptionalCallExpression') return null;
    const argIndex = callPath.node.arguments?.indexOf(fnPath.node) ?? -1;
    if (argIndex < 0) return null;
    const callee = callPath.get('callee');
    // restrict to non-computed Identifier property to keep the inference deterministic. computed
    // / literal-string member keys would need full `getMemberProperty` semantics; not yet worth
    // the dep when no caller has tripped the gap
    const calleeNode = callee.node;
    if (calleeNode?.type !== 'MemberExpression' && calleeNode?.type !== 'OptionalMemberExpression') return null;
    if (calleeNode.computed || calleeNode.property?.type !== 'Identifier') return null;
    const propName = calleeNode.property.name;
    const objInfo = findExpressionAnnotation(callee.get('object'));
    if (!objInfo) return null;
    const receiver = unwrapTypeAnnotation(objInfo.annotation);
    if (!receiver) return null;
    const method = findTypeMember({ objectType: receiver, key: propName, scope: objInfo.scope });
    if (method?.type !== 'TSMethodSignature') return null;
    const cbParam = dropLeadingThisParam(functionTypeParams(method))?.[argIndex];
    const cbFnType = unwrapTypeAnnotation(cbParam?.typeAnnotation);
    if (!isFunctionTypeNode(cbFnType)) return null;
    const target = dropLeadingThisParam(functionTypeParams(cbFnType))?.[paramIndex];
    const annotation = unwrapTypeAnnotation(target?.typeAnnotation);
    if (!annotation) return null;
    return resolveTypeAnnotation(annotation, objInfo.scope);
  }

  // does this function's NAME leave the file, so that callers this module cannot see may pass an
  // arg? then a defaulted param's default type is not authoritative. two channels, one per host:
  //
  // an EXPORT. babel records the export as a reference (which bails the call-site scan below); the
  // oxc program-index fallback drops the export-specifier slot, so detect the export form directly
  // for cross-parser parity. covers declaration exports (`export function f` / `export default
  // function f` / `export const f = () =>`, reached via the decl wrappers) AND a separate
  // `export { f }` / `export default f` specifier elsewhere in the module.
  // a sloppy host opens no second hole: it is a CommonJS wrapper, whose top level is a function
  // body, so a declaration there keeps the narrow - `module.exports = f` is an assignment
  // reference the call-site scan already refuses
  function functionNameEscapesFile(fnPath, fnName) {
    let program = null;
    for (let p = fnPath.parentPath; p; p = p.parentPath) {
      const type = p.node?.type;
      if (type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration') return true;
      if (t.isProgram(p.node)) {
        program = p;
        break;
      }
    }
    if (!program) return false;
    if (!fnName) return false;
    for (const stmt of program.node.body ?? []) {
      // a re-export (`export { f } from './x'`) carries a source and re-exports a DIFFERENT module's
      // binding, so it does not make THIS function escape - require no source
      if (stmt.type === 'ExportNamedDeclaration' && !stmt.source) {
        for (const spec of stmt.specifiers ?? []) if (spec.local?.name === fnName) return true;
      } else if (stmt.type === 'ExportDefaultDeclaration'
        && stmt.declaration?.type === 'Identifier' && stmt.declaration.name === fnName) return true;
    }
    return false;
  }

  // the invocation a reference to the function stands in, and the arguments that reach the
  // parameters - or null where the reference is not invoked here. the SHAPES are the call canon's
  // (a plain call, a `new`, a tagged template, `.call` / `.apply`, `Reflect.apply`, a `bind`
  // invoked on the spot), so this climb owns only how far above a reference a receiver-invoker hop
  // can sit: two, the member and the bind's own call. a transparent wrapper is not a hop - the
  // canon peels those on both sides of the identity compare
  function invocationPairingAt(refPath, scope, anchor) {
    const shadowCheck = { nameIsShadowed: name => Boolean(getScopeBinding(scope, name, anchor)) };
    for (let cur = refPath, hops = 0; hops <= 2; hops++) {
      // the same peel answers nothing at the top of the tree, and no host there ends the hop climb
      const host = peelTransparentExprAncestorPath(cur)?.parentPath;
      if (!host?.node) return null;
      const pairing = callPairing(host.node, null, shadowCheck);
      // a `new` hands the function's own identity to every object it builds: `inst.constructor` IS
      // the constructor, and reaching it that way spells no name for a census keyed on names to
      // count - measured as a live in-file re-entry (`new this.constructor([1, 2])` inside a
      // method) as well as an exported instance. so a construction accounts for its own arguments
      // only while the object it makes is DROPPED where it stands; a HELD one carries the channel
      // on, and following it is an instance closure this census is not
      if (pairing && pairing.callee === refPath.node) {
        return host.node.type === 'NewExpression' && !valueIsDroppedAt(host) ? null : pairing;
      }
      cur = host;
    }
    return null;
  }

  // does ONE invocation put a real value in the parameter's slot? a missing slot and an `undefined`
  // / `void` argument both leave the default standing. the wrappers a source may spell around the
  // argument (`(undefined)`, `undefined as any`, `undefined!`) leave the VALUE alone, and only one
  // leg's parser keeps a paren as a node - reading the raw slot answers "a real arg" for the paren
  // dialect and "the default" for the other on one source, and costs the narrow on both TS
  // spellings. a spread at or before the slot can supply the param from the spread iterable, and an
  // argument list the pairing could not decide says nothing about the slot - both count as an
  // override, matching the arg->param spread guard in resolveDirectParam / paramHasOverridingArg
  function invocationOverridesSlot(pairing, argIndex, scope) {
    if (pairing.argsUnknown) return true;
    const args = pairing.args ?? [];
    const length = effectiveArgsLength(args);
    if (length === null) return true;
    const arg = argIndex < length ? resolveCallArgument(args, argIndex) : null;
    if (!arg) return false;
    const value = unwrapRuntimeExpr(arg);
    if (isVoidExpression(value)) return false;
    return !(isBareUndefinedIdentifier(value) && !getScopeBinding(scope, 'undefined'));
  }

  // is `function f(x = default)` never called with a real overriding arg at this param's slot?
  // only then does the default's TYPE soundly describe the param at runtime (a foreign arg would
  // make a type-specific Maybe forward to a missing native method). scans the enclosing function's
  // call sites via the parser-agnostic enumerator: an `undefined` / `void` arg triggers the default
  // (not an override), a missing arg is fine, but a real arg or a caller-reaching reference (the
  // function escapes, so external calls are unknown) makes the default non-authoritative
  function defaultParamNeverOverridden(bindingPath) {
    const fnPath = bindingPath.parentPath;
    if (!fnPath?.node || !t.isFunction(fnPath.node)) return false;
    const paramIndex = fnPath.node.params.indexOf(bindingPath.node);
    if (paramIndex === -1) return false;
    // the call args are this-dropped at runtime, so a leading `this` pseudo-param shifts the override
    // check's arg position down by one (raw `paramIndex` indexes the AST params)
    const argIndex = argIndexForParam(fnPath.node.params, paramIndex);
    // the function is callable by EVERY name that binds it: a named function expression's internal
    // name (recursion only) AND, for `const f = function g(){}`, the outer VariableDeclarator name
    // (the external callers). resolving only the NFE internal name sees its ~0 recursion sites and
    // misses every external call -> false "never overridden" -> the default narrows the param even
    // though callers pass a foreign type (`_atMaybeArray` on a string, ie:11 throw). check all names
    const sources = [];
    if (fnPath.node.id?.type === 'Identifier') sources.push({ name: fnPath.node.id.name, scope: fnPath.scope, anchor: fnPath });
    const declarator = fnPath.parentPath?.node;
    const declaresTheName = declarator.type === 'VariableDeclarator' && declarator.id.type === 'Identifier';
    if (declaresTheName) {
      sources.push({ name: declarator.id.name, scope: fnPath.parentPath.scope, anchor: fnPath.parentPath });
    }
    const viaClass = constructorCallerNames(fnPath);
    if (viaClass) sources.push(...viaClass.sources);
    // ... and the caller set must ACCOUNT for the outside, which the NFE internal name alone never
    // does. two spellings do: an OUTER NAME the outside can write (a declaration's own id, a
    // declarator's, the class of a constructor), or - for a function reached as a VALUE - the
    // invocation standing at its own position. a literal occupies exactly ONE position, so an
    // invocation there IS its whole external caller set, and the canon reads the arguments of that
    // one the same way it reads a named call's: an IIFE, `.call` / `.apply` on the literal, a
    // TAGGED TEMPLATE putting the strings array in slot 0. anywhere else the value is handed
    // straight to whatever invokes it, with no name to scan and an empty recursion set that would
    // read as "no caller". `arguments.callee` is not a third spelling: a parameter default makes
    // the list non-simple, whose unmapped arguments object answers `callee` with the poison pill
    const ownInvocation = invocationPairingAt(fnPath, fnPath.scope, fnPath);
    const outerNamed = fnPath.node.type === 'FunctionDeclaration'
      || declaresTheName || Boolean(viaClass?.outerNamed);
    if (!outerNamed && !ownInvocation) return false;
    if (ownInvocation && invocationOverridesSlot(ownInvocation, argIndex, fnPath.scope)) return false;
    for (const { name: fnName, scope, anchor } of sources) {
      const binding = getScopeBinding(scope, fnName, anchor);
      if (!binding || binding.constantViolations?.length) return false;
      if (functionNameEscapesFile(fnPath, fnName)) return false;
      // a NULL reference set means the callers could not be enumerated, not that there are none;
      // treating unknown-references as proof-of-absence would let the default narrow the param over
      // a foreign-typed call arg (bias-unsafe) - bail rather than claim "never overridden"
      const refs = collectBindingReferences(binding, anchor);
      if (refs === null) return false;
      for (const ref of refs) {
        const pairing = invocationPairingAt(ref, ref.scope, ref);
        if (!pairing) {
          if (valueIsDroppedAt(ref)) continue;
          return false;
        }
        if (invocationOverridesSlot(pairing, argIndex, ref.scope)) return false;
      }
    }
    return true;
  }

  // resolve a binding's type via the most precise source available: rest-param ->
  // destructure -> annotation -> for-of element -> straight-line assignment -> const init.
  // single Identifier path; never recurses through the resolver entry-point on the binding
  // itself (callers use this as the leaf of an `Identifier` resolution chain). returns null
  // for any non-Identifier path or unresolvable binding shape
  // the binding's OWN declaration / loop-head iteration write is not a reassignment: babel
  // canonicalizes a for-x head as the ForX statement (an ANCESTOR of the head declarator),
  // estree records the declared pattern identifier itself (a DESCENDANT of it) - both
  // describe the initial binding the structural narrow already models. a REAL violation
  // node (assignment / update / a for-x head re-targeting an OUTER binding) never nests
  // with the declarator in either direction
  function isOwnBindingWrite(violation, bindingPath) {
    for (let cur = violation; cur; cur = cur.parentPath) if (cur.node === bindingPath.node) return true;
    for (let cur = bindingPath; cur; cur = cur.parentPath) if (cur.node === violation.node) return true;
    return false;
  }

  // a STRUCTURAL narrow (rest / destructure slot / default-param / for-of element) reflects
  // the binding's initial value only: a recorded reassignment that the straight-line walk
  // cannot dominate (a conditional / loop write) may replace it with a foreign family at
  // runtime, so the narrow must bail to generic. a DOMINATING straight-line write is
  // intercepted by resolvePath before this leaf is consulted, so a null walk result with
  // non-empty foreign violations is exactly the undominated case. annotation-based narrows
  // stay un-gated - the declared type already covers every TS-legal reassignment
  function structuralNarrowInvalidated(binding, path, ignorableRebind = null) {
    // any surviving foreign write bails UNCONDITIONALLY: a dominating write with a
    // RESOLVABLE value is intercepted upstream (resolvePath's straight-line / redecl
    // machinery) and never reaches this leaf - so a write observed here is either
    // undominated (conditional / loop) or dominated-but-unresolvable, and in both cases
    // the binding's runtime value is not the structural slot this leaf would narrow to
    const foreign = binding.constantViolations?.filter(v => !isOwnBindingWrite(v, binding.path)
      && !ignorableRebind?.(v.node));
    if (foreign?.length) return true;
    // a `var` RE-DECLARATION reaches here with an empty violation list on the estree lane
    // (no native record; the canonical recovery deliberately excludes declarator-shaped
    // writes for the positional redecl machinery) - consult the positional scan directly.
    // a redecl is legal over var / param / hoisted-function / catch-param bindings - every
    // kind except the block-scoped ones (whose redecl is a parse error and never reaches
    // us) and imports; gating on kind === 'var' alone left a `var x` over a PARAM stale
    // on the estree lane
    const { kind } = binding;
    return kind !== 'let' && kind !== 'const' && kind !== 'module'
      && staleVarRedeclNodes(binding, path, path.node.name).some(node => !ignorableRebind?.(node));
  }

  // a REST slot's family is RHS-INDEPENDENT (`var [...r] = "abc"` spreads into a fresh
  // Array; `{ ...rest }` is always an Object): when the ORIGINAL binding and a re-declaration
  // both bind the name through a rest slot of the SAME family, the redecl cannot change the
  // structural narrow - it is ignorable for invalidation. null = not a rest binding
  function restRebindFamily(node, name) {
    if (restBindsNameDirectly(node, name)) return 'Array';
    if (node?.type === 'VariableDeclarator') return nestedRestType(node.id, name)?.constructor ?? null;
    return null;
  }

  // invariance filter for a binding whose CURRENT declaration is a same-family rest slot
  function sameRestFamilyRebind(binding, name) {
    const original = restRebindFamily(binding.path?.node, name);
    if (!original) return null;
    return node => restRebindFamily(node, name) === original;
  }

  // a rewrite that moves a name onto a new declarator and prunes the host to a sentinel leaves a
  // record whose declarator PROVABLY no longer binds that name - both legs reach this, the one
  // mutating in place mid-traversal and the one draining at flush. answering the structural
  // question from the dead node reads as "unknown" and over-injects (`Object.keys` on such a
  // binding loses its provably-non-primitive decline) or, worse, reads the node's REMAINING shape
  // and answers about the sentinel. re-find the live declarator in the list that now holds it. the
  // RECORD IS NOT TOUCHED: the alias / fold verdicts read it as evidence about the ORIGINAL
  // declaration, and rewriting it there folds a conditionally-executed alias and drops live
  // injections (both measured)
  function liveBindingPath(binding, name) {
    const declared = binding.path;
    // only a DECLARATOR-hosted record can go stale this way - a param or catch binding keeps its
    // own node. a for-x HEAD declarator is one of these, and the block below finds its live twin
    if (declared?.node?.type !== 'VariableDeclarator' || declaratorBindsName(declared.node, name)) return declared;
    let statement = declared.parentPath;
    if (statement?.parentPath?.node?.type === 'ExportNamedDeclaration') statement = statement.parentPath;
    // a for-x HEAD holds no statement list, so the scan below has nothing to walk - and an
    // extraction moves the name into the loop BODY, which is the list that does hold it. without
    // this the record stays the dead head declarator, whose id is the minted iteration name, and
    // the binding reads as a DIRECT for-x binding: the rest of an iterated array resolves Array
    const loopBody = findForLoopParent(declared)?.get('body');
    if (loopBody?.node?.type === 'BlockStatement') {
      return findLiveDeclarator(loopBody.node.body, index => loopBody.get('body')[index], name) ?? declared;
    }
    // reading `container` assumes the main traversal - program-exit finalization replaces the
    // Program body array wholesale (import-injector), but no type query runs after it
    const body = statement?.container;
    if (!Array.isArray(body) || typeof statement.getSibling !== 'function') return declared;
    return findLiveDeclarator(body, index => statement.getSibling(index), name) ?? declared;
  }

  // the declarator binding `name` in a statement list, or null. scans the NODES and materializes a
  // path only for the one found: a list-valued `path.get` builds a NodePath per element on every
  // call, and this recovery runs per use over a list the emitter keeps rewriting, so going through
  // paths for the scan itself is quadratic in the block size
  function findLiveDeclarator(statements, statementAt, name) {
    for (let i = 0; i < statements.length; i++) {
      const viaExport = statements[i]?.type === 'ExportNamedDeclaration';
      const declaration = viaExport ? statements[i].declaration : statements[i];
      if (declaration?.type !== 'VariableDeclaration') continue;
      const index = (declaration.declarations ?? []).findIndex(item => declaratorBindsName(item, name));
      if (index === -1) continue;
      const found = statementAt(i);
      return (viaExport ? found.get('declaration') : found).get('declarations')[index];
    }
    return null;
  }

  function resolveBindingType(path) {
    if (!t.isIdentifier(path.node)) return null;
    const binding = getScopeBinding(path.scope, path.node.name, path);
    if (!binding) return null;
    const { name } = path.node;
    const bindingPath = liveBindingPath(binding, name);
    const { node } = bindingPath;
    // a dominating var-redecl whose slot for `name` is an array-rest SLICE has no RHS node
    // the redecl path machinery could hand back - its slice TYPE resolves here instead,
    // before the reassignment gate below treats the redecl as an invalidating write
    const sliceType = binding.kind !== 'let' && binding.kind !== 'const' && binding.kind !== 'module'
      && resolveStaleRedeclSliceType(binding, path, name);
    if (sliceType) return sliceType;
    // rest-param: `function f(...xs) { xs.at(0) }` - `xs` is always an Array at runtime
    // regardless of call-site. annotated form (`...xs: T[]`) flows through the annotation
    // branch below; unannotated falls here. without this, `.at(0)` on `xs` dispatches the
    // generic polyfill instead of the array-specific helper
    if (restBindsNameDirectly(node, name)) {
      const annotated = findBindingAnnotation(bindingPath);
      if (annotated) return resolveTypeAnnotation(annotated, bindingPath.scope);
      return structuralNarrowInvalidated(binding, path, sameRestFamilyRebind(binding, name)) ? null : new $Object('Array');
    }
    // destructured object / array: for (const { a } of ...) / const [a] = ...
    const pattern = bindingDestructuringPattern(node);
    if (pattern) {
      if (structuralNarrowInvalidated(binding, path, sameRestFamilyRebind(binding, name))) return null;
      const slot = pattern.type === 'ObjectPattern'
        ? resolveObjectBinding(pattern, name, bindingPath)
        : resolveArrayBinding(pattern, name, bindingPath);
      return foldWithPatternDefault(slot, pattern, name, bindingPath);
    }
    // direct annotation: function foo(x: T) or const x: T = ... or (x: T = default)
    // must NOT be reached for destructured bindings - their pattern-level annotation
    // describes the container type, not the element type.
    // `withLookupPath(bindingPath, ...)` registers the binding's NodePath as anchor for
    // downstream `findTypeDeclaration` calls - lets parsers without TSModuleDeclaration
    // scope (estree-toolkit) fall back to walking ancestors for namespace-local type decls
    const typeAnnotation = findBindingAnnotation(bindingPath);
    if (typeAnnotation) {
      // an optional parameter (`function f(a?: T)`) admits undefined on every call that omits it,
      // exactly like an optional property - mark it on the same channel so the logical truthy-fold
      // cannot collapse `a ?? fallback` to the annotated branch. the flag lives on the binding node,
      // not on the annotation, so it has to be re-applied here; `findBindingAnnotation` itself hands
      // back a raw slot that several callers pattern-match by node type
      const marked = withMemberModifiers(typeAnnotation, { optional: Boolean(node?.optional) });
      return withLookupPath(bindingPath, () => resolveTypeAnnotation(marked, bindingPath.scope));
    }
    // unannotated arrow / function param passed as a call argument: infer from the callee's
    // matching parameter slot. without this, `Holder<number>.use(items => items.X)` resolves
    // `items` to the raw `T[]` from the method signature and dispatches the generic polyfill
    // instead of the array-specific helper
    if (node?.type === 'Identifier' && bindingPath.parentPath?.node && t.isFunction(bindingPath.parentPath.node)) {
      const inferred = !structuralNarrowInvalidated(binding, path) && inferCallbackParamType(bindingPath);
      if (inferred) return inferred;
    }
    // unannotated Identifier param with default value (`function f(x = [1,2,3])`). the default's
    // TYPE narrows the param ONLY if no call site overrides it with a real arg: a caller-passed
    // foreign arg makes the runtime receiver foreign, and a type-specific Maybe (`_atMaybeArray`)
    // would forward it to the native method and throw on engines lacking it. so narrow from the
    // default only when every call omits the arg (or passes `undefined` / `void`, which trigger
    // the default), else resolve generic
    if (node?.type === 'AssignmentPattern' && node.left?.type === 'Identifier' && node.left.name === name) {
      if (structuralNarrowInvalidated(binding, path)) return null;
      return defaultParamNeverOverridden(bindingPath) ? resolveNodeType(bindingPath.get('right')) : null;
    }
    // for-in / for-of (only for direct bindings - destructured bindings return early above)
    const forLoopParent = findForLoopParent(bindingPath);
    if (forLoopParent) {
      if (structuralNarrowInvalidated(binding, path)) return null;
      // for-in: iteration variable is always a string per ECMAScript spec
      if (t.isForInStatement(forLoopParent.node)) return new $Primitive('string');
      // for-of / for-await-of: infer element type from the iterable
      if (t.isForOfStatement(forLoopParent.node)) return resolveForOfResolvedElement(forLoopParent);
    }
    // mutable binding: resolve from the last straight-line assignment before usage
    const lastAssign = findLastStraightLineAssignment(binding, path);
    if (lastAssign) return assignedValueType(lastAssign, name);
    // no assignment found - resolve from init when either const or all mutations are after usage
    if (t.isVariableDeclarator(node) && node.init) return resolveFromDeclaratorInit(binding, bindingPath, path, name);
    return null;
  }

  // the value an assignment writes into the binding named `name`: a compound operator's own result,
  // the paired slot of a destructuring LHS, or the plain RHS
  function assignedValueType(assignPath, name) {
    // `+=` / `-=` / ... - the assignment node's own type captures the result
    if (assignPath.node.type === 'AssignmentExpression' && assignPath.node.operator !== '=') {
      return resolveNodeType(assignPath);
    }
    const left = assignLeft(assignPath.node);
    const rightKey = assignRightKey(assignPath.node);
    // destructuring: `({ a: { b } } = ...)` / `[x] = ['hi']` / `var [{ a }] = [{ a: 'x' }]` -
    // dispatch by pattern kind, then resolve via the shared runtime-or-annotation fallback
    // (keeps ArrayPattern and ObjectPattern reassign-narrowing symmetric)
    const keyPath = findPatternKeyPath(left, name, assignPath.scope);
    if (keyPath) return resolveDestructuredMember(assignPath.get(rightKey), keyPath);
    // an undecomposable pattern slot is an unknown value, not the whole RHS
    if (isDestructurePattern(left)) return null;
    return resolveNodeType(assignPath.get(rightKey));
  }

  // every value that can reach a read of `binding`, as two views of ONE enumeration: `types` is the
  // per-arm resolved type (the whole set is null-free only when every arm resolved), `paths` is the
  // per-arm value PATH for consumers that re-resolve arms themselves - null once an arm has no single
  // value node to point at. null overall when an arm cannot be read at all
  function reachableValueArms(binding, bindingPath, name, usagePath) {
    // a `var name = X` REDECLARATION is deliberately kept OUT of the violation list (the type layer
    // resolves redecl flow through its own positional machinery), so an enumeration built off that
    // list alone silently misses a whole value. the canonical scan reads the AST rather than either
    // parser's binding model, so both emitters decline on the same shape
    if (varInitStaleByRedecl(binding, usagePath, name)) return null;
    const initPath = bindingPath.get('init');
    const types = [];
    let paths = [];
    // a NULLISH arm dispatches nothing - a member access on it throws natively and no polyfill
    // changes that - so it neither narrows nor widens the set
    if (!isNullishInit(initPath.node, bindingPath.scope, bindingPath)) {
      types.push(resolveNodeType(initPath));
      paths.push(initPath);
    }
    for (const violation of binding.constantViolations ?? []) {
      // a RECOVERED extra is node-shaped: it carries no parent chain to decompose, and its presence
      // means the native write list was incomplete - decline rather than under-report the writes
      if (violation.canonicalRecovered) return null;
      const assignPath = violationToAssignment(violation);
      if (!assignPath) return null;
      const plain = assignPath.node.operator === '=';
      const valuePath = assignPath.get(assignRightKey(assignPath.node));
      // the scope gate reads the binding chain directly rather than through the resolver, so it needs
      // the same anchoring the resolver entry applies - an unanchored write path answers "no shadow"
      const anchored = anchorPathScope(assignPath);
      if (plain && isNullishInit(valuePath.node, anchored.scope, anchored)) continue;
      types.push(assignedValueType(assignPath, name));
      // a compound operator's result and a destructuring slot are computed, not written from a
      // single node - the path view cannot describe them. `null` is the DECLINED sentinel of that
      // view and the loop runs on for the type view, so a later plain write writes through the
      // guard rather than into the sentinel
      if (plain && !PATTERN_WRAPPERS.has(assignLeft(assignPath.node)?.type)) paths?.push(valuePath);
      else paths = null;
    }
    return { types, paths };
  }

  // the reachable-value arms as PATHS, for the hint-set channel: it re-resolves each arm itself
  // (an arm may be a nested union of its own), so it needs the nodes rather than folded types
  function reachableValuePaths(binding, bindingPath, name, usagePath) {
    return reachableValueArms(binding, bindingPath, name, usagePath)?.paths ?? null;
  }

  // union of the declarator init and every write value, for a read that runs deferred: each write
  // can land before a later invocation, so all of them reach the read whatever their source position
  function deferredReadUnionType(binding, bindingPath, name, usagePath) {
    const arms = reachableValueArms(binding, bindingPath, name, usagePath)?.types;
    if (!arms?.length) return null;
    // the CANONICAL union fold, not a bare reduce over `commonType`: an unresolvable arm bails the
    // whole set (an open set is exactly the unknown the caller had before), a dropped nullish arm
    // marks the result, and - the reason the hand-written reduce was wrong - a disagreement
    // SHORT-CIRCUITS instead of letting the next arm re-seed the accumulator off the null. with the
    // reduce, `[1,2] | 'abc' | [3,4]` answered Array purely because the clash was not last
    return foldUnionTypes(arms, arm => arm);
  }

  function resolveFromDeclaratorInit(binding, bindingPath, path, name) {
    // estree-toolkit block-scopes a `var`, so `binding.path` can be a stale declarator overwritten
    // by a `var name = X` re-declaration before the use that it never recorded - don't trust its
    // init then (babel records the redecl, so this only fires on the estree var-hoist gap)
    if (varInitStaleByRedecl(binding, path, name)) return null;
    const violations = binding.constantViolations;
    if (!violations?.length) return resolveNodeType(bindingPath.get('init'));
    // loop back-edge: a reassignment inside an enclosing loop body re-runs before the next-iteration
    // use, so the declarator init no longer describes the receiver from iteration 2 - degrade to generic
    if (bindingCrossesLoopBackEdge(path, binding)) return null;
    // a violation whose home runs at an UNKNOWN time (a captured function invoked before the use,
    // an instance class-field initializer) fires regardless of source position, so the positional
    // test below cannot see it. an IIFE body is NOT such a home - it lifts to a straight-line
    // position and stays positionally bounded, which is why this uses the shared deferral
    // predicate rather than the blanket captured-function gate
    if (violations.some(v => violationRunsDeferred(v, binding.scope))) return null;
    // the positional test below proves the init still describes the receiver only when the use
    // RUNS before every write. a closure-captured use re-runs per invocation, so a later write
    // reaches it - the read is not positionally bounded and the init is no longer authoritative
    // a DEFERRED read observes the init AND every write that can land before a later invocation, so
    // the receiver is their UNION - strictly narrower than "unknown" while staying bail-safe, since a
    // wider value set only reduces narrowing. a write this cannot decompose leaves the set open, and
    // an open set is exactly the unknown the caller had before
    if (usageRunsDeferred(path, binding.scope)) return deferredReadUnionType(binding, bindingPath, name, path);
    // a write whose evaluation slot runs AHEAD of the use's own - a class computed key, computed when
    // the class is defined and so before every static field and static block it hosts - sits PAST the
    // use by position, so the test below reads it as "after" and keeps an init it has already replaced.
    // this answer picks a helper FAMILY, not just a global to substitute: kept, the stale `[]` init
    // keys an array-only helper to a receiver the key already made a string, which is a wrong VALUE
    // on `usage-pure` (`[].includes.call('abc', 'ab')` is false where the string method is true)
    if (anyWriteOutrunsUse(violations.map(v => v.node), path)) return null;
    const usagePos = path.node.start;
    if (usagePos !== undefined && violations.every(v => (v.node.start ?? -1) >= usagePos)) {
      return resolveNodeType(bindingPath.get('init'));
    }
    return null;
  }

  // cluster-private (consumed only by other cluster functions, not by factory or other
  // clusters):
  // `resolveArrayPatternBinding` / `findPatternIndex` / `resolveRuntimeIterableElement` /
  // `resolveArrayBinding` / `resolveForOfElementAnnotation` / `resolveObjectBinding` /
  // `findBindingPattern` / `unwrapPromiseAnnotation`
  return {
    defaultParamNeverOverridden,
    reachableValuePaths,
    findArrayPatternKeyPath,
    findDestructuredKeyPath,
    findForLoopParent,
    resolveArrayLiteralElement,
    resolveArrayLiteralCommonType,
    annotationAtKeyPath,
    findBindingAnnotation,
    bindingDestructuringPattern,
    resolveAnnotatedMember,
    resolveAnnotatedMemberPath,
    resolveForOfResolvedElement,
    resolveObjectMemberPath,
    resolveDestructuredMember,
    collectPatternKeyPath,
    resolveBindingType,
  };
}
