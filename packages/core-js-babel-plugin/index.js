'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');
const entries = require('@core-js/compat/entries.json');
const compat = require('@core-js/compat/compat');
const getModulesListForTargetVersion = require('@core-js/compat/get-modules-list-for-target-version');
const { Globals, StaticProperties, InstanceProperties } = require('@core-js/compat/built-in-definitions');

const defaultCoreJSPackages = ['core-js'];

const { hasOwn } = Object;

function normalizeImportPath(path) {
  if (typeof path == 'string') return path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
}

const hints = new Set([
  'array',
  'string',
  'regexp',
  'object',
  'function',
]);

function resolveHint(desc, meta) {
  const { placement, object } = meta;
  const hint = String(object).toLowerCase();
  if (placement !== 'prototype' || !hints.has(hint)) return desc.common;
  let required = true;
  for (const $hint of hints) if (hasOwn(desc, $hint)) {
    if (hint === $hint) return desc[hint];
    required = false;
  }
  if (required) return desc.common;
}

module.exports = defineProvider(({
  createMetaResolver,
  debug,
  method,
  targets,
}, {
  pkg,
  pkgs,
  mode = 'actual',
  version = '4.0',
}) => {
  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw new TypeError('Incorrect package name');

  const packages = pkgs ? [...defaultCoreJSPackages, ...pkgs] : [...defaultCoreJSPackages];

  const modulesListForTargetVersion = getModulesListForTargetVersion(version);
  const injectedModules = new Set();

  if (!Object.keys(targets).length) targets = null;

  const resolve = createMetaResolver({
    global: Globals,
    static: StaticProperties,
    instance: InstanceProperties,
  });

  function getCoreJSEntry(source) {
    source = normalizeImportPath(source);
    for (const $pkg of packages) {
      if (source === $pkg) return '';
      if (source.startsWith(`${ $pkg }/`)) {
        const entry = source.slice($pkg.length + 1);
        if (hasOwn(entries, entry)) return entry;
      }
    }
    return null;
  }

  function getModulesForCoreJSEntry(entry) {
    return compat({ modules: entries[entry], targets, version }).list;
  }

  function injectCoreJSModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForCoreJSEntry(entry)) {
      const moduleEntry = `modules/${ moduleName }`;
      utils.injectGlobalImport(`${ pkg }/${ moduleEntry }`, moduleName);
      injectedModules.add(moduleEntry);
      debug(moduleName);
    }
  }

  return {
    name: 'core-js@4',
    polyfills: modulesListForTargetVersion,
    entryGlobal({ source }, utils, path) {
      const entry = getCoreJSEntry(source);
      if (entry === null || injectedModules.has(entry)) return;
      injectCoreJSModulesForEntry(entry, utils);
      path.remove();
    },
    usageGlobal(meta, utils) {
      const resolved = resolve(meta);
      if (!resolved) return;
      let { kind, desc: { global: desc } } = resolved;
      if (kind === 'instance') {
        desc = resolveHint(desc, meta);
        if (!desc) return true;
      }
      for (const entry of desc.dependencies) {
        injectCoreJSModulesForEntry(`${ mode }/${ entry }`, utils);
      }
      return true;
    },
    usagePure() { /* empty */ },
  };
});
