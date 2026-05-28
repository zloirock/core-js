// Destructuring + for-of binding resolution. given an Identifier inside an ArrayPattern /
// ObjectPattern (potentially nested), walks up to find what type-shape the binding receives.
// supports four sources, tried in order:
//   1. annotation on the pattern itself (`const { x }: { x: T }`)
//   2. annotation on the init expression (`const { x } = (init as { x: T })`)
//   3. for-of iterable element type (`for (const { x } of items)`)
//   4. destructuring default fallback (`const { x = T() } = ...`)
//
// For-of helpers double-duty for both annotated (`Iterable<T>` -> T) and runtime
// (`for (const x of 'hello')` -> string) cases. Promise unwrapping for `for await of`.
//
// Public surface mirrors the previous factory functions - external callers are heavy
// (resolveBindingType, type-query, plus various back-reference paths). `resolveNodeType`
// is late-bound via thunk since the cluster recurses into the main resolver.
import { $Object, $Primitive, PATTERN_WRAPPERS, peelAssignmentPattern } from './base.js';
import { collectQualifiedSegments } from './ast-shapes.js';
import { assignLeft, assignRightKey } from './straight-line-flow.js';

export function createPatternBindings({
  t,
  babelNodeType,
  isRestBinding,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveInnerType,
  commonType,
  findEnumDeclaration,
  resolveEnumMemberType,
  findTypeMember,
  substituteTypeParams,
  buildDefaultTypeParamMap,
  promiseRefInner,
  unwrapPromise,
  unwrapTypeAnnotation,
  findExpressionAnnotation,
  extractElementAnnotation,
  resolveElementType,
  findTupleElement,
  resolveObjectMember,
  findObjectMember,
  resolveTypeAnnotation,
  resolveComputedKeyName,
  getKeyName,
  findLastStraightLineAssignment,
  withLookupPath,
  functionTypeParams,
}) {
  // walk ArrayPattern elements for a target binding, returning index-prefixed key path.
  // sentinel conventions:
  //   - null         not found
  //   - [-1]         found in rest (-1 signals "whole tail" slice, not an index)
  //   - [i, ...sub]  found at index i (possibly nested)
  // `findPatternIndex` below uses `-1` with a DIFFERENT meaning ("not found" scalar); the
  // return shape (array vs scalar) disambiguates at call sites
  // dispatch by pattern kind so callers (and the recursive child walks below) don't repeat
  // the type-test pair. unknown kinds return null - caller signals "binding not found here"
  function findPatternKeyPath(pattern, name, scope) {
    if (pattern?.type === 'ObjectPattern') return findDestructuredKeyPath(pattern, name, scope);
    if (pattern?.type === 'ArrayPattern') return findArrayPatternKeyPath(pattern, name, scope);
    return null;
  }

  function findArrayPatternKeyPath(arrayPattern, name, scope) {
    for (let i = 0; i < (arrayPattern.elements?.length ?? 0); i++) {
      const el = arrayPattern.elements[i];
      if (!el) continue;
      // rest: [...x] is always Array - signal via negative index so callers know
      if (el.type === 'RestElement') {
        if (el.argument?.type === 'Identifier' && el.argument.name === name) return [-1];
        // nested ArrayPattern inside rest (`[a, ...[head]] = arr`). the rest slice has
        // the same element type as the source; an inner positional access at `j` then maps
        // to source index `i + j` (rest starts at outer position `i`)
        if (el.argument?.type === 'ArrayPattern') {
          const inner = findArrayPatternKeyPath(el.argument, name, scope);
          if (inner && typeof inner[0] === 'number' && inner[0] >= 0) {
            return [i + inner[0], ...inner.slice(1)];
          }
        }
        // nested ObjectPattern in rest (`const [...{ length }] = arr`) destructures the
        // rest-Array directly: `{ length }` is a key off the Array slice. signal via `[-1]`
        // so callers resolve through the Array element type, then walk into the inner key
        // path. `length` matches Array.prototype.length; arbitrary numeric/string keys
        // resolve through the array's index/length signature
        if (el.argument?.type === 'ObjectPattern') {
          const inner = findDestructuredKeyPath(el.argument, name, scope);
          if (inner) return [-1, ...inner];
        }
        continue;
      }
      const unwrapped = peelAssignmentPattern(el);
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
      const value = peelAssignmentPattern(prop.value);
      if (value?.type === 'Identifier' && value.name === name) return [key];
      const inner = findPatternKeyPath(value, name, scope);
      if (inner) return [key, ...inner];
    }
    return null;
  }

  // resolve the type of a destructuring default: const { items = [] } = obj or const [a = []] = arr.
  // recurses into nested ObjectPatterns / ArrayPatterns - `const { a: { b = [] } } = obj`
  // resolving `b` finds the depth-2 default that one-level walk missed
  function resolveDestructuringDefault(pattern, varName, bindingPath) {
    const patternPath = bindingPath.node === pattern ? bindingPath
      : bindingPath.node.id === pattern ? bindingPath.get('id')
      : bindingPath.node.left === pattern ? bindingPath.get('left') : null;
    if (!patternPath) return null;
    return walkDestructuringForDefault(patternPath, pattern, varName);
  }

  function walkDestructuringForDefault(patternPath, pattern, varName) {
    const children = patternPath.get(pattern.properties ? 'properties' : 'elements');
    for (const child of children) {
      if (!child.node) continue;
      const valuePath = babelNodeType(child.node) === 'ObjectProperty' ? child.get('value') : child;
      if (t.isAssignmentPattern(valuePath.node)) {
        if (valuePath.node.left?.type === 'Identifier' && valuePath.node.left.name === varName) {
          return resolveNodeType(valuePath.get('right'));
        }
        // `{ a: { b = [] } = {} }` - the inner pattern is on `valuePath.left`, recurse there
        const innerLeft = valuePath.get('left');
        if (innerLeft.node?.type === 'ObjectPattern' || innerLeft.node?.type === 'ArrayPattern') {
          const found = walkDestructuringForDefault(innerLeft, innerLeft.node, varName);
          if (found) return found;
        }
      } else if (valuePath.node?.type === 'ObjectPattern' || valuePath.node?.type === 'ArrayPattern') {
        const found = walkDestructuringForDefault(valuePath, valuePath.node, varName);
        if (found) return found;
      }
    }
    return null;
  }

  function resolveDestructuredType(objectPattern, name, scope) {
    const keyPath = findDestructuredKeyPath(objectPattern, name, scope);
    if (!keyPath) return null;
    return resolveAnnotatedMemberPath(objectPattern.typeAnnotation, keyPath, scope);
  }

  // resolve the type of a variable destructured from an ArrayPattern against an annotation.
  // covers two shapes uniformly:
  //   - top-level Identifier element: `[a]` -> findPatternIndex + tuple/array element type
  //   - nested pattern (`[{x}]`, `[[y]]`): top-level scan misses varName; key-path walk via
  //     `findArrayPatternKeyPath` against the same annotation reaches the leaf. without this
  //     branch, `for (const [{ x }] of items)` falls through to generic .at fallback while
  //     the symmetric object-outer / array-inner case (`for (const { arr: [x] } of items)`)
  //     resolves through resolveObjectBinding's collectPatternKeyPath
  function resolveArrayPatternBinding({ arrayPattern, varName, annotation, scope }) {
    const index = findPatternIndex(arrayPattern, varName);
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
      const id = peelAssignmentPattern(element);
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

  // resolve array destructuring from any annotation source: pattern, init, or for-of iterable.
  // `resolveArrayPatternBinding` handles top-level Identifier AND nested-pattern element
  // shapes against a single annotation, so each annotation source needs just one call
  function resolveArrayBinding(arrayPattern, varName, bindingPath) {
    // array rest: const [a, ...rest] = items -> rest is always Array
    if (isRestBinding(arrayPattern.elements ?? [], varName)) return new $Object('Array');
    // annotation on the pattern itself: function foo([a]: string[]) or const [a]: string[] = ...
    if (arrayPattern.typeAnnotation) {
      const result = resolveArrayPatternBinding({
        arrayPattern, varName, annotation: arrayPattern.typeAnnotation, scope: bindingPath.scope,
      });
      if (result) return result;
    }
    // annotation on the init expression: const [a] = typedArr
    if (t.isVariableDeclarator(bindingPath.node) && bindingPath.node.init) {
      const initInfo = findExpressionAnnotation(bindingPath.get('init'));
      if (initInfo) {
        const initResult = resolveArrayPatternBinding({
          arrayPattern, varName, annotation: initInfo.annotation, scope: initInfo.scope,
        });
        if (initResult) return initResult;
      }
      // runtime init: resolve through variables to the actual value
      const initPath = resolveRuntimeExpression(bindingPath.get('init'));
      const index = findPatternIndex(arrayPattern, varName);
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
        arrayPattern, varName, annotation: elemInfo.annotation, scope: elemInfo.scope,
      });
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
    // `typeof Enum` in annotation position - member access on the enum object yields the
    // enum value kind. findTypeMember doesn't walk TSTypeQuery bodies, so dispatch here
    if (unwrapped.type === 'TSTypeQuery') {
      const segments = collectQualifiedSegments(unwrapped.exprName);
      const rootName = segments?.[0];
      if (rootName && segments.length === 1) {
        const enumDecl = findEnumDeclaration(rootName, scope);
        if (enumDecl) {
          const type = resolveEnumMemberType(enumDecl, keyName);
          if (type) return type;
        }
      }
    }
    const memberType = findTypeMember({ objectType: unwrapped, key: keyName, scope });
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
      const next = findTypeMember({ objectType: unwrapped, key: keyPath[i], scope });
      if (!next) return null;
      current = next;
    }
    return resolveAnnotatedMember(current, keyPath.at(-1), scope);
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
  function resolveObjectMemberPath(objPath, keyPath) {
    if (keyPath.length === 0) return resolveNodeType(objPath);
    const [step] = keyPath;
    const rest = keyPath.slice(1);
    if (typeof step === 'number') {
      // -1 = rest element, always Array
      if (step < 0) return new $Object('Array');
      if (!t.isArrayExpression(objPath.node) || objPath.node.elements.length <= step) return null;
      // any spread at or before the target index shifts subsequent positions to a runtime-
      // determined slot - `[...spread, 'x'][1]` resolves to spread[1] OR 'x' depending on
      // spread.length. mirror `resolveArrayLiteralElement`'s spread-guard so this nested
      // path matches the top-level extraction semantics
      for (let i = 0; i <= step; i++) {
        if (objPath.node.elements[i]?.type === 'SpreadElement') return null;
      }
      return resolveObjectMemberPath(resolveRuntimeExpression(objPath.get('elements')[step]), rest);
    }
    if (!t.isObjectExpression(objPath.node)) return null;
    if (!rest.length) return resolveObjectMember(objPath, step);
    const prop = findObjectMember(objPath, step);
    if (!prop || !t.isObjectProperty(prop.node)) return null;
    const next = resolveRuntimeExpression(prop.get('value'));
    return resolveObjectMemberPath(next, rest);
  }

  // try runtime object literal, then annotation-based resolution for a destructured member
  function resolveDestructuredMember(exprPath, keyPath) {
    const runtimeResult = resolveObjectMemberPath(resolveRuntimeExpression(exprPath), keyPath);
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
        result.unshift(idx);
      }
      prev = cur;
      cur = cur.parentPath;
    }
    return result;
  }

  // walk an ObjectPattern (and any nested ObjectPatterns under its property values) looking
  // for a RestElement whose argument identifier matches `varName`. covers both top-level
  // (`{ ...rest } = obj`) and nested (`{ x: {...rest} } = obj`) cases - shared `isRestBinding`
  // only inspects the immediate properties array, so without the recursive walk the resolver
  // falls through to keyPath logic and nested `rest` ends up null. narrow to `$Object('Object')`
  // lets the `arg-is-object` filter (e.g. on `Object.keys`) subsume the polyfill when the user
  // passes a provably non-primitive rest binding
  function bindsObjectRest(pattern, varName) {
    if (pattern?.type !== 'ObjectPattern') return false;
    for (const prop of pattern.properties) {
      if (prop?.type === 'RestElement' && prop.argument?.type === 'Identifier' && prop.argument.name === varName) return true;
      if (babelNodeType(prop) !== 'ObjectProperty') continue;
      if (bindsObjectRest(peelAssignmentPattern(prop.value), varName)) return true;
    }
    return false;
  }

  function resolveObjectBinding(objectPattern, varName, bindingPath) {
    // object rest at any depth: `{ ...rest } = obj` and `{ x: {...rest} } = obj` both bind
    // an Object. the recursive walk in `bindsObjectRest` catches both cases uniformly
    if (bindsObjectRest(objectPattern, varName)) return new $Object('Object');
    // annotation on the pattern: const { items }: { items: number[] } = ...
    if (objectPattern.typeAnnotation) {
      const result = resolveDestructuredType(objectPattern, varName, bindingPath.scope);
      if (result) return result;
    }
    const keyPath = findDestructuredKeyPath(objectPattern, varName, bindingPath.scope);
    if (!keyPath) return null;
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
      if (t.isArrayExpression(iterPath.node) && iterPath.node.elements.length) {
        const firstElem = resolveRuntimeExpression(iterPath.get('elements')[0]);
        const result = resolveObjectMemberPath(firstElem, keyPath);
        if (result) return result;
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

  // callback-param inference for unannotated arrow / function params passed as a call argument.
  // shape: `recv.method(arg => arg.X)` where `recv: Alias<Arg>` with `method(cb: (a: ParamT) => void)`.
  // `findTypeMember` deep-substitutes the receiver's alias type-args into the returned method
  // node, so the callback parameter slot already carries the concrete type before unwrap.
  // non-Identifier callee property, non-method member, or positional mismatch bail to null
  function inferCallbackParamType(bindingPath) {
    const fnPath = bindingPath.parentPath;
    if (!fnPath?.node || !t.isFunction(fnPath.node)) return null;
    const paramIndex = fnPath.node.params?.indexOf(bindingPath.node) ?? -1;
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
    const cbParam = functionTypeParams(method)?.[argIndex];
    const cbFnType = unwrapTypeAnnotation(cbParam?.typeAnnotation);
    if (cbFnType?.type !== 'TSFunctionType' && cbFnType?.type !== 'FunctionTypeAnnotation') return null;
    const target = functionTypeParams(cbFnType)?.[paramIndex];
    const annotation = unwrapTypeAnnotation(target?.typeAnnotation);
    if (!annotation) return null;
    return resolveTypeAnnotation(annotation, objInfo.scope);
  }

  // resolve a binding's type via the most precise source available: rest-param ->
  // destructure -> annotation -> for-of element -> straight-line assignment -> const init.
  // single Identifier path; never recurses through the resolver entry-point on the binding
  // itself (callers use this as the leaf of an `Identifier` resolution chain). returns null
  // for any non-Identifier path or unresolvable binding shape
  function resolveBindingType(path) {
    if (!t.isIdentifier(path.node)) return null;
    const binding = path.scope?.getBinding(path.node.name);
    if (!binding) return null;
    const { path: bindingPath } = binding;
    const { name } = path.node;
    const { node } = bindingPath;
    // rest-param: `function f(...xs) { xs.at(0) }` - `xs` is always an Array at runtime
    // regardless of call-site. annotated form (`...xs: T[]`) flows through the annotation
    // branch below; unannotated falls here. without this, `.at(0)` on `xs` dispatches the
    // generic polyfill instead of the array-specific helper
    if (node?.type === 'RestElement') {
      const annotated = findBindingAnnotation(bindingPath);
      if (annotated) return resolveTypeAnnotation(annotated, bindingPath.scope);
      return new $Object('Array');
    }
    // destructured object: for (const { a } of ...) or const { a } = ...
    const objectPattern = findBindingPattern(node, 'ObjectPattern');
    if (objectPattern) return resolveObjectBinding(objectPattern, name, bindingPath);
    // destructured array: for (const [a] of ...) or const [a] = ...
    const arrayPattern = findBindingPattern(node, 'ArrayPattern');
    if (arrayPattern) return resolveArrayBinding(arrayPattern, name, bindingPath);
    // direct annotation: function foo(x: T) or const x: T = ... or (x: T = default)
    // must NOT be reached for destructured bindings - their pattern-level annotation
    // describes the container type, not the element type.
    // `withLookupPath(bindingPath, ...)` registers the binding's NodePath as anchor for
    // downstream `findTypeDeclaration` calls - lets parsers without TSModuleDeclaration
    // scope (estree-toolkit) fall back to walking ancestors for namespace-local type decls
    const typeAnnotation = findBindingAnnotation(bindingPath);
    if (typeAnnotation) return withLookupPath(bindingPath, () => resolveTypeAnnotation(typeAnnotation, bindingPath.scope));
    // unannotated arrow / function param passed as a call argument: infer from the callee's
    // matching parameter slot. without this, `Holder<number>.use(items => items.X)` resolves
    // `items` to the raw `T[]` from the method signature and dispatches the generic polyfill
    // instead of the array-specific helper
    if (node?.type === 'Identifier' && bindingPath.parentPath?.node && t.isFunction(bindingPath.parentPath.node)) {
      const inferred = inferCallbackParamType(bindingPath);
      if (inferred) return inferred;
    }
    // unannotated Identifier param with default value (`function f(x = [])`). babel binds
    // the param to the AssignmentPattern wrapper (same convention as RestElement above), so
    // the default expression lives at `bindingPath.get('right')`. annotated form caught by
    // `findBindingAnnotation` above. caller-passed arg overrides at runtime, but polyfill
    // emit follows the declared default's TYPE shape
    if (node?.type === 'AssignmentPattern' && node.left?.type === 'Identifier' && node.left.name === name) {
      return resolveNodeType(bindingPath.get('right'));
    }
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
      // `+=` / `-=` / ... - the assignment node's own type captures the result
      if (lastAssign.node.type === 'AssignmentExpression' && lastAssign.node.operator !== '=') {
        return resolveNodeType(lastAssign);
      }
      const left = assignLeft(lastAssign.node);
      const rightKey = assignRightKey(lastAssign.node);
      // destructuring: `({ a: { b } } = ...)` / `[x] = ['hi']` / `var [{ a }] = [{ a: 'x' }]` -
      // dispatch by pattern kind, then resolve via the shared runtime-or-annotation fallback
      // (keeps ArrayPattern and ObjectPattern reassign-narrowing symmetric)
      const keyPath = findPatternKeyPath(left, name, lastAssign.scope);
      if (keyPath) return resolveDestructuredMember(lastAssign.get(rightKey), keyPath);
      if (left?.type === 'ObjectPattern' || left?.type === 'ArrayPattern') return null;
      return resolveNodeType(lastAssign.get(rightKey));
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

  // cluster-private (consumed only by other cluster functions, not by factory or other
  // clusters): `resolveDestructuringDefault` / `resolveDestructuredType` /
  // `resolveArrayPatternBinding` / `findPatternIndex` / `resolveRuntimeIterableElement` /
  // `resolveArrayBinding` / `resolveForOfElementAnnotation` / `resolveObjectBinding` /
  // `findBindingPattern`
  return {
    findArrayPatternKeyPath,
    findDestructuredKeyPath,
    findForLoopParent,
    resolveArrayLiteralElement,
    resolveArrayLiteralCommonType,
    findBindingAnnotation,
    resolveAnnotatedMember,
    resolveAnnotatedMemberPath,
    unwrapPromiseAnnotation,
    resolveForOfResolvedElement,
    resolveObjectMemberPath,
    resolveDestructuredMember,
    collectPatternKeyPath,
    resolveBindingType,
  };
}
