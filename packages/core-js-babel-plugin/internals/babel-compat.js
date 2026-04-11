import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage';
import { findUniqueName, mayHaveSideEffects, TS_EXPR_WRAPPERS } from '@core-js/polyfill-provider/helpers';

export default function (t) {
  // side-effect expressions from destructuring inits - deferred to Program.exit
  const deferredSideEffects = [];
  // original body index of each declaration, before insertBefore shifts it
  const originalDeclKeys = new WeakMap();
  // pending extracted declarators per ObjectPattern (for multi-declarator source-order split)
  const pendingExtractions = new WeakMap();

  // memoized ancestor walk - cached on parent nodes so descendants share results
  const typeAnnotationCache = new WeakMap();
  function isInTypeAnnotation(path) {
    const visited = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      const { node } = current;
      if (!node) break;
      if (typeAnnotationCache.has(node)) {
        const cached = typeAnnotationCache.get(node);
        for (const n of visited) typeAnnotationCache.set(n, cached);
        return cached;
      }
      if (isTypeAnnotationNodeType(node.type)) {
        typeAnnotationCache.set(node, true);
        for (const n of visited) typeAnnotationCache.set(n, true);
        return true;
      }
      visited.push(node);
    }
    for (const n of visited) typeAnnotationCache.set(n, false);
    return false;
  }

  // identifiers and `this` are safe to double-evaluate (no side effects, no temp ref needed).
  // we DO NOT peel TS-only wrappers (`!`/`as`/`satisfies`) here - keeping them in the
  // memoize check makes the unplugin (which uses a source-text regex) and babel agree on
  // when to introduce a `_ref`, which is especially important inside optional chains
  const isSafeToReuse = node => t.isIdentifier(node) || t.isThisExpression(node);

  // own UID generator for `_ref` temp variables - bypasses Babel's
  // scope.generateUidIdentifier which strips trailing digits from the hint, producing wrong
  // numbering (after `_ref9` -> `_ref0`, `_ref1` instead of `_ref10`, `_ref11`).
  // declare=true uses scope.push (handles arrow expression body -> block conversion correctly);
  // declare=false skips the push for callers that build their own initialized declaration
  // (e.g. destructuring extracts a const). generated names are tracked per file via REFS_KEY
  // so subsequent calls don't reuse a name or collide with one we generated earlier.
  // we also publish the chosen name into Babel's `program.references`/`program.uids` so that
  // sibling transforms running afterwards (e.g. plugin-transform-computed-properties) don't
  // hand the same name to a temp var via `scope.generateUidIdentifierBasedOnNode` -
  // when declare=false the binding isn't registered, so without this they would collide
  const REFS_KEY = Symbol('coreJSRefs');

  function generateRef(scope, declare = true) {
    const program = scope.getProgramParent();
    const refs = program.path.node[REFS_KEY] ??= new Set();
    const name = findUniqueName('_ref', refs.size === 0 ? null : refs.size + 1, 2,
      n => refs.has(n) || scope.hasBinding(n) || program.references[n] || program.uids[n]);
    refs.add(name);
    program.references[name] = true;
    program.uids[name] = true;
    const id = t.identifier(name);
    if (declare) scope.push({ id });
    return id;
  }

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
    while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
      if (current.node.optional) {
        chainStart = current;
        break;
      }
      current = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
    }
    if (!chainStart) return [null, node.object];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    // skip null-check when the optional is on a polyfillable expression (replacement consumes `?.`)
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
    return [check, node.object];
  }

  function replaceAndWrap(replacePath, result, check) {
    replacePath.replaceWith(result);
    const wrapPath = normalizeOptionalChain(replacePath) || replacePath;
    if (check) wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
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
    const callerPath = unwrapTSExpressionParent(path);
    const { parent } = callerPath;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent))
      && parent.callee === callerPath.node;
    const [check, object] = extractCheck(path, skipOptional);
    const result = isCall
      ? buildMethodCall(id, object, path.scope, parent.arguments, parent.optional)
      : t.callExpression(id, [t.cloneNode(object)]);
    replaceAndWrap(isCall ? callerPath.parentPath : path, result, check);
  }

  function replaceCallWithSimple(path, id, skipOptional) {
    const [check, object] = extractCheck(path, skipOptional);
    // peel TS wrappers so the call (and not its `as X` / `!` envelope) is what we replace
    const callerPath = unwrapTSExpressionParent(path);
    replaceAndWrap(callerPath.parentPath, t.callExpression(id, [t.cloneNode(object)]), check);
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
      parent.parentPath.insertBefore(t.variableDeclaration('const', [
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

  // bodyless control statement with side-effect: wrap in block to keep scope
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
  function findStatementParent(path) {
    let stmt = path;
    while (stmt.parentPath && !Array.isArray(stmt.parentPath.node.body)) stmt = stmt.parentPath;
    return stmt;
  }

  function deferSideEffect(containerPath, initNode) {
    if (!initNode || !mayHaveSideEffects(initNode)) return;
    const stmt = findStatementParent(containerPath);
    const body = stmt.parentPath?.node?.body;
    if (Array.isArray(body)) {
      const index = originalDeclKeys.get(containerPath.node) ?? stmt.key;
      deferredSideEffects.push({
        body, index,
        seq: deferredSideEffects.length,
        node: t.expressionStatement(t.cloneDeep(initNode)),
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
    if (hasRest) {
      prop.get('value').replaceWith(prop.scope.generateUidIdentifier('unused'));
      prop.node.shorthand = false;
    } else {
      prop.remove();
    }
    const isEmpty = !hasRest && objectPattern.node.properties.length === 0;

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
      const isBodyless = !isExport && !isForInit && !Array.isArray(declaration.parentPath?.node?.body);
      if (isEmpty) {
        if (isBodyless && isStaticValue && mayHaveSideEffects(parent.node.init)) {
          wrapBodylessWithSideEffect(declaration, parent.node.init, extractedDeclaration);
        } else if (isForInit) {
          // --- for-init: SE stays inline, can't be deferred outside the loop ---
          if (mayHaveSideEffects(parent.node.init)) handleForInitSE(declaration, parent, localBinding, value, prop.scope, isStaticValue);
          else if (isMultiDecl) {
            parent.node.id = localBinding;
            parent.node.init = value;
          } else declaration.replaceWith(extractedDeclaration);
        } else {
          // --- block-level: defer SE to Program.exit, then replace ---
          if (isStaticValue) deferSideEffect(declaration, parent.node.init);
          if (isMultiDecl) {
            const pending = pendingExtractions.get(objectPattern.node) ?? [];
            pending.push(t.variableDeclarator(localBinding, value));
            const idx = declaration.node.declarations.indexOf(parent.node);
            if (idx !== -1) declaration.node.declarations.splice(idx, 1, ...pending);
            trySplitDeclaration(declaration, isExport);
          } else {
            declaration.replaceWith(extractedDeclaration);
          }
        }
      } else if (isMultiDecl && !isForInit) {
        // non-last property: collect for batch insertion when isEmpty fires
        if (!pendingExtractions.has(objectPattern.node)) pendingExtractions.set(objectPattern.node, []);
        pendingExtractions.get(objectPattern.node).push(t.variableDeclarator(localBinding, value));
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
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
    unwrapTSExpressionParent,
  };
}
