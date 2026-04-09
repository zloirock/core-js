import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage';
import { findUniqueName } from '@core-js/polyfill-provider/helpers';

// TS-only expression wrappers - runtime no-ops that forward to their `.expression` child
const TS_EXPR_WRAPPERS = new Set([
  'TSNonNullExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
]);

export default function (t) {
  // memoized ancestor walk - cached on parent nodes so descendants share results
  // (overall O(node count) instead of O(node count * depth))
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
  function normalizeOptionalChain(path, stripFirstOptional) {
    let { parentPath } = path;
    if (parentPath.isOptionalMemberExpression()) {
      if (path.key !== 'object') return null;
    } else if (parentPath.isOptionalCallExpression()) {
      if (path.key !== 'callee') return null;
    } else return null;
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

  function handleDestructuredProperty(prop, value) {
    const propValue = prop.node.value;
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
    const objectPattern = prop.parentPath;
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
      // multi-declarator: modify in-place to avoid Babel traversal crash
      if (isEmpty && declaration.node.declarations.length > 1) {
        parent.node.id = localBinding;
        parent.node.init = value;
      } else {
        const extractedDeclaration = t.variableDeclaration(declaration.node.kind, [
          t.variableDeclarator(localBinding, value),
        ]);
        if (isEmpty) {
          declaration.replaceWith(extractedDeclaration);
        } else if (declaration.parentPath.isExportNamedDeclaration()) {
          declaration.parentPath.insertBefore(t.exportNamedDeclaration(extractedDeclaration));
        } else {
          declaration.insertBefore(extractedDeclaration);
        }
      }
    } else {
      const assignment = t.expressionStatement(t.assignmentExpression('=', localBinding, value));
      const assignmentTarget = parent.parentPath;
      if (isEmpty) {
        assignmentTarget.replaceWith(assignment);
      } else {
        assignmentTarget.insertBefore(assignment);
      }
    }
  }

  return {
    isInTypeAnnotation,
    deoptionalizeNode,
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
    unwrapTSExpressionParent,
  };
}
