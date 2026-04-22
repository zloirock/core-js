import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage';
import {
  createTypeAnnotationChecker,
  mayHaveSideEffects,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers';

export default function (t, { getInjector } = {}) {
  // side-effect expressions from destructuring inits - deferred to Program.exit
  const deferredSideEffects = [];
  // original body index of each declaration, before insertBefore shifts it
  let originalDeclKeys = new WeakMap();

  const isInTypeAnnotation = createTypeAnnotationChecker(isTypeAnnotationNodeType);

  function reset() {
    originalDeclKeys = new WeakMap();
    deferredSideEffects.length = 0;
    isInTypeAnnotation.reset();
  }

  // identifiers and `this` are safe to double-evaluate. TS wrappers are deliberately NOT
  // peeled here - keeping them in the check keeps babel's `_ref` emission in sync with
  // unplugin's source-text regex, especially inside optional chains
  const isSafeToReuse = node => t.isIdentifier(node) || t.isThisExpression(node);

  const generateRef = (scope, declare = true) => getInjector().generateRef(scope, declare);
  const generateUnusedId = () => t.identifier(getInjector().generateUnusedName());

  function memoize(node, scope) {
    if (isSafeToReuse(node)) return [t.cloneNode(node), t.cloneNode(node)];
    const ref = generateRef(scope);
    return [t.assignmentExpression('=', t.cloneNode(ref), node), ref];
  }

  // tokens that are safe as a statement-leading token (no ASI hazard with the previous statement)
  const isLeadingIdentLike = node => t.isIdentifier(node) || t.isThisExpression(node) || t.isSuper(node);

  function wrapConditional(check, result) {
    // place `null` first when `check` doesn't start with an identifier-like token (typically
    // an AssignmentExpression `(_ref = X)`). This guarantees ASI safety when the replacement
    // is embedded in raw source and matches the unplugin output. For identifier-like tokens
    // there is no ASI hazard, so keep the more readable `x == null` form
    const NULL = t.nullLiteral();
    const test = isLeadingIdentLike(check)
      ? t.binaryExpression('==', check, NULL)
      : t.binaryExpression('==', NULL, check);
    return t.conditionalExpression(test, t.unaryExpression('void', t.numericLiteral(0)), result);
  }

  function buildMethodCall(id, object, scope, args, optionalCall) {
    const [assign, ref] = memoize(object, scope);
    // clone args: originals may belong to a parent being replaced (stale Babel path containers)
    const callArgs = [t.cloneNode(ref), ...args.map(a => t.cloneNode(a))];
    const callMember = optionalCall
      ? t.optionalMemberExpression(t.callExpression(id, [assign]), t.identifier('call'), false, true)
      : t.memberExpression(t.callExpression(id, [assign]), t.identifier('call'));
    return optionalCall
      ? t.optionalCallExpression(callMember, callArgs, false)
      : t.callExpression(callMember, callArgs);
  }

  function deoptionalizeNode(path) {
    const type = path.isOptionalMemberExpression() ? 'MemberExpression' : 'CallExpression';
    path.node.type = type;
    path.type = type;
    delete path.node.optional;
  }

  // strip Optional{Member,Call}Expression wrappers above a replaced node
  // stripFirstOptional: also deoptionalize the first user-written ?. in the chain
  // (used when the replacement is always defined, e.g., polyfill imports)
  // is `child` the operand slot (object/callee) of an optional expression,
  // possibly through TS wrappers?
  function isOptionalOperand(child, parent) {
    const slot = parent.isOptionalMemberExpression() ? 'object'
      : parent.isOptionalCallExpression() ? 'callee' : null;
    if (!slot) return false;
    let cur = parent.node[slot];
    while (cur && TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
    return cur === child.node;
  }

  function normalizeOptionalChain(path, stripFirstOptional) {
    let { parentPath } = path;
    // walk past TS wrappers (satisfies, as, !) between the replaced node and the optional chain
    while (parentPath && TS_EXPR_WRAPPERS.has(parentPath.node?.type)) ({ parentPath } = parentPath);
    if (!parentPath || !isOptionalOperand(path, parentPath)) return null;
    let topPath = null;
    let seenOptional = false;
    const isOptional = p => p.isOptionalMemberExpression() || p.isOptionalCallExpression();
    // eslint-disable-next-line no-unmodified-loop-condition -- safe
    while (isOptional(parentPath) && (!parentPath.node.optional || stripFirstOptional && !seenOptional)) {
      if (parentPath.node.optional) seenOptional = true;
      topPath = parentPath;
      deoptionalizeNode(parentPath);
      ({ parentPath } = parentPath);
    }
    return topPath;
  }

  function extractCheck(path, skipOptional) {
    const { node } = path;
    if (node.optional) {
      if (skipOptional?.(node, path.scope)) return [null, node.object];
      return memoize(node.object, path.scope);
    }
    if (!path.isOptionalMemberExpression()) return [null, node.object];
    let chainStart = null;
    let current = path.get('object');
    // skip TS wrappers (as, satisfies, !) that sit between the member and the inner chain
    const throughTS = current.node && TS_EXPR_WRAPPERS.has(current.node.type);
    while (current.node && TS_EXPR_WRAPPERS.has(current.node.type)) current = current.get('expression');
    while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
      if (current.node.optional) {
        chainStart = current;
        break;
      }
      current = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
    }
    if (!chainStart) return [null, node.object];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    // skip null-check when the optional is on a polyfillable expression (replacement consumes `?.`).
    // reassigning `chainStart.node[key]` swaps the receiver / callee with the memoized ref —
    // computed property nodes (`.property`) and call arguments (`.arguments`) on the same chainStart
    // remain untouched, so computed-property bootstrapping isn't disturbed
    let check = null;
    if (!skipOptional?.(chainStart.node, path.scope)) {
      let ref;
      [check, ref] = memoize(chainStart.node[key], path.scope);
      chainStart.node[key] = t.cloneNode(ref);
    }
    deoptionalizeNode(chainStart);
    for (let p = chainStart.parentPath; p !== path; p = p.parentPath) {
      if (p.isOptionalMemberExpression() || p.isOptionalCallExpression()) deoptionalizeNode(p);
    }
    return [check, node.object, throughTS];
  }

  function replaceAndWrap(replacePath, result, check, embedGuard) {
    // when check came through a TS wrapper (arr?.at(-1)!.includes), embed the guard
    // directly - Babel's path references become stale after replaceWith and the two-step
    // replace-then-wrap approach loses the guard. for normal chains (no TS wrapper),
    // use the two-step approach so normalizeOptionalChain correctly lifts the guard
    // past chain continuations like .valueOf()
    if (embedGuard) {
      replacePath.replaceWith(wrapConditional(check, result));
      normalizeOptionalChain(replacePath);
    } else {
      replacePath.replaceWith(result);
      const wrapPath = normalizeOptionalChain(replacePath) || replacePath;
      if (check) wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
    }
  }

  // walk past TS expression wrappers between a member expression and its enclosing call -
  // needed when @babel/plugin-transform-typescript runs after us so `arr.includes!(1)` is
  // not misclassified as non-call (which would emit `_includes(arr)` with broken `this`)
  function unwrapTSExpressionParent(path) {
    let current = path;
    while (current.parentPath && TS_EXPR_WRAPPERS.has(current.parentPath.node?.type)) {
      current = current.parentPath;
    }
    return current;
  }

  function replaceInstanceLike(path, id, skipOptional) {
    // (arr?.includes)(1) - parenthesized optional callee breaks the chain.
    // replace only the member expression, keep the original call site.
    // only for optional chains - non-optional (arr.includes)(1) preserves this
    if ((path.node.extra?.parenthesized || unwrapTSExpressionParent(path).node.extra?.parenthesized)
      && path.isOptionalMemberExpression()) {
      const [check, object, embed] = extractCheck(path, skipOptional);
      const lookup = t.callExpression(id, [t.cloneNode(object)]);
      replaceAndWrap(path, lookup, check, embed);
      return;
    }
    const callerPath = unwrapTSExpressionParent(path);
    const { parent } = callerPath;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent))
      && parent.callee === callerPath.node;
    const [check, object, embed] = extractCheck(path, skipOptional);
    const result = isCall
      ? buildMethodCall(id, object, path.scope, parent.arguments, parent.optional)
      : t.callExpression(id, [t.cloneNode(object)]);
    replaceAndWrap(isCall ? callerPath.parentPath : path, result, check, embed);
  }

  function replaceCallWithSimple(path, id, skipOptional) {
    const [check, object, embed] = extractCheck(path, skipOptional);
    // peel TS wrappers so the call (and not its `as X` / `!` envelope) is what we replace
    const callerPath = unwrapTSExpressionParent(path);
    replaceAndWrap(callerPath.parentPath, t.callExpression(id, [t.cloneNode(object)]), check, embed);
  }

  // Babel-style OR-chain for `(recv)?.inner?.(ia).outer(oa)`: runs outer directly on
  // `_m.call(_a, ia)` so value-undef (e.g. `[].at(99)`) reaches `_outer()` and throws
  // like native, while each `?.` contributes its own `null == ...` test.
  // caller (findInnerPolyChain) guarantees outer is a call expression
  function replaceInstanceChainCombined(outerPath, outerId, { innerCallee, innerArgs, innerId }) {
    const callerPath = unwrapTSExpressionParent(outerPath);
    const outerCall = callerPath.parent;
    const { scope } = outerPath;
    const nullTest = expr => t.binaryExpression('==', t.nullLiteral(), expr);
    const assign = (ref, value) => t.assignmentExpression('=', t.cloneNode(ref), value);

    const [anAssign, aRef] = memoize(innerCallee.object, scope);
    const mRef = generateRef(scope);
    const mCall = t.callExpression(
      t.memberExpression(t.cloneNode(mRef), t.identifier('call')),
      [t.cloneNode(aRef), ...innerArgs.map(a => t.cloneNode(a))]);

    const tests = [nullTest(anAssign),
      nullTest(assign(mRef, t.callExpression(t.cloneNode(innerId), [t.cloneNode(aRef)])))];
    let outerObject = mCall;
    // `?.method` as outer: nullish inner result must short-circuit the outer call too
    if (outerPath.node.optional) {
      const vRef = generateRef(scope);
      tests.push(nullTest(assign(vRef, mCall)));
      outerObject = t.cloneNode(vRef);
    }
    const testOr = tests.reduce((a, b) => t.logicalExpression('||', a, b));

    const replacement = buildMethodCall(outerId, outerObject, scope, outerCall.arguments, outerCall.optional);
    const conditional = t.conditionalExpression(testOr,
      t.unaryExpression('void', t.numericLiteral(0)), replacement);
    // chained outer calls read the hint off the result node; relocate the pre-combine
    // `annotateCallReturnType` stamp onto the wrapping conditional so they still resolve
    if (outerCall.coreJSResolvedType) conditional.coreJSResolvedType = outerCall.coreJSResolvedType;
    callerPath.parentPath.replaceWith(conditional);
  }

  function resolveDestructuringObject(path, resolvedType) {
    const parent = path.parentPath.parentPath;
    const initKey = parent.isVariableDeclarator() ? 'init'
      : parent.isAssignmentExpression() ? 'right' : null;
    if (!initKey) return null;
    const objectNode = parent.node[initKey];
    if (!objectNode) return null;
    // memoize non-identifier init when other properties remain to avoid double evaluation
    if (!t.isIdentifier(objectNode) && path.parentPath.node.properties.length > 1) {
      // declare=false: we emit our own `const _ref = init;` below, no extra `var _ref;`
      const ref = generateRef(path.scope, false);
      // for-init: splice as sibling declarator; declaration-level insertBefore would wrap
      // the whole for-init in an arrow-IIFE and lose the loop-header shape
      const isForInit = parent.isVariableDeclarator()
        && parent.parentPath?.parentPath?.isForStatement()
        && parent.parentPath.parentPath.node.init === parent.parentPath.node;
      if (isForInit) parent.insertBefore(t.variableDeclarator(ref, objectNode));
      else parent.parentPath.insertBefore(t.variableDeclaration('const', [
        t.variableDeclarator(ref, objectNode),
      ]));
      const cloned = t.cloneNode(ref);
      // store resolved type for subsequent destructured properties to resolve type hints
      if (resolvedType) cloned.coreJSResolvedType = resolvedType;
      parent.node[initKey] = cloned;
      return ref;
    }
    return objectNode;
  }

  // split multi-declarator VariableDeclaration into separate statements when all patterns resolved
  function trySplitDeclaration(declaration, isExport) {
    if (declaration.node.declarations.some(d => t.isObjectPattern(d.id))) return;
    const { kind } = declaration.node;
    const stmts = declaration.node.declarations.map(d => isExport
      ? t.exportNamedDeclaration(t.variableDeclaration(kind, [d]))
      : t.variableDeclaration(kind, [d]));
    declaration.replaceWithMultiple(stmts);
  }

  // bodyless control statement with side-effect: wrap in block to keep scope.
  // `cloneDeep` is necessary - the original `initNode` is still referenced by the
  // about-to-be-replaced declaration's path; reusing it would create node-identity aliasing
  // that babel's path tracker mishandles. expensive (deep walk) but bounded by init AST size
  function wrapBodylessWithSideEffect(declaration, initNode, extractedDeclaration) {
    declaration.replaceWith(t.blockStatement([
      t.expressionStatement(t.cloneDeep(initNode)),
      extractedDeclaration,
    ]));
  }

  // for-init with SE: keep SE inline so it doesn't escape the loop
  // static: for (var { from } = (se(), Array);;) -> for (var _ref = (se(), Array), from = _Array$from;;)
  // instance: for (var { at } = getObj();;) -> for (var at = _at(getObj());;) - SE consumed by call
  function handleForInitSE(declaration, parent, localBinding, value, scope, isStatic) {
    if (isStatic) {
      // static polyfill import - SE needs a dummy binding to stay in for-init
      const ref = generateRef(scope, false);
      const idx = declaration.node.declarations.indexOf(parent.node);
      if (idx !== -1) declaration.node.declarations.splice(idx, 1,
        t.variableDeclarator(ref, t.cloneDeep(parent.node.init)),
        t.variableDeclarator(localBinding, value));
    } else {
      // instance call already embeds the init - SE preserved by the call itself
      parent.node.id = localBinding;
      parent.node.init = value;
    }
  }

  // walk up from `path` to the nearest parent whose container is an array body (statement-level)
  // SwitchCase uses `consequent` instead of `body`
  function findStatementParent(path) {
    let stmt = path;
    while (stmt.parentPath && !Array.isArray(stmt.parentPath.node.body)
      && !Array.isArray(stmt.parentPath.node.consequent)) stmt = stmt.parentPath;
    return stmt;
  }

  // `replaceWith` doesn't register declarations on the target scope, so after collapsing
  // `const { X } = ...` to `const X = ...` a later visit of bare `X` would see an empty
  // scope and mistake `X` for an unbound global. safe only on `replaceWith` (original
  // bindings gone); `insertBefore` keeps the old declaration and duplicate-registering
  // the same name trips babel's block-scope collision check in rest / multi-prop paths
  function replaceWithAndRegister(path, node) {
    const [newPath] = path.replaceWith(node);
    newPath.scope.registerDeclaration(newPath);
  }

  // `(inner(), Array)` - when we lift the init as a standalone statement only the
  // side-effectful head is needed; the trailing value (`Array`, read by the destructure)
  // becomes a no-op read once extraction leaves no destructure target. trim it so the
  // emitted ExpressionStatement reads `inner();` instead of `inner(), Array;`
  function trimSideEffectTail(node) {
    if (!t.isSequenceExpression(node)) return node;
    const trimmed = [...node.expressions];
    while (trimmed.length > 1 && !mayHaveSideEffects(trimmed[trimmed.length - 1])) trimmed.pop();
    if (trimmed.length === node.expressions.length) return node;
    return trimmed.length === 1 ? trimmed[0] : t.sequenceExpression(trimmed);
  }

  function deferSideEffect(containerPath, initNode) {
    if (!initNode || !mayHaveSideEffects(initNode)) return;
    const stmt = findStatementParent(containerPath);
    const parentNode = stmt.parentPath?.node;
    const body = parentNode?.body ?? parentNode?.consequent;
    if (Array.isArray(body)) {
      const index = originalDeclKeys.get(containerPath.node) ?? stmt.key;
      // processDeferredSideEffects assumes each queued `node` is an ExpressionStatement
      // (the re-traversal visitor walks only its body and spawns nested polyfills from
      // `.expression`). emit as ExpressionStatement unconditionally; a future caller that
      // wants a different statement type must teach the consumer or wrap on its own
      deferredSideEffects.push({
        body, index,
        seq: deferredSideEffects.length,
        node: t.expressionStatement(t.cloneDeep(trimSideEffectTail(initNode))),
      });
    }
  }

  function handleDestructuredProperty(prop, value) {
    const propValue = prop.node.value,
          // captured before default-value processing turns Identifier into ConditionalExpression
          isStaticValue = t.isIdentifier(value);
    const objectPattern = prop.parentPath;
    // default value: { from = [] } = Array -> from = _from === void 0 ? [] : _from
    // instance calls need temp ref to avoid double evaluation
    let localBinding;
    if (t.isAssignmentPattern(propValue)) {
      localBinding = t.cloneNode(propValue.left);
      const needsTemp = t.isCallExpression(value);
      const ref = needsTemp ? generateRef(prop.scope) : value;
      const test = t.binaryExpression('===', needsTemp ? t.assignmentExpression('=', ref, value) : ref,
        t.unaryExpression('void', t.numericLiteral(0)));
      value = t.conditionalExpression(test, t.cloneNode(propValue.right), t.cloneNode(ref));
    } else {
      localBinding = t.cloneNode(propValue);
    }
    const parent = objectPattern.parentPath;

    // rest element present: keep property in pattern with renamed value to preserve rest semantics
    // const { from, ...rest } = Array -> const from = _from; const { from: _, ...rest } = Array
    const hasRest = objectPattern.node.properties.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
    // rest: rename property value to preserve rest semantics; otherwise remove property
    const isEmpty = hasRest ? false : (prop.remove(), objectPattern.node.properties.length === 0);
    if (hasRest) {
      // shared generator keeps babel and unplugin emitting identical `_unused` sentinels;
      // scope.generateUidIdentifier would diverge when babel's scope tracker sees
      // pre-existing `_unused*` bindings our injector hasn't learnt about
      prop.get('value').replaceWith(generateUnusedId());
      prop.node.shorthand = false;
    }

    if (parent.isVariableDeclarator()) {
      const declaration = parent.parentPath;
      // save original index before first insertBefore shifts it
      if (!originalDeclKeys.has(declaration.node)) {
        originalDeclKeys.set(declaration.node, findStatementParent(declaration).key);
      }
      const extractedDeclaration = t.variableDeclaration(declaration.node.kind, [
        t.variableDeclarator(localBinding, value),
      ]);
      const isExport = declaration.parentPath.isExportNamedDeclaration();
      const isMultiDecl = declaration.node.declarations.length > 1;
      const isForInit = declaration.parentPath?.isForStatement()
        && declaration.parentPath.node.init === declaration.node;
      // unbraced body of if/while/for-body/with/label - parent.body is a single node, not an array
      // SwitchCase uses `consequent` (array) instead of `body`
      const parentNode = declaration.parentPath?.node;
      const isBodyless = !isExport && !isForInit
        && !Array.isArray(parentNode?.body) && !Array.isArray(parentNode?.consequent);
      if (isEmpty) {
        if (isBodyless && isStaticValue && mayHaveSideEffects(parent.node.init)) {
          wrapBodylessWithSideEffect(declaration, parent.node.init, extractedDeclaration);
        } else if (isForInit) {
          // --- for-init: SE stays inline, can't be deferred outside the loop ---
          if (mayHaveSideEffects(parent.node.init)) handleForInitSE(declaration, parent, localBinding, value, prop.scope, isStaticValue);
          else if (isMultiDecl) {
            parent.node.id = localBinding;
            parent.node.init = value;
          } else replaceWithAndRegister(declaration, extractedDeclaration);
        } else {
          // --- block-level: defer SE to Program.exit, then replace ---
          if (isStaticValue) deferSideEffect(declaration, parent.node.init);
          if (isMultiDecl) {
            // earlier extractions from sibling props are already spliced in-line; swap the
            // now-empty parent declarator for the final one, then split mixed export runs
            const idx = declaration.node.declarations.indexOf(parent.node);
            if (idx !== -1) declaration.node.declarations.splice(idx, 1, t.variableDeclarator(localBinding, value));
            trySplitDeclaration(declaration, isExport);
          } else {
            replaceWithAndRegister(declaration, extractedDeclaration);
          }
        }
      } else if (isMultiDecl || isForInit) {
        // `parent.insertBefore` (VariableDeclarator-level) keeps babel-traverse path.key of
        // queued sibling declarators in sync. `declaration.insertBefore` would wrap a
        // for-init in an arrow-IIFE and lose the loop-header shape
        parent.insertBefore(t.variableDeclarator(localBinding, value));
      } else if (isExport) {
        declaration.parentPath.insertBefore(t.exportNamedDeclaration(extractedDeclaration));
      } else {
        declaration.insertBefore(extractedDeclaration);
      }
    } else {
      const assignment = t.expressionStatement(t.assignmentExpression('=', localBinding, value));
      const assignmentTarget = parent.parentPath;
      if (isEmpty) {
        if (isStaticValue) deferSideEffect(assignmentTarget, parent.node.right);
        assignmentTarget.replaceWith(assignment);
      } else {
        assignmentTarget.insertBefore(assignment);
      }
    }
  }

  return {
    isInTypeAnnotation,
    deferredSideEffects,
    deoptionalizeNode,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceInstanceChainCombined,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
    unwrapTSExpressionParent,
    reset,
  };
}
