import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import { buildOffsetToLine, isCoreJSFile, parseDisableDirectives, mergeVisitors } from '@core-js/polyfill-provider/helpers';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { createPolyfillResolver } from '@core-js/polyfill-provider/resolver';
import { createModuleInjectors, createUsageGlobalCallback } from '@core-js/polyfill-provider/plugin-options';
import { nodeType, types } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import TransformQueue from './transform-queue.js';
import detectEntries from './detect-entry.js';
import {
  canTransformDestructuring as sharedCanTransformDestructuring,
  resolveSymbolIteratorEntry,
  resolveSymbolInEntry,
  isTypeAnnotationNodeType,
  findProxyGlobal,
} from '@core-js/polyfill-provider/detect-usage';
import { createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';

const typeResolvers = createResolveNodeType(nodeType, types);

export default function createPlugin(options) {
  const { resolver, createDebugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    isMemberLike: path => path.node?.type === 'MemberExpression',
    isCallee: (node, parent) => parent && parent.callee === node
      && (parent.type === 'CallExpression' || parent.type === 'NewExpression'),
    isSpreadElement: node => node?.type === 'SpreadElement',
  });

  const { method, absoluteImports, importStyle: importStyleOption, bundler } = options;
  const {
    mode, pkg, getModulesForEntry, getCoreJSEntry, isEntryNeeded,
    resolveUsage, resolvePure, resolvePureOrGlobalFallback,
  } = resolver;
  const isWebpack = bundler === 'webpack' || bundler === 'rspack';

  return {
    name: 'core-js-unplugin',

    transform(code, id) {
      if (isCoreJSFile(id)) return null;

      // parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const { program: ast, comments, errors } = parseSync(id, code, { sourceType: 'module' });
      if (errors?.length) return null;

      const importStyle = importStyleOption ?? 'import';

      // check disable directives
      const offsetToLine = buildOffsetToLine(code);
      const directives = parseDisableDirectives(comments, offsetToLine);
      if (directives === true) return null; // entire file disabled
      const disabledLines = directives;

      function isDisabled(node) {
        if (!disabledLines) return false;
        if (node.start === undefined) return false;
        return disabledLines.has(offsetToLine(node.start));
      }

      const ms = new MagicString(code);
      const injector = new ImportInjector({ ms, pkg, mode, absoluteImports, importStyle });

      const debugOutput = createDebugOutput?.() ?? null;

      const { injectModulesForEntry, injectModulesForModeEntry, outputDebug } = createModuleInjectors({
        mode,
        getModulesForEntry,
        getDebugOutput() { return debugOutput; },
        injectGlobal: moduleName => injector.addGlobalImport(moduleName),
      });

      function injectPureImport(entry, hint) {
        debugOutput?.add(entry);
        return injector.addPureImport(entry, hint);
      }

      function finalize() {
        injector.flush();
        outputDebug();
        if (ms.hasChanged()) return { code: ms.toString(), map: ms.generateMap({ hires: 'boundary' }) };
        return null;
      }

      // entry-global mode
      if (method === 'entry-global') {
        const entryFound = detectEntries(ast, {
          getCoreJSEntry,
          injectModulesForEntry,
          isDisabled,
          ms,
        });
        if (entryFound) debugOutput?.markEntryFound();
        return finalize();
      }

      // usage-global mode
      if (method === 'usage-global') {
        const usageGlobalCallback = createUsageGlobalCallback({
          resolveUsage, injectModulesForModeEntry,
          isDisabled,
        });

        const usageVisitors = createUsageVisitors({ onUsage: usageGlobalCallback });
        const syntaxVisitors = createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });

        traverse(ast, mergeVisitors({
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...usageVisitors,
        }, syntaxVisitors));

        return finalize();
      }

      // usage-pure mode
      if (method === 'usage-pure') {
        const skippedNodes = new WeakSet();
        const transforms = new TransformQueue(code, ms);

        function genUid() { return injector.generateRef(); }
        function nodeSrc(n) { return code.slice(n.start, n.end); }

        function handleSymbolIterator(meta, node, parent) {
          const entry = resolveSymbolIteratorEntry(node, parent);
          if (!isEntryNeeded(entry)) return;
          const isCallParent = parent?.type === 'CallExpression' && parent.callee === node;
          const isZeroArgCall = isCallParent && parent.arguments.length === 0;
          const hasNullCheck = node.optional || (isCallParent && containsOptional(node));
          const hint = entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod';
          const binding = injectPureImport(entry, hint);
          const objectText = nodeSrc(node.object);
          // memoize non-Identifier objects to avoid double evaluation in null-check / .call patterns
          const needsMemo = node.object.type !== 'Identifier' && (hasNullCheck || (isCallParent && parent.arguments.length > 0));
          const objRef = needsMemo ? genUid() : objectText;
          const memoPrefix = needsMemo ? `(${ objRef } = ${ objectText }, ` : '';
          const memoSuffix = needsMemo ? ')' : '';
          if (isZeroArgCall) {
            let replacement;
            if (hasNullCheck && parent.optional) {
              // foo?.[Symbol.iterator]?.() -> foo == null ? void 0 : _getIteratorMethod(foo)?.call(foo)
              replacement = `${ memoPrefix }${ objRef } == null ? void 0 : ${ binding }(${ objRef })?.call(${ objRef })${ memoSuffix }`;
            } else if (hasNullCheck) {
              // foo?.[Symbol.iterator]() -> foo == null ? void 0 : _getIterator(foo)
              replacement = `${ memoPrefix }${ objRef } == null ? void 0 : ${ binding }(${ objRef })${ memoSuffix }`;
            } else {
              replacement = `${ binding }(${ objectText })`;
            }
            transforms.add(parent.start, parent.end, replacement);
            skippedNodes.add(parent);
          } else if (isCallParent && parent.arguments.length > 0) {
            // foo[Symbol.iterator](args) -> _getIteratorMethod(foo).call(foo, args)
            const argsSrc = parent.arguments.map(a => nodeSrc(a)).join(', ');
            const optCall = parent.optional ? '?.' : '.';
            const callExpr = `${ binding }(${ objRef })${ optCall }call(${ objRef }, ${ argsSrc })`;
            const replacement = hasNullCheck
              ? `${ memoPrefix }${ objRef } == null ? void 0 : ${ callExpr }${ memoSuffix }`
              : `${ memoPrefix }${ callExpr }${ memoSuffix }`;
            transforms.add(parent.start, parent.end, replacement);
            skippedNodes.add(parent);
          } else {
            transforms.add(node.start, node.end, `${ binding }(${ objectText })`);
          }
          if (node.property) skippedNodes.add(node.property);
          const proxyGlobal = findProxyGlobal(node);
          if (proxyGlobal) skippedNodes.add(proxyGlobal);
        }

        function containsOptional(node) {
          if (!node || typeof node !== 'object') return false;
          if (node.optional) return true;
          if (node.type === 'MemberExpression' || node.type === 'CallExpression') {
            return containsOptional(node.object || node.callee);
          }
          return false;
        }

        // memoize object source when it's not a simple identifier (avoids double evaluation)
        function memoObject(node) {
          const objectSrc = nodeSrc(node.object);
          if (node.object.type === 'Identifier') return { ref: objectSrc, prefix: '', suffix: '' };
          const ref = genUid();
          return { ref, prefix: `(${ ref } = ${ objectSrc }, `, suffix: ')' };
        }

        function replaceInstance(binding, node, parent) {
          const isCall = parent?.type === 'CallExpression' && parent.callee === node;
          const hasOptional = node.optional || containsOptional(node);
          if (!isCall) {
            if (hasOptional) {
              const { ref, prefix, suffix } = memoObject(node);
              transforms.add(node.start, node.end, `${ prefix }${ ref } == null ? void 0 : ${ binding }(${ ref })${ suffix }`);
            } else {
              transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.object) })`);
            }
          } else {
            const argsSrc = parent.arguments.map(a => nodeSrc(a)).join(', ');
            const argsPart = argsSrc ? `, ${ argsSrc }` : '';
            if (hasOptional) {
              const { ref, prefix, suffix } = memoObject(node);
              const optCall = parent.optional ? '?.' : '.';
              transforms.add(parent.start, parent.end, `${ prefix }${ ref } == null ? void 0 : ${ binding }(${ ref })${ optCall }call(${ ref }${ argsPart })${ suffix }`);
            } else if (node.object.type !== 'Identifier') {
              const { ref, prefix, suffix } = memoObject(node);
              transforms.add(parent.start, parent.end, `${ prefix }${ binding }(${ ref }).call(${ ref }${ argsPart })${ suffix }`);
            } else {
              const objectSrc = nodeSrc(node.object);
              transforms.add(parent.start, parent.end, `${ binding }(${ objectSrc }).call(${ objectSrc }${ argsPart })`);
            }
            skippedNodes.add(parent);
          }
          const proxyGlobal = findProxyGlobal(node);
          if (proxyGlobal) skippedNodes.add(proxyGlobal);
        }

        // deferred destructuring: collect polyfilled properties per ObjectPattern
        const destructuringMap = new Map(); // key: ObjectPattern node -> [{propNode, localName, binding, kind, initSrc}]

        function canTransformDestructuring(metaPath) {
          const objectPattern = metaPath.parent;
          if (!objectPattern) return false;
          const declaratorPath = metaPath.parentPath?.parentPath;
          if (!declaratorPath?.node) return false;
          if (declaratorPath.node.type === 'Property') return false;
          if (!sharedCanTransformDestructuring({
            parentType: declaratorPath.node.type,
            parentInit: declaratorPath.node.init,
            grandParentType: declaratorPath.parentPath?.parentPath?.node?.type,
            patternProperties: objectPattern.properties,
          })) return false;
          // ESTree-specific: assignment must be inside ExpressionStatement (unwrap ParenthesizedExpression)
          if (declaratorPath.node.type === 'AssignmentExpression') {
            let exprParent = declaratorPath.parentPath;
            while (exprParent?.node?.type === 'ParenthesizedExpression') exprParent = exprParent.parentPath;
            if (exprParent?.node?.type !== 'ExpressionStatement') return false;
          }
          return true;
        }

        function handleDestructuringPure(meta, metaPath, propNode) {
          if (!canTransformDestructuring(metaPath)) return;
          // skip properties with default values
          if (propNode.value?.type === 'AssignmentPattern') return;
          // skip nested patterns
          if (propNode.value?.type === 'ObjectPattern' || propNode.value?.type === 'ArrayPattern') return;
          const pureResult = resolvePure(meta, metaPath);
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
          const binding = injectPureImport(importEntry, hintName);

          const objectPattern = metaPath.parent;
          const localName = propNode.value?.type === 'Identifier' ? propNode.value.name : propNode.key?.name;
          if (!localName) return;

          // find statement path:
          // VariableDeclaration: Property -> ObjectPattern -> VariableDeclarator -> VariableDeclaration
          // assignment: Property -> ObjectPattern -> AssignmentExpression -> ExpressionStatement
          const declaratorPath = metaPath.parentPath?.parentPath;
          const isAssignment = declaratorPath?.node?.type === 'AssignmentExpression';
          let declPath = declaratorPath?.parentPath;
          // unwrap ParenthesizedExpression for assignment: ({ from } = Array) -> ExpressionStatement
          if (isAssignment) {
            while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
          }
          // get init source for instance methods
          const initNode = isAssignment ? declaratorPath?.node?.right : declaratorPath?.node?.init;
          const initSrc = initNode ? nodeSrc(initNode) : null;

          if (!destructuringMap.has(objectPattern)) {
            destructuringMap.set(objectPattern, {
              entries: [],
              allProps: objectPattern.properties || [],
              declPath,
              declaratorPath,
              isAssignment,
              initSrc,
              initIsIdent: initNode?.type === 'Identifier',
            });
          }
          destructuringMap.get(objectPattern).entries.push({ propNode, localName, binding, kind });
        }

        function applyDestructuringTransforms() {
          // group by declPath node to handle multiple destructurings in the same VariableDeclaration
          const byStatement = new Map();
          for (const [, info] of destructuringMap) {
            if (!info.declPath?.node || !info.declaratorPath?.node) continue;
            const key = info.declPath.node;
            if (!byStatement.has(key)) byStatement.set(key, []);
            byStatement.get(key).push(info);
          }

          for (const [, infos] of byStatement) {
            const [{ declPath, isAssignment }] = infos;
            const isExport = !isAssignment && declPath.parentPath?.node?.type === 'ExportNamedDeclaration';
            const replaceNode = isExport ? declPath.parentPath.node : declPath.node;
            const exportPrefix = isExport ? 'export ' : '';
            const declKeyword = isAssignment ? '' : `${ declPath.node.kind } `;
            const polyfilledDeclarators = new Set(infos.map(i => i.declaratorPath.node));
            const parts = [];

            for (const info of infos) {
              const { entries, allProps, initSrc, initIsIdent } = info;
              const polyfillKeys = new Set(entries.map(e => e.propNode));
              const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
              const remaining = allProps.filter(p => !polyfillKeys.has(p));
              const hasInstance = entries.some(e => e.kind === 'instance');
              const needsMemo = hasInstance && !initIsIdent && (entries.length > 1 || remaining.length > 0 || hasRest);
              let objRef = initSrc;
              if (needsMemo && initSrc) {
                objRef = genUid();
                parts.push(`const ${ objRef } = ${ initSrc }`);
              }

              for (const e of entries) {
                parts.push(e.kind === 'instance' && initSrc
                  ? `${ exportPrefix }${ declKeyword }${ e.localName } = ${ e.binding }(${ objRef })`
                  : `${ exportPrefix }${ declKeyword }${ e.localName } = ${ e.binding }`);
              }
              // rebuild remaining pattern - when rest is present, keep polyfilled props with renamed values
              // const { from, ...rest } = Array -> const { from: _unused, ...rest } = Array
              const rebuiltProps = hasRest
                ? allProps.map(p => polyfillKeys.has(p) ? `${ nodeSrc(p.key) }: ${ injector.generateUnusedName() }` : nodeSrc(p))
                : remaining.map(p => nodeSrc(p));
              if (rebuiltProps.length > 0) {
                parts.push(isAssignment
                  ? `({ ${ rebuiltProps.join(', ') } } = ${ objRef })`
                  : `${ exportPrefix }${ declKeyword }{ ${ rebuiltProps.join(', ') } } = ${ objRef }`);
              }
            }

            // preserve non-destructured declarators: `const { from } = Array, y = 5`
            if (!isAssignment && declPath.node.declarations?.length > polyfilledDeclarators.size) {
              const others = declPath.node.declarations.filter(d => !polyfilledDeclarators.has(d)).map(d => nodeSrc(d));
              if (others.length) parts.push(`${ exportPrefix }${ declKeyword }${ others.join(', ') }`);
            }

            transforms.add(replaceNode.start, replaceNode.end, `${ parts.join(';\n') };`);
          }
        }

        function isInTypeAnnotation(path) {
          for (let current = path.parentPath; current; current = current.parentPath) {
            if (isTypeAnnotationNodeType(current.node?.type)) return true;
          }
          return false;
        }

        const usagePureCallback = (meta, metaPath) => {
          if (isDisabled(metaPath.node)) return;
          if (skippedNodes.has(metaPath.node)) return;
          if (isInTypeAnnotation(metaPath)) return;
          const { node } = metaPath;
          const parent = metaPath.parentPath?.node;

          if (meta.kind === 'in') {
            const symbolIn = resolveSymbolInEntry(meta.key);
            if (symbolIn && isEntryNeeded(symbolIn.entry)) {
              const binding = injectPureImport(symbolIn.entry, symbolIn.hint);
              if (meta.key === 'Symbol.iterator') {
                transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.right) })`);
              } else {
                transforms.add(node.left.start, node.left.end, binding);
              }
            } else if (meta.object) {
              // 'from' in Array / 'Promise' in globalThis - replace with true if polyfillable
              const resolved = resolvePureOrGlobalFallback(meta, metaPath);
              if (resolved.result) {
                transforms.add(node.start, node.end, 'true');
                // prevent child visitors from adding unused imports for the replaced expression
                skippedNodes.add(node.right);
                const proxyGlobal = findProxyGlobal(node.right);
                if (proxyGlobal) skippedNodes.add(proxyGlobal);
              }
            }
            return;
          }

          // unwrap ChainExpression for delete check: delete obj?.prop -> UnaryExpression -> ChainExpression -> MemberExpression
          const deleteParent = parent?.type === 'ChainExpression' ? metaPath.parentPath?.parentPath?.node : parent;
          if (deleteParent?.type === 'UnaryExpression' && deleteParent.operator === 'delete') return;

          if (meta.kind === 'property') {
            if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
              return handleDestructuringPure(meta, metaPath, node);
            }
            if (node.type !== 'MemberExpression') return;
            if (parent?.type === 'UpdateExpression') return;
            if (node.object?.type === 'Super') return;
            if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIterator(meta, node, parent);
          }

          const { result: pureResult, fallback } = resolvePureOrGlobalFallback(meta, metaPath);
          if (fallback && node.type === 'MemberExpression') {
            const proxyGlobal = findProxyGlobal(node);
            if (proxyGlobal) skippedNodes.add(proxyGlobal);
            const binding = injectPureImport(fallback.entry, fallback.hintName);
            transforms.add(node.object.start, node.object.end, binding);
            return;
          }
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
          const binding = injectPureImport(importEntry, hintName);

          // when polyfilling a MemberExpression, mark proxy global (globalThis, self, etc.)
          // as skipped to prevent the Identifier visitor from adding an unused import
          if (node.type === 'MemberExpression') {
            const proxyGlobal = findProxyGlobal(node);
            if (proxyGlobal) skippedNodes.add(proxyGlobal);
          }

          if (kind === 'instance' && node.type === 'MemberExpression') {
            replaceInstance(binding, node, parent);
          } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
            // remove optional call operator `?.` when replacing global/static callee
            // globalThis.Map?.() -> _Map() - the `?.` between callee and `(` should be removed
            const { end } = node;
            const optionalEnd = parent?.type === 'CallExpression' && parent.optional
              && parent.callee === node && code[end] === '?' && code[end + 1] === '.'
              ? end + 2 : end;
            transforms.add(node.start, optionalEnd, binding);
          }
        };

        traverse(ast, {
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...createUsageVisitors({ onUsage: usagePureCallback, suppressProxyGlobals: true, walkAnnotations: false }),
        });
        applyDestructuringTransforms();
        transforms.apply();
        return finalize();
      }

      return null;
    },
  };
}
