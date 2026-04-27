// polyfill emission pipeline. covers all kinds dispatched from the usage-pure visitor:
// instance-method member-call rewrites (with optional-chain handling, Symbol.iterator special
// path, receiver-polyfill substitution, chain composition), global / static member rewrites
// (shorthand / export / super-call / TS-wrapper / optional-chain deoptimization), and `in`
// expression rewrites (Symbol.X / generic key probe -> `true`). factory captures closure deps
// from the outer transform context (code / scopeTracker / transforms / injector / Sets /
// resolver hooks).
import {
  hasSideEffectfulSequencePrefix,
  TS_EXPR_WRAPPERS,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import { findProxyGlobal } from '@core-js/polyfill-provider/detect-usage/resolve';
import { isPolyfillableOptional } from '@core-js/polyfill-provider/detect-usage/annotations';
import { resolveSymbolInEntry } from '@core-js/polyfill-provider/detect-usage/members';
import { createRewriteHint } from './transform-queue.js';
import {
  isCallee,
  unwrapNode,
  unwrapNodeForMemoize,
} from './emit-utils.js';
import { skipGap, walkAstNodes } from './plugin-helpers.js';

export function createPolyfillEmitter({
  canFuseWithOpenParen,
  code,
  estreeAdapter,
  injectPureImport,
  isEntryNeeded,
  NEEDS_GUARD_PARENS,
  NO_REF_NEEDED,
  resolveGlobalPolyfill,
  resolvePureOrGlobalFallback,
  scopeTracker,
  skippedNodes,
  startsEnclosingStatement,
  transforms,
}) {
  function nodeSrc(n) {
    return code.slice(n.start, n.end);
  }

  // wrap a polyfill binding in a source-level SequenceExpression carrying any side
  // effects collected from the receiver / computed-key. noop when empty - callers can
  // invoke unconditionally. mirrors `withSideEffects` in babel-plugin, text-based
  function wrapSideEffects(binding, sideEffects) {
    return sideEffects?.length
      ? `(${ sideEffects.map(e => nodeSrc(e)).join(', ') }, ${ binding })`
      : binding;
  }

  // a `(`-leading replacement at a statement-leading slot can fuse with the previous
  // line into a call (`a\n(...)` -> `a(...)`); inject `;` only when both conditions hit
  function asiGuardLeadingParen(replacement, metaPath, start) {
    return replacement[0] === '('
      && startsEnclosingStatement(metaPath, start)
      && canFuseWithOpenParen(code, start)
      ? `;${ replacement }`
      : replacement;
  }

  // source of `node` with its outer `ParenthesizedExpression` wrapper dropped - except
  // when the inner is a `SequenceExpression` (dropping the parens changes semantics)
  function unwrapParensSrc(node) {
    return nodeSrc(node.type === 'ParenthesizedExpression'
      && node.expression.type !== 'SequenceExpression' ? node.expression : node);
  }

  // strip `?.` at known absolute positions within a source slice
  function stripOptionalDots(src, baseOffset, positions) {
    if (!positions?.length) return src;
    const sorted = [...positions].sort((a, b) => a - b);
    let result = '';
    let prev = 0;
    for (const absPos of sorted) {
      let rel = absPos - baseOffset;
      if (rel < 0 || rel >= src.length) continue;
      rel = skipGap(src, rel);
      if (rel >= src.length || src[rel] !== '?' || src[rel + 1] !== '.') continue;
      result += src.slice(prev, rel);
      const afterQ = skipGap(src, rel + 2);
      prev = (src[afterQ] === '[' || src[afterQ] === '(') ? rel + 2 : rel + 1;
    }
    return result + src.slice(prev);
  }

  // walk the chain to find the first non-polyfillable optional, skipping TS wrappers
  function findChainRoot(node, scope) {
    function chainChild(n) {
      return n.object || n.callee || (TS_EXPR_WRAPPERS.has(n.type) ? n.expression : null);
    }
    function makeResult(optionalNode) {
      const rootNode = optionalNode.object || optionalNode.callee;
      const deoptPositions = [];
      let cur = chainChild(node);
      while (cur && typeof cur === 'object') {
        if (cur.optional) {
          const pos = cur.object?.end ?? cur.callee?.end;
          if (pos !== undefined) deoptPositions.push(pos);
        }
        if (cur === optionalNode) break;
        cur = chainChild(cur);
      }
      return { root: unwrapParensSrc(rootNode), rootRaw: nodeSrc(rootNode), deoptPositions, rootNode };
    }
    const isPoly = n => isPolyfillableOptional(n, scope, estreeAdapter, resolveBuiltIn);
    let current = node.optional ? node : chainChild(node);
    while (current && typeof current === 'object') {
      if (current.optional) {
        return isPoly(current) ? { root: null } : makeResult(current);
      }
      current = chainChild(current);
    }
    return { root: null };
  }

  // build the replacement text for an instance method or Symbol.iterator transform
  function buildReplacement(binding, objectSrc, opts) {
    const {
      isCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
      optionalCall, args, objectStart, preAllocatedGuardRef, sideEffects,
    } = opts;
    const strip = src => stripOptionalDots(src, objectStart ?? 0, deoptPositions);
    let bodyObj = deoptPositions?.length ? strip(objectSrc) : objectSrc;
    let guard = '';
    let guardRef = null;

    if (optionalRoot) {
      if (/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)) {
        guard = `${ optionalRoot } == null ? void 0 : `;
      } else {
        guardRef = preAllocatedGuardRef ?? scopeTracker.genRef();
        guard = `null == (${ guardRef } = ${ optionalRoot }) ? void 0 : `;
        bodyObj = guardRef + bodyObj.slice(strip(rootRaw).length);
      }
    }

    let split = null;
    let body;
    if (isNew) {
      body = `new (${ binding }(${ bodyObj }))(${ args || '' })`;
    } else if (!isCall) {
      body = `${ binding }(${ bodyObj })`;
    } else {
      const ref = isNonIdent && bodyObj !== guardRef ? scopeTracker.genRef() : null;
      const obj = ref || bodyObj;
      const firstArg = ref ? `${ ref } = ${ bodyObj }` : bodyObj;
      const dot = optionalCall ? '?.' : '.';
      const argsPart = args ? `, ${ args }` : '';
      const prefix = `${ binding }(${ firstArg })`;
      const suffix = `${ dot }call(${ obj }${ argsPart })`;
      body = `${ prefix }${ suffix }`;
      if (!guard && !sideEffects?.length) split = { prefix, suffix };
    }
    const replacement = `${ guard }${ wrapSideEffects(body, sideEffects) }`;
    return { replacement, split };
  }

  // position past optional `?.` token after pos, skipping whitespace and comments
  function afterOptional(pos, keepDot) {
    const p = skipGap(code, pos);
    return code[p] === '?' && code[p + 1] === '.' ? (keepDot ? p + 1 : p + 2) : pos;
  }

  function skipProxyGlobal(node) {
    const proxy = findProxyGlobal(node);
    if (proxy) skippedNodes.add(proxy);
  }

  // mark a node and its transparent wrappers (parens, ChainExpression, TS wrappers) as skipped
  function skipWrappedNode(node) {
    let cur = node;
    while (cur) {
      skippedNodes.add(cur);
      if (cur.type === 'ParenthesizedExpression' || cur.type === 'ChainExpression'
          || TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
      else break;
    }
  }

  // resolve optional root + skip redundant guard when nested inside an outer transform
  function resolveOptionalRoot(node, parent, isCall, scope) {
    let { root, rootRaw, deoptPositions, rootNode } = findChainRoot(node, scope);
    if (root) {
      const start = isCall ? parent.start : node.start;
      const end = isCall ? parent.end : node.end;
      if (transforms.hasGuardFor(start, end, rootNode)) root = null;
    }
    return { optionalRoot: root, rootRaw, deoptPositions, rootNode };
  }

  // slice the original source between a call expression's parentheses, preserving every byte
  function sliceBetweenParens(callNode) {
    if (callNode.callee?.end === undefined || callNode.end === undefined) return null;
    const closeParen = callNode.end - 1;
    if (code[closeParen] !== ')') return null;
    const afterCallee = callNode.typeArguments?.end ?? callNode.callee.end;
    const openParen = skipGap(code, afterOptional(afterCallee, false));
    if (code[openParen] !== '(') return null;
    return code.slice(openParen + 1, closeParen);
  }

  // does guard ternary need () to preserve correct precedence?
  function guardNeedsParens(metaPath, isCall, start, end) {
    let outer = (isCall ? metaPath.parentPath : metaPath)?.parentPath;
    while (outer?.node && (outer.node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(outer.node.type))) {
      outer = outer.parentPath;
    }
    if (NEEDS_GUARD_PARENS.has(outer?.node?.type)) return true;
    if (outer?.node?.type === 'ConditionalExpression' && outer.node.test?.end === end) return true;
    const p = skipGap(code, end);
    return code[p] === '?' && code[p + 1] === '.' && !transforms.containsRange(start, end);
  }

  // build replacement, wrap guard if needed, add to transform queue
  function addInstanceTransform(binding, node, parent, metaPath, isCall, replacementIsCall = isCall, sideEffects = null) {
    const receiverPure = resolveReceiverPolyfill(node.object, metaPath);
    let objectSrc = receiverPure
      ? injectPureImport(receiverPure.entry, receiverPure.hintName)
      : unwrapParensSrc(node.object);
    let isNonIdent = receiverPure ? false : !NO_REF_NEEDED.has(unwrapNodeForMemoize(node.object).type);
    if (receiverPure) skippedNodes.add(node.object);
    const { optionalRoot, rootRaw, deoptPositions, rootNode } = resolveOptionalRoot(node, parent, isCall, metaPath?.scope);
    let reusedOuterRef = null;
    if (!optionalRoot && rootNode && node.object === rootNode) {
      const outerRef = transforms.findOuterGuardRef(rootNode);
      if (outerRef) {
        objectSrc = outerRef;
        isNonIdent = false;
        reusedOuterRef = outerRef;
      }
    }
    const argsSrc = isCall ? sliceBetweenParens(parent) : null;
    const start = isCall ? parent.start : node.start;
    const end = isCall ? parent.end : node.end;
    const isNew = parent?.type === 'NewExpression';
    const preAllocatedGuardRef = optionalRoot
        && !/^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(optionalRoot)
        ? scopeTracker.genRef() : null;

    const built = buildReplacement(binding, objectSrc, {
      isCall: replacementIsCall, isNew, isNonIdent, optionalRoot, rootRaw, deoptPositions,
      optionalCall: isCall && parent.optional, args: argsSrc,
      objectStart: node.object.start,
      preAllocatedGuardRef, sideEffects,
    });
    let { replacement } = built;
    const { split } = built;
    if (optionalRoot && guardNeedsParens(metaPath, isCall, start, end)) {
      replacement = asiGuardLeadingParen(`(${ replacement })`, metaPath, start);
    }
    const hint = createRewriteHint({
      rootRaw,
      guardRef: preAllocatedGuardRef ?? reusedOuterRef,
      deoptPositions,
      objectStart: node.object.start,
      absorbsRoot: !!reusedOuterRef,
    });
    const splitPoint = node.object.end;
    const canSplit = split && !optionalRoot && !receiverPure && !reusedOuterRef
      && !rootNode
      && splitPoint > start && splitPoint < end;
    if (canSplit) {
      transforms.addSplit(start, splitPoint, end, split.prefix, split.suffix, null, hint);
    } else {
      transforms.add(start, end, replacement, optionalRoot ? rootNode : null, hint);
    }
    if (isCall) skippedNodes.add(parent);
    skipProxyGlobal(node);
  }

  function handleSymbolIterator(meta, node, parent, metaPath) {
    if (node.object?.type === 'Super') return;
    if (node.computed && hasSideEffectfulSequencePrefix(node.property)) return;
    const isCallParent = isCallee(node, parent);
    const isPlainCall = isCallParent && parent.type === 'CallExpression';
    const entry = isPlainCall && parent.arguments.length === 0 && !parent.optional
        ? 'get-iterator' : 'get-iterator-method';
    if (!isEntryNeeded(entry)) return;
    const binding = injectPureImport(entry, entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod');
    addInstanceTransform(binding, node, parent, metaPath, isCallParent,
      isCallParent && (parent.arguments.length > 0 || parent.optional));
    if (node.property) skipWrappedNode(node.property);
  }

  function resolveReceiverPolyfill(obj, metaPath) {
    if (obj?.type !== 'Identifier') return null;
    if (metaPath?.scope?.hasBinding?.(obj.name)) return null;
    return resolveGlobalPolyfill(obj.name);
  }

  // text-based Babel-style OR-chain (see babel-compat.js replaceInstanceChainCombined)
  function findInnerPolyChain(node, parent, metaPath) {
    if (!isCallee(node, parent) || node.type !== 'MemberExpression' || node.computed) return null;
    let current = node.object;
    while (current && (current.type === 'ParenthesizedExpression'
        || current.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(current.type))) {
      current = current.expression;
    }
    while (current && (current.type === 'MemberExpression' || current.type === 'CallExpression')) {
      if (current.optional) break;
      current = current.type === 'MemberExpression' ? current.object : current.callee;
    }
    if (current?.type !== 'CallExpression' || !current.optional) return null;
    const { callee } = current;
    if (callee?.type !== 'MemberExpression' || callee.computed) return null;
    if (callee.property?.type !== 'Identifier') return null;
    const meta = { kind: 'property', object: null, key: callee.property.name, placement: 'prototype' };
    const { result } = resolvePureOrGlobalFallback(meta, metaPath.get('object').get('callee'));
    if (result?.kind !== 'instance') return null;
    return { chainStart: current, innerCallee: callee, innerResult: result };
  }

  function replaceInstanceChainCombined(outerBinding, node, parent, metaPath, chain) {
    const { chainStart, innerCallee, innerResult } = chain;
    const innerBinding = injectPureImport(innerResult.entry, innerResult.hintName);
    const aRef = scopeTracker.genRef();
    const mRef = scopeTracker.genRef();
    const outerRef = scopeTracker.genRef();
    const innerArgs = sliceBetweenParens(chainStart) ?? '';
    const outerArgs = sliceBetweenParens(parent) ?? '';
    const innerCall = `${ mRef }.call(${ aRef }${ innerArgs ? `, ${ innerArgs }` : '' })`;
    const receiver = unwrapParensSrc(innerCallee.object);

    const tests = [
      `null == (${ aRef } = ${ receiver })`,
      `null == (${ mRef } = ${ innerBinding }(${ aRef }))`,
    ];
    let outerObj;
    if (node.optional) {
      tests.push(`null == (${ outerRef } = ${ innerCall })`);
      outerObj = outerRef;
    } else {
      outerObj = `${ outerRef } = ${ innerCall }`;
    }
    const dot = parent.optional ? '?.' : '.';
    const suffix = outerArgs ? `, ${ outerArgs }` : '';
    let replacement = `${ tests.join(' || ') } ? void 0 : ${ outerBinding }(${ outerObj })${ dot }call(${ outerRef }${ suffix })`;
    if (guardNeedsParens(metaPath, true, parent.start, parent.end)) replacement = `(${ replacement })`;

    transforms.add(parent.start, parent.end, replacement);
    skippedNodes.add(innerCallee);
    skippedNodes.add(parent);
    skipProxyGlobal(node);
  }

  function replaceInstance(binding, node, parent, metaPath, sideEffects) {
    if (isCallee(node, parent) && parent.callee !== node
        && parent.callee?.type === 'ParenthesizedExpression' && node.optional) {
      addInstanceTransform(binding, node, parent, metaPath, false, false, sideEffects);
      return;
    }
    const chain = findInnerPolyChain(node, parent, metaPath);
    if (chain) return replaceInstanceChainCombined(binding, node, parent, metaPath, chain);
    const isCall = isCallee(node, parent);
    addInstanceTransform(binding, node, parent, metaPath, isCall, isCall, sideEffects);
  }

  // replace global identifier or static member with polyfill import binding. the
  // shorthand / export / super early-returns don't carry side effects (Identifier /
  // Super can't host a SequenceExpression); only the final MemberExpression replacement
  // wraps with `sideEffects` from the receiver / computed-key
  function replaceGlobalOrStatic(binding, node, parent, metaPath, sideEffects) {
    // oxc emits two Identifier nodes (key + value, or local + exported) sharing the
    // same source range for shorthand `{ Promise }` and bare `export { Promise }`
    const directParent = metaPath.parent;
    if (node.type === 'Identifier' && directParent?.type === 'Property' && directParent.shorthand
        && directParent.value === node && metaPath.parentPath?.parent?.type === 'ObjectExpression') {
      return transforms.add(node.start, node.end, `${ node.name }: ${ binding }`);
    }
    // shorthand `export { Promise }` - ESTree sets `local === exported` by reference;
    // `local === exported` identity is the canonical shorthand test (range-only match
    // would also pass for `export { Promise as Promise }`, which is a valid distinction)
    if (node.type === 'Identifier' && directParent?.type === 'ExportSpecifier'
        && directParent.local === node && directParent.exported === node) {
      return transforms.add(node.start, node.end, `${ binding } as ${ node.name }`);
    }
    // super.method(args) -> binding.call(this, args) to preserve this-binding.
    // `sliceBetweenParens` keeps every byte between `(` and `)` (comments, whitespace,
    // trailing commas); `sep` branches on AST arity so `super.foo(/* c */)` (no real args,
    // comment still round-trips inside argsSrc) doesn't get a dangling leading comma
    if (node.object?.type === 'Super' && parent?.type === 'CallExpression' && isCallee(node, parent)) {
      const argsSrc = sliceBetweenParens(parent) ?? '';
      const sep = parent.arguments.length ? ', ' : '';
      return transforms.add(parent.start, parent.end, `${ binding }.call(this${ sep }${ argsSrc })`);
    }
    // strip TS wrappers (satisfies, as, !) - meaningless after polyfill replacement
    let { start, end } = node;
    let wrapperPath = metaPath.parentPath;
    while (wrapperPath?.node && (TS_EXPR_WRAPPERS.has(wrapperPath.node.type)
        || wrapperPath.node.type === 'ParenthesizedExpression')) {
      ({ start, end } = wrapperPath.node);
      wrapperPath = wrapperPath.parentPath;
    }
    // deoptionalize `?.` - polyfill import is always defined
    if (parent?.type === 'CallExpression' && parent.optional && isCallee(node, parent)) {
      start = parent.callee.start;
      end = afterOptional(parent.callee.end, false);
    } else if (parent?.type === 'MemberExpression' && parent.optional && unwrapNode(parent.object) === node) {
      start = parent.object.start;
      end = afterOptional(parent.object.end, !parent.computed);
    }
    transforms.add(start, end, asiGuardLeadingParen(wrapSideEffects(binding, sideEffects), metaPath, start));
  }

  // `key in obj` rewrite: Symbol-sourced LHS (`Symbol.X in obj`) takes the symbol-in
  // polyfill path; bare-name LHS with statically-known polyfilled key (`'from' in Array`)
  // folds the whole expression to `true` (polyfill is always defined). string-keyed Symbol
  // (`'Symbol.X' in Obj`) falls through to the bare-name branch via its string key
  function handleInExpression(meta, metaPath) {
    const { node } = metaPath;
    const symbolIn = meta.symbolSourced ? resolveSymbolInEntry(meta.key) : null;
    if (symbolIn && isEntryNeeded(symbolIn.entry)) {
      const binding = injectPureImport(symbolIn.entry, symbolIn.hint);
      if (meta.key === 'Symbol.iterator') {
        transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.right) })`);
        skipWrappedNode(node.left);
      } else {
        transforms.add(node.left.start, node.left.end, binding);
      }
    } else if (meta.object) {
      // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable
      const resolved = resolvePureOrGlobalFallback(meta, metaPath);
      if (resolved.result) {
        transforms.add(node.start, node.end, 'true');
        // marking only `node.right` leaves nested identifiers (`foo.bar.baz` -> `foo`)
        // visible to child visitors, which would emit spurious polyfill imports for
        // code the `'true'` replacement has already discarded
        walkAstNodes(node.right, n => skippedNodes.add(n));
        skipProxyGlobal(node.right);
      }
    }
  }

  return {
    addInstanceTransform,
    afterOptional,
    asiGuardLeadingParen,
    handleInExpression,
    handleSymbolIterator,
    nodeSrc,
    replaceGlobalOrStatic,
    replaceInstance,
    replaceInstanceChainCombined,
    resolveReceiverPolyfill,
    skipProxyGlobal,
    skipWrappedNode,
    sliceBetweenParens,
    unwrapParensSrc,
    wrapSideEffects,
  };
}
