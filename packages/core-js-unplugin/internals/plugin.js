import { createRequire } from 'node:module';
import { parseSync } from 'oxc-parser';
import { traverse } from 'estree-toolkit';
import MagicString from 'magic-string';
import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  isCoreJSFile,
  pureImportName,
  parseDisableDirectives,
  createPolyfillResolver,
  validateImportStyle,
  resolveImportStyle,
} from '@core-js/polyfill-provider';
import { createResolveNodeType } from '@core-js/polyfill-provider/resolve-node-type';
import { babelNodeType } from './estree-compat.js';
import ImportInjector from './import-injector.js';
import detectEntries from './detect-entry.js';
import { createUsageVisitors, createSyntaxVisitors } from './detect-usage.js';

const { hasOwn } = Object;

// ESTree-to-Babel node type predicates for resolve-node-type
// resolve-node-type uses Babel naming (ObjectProperty, OptionalMemberExpression, etc.)
// but oxc-parser produces ESTree nodes (Property, MemberExpression with optional flag, etc.)
const estreeTypes = {
  isIdentifier: (n, opts) => n?.type === 'Identifier' && (!opts?.name || n.name === opts.name),
  isMemberExpression: n => n?.type === 'MemberExpression' && !n.optional,
  isOptionalMemberExpression: n => n?.type === 'MemberExpression' && n.optional === true,
  isCallExpression: (n, opts) => n?.type === 'CallExpression' && !n.optional && (!opts?.callee || n.callee === opts.callee),
  isOptionalCallExpression: (n, opts) => n?.type === 'CallExpression' && n.optional === true && (!opts?.callee || n.callee === opts.callee),
  isObjectProperty: n => n?.type === 'Property' && !n.method && n.kind === 'init',
  isObjectMethod: n => n?.type === 'Property' && (n.method || n.kind === 'get' || n.kind === 'set'),
  isObjectExpression: n => n?.type === 'ObjectExpression',
  isObjectPattern: n => n?.type === 'ObjectPattern',
  isArrayExpression: n => n?.type === 'ArrayExpression',
  isClassMethod: n => n?.type === 'MethodDefinition',
  isClassProperty: n => n?.type === 'PropertyDefinition',
  isClassAccessorProperty: n => n?.type === 'AccessorProperty',
  isClassBody: n => n?.type === 'ClassBody',
  isClassDeclaration: n => n?.type === 'ClassDeclaration',
  isClass: n => n?.type === 'ClassDeclaration' || n?.type === 'ClassExpression',
  isFunction: n => {
    const type = n?.type;
    return type === 'FunctionDeclaration'
      || type === 'FunctionExpression'
      || type === 'ArrowFunctionExpression'
      || type === 'TSDeclareFunction'
      || (type === 'Property' && n.method)
      || type === 'MethodDefinition';
  },
  isFunctionDeclaration: n => n?.type === 'FunctionDeclaration' || n?.type === 'TSDeclareFunction',
  isArrowFunctionExpression: n => n?.type === 'ArrowFunctionExpression',
  isVariableDeclarator: n => n?.type === 'VariableDeclarator',
  isVariableDeclaration: n => n?.type === 'VariableDeclaration',
  isAssignmentExpression: n => n?.type === 'AssignmentExpression',
  isAssignmentPattern: n => n?.type === 'AssignmentPattern',
  isBlockStatement: n => n?.type === 'BlockStatement',
  isReturnStatement: n => n?.type === 'ReturnStatement',
  isIfStatement: n => n?.type === 'IfStatement',
  isSwitchStatement: n => n?.type === 'SwitchStatement',
  isSwitchCase: n => n?.type === 'SwitchCase',
  isForOfStatement: n => n?.type === 'ForOfStatement',
  isForInStatement: n => n?.type === 'ForInStatement',
  isNewExpression: n => n?.type === 'NewExpression',
  isThisExpression: n => n?.type === 'ThisExpression',
  isConditionalExpression: n => n?.type === 'ConditionalExpression',
  isLogicalExpression: n => n?.type === 'LogicalExpression',
  isSpreadElement: n => n?.type === 'SpreadElement',
  isProgram: n => n?.type === 'Program',
  isImport: n => n?.type === 'ImportExpression',
};

const {
  resolvePropertyObjectType,
  resolveGuardHints,
  toHint,
  isString,
  isObject,
} = createResolveNodeType(babelNodeType, estreeTypes);

export default function createPlugin(options) {
  const {
    method,
    targets,
    debug: debugOpt = false,
    bundler,
    importStyle: importStyleOption,
    ...restOptions
  } = options;

  validateImportStyle(importStyleOption);

  const isWebpack = bundler === 'webpack' || bundler === 'rspack';

  // Validate shouldInjectPolyfill
  if (restOptions.shouldInjectPolyfill !== undefined && typeof restOptions.shouldInjectPolyfill !== 'function') {
    throw new Error(`.shouldInjectPolyfill must be a function, or undefined (received ${ restOptions.shouldInjectPolyfill })`);
  }
  if (typeof restOptions.shouldInjectPolyfill === 'function' && (restOptions.include || restOptions.exclude)) {
    throw new Error('.include and .exclude are not supported when using the .shouldInjectPolyfill function.');
  }

  // Resolve targets: explicit targets, or browserslist config from configPath
  const effectiveTargets = (() => {
    if (targets) return targets;
    if (restOptions.ignoreBrowserslistConfig) return null;
    if (restOptions.configPath) {
      try {
        const require = createRequire(import.meta.url);
        const browserslist = require('browserslist');
        return browserslist(undefined, { path: restOptions.configPath });
      } catch { return null; }
    }
    return null;
  })();

  const parsedTargets = effectiveTargets ? targetsParser(effectiveTargets) : null;

  // Build shouldInjectPolyfill from targets + include/exclude + user callback
  const shouldInjectPolyfill = (() => {
    const { include, exclude, shouldInjectPolyfill: userCallback } = restOptions;
    const matchers = patterns => {
      if (!patterns) return null;
      return (Array.isArray(patterns) ? patterns : [patterns]).map(p => {
        if (typeof p === 'string') {
          if (p.includes('*')) {
            const re = new RegExp(`^${ p.replaceAll('*', '.*') }$`);
            return mod => re.test(mod);
          }
          return mod => mod === p;
        }
        if (p instanceof RegExp) return mod => p.test(mod);
        return () => false;
      });
    };
    const includeMatchers = matchers(include);
    const excludeMatchers = matchers(exclude);

    const defaultShouldInject = mod => {
      if (excludeMatchers?.some(m => m(mod))) return false;
      if (includeMatchers?.some(m => m(mod))) return true;
      if (parsedTargets) {
        const requirements = compatData[mod];
        if (!requirements) return true;
        for (const [engine, version] of parsedTargets) {
          if (!hasOwn(requirements, engine) || compare(version, '<', requirements[engine])) return true;
        }
        return false;
      }
      return true;
    };

    if (typeof userCallback === 'function') return mod => userCallback(mod, defaultShouldInject(mod));
    return defaultShouldInject;
  })();

  const resolver = createPolyfillResolver({
    ...restOptions,
    method,
    shouldInjectPolyfill,
    resolvePropertyObjectType, resolveGuardHints, toHint, isString, isObject,
    isMemberLike: path => path.node?.type === 'MemberExpression',
    isCallee: (node, parent) => parent && parent.callee === node,
    isSpreadElement: node => node?.type === 'SpreadElement',
  });

  const { mode, pkg, getModulesForEntry, getCoreJSEntry, isEntryNeeded } = resolver;

  // Debug: build targets display string and helper for per-module target info
  const debugTargetsStr = parsedTargets
    ? JSON.stringify(Object.fromEntries([...parsedTargets].map(([e, v]) => [e, String(v)])), null, 2)
    : '{}';

  function getUnsupportedTargets(moduleName) {
    if (!parsedTargets) return {};
    const requirements = compatData[moduleName];
    if (!requirements) return Object.fromEntries(parsedTargets.map(([e, v]) => [e, String(v)]));
    const unsupported = {};
    for (const [engine, version] of parsedTargets) {
      if (!hasOwn(requirements, engine) || compare(version, '<', requirements[engine])) {
        unsupported[engine] = String(version);
      }
    }
    return unsupported;
  }

  function formatTargets(obj) {
    const pairs = Object.entries(obj);
    if (!pairs.length) return '{}';
    return `{ ${ pairs.map(([k, v]) => `"${ k }":"${ v }"`).join(', ') } }`;
  }

  function formatDebug(modules, pureEntries, { entryFound = true } = {}) {
    const items = method === 'usage-pure' ? [...pureEntries] : [...modules];
    const polyfillLines = items.map(item => method === 'usage-pure'
      ? `  ${ item }`
      : `  ${ item } ${ formatTargets(getUnsupportedTargets(item)) }`);

    let result;
    if (method === 'entry-global' && !entryFound) {
      result = 'The entry point for the core-js@4 polyfill has not been found.';
    } else if (items.length === 0) {
      const scope = method === 'entry-global' ? 'your targets' : 'your code and targets';
      result = `Based on ${ scope }, the core-js@4 polyfill did not add any polyfill.`;
    } else {
      const verb = method === 'entry-global' ? 'entry has been replaced with' : 'added';
      result = `The core-js@4 polyfill ${ verb } the following polyfills:\n${ polyfillLines.join('\n') }`;
    }

    return `core-js@4: \`DEBUG\` option\n\nUsing targets: ${ debugTargetsStr }\n\nUsing polyfills with \`${ method }\` method:\n${ result }`;
  }

  return {
    name: 'core-js-unplugin',

    // eslint-disable-next-line max-statements -- long method with mode-specific branches
    transform(code, id) {
      if (isCoreJSFile(id)) return null;

      // Parse with oxc-parser (sync is the only available API)
      // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
      const { program: ast, comments, errors } = parseSync(id, code, { sourceType: 'module' });
      if (errors?.length) return null;

      // Resolve importStyle: explicit option > sourceType auto-detection > 'import' default
      const importStyle = resolveImportStyle(importStyleOption, ast.sourceType);

      // Check disable directives
      const directives = parseDisableDirectives(comments, code);
      if (directives === true) return null; // entire file disabled
      const disabledLines = directives;

      // Precompute line start offsets for O(log n) offset-to-line lookup
      // Only built when disable directives are present
      let lineStarts;
      if (disabledLines) {
        lineStarts = [0]; // line 1 starts at offset 0
        for (let i = 0; i < code.length; i++) {
          if (code[i] === '\n') lineStarts.push(i + 1);
        }
      }

      function offsetToLine(offset) {
        // Binary search in lineStarts
        let lo = 0;
        let hi = lineStarts.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (lineStarts[mid] <= offset) lo = mid;
          else hi = mid - 1;
        }
        return lo + 1; // 1-based
      }

      function isDisabled(node) {
        if (!disabledLines) return false;
        if (node.start === undefined) return false;
        return disabledLines.has(offsetToLine(node.start));
      }

      const ms = new MagicString(code);
      const injector = new ImportInjector(ms, pkg, mode, restOptions.absoluteImports, importStyle);
      const injectedModules = new Set();

      function injectModule(moduleName) {
        if (injectedModules.has(moduleName)) return;
        injectedModules.add(moduleName);
        injector.addGlobalImport(moduleName);
      }

      function injectModulesForEntry(entry) {
        for (const moduleName of getModulesForEntry(entry)) {
          injectModule(moduleName);
        }
      }

      function injectModulesForModeEntry(entry) {
        injectModulesForEntry(`${ mode }/${ entry }`);
      }

      function finalize(debugOptions) {
        injector.flush();
        const result = ms.toString();
        if (debugOpt) {
          const allModules = new Set([...injectedModules, ...injector.globalModules]);
          const modePrefix = `${ mode }/`;
          const pureEntries = [...injector.pureImports.keys()].map(k => k.startsWith(modePrefix) ? k.slice(modePrefix.length) : k);
          // eslint-disable-next-line no-console -- debug output requested by user
          console.log(formatDebug(allModules, pureEntries, debugOptions));
        }
        if (result === code) return null;
        return { code: result, map: ms.generateMap({ hires: true }) };
      }

      // entry-global mode
      if (method === 'entry-global') {
        const entryFound = detectEntries(ast, {
          getCoreJSEntry,
          getModulesForEntry,
          isDisabled,
          injector,
          ms,
        });
        return finalize({ entryFound });
      }

      // usage-global mode
      if (method === 'usage-global') {
        const usageCallback = (meta, path) => {
          if (isDisabled(path.node)) return;
          if (meta.kind === 'in' && meta.key === 'Symbol.iterator') {
            injectModulesForModeEntry('symbol/iterator');
            return;
          }
          const deps = resolver.resolveUsage(meta, path);
          if (!deps) return;
          for (const entry of deps) injectModulesForModeEntry(entry);
        };

        const usageVisitors = createUsageVisitors(usageCallback);
        const syntaxVisitors = createSyntaxVisitors(
          injectModulesForModeEntry,
          injectModulesForEntry,
          null, // getUtils not needed
          isDisabled,
          { isWebpack },
        );

        // Merge visitors - combine handlers for same node type
        const mergedVisitors = {
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...usageVisitors,
        };
        for (const [key, handler] of Object.entries(syntaxVisitors)) {
          if (mergedVisitors[key]) {
            const usageHandler = mergedVisitors[key];
            mergedVisitors[key] = path => {
              usageHandler(path);
              handler(path);
            };
          } else {
            mergedVisitors[key] = handler;
          }
        }
        traverse(ast, mergedVisitors);

        return finalize();
      }

      // usage-pure mode
      if (method === 'usage-pure') {
        let uidCounter = 0;
        const skippedNodes = new WeakSet();

        function genUid() {
          let name = `_ref${ uidCounter++ || '' }`;
          while (injector.rootScope?.hasBinding(name) || injector.usedNames.has(name)) {
            name = `_ref${ uidCounter++ }`;
          }
          injector.addRef(name);
          return name;
        }
        function nodeSrc(n) { return code.slice(n.start, n.end); }

        const { resolvePureEntry, resolve, enhanceMeta } = resolver;

        function handleSymbolIteratorPure(meta, node, parent) {
          const isCallParent = parent?.type === 'CallExpression' && parent.callee === node;
          const isZeroArgCall = isCallParent && parent.arguments.length === 0;
          // foo[Symbol.iterator]() -> getIterator (non-optional, zero args)
          // foo?.[Symbol.iterator]() -> getIterator with null check
          // foo[Symbol.iterator]?.() -> getIteratorMethod (optional call = uncertain)
          // foo[Symbol.iterator](arg) -> getIteratorMethod
          // foo[Symbol.iterator] -> getIteratorMethod (property access, no call)
          const useGetIterator = isZeroArgCall && !parent.optional;
          // Detect optional chain on the object: foo?.[Symbol.iterator]()
          const hasNullCheck = node.optional || (isCallParent && containsOptional(node));
          const entry = useGetIterator ? 'get-iterator' : 'get-iterator-method';
          if (!isEntryNeeded(entry)) return;
          const hint = entry === 'get-iterator' ? 'getIterator' : 'getIteratorMethod';
          const binding = injector.addPureImport(entry, hint);
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
            addTransform(parent.start, parent.end, replacement);
            skippedNodes.add(parent);
          } else if (isCallParent && parent.arguments.length > 0) {
            // foo[Symbol.iterator](args) -> _getIteratorMethod(foo)?.call(foo, args)
            const argsSrc = parent.arguments.map(a => nodeSrc(a)).join(', ');
            addTransform(parent.start, parent.end, `${ binding }(${ objectText })${ parent.optional ? '?.' : '.' }call(${ objectText }, ${ argsSrc })`);
            skippedNodes.add(parent);
          } else {
            addTransform(node.start, node.end, `${ binding }(${ objectText })`);
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

        // Deferred transform queue - collected during traversal, applied after
        // For chained method calls, inner transforms are composed into outer ones
        const pendingTransforms = [];

        function addTransform(start, end, content) {
          pendingTransforms.push({ start, end, content });
        }

        function applyTransforms() {
          // Sort innermost first: smaller ranges before larger, right-to-left for same-level
          pendingTransforms.sort((a, b) => (a.end - a.start) - (b.end - b.start) || b.start - a.start);

          // Build a map of range -> replacement for composing nested transforms
          // When an outer transform's content references original source that has an inner transform,
          // substitute the inner transform's replacement into the outer
          const transformMap = new Map(); // key: "start:end", value: replacement content

          for (const t of pendingTransforms) {
            // Check if this transform's content contains any inner transform's original range
            let { content } = t;
            for (const [key, innerContent] of transformMap) {
              const [innerStart, innerEnd] = key.split(':').map(Number);
              if (innerStart >= t.start && innerEnd <= t.end) {
                // Inner transform is contained - substitute its replacement into our content
                const originalInner = code.slice(innerStart, innerEnd);
                content = content.replaceAll(originalInner, innerContent);
              }
            }
            transformMap.set(`${ t.start }:${ t.end }`, content);
          }

          // Apply from right to left (largest start first) to preserve positions
          const sorted = [...transformMap.entries()].sort((a, b) => {
            const [aStart] = a[0].split(':').map(Number);
            const [bStart] = b[0].split(':').map(Number);
            return bStart - aStart;
          });

          const applied = new Set();
          for (const [key, content] of sorted) {
            const [start, end] = key.split(':').map(Number);
            // Skip if contained within an already-applied wider range
            let skip = false;
            for (const appliedKey of applied) {
              const [aStart, aEnd] = appliedKey.split(':').map(Number);
              if (aStart <= start && aEnd >= end && appliedKey !== key) {
                skip = true;
                break;
              }
            }
            if (skip) continue;
            try {
              ms.overwrite(start, end, content);
              applied.add(key);
            } catch { /* skip conflicting */ }
          }
        }

        function replaceInstance(binding, node, parent) {
          const isCall = parent?.type === 'CallExpression' && parent.callee === node;
          if (!isCall) {
            addTransform(node.start, node.end, `${ binding }(${ nodeSrc(node.object) })`);
            return;
          }
          const objectSrc = nodeSrc(node.object);
          const argsSrc = parent.arguments.map(a => nodeSrc(a)).join(', ');
          const argsPart = argsSrc ? `, ${ argsSrc }` : '';
          if (node.object.type !== 'Identifier') {
            const ref = genUid();
            addTransform(parent.start, parent.end, `(${ ref } = ${ objectSrc }, ${ binding }(${ ref }).call(${ ref }${ argsPart }))`);
          } else {
            addTransform(parent.start, parent.end, `${ binding }(${ objectSrc }).call(${ objectSrc }${ argsPart })`);
          }
          skippedNodes.add(parent);
        }

        // Deferred destructuring: collect polyfilled properties per ObjectPattern
        const destructuringMap = new Map(); // key: ObjectPattern node -> [{propNode, localName, binding, kind, initSrc}]

        // Check if destructuring pattern can be transformed (mirrors canTransformDestructuring in babel plugin)
        function canTransformDestructuring(metaPath) {
          const objectPattern = metaPath.parent;
          if (!objectPattern) return false;
          // Skip if rest element present - extracting a property changes rest semantics
          if (objectPattern.properties?.some(p => p.type === 'RestElement')) return false;
          const declaratorPath = metaPath.parentPath?.parentPath;
          if (!declaratorPath?.node) return false;
          // Skip nested patterns: { foo: { filter } } - declarator is a Property, not VariableDeclarator/AssignmentExpression
          if (declaratorPath.node.type === 'Property') return false;
          const declNode = declaratorPath.parentPath?.node;
          if (!declNode) return false;
          // VariableDeclaration: skip for-in/for-of (no init), skip multi-property in for-loop
          if (declNode.type === 'VariableDeclaration') {
            const grandParent = declaratorPath.parentPath?.parentPath?.node;
            if (grandParent?.type === 'ForInStatement' || grandParent?.type === 'ForOfStatement') return false;
            if (grandParent?.type === 'ForStatement' && objectPattern.properties?.length > 1) return false;
          }
          // AssignmentExpression: skip nested/non-ExpressionStatement
          if (declaratorPath.node.type === 'AssignmentExpression') {
            let exprParent = declaratorPath.parentPath;
            // Unwrap ParenthesizedExpression: ({ from } = Array)
            while (exprParent?.node?.type === 'ParenthesizedExpression') exprParent = exprParent.parentPath;
            if (exprParent?.node?.type !== 'ExpressionStatement') return false;
          }
          return true;
        }

        function handleDestructuringPure(meta, metaPath, propNode) {
          if (!canTransformDestructuring(metaPath)) return;
          // Skip properties with default values
          if (propNode.value?.type === 'AssignmentPattern') return;
          // Skip nested patterns
          if (propNode.value?.type === 'ObjectPattern' || propNode.value?.type === 'ArrayPattern') return;
          const resolved = resolve(meta);
          if (!resolved || !hasOwn(resolved.desc ?? {}, 'pure')) return;
          const { kind, desc: { pure: desc } } = resolved;
          let effectiveMeta = meta;
          if (kind === 'instance') {
            effectiveMeta = enhanceMeta(meta, metaPath, desc);
            if (effectiveMeta === null) return;
          }
          const importEntry = resolvePureEntry(kind, desc, effectiveMeta, metaPath);
          if (!importEntry) return;
          const binding = injector.addPureImport(importEntry, pureImportName(kind, resolved.name, importEntry));

          const objectPattern = metaPath.parent;
          const localName = propNode.value?.type === 'Identifier' ? propNode.value.name : propNode.key?.name;
          if (!localName) return;

          // Find statement path:
          // VariableDeclaration: Property -> ObjectPattern -> VariableDeclarator -> VariableDeclaration
          // Assignment: Property -> ObjectPattern -> AssignmentExpression -> ExpressionStatement
          const declaratorPath = metaPath.parentPath?.parentPath;
          const isAssignment = declaratorPath?.node?.type === 'AssignmentExpression';
          let declPath = declaratorPath?.parentPath;
          // Unwrap ParenthesizedExpression for assignment: ({ from } = Array) -> ExpressionStatement
          if (isAssignment) {
            while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
          }
          // Get init source for instance methods
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

            // Determine if we need to memoize init (for instance methods with non-identifier init)
            const hasInstance = entries.some(e => e.kind === 'instance');
            const needsMemo = hasInstance && !initIsIdent && entries.length > 1;
            let objRef = initSrc;
            if (needsMemo && initSrc) {
              objRef = genUid();
            }

            // Build extracted declarations
            const declKeyword = isAssignment ? '' : 'const ';
            const extracted = entries.map(e => e.kind === 'instance' && initSrc
              ? `${ declKeyword }${ e.localName } = ${ e.binding }(${ objRef })`
              : `${ declKeyword }${ e.localName } = ${ e.binding }`);

            const memoPrefix = needsMemo && initSrc ? `const ${ objRef } = ${ initSrc };\n` : '';
            const extractedStr = `${ extracted.join(';\n') };\n`;

            if (remaining.length === 0) {
              // All properties polyfilled -> replace entire statement
              const stmtNode = declPath.node;
              addTransform(stmtNode.start, stmtNode.end, memoPrefix + extractedStr.trimEnd());
            } else {
              // Some properties remain -> prepend extracted, remove polyfilled props from pattern
              // This is hard with magic-string. Approximate: prepend declarations before statement
              addTransform(declPath.node.start, declPath.node.start, memoPrefix + extractedStr);
              // Remove the polyfilled properties from the source
              for (const entry of entries) {
                const prop = entry.propNode;
                if (code[prop.end] === ',') {
                  // Remove property + trailing comma + optional space
                  const end = code[prop.end + 1] === ' ' ? prop.end + 2 : prop.end + 1;
                  addTransform(prop.start, end, '');
                } else {
                  // Last property - find preceding comma
                  let commaPos = prop.start - 1;
                  while (commaPos > 0 && code[commaPos] !== ',') commaPos--;
                  if (code[commaPos] === ',') addTransform(commaPos, prop.end, '');
                  else addTransform(prop.start, prop.end, '');
                }
              }
            }
          }
        }

        // Check if a path is inside a TS type annotation (type aliases, interfaces, etc.)
        function isInTypeAnnotation(path) {
          let current = path;
          while (current) {
            const type = current.node?.type;
            if (type === 'TSTypeAliasDeclaration' || type === 'TSInterfaceDeclaration'
              || type === 'TSTypeAnnotation' || type === 'TSTypeReference') return true;
            current = current.parentPath;
          }
          return false;
        }

        const pureCallback = (meta, metaPath) => {
          if (isDisabled(metaPath.node)) return;
          if (skippedNodes.has(metaPath.node)) return;
          if (isInTypeAnnotation(metaPath)) return;
          const { node } = metaPath;
          const parent = metaPath.parentPath?.node;

          if (meta.kind === 'in') {
            if (meta.key === 'Symbol.iterator' && isEntryNeeded('is-iterable')) {
              const binding = injector.addPureImport('is-iterable', 'isIterable');
              addTransform(node.start, node.end, `${ binding }(${ nodeSrc(node.right) })`);
            } else if (meta.key?.startsWith('Symbol.')) {
              // Symbol.hasInstance in obj -> _Symbol$hasInstance in obj
              const symbolProp = meta.key.slice(7); // e.g., 'hasInstance'
              const entry = `symbol/${ symbolProp.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
              if (isEntryNeeded(entry)) {
                const binding = injector.addPureImport(entry, meta.key.replace('.', '$'));
                addTransform(node.left.start, node.left.end, binding);
              }
            }
            return;
          }

          if (parent?.type === 'UnaryExpression' && parent.operator === 'delete') return;
          if (meta.kind !== 'property' && meta.kind !== 'global') return;

          if (meta.kind === 'property') {
            if (node.type === 'Property' && metaPath.parent?.type === 'ObjectPattern') {
              return handleDestructuringPure(meta, metaPath, node);
            }
            if (node.type !== 'MemberExpression') return;
            if (parent?.type === 'UpdateExpression') return;
            if (node.object?.type === 'Super') return;
            if (parent?.type === 'AssignmentExpression' && parent.left === node) return;
            if (meta.key === 'Symbol.iterator') return handleSymbolIteratorPure(meta, node, parent);
          }

          let resolved = resolve(meta);
          // Unresolved static property on a known global (e.g., Symbol.prototype) - fall back to global polyfill
          // But not for global proxy objects (globalThis, self, window, global) - those are handled differently
          if (!resolved && meta.kind === 'property' && meta.placement === 'static' && meta.object
            && !POSSIBLE_GLOBAL_OBJECTS.has(meta.object) && node.type === 'MemberExpression') {
            resolved = resolve({ kind: 'global', name: meta.object });
            if (resolved && hasOwn(resolved.desc ?? {}, 'pure')) {
              const fallbackEntry = resolvePureEntry(resolved.kind, resolved.desc.pure, { kind: 'global', name: meta.object }, metaPath);
              if (fallbackEntry) {
                const binding = injector.addPureImport(fallbackEntry, meta.object);
                addTransform(node.object.start, node.object.end, binding);
              }
              return;
            }
          }
          if (!resolved || !hasOwn(resolved.desc ?? {}, 'pure')) return;
          const { kind, desc: { pure: desc } } = resolved;
          let effectiveMeta = meta;
          if (kind === 'instance') {
            effectiveMeta = enhanceMeta(meta, metaPath, desc);
            if (effectiveMeta === null) return;
          }
          const importEntry = resolvePureEntry(kind, desc, effectiveMeta, metaPath);
          if (!importEntry) return;
          // Build hint matching Babel convention: statics -> 'Array.from', globals -> 'Promise', instances -> via pureImportName
          const binding = injector.addPureImport(importEntry, pureImportName(kind, resolved.name, importEntry));

          if (kind === 'instance' && node.type === 'MemberExpression') {
            replaceInstance(binding, node, parent);
          } else if (kind === 'global' || (kind === 'static' && node.type === 'MemberExpression')) {
            // Remove optional call operator `?.` when replacing global/static callee
            // globalThis.Map?.() -> _Map() - the `?.` between callee and `(` should be removed
            const { end } = node;
            const optionalEnd = parent?.type === 'CallExpression' && parent.optional
              && parent.callee === node && code[end] === '?' && code[end + 1] === '.'
              ? end + 2 : end;
            addTransform(node.start, optionalEnd, binding);
          }
        };

        traverse(ast, {
          $: { scope: true },
          Program(path) { injector.rootScope = path.scope; },
          ...createUsageVisitors(pureCallback, { suppressProxyGlobals: true, walkAnnotations: false }),
        });
        applyDestructuringTransforms();
        applyTransforms();
        return finalize();
      }

      return null;
    },
  };
}
