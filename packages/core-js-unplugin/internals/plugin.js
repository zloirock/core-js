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
} from '@core-js/polyfill-provider/detect-usage';
import { createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';

const typeResolvers = createResolveNodeType(nodeType, types);

export default function createPlugin(options) {
  const { resolver, debugOutput } = createPolyfillResolver(options, {
    typeResolvers,
    isMemberLike: path => path.node?.type === 'MemberExpression',
    isCallee: (node, parent) => parent && parent.callee === node,
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

      const { injectModulesForEntry, injectModulesForModeEntry, outputDebug } = createModuleInjectors({
        mode,
        getModulesForEntry,
        debugOutput,
        injectGlobal: moduleName => injector.addGlobalImport(moduleName),
      });

      function injectPureImport(entry, hint) {
        debugOutput?.add(entry);
        return injector.addPureImport(entry, hint);
      }

      function finalize() {
        injector.flush();
        outputDebug();
        if (ms.hasChanged()) return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
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
          if (isZeroArgCall) {
            let replacement;
            if (hasNullCheck && parent.optional) {
              // foo?.[Symbol.iterator]?.() -> foo == null ? void 0 : _getIteratorMethod(foo)?.call(foo)
              replacement = `${ objectText } == null ? void 0 : ${ binding }(${ objectText })?.call(${ objectText })`;
            } else if (hasNullCheck) {
              // foo?.[Symbol.iterator]() -> foo == null ? void 0 : _getIterator(foo)
              replacement = `${ objectText } == null ? void 0 : ${ binding }(${ objectText })`;
            } else {
              replacement = `${ binding }(${ objectText })`;
            }
            transforms.add(parent.start, parent.end, replacement);
            skippedNodes.add(parent);
          } else if (isCallParent && parent.arguments.length > 0) {
            // foo[Symbol.iterator](args) -> _getIteratorMethod(foo)?.call(foo, args)
            const argsSrc = parent.arguments.map(a => nodeSrc(a)).join(', ');
            transforms.add(parent.start, parent.end, `${ binding }(${ objectText })${ parent.optional ? '?.' : '.' }call(${ objectText }, ${ argsSrc })`);
            skippedNodes.add(parent);
          } else {
            transforms.add(node.start, node.end, `${ binding }(${ objectText })`);
          }
          if (node.property) skippedNodes.add(node.property);
        }

        function containsOptional(node) {
          if (!node || typeof node !== 'object') return false;
          if (node.optional) return true;
          if (node.type === 'MemberExpression' || node.type === 'CallExpression') {
            return containsOptional(node.object || node.callee);
          }
          return false;
        }

        function replaceInstance(binding, node, parent) {
          const isCall = parent?.type === 'CallExpression' && parent.callee === node;
          if (!isCall) {
            transforms.add(node.start, node.end, `${ binding }(${ nodeSrc(node.object) })`);
            return;
          }
          const objectSrc = nodeSrc(node.object);
          const argsSrc = parent.arguments.map(a => nodeSrc(a)).join(', ');
          const argsPart = argsSrc ? `, ${ argsSrc }` : '';
          if (node.object.type !== 'Identifier') {
            const ref = genUid();
            transforms.add(parent.start, parent.end, `(${ ref } = ${ objectSrc }, ${ binding }(${ ref }).call(${ ref }${ argsPart }))`);
          } else {
            transforms.add(parent.start, parent.end, `${ binding }(${ objectSrc }).call(${ objectSrc }${ argsPart })`);
          }
          skippedNodes.add(parent);
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
          for (const [, info] of destructuringMap) {
            const { entries, allProps, declPath, declaratorPath, initSrc, initIsIdent, isAssignment } = info;
            if (!declPath?.node || !declaratorPath?.node) continue;

            const polyfillKeys = new Set(entries.map(e => e.propNode));
            const remaining = allProps.filter(p => !polyfillKeys.has(p));

            // determine if we need to memoize init (for instance methods with non-identifier init)
            const hasInstance = entries.some(e => e.kind === 'instance');
            const needsMemo = hasInstance && !initIsIdent && entries.length > 1;
            let objRef = initSrc;
            if (needsMemo && initSrc) {
              objRef = genUid();
            }

            // build extracted declarations
            const declKeyword = isAssignment ? '' : 'const ';
            const extracted = entries.map(e => e.kind === 'instance' && initSrc
              ? `${ declKeyword }${ e.localName } = ${ e.binding }(${ objRef })`
              : `${ declKeyword }${ e.localName } = ${ e.binding }`);

            const memoPrefix = needsMemo && initSrc ? `const ${ objRef } = ${ initSrc };\n` : '';
            const extractedStr = `${ extracted.join(';\n') };\n`;

            const stmtNode = declPath.node;
            if (remaining.length === 0) {
              // all properties polyfilled -> replace entire statement
              transforms.add(stmtNode.start, stmtNode.end, memoPrefix + extractedStr.trimEnd());
            } else {
              // some properties remain -> replace entire statement with extracted + rebuilt destructuring
              const remainingProps = remaining.map(p => nodeSrc(p)).join(', ');
              const rebuilt = isAssignment
                ? `({ ${ remainingProps } } = ${ objRef })`
                : `${ stmtNode.kind } { ${ remainingProps } } = ${ objRef }`;
              transforms.add(stmtNode.start, stmtNode.end, memoPrefix + extractedStr + rebuilt);
            }
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
            }
            return;
          }

          if (parent?.type === 'UnaryExpression' && parent.operator === 'delete') return;

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
            const binding = injectPureImport(fallback.entry, fallback.hintName);
            transforms.add(node.object.start, node.object.end, binding);
            return;
          }
          if (!pureResult) return;
          const { entry: importEntry, kind, hintName } = pureResult;
          const binding = injectPureImport(importEntry, hintName);

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
