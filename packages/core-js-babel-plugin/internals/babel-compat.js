import { isTypeAnnotationNodeType } from '@core-js/polyfill-provider/detect-usage';

export default function (t) {
  function isInTypeAnnotation(path) {
    return !!path.findParent(p => isTypeAnnotationNodeType(p.node.type));
  }

  function memoize(node, scope) {
    if (t.isIdentifier(node)) return [t.cloneNode(node), node];
    const ref = scope.generateDeclaredUidIdentifier('ref');
    return [t.assignmentExpression('=', t.cloneNode(ref), node), ref];
  }

  function wrapConditional(check, result) {
    return t.conditionalExpression(
      t.binaryExpression('==', check, t.nullLiteral()),
      t.unaryExpression('void', t.numericLiteral(0)),
      result,
    );
  }

  function buildMethodCall(id, object, scope, args, optionalCall) {
    const [assign, ref] = memoize(object, scope);
    const callMember = optionalCall
      ? t.optionalMemberExpression(t.callExpression(id, [assign]), t.identifier('call'), false, true)
      : t.memberExpression(t.callExpression(id, [assign]), t.identifier('call'));
    return optionalCall
      ? t.optionalCallExpression(callMember, [t.cloneNode(ref), ...args], false)
      : t.callExpression(callMember, [t.cloneNode(ref), ...args]);
  }

  function deoptionalizeNode(path) {
    const type = path.isOptionalMemberExpression() ? 'MemberExpression' : 'CallExpression';
    path.node.type = type;
    path.type = type;
    delete path.node.optional;
  }

  function normalizeOptionalChain(path, all) {
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
    while (isOptional(parentPath) && (!parentPath.node.optional || all && !seenOptional)) {
      if (parentPath.node.optional) seenOptional = true;
      topPath = parentPath;
      deoptionalizeNode(parentPath);
      ({ parentPath } = parentPath);
    }
    return topPath;
  }

  function extractCheck(path) {
    const { node } = path;
    if (node.optional) return memoize(node.object, path.scope);
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
    const [check, ref] = memoize(chainStart.node[key], path.scope);
    chainStart.node[key] = t.cloneNode(ref);
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

  function replaceInstanceLike(path, id) {
    const { node, parent } = path;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent)) && parent.callee === node;
    const [check, object] = extractCheck(path);
    const result = isCall
      ? buildMethodCall(id, object, path.scope, parent.arguments, parent.optional)
      : t.callExpression(id, [t.cloneNode(object)]);
    replaceAndWrap(isCall ? path.parentPath : path, result, check);
  }

  function replaceCallWithSimple(path, id) {
    const [check, object] = extractCheck(path);
    replaceAndWrap(path.parentPath, t.callExpression(id, [t.cloneNode(object)]), check);
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
      const ref = path.scope.generateUidIdentifier('ref');
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
    const localBinding = t.cloneNode(prop.node.value);
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
    normalizeOptionalChain,
    replaceInstanceLike,
    replaceCallWithSimple,
    resolveDestructuringObject,
    handleDestructuredProperty,
  };
}
