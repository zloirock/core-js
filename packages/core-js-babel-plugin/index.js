'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');
const entries = require('@core-js/compat/entries.json');
const compat = require('@core-js/compat/compat');
const getModulesListForTargetVersion = require('@core-js/compat/get-modules-list-for-target-version');
const { Globals, StaticProperties, InstanceProperties } = require('@core-js/compat/built-in-definitions');

const DEFAULT_COREJS_PACKAGES = ['core-js'];

function normalizeImportPath(path) {
  if (typeof path == 'string') return path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
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

  const packages = pkgs ? [...DEFAULT_COREJS_PACKAGES, ...pkgs] : [...DEFAULT_COREJS_PACKAGES];

  const modulesListForTargetVersion = getModulesListForTargetVersion(version);
  const injectedModules = new Set();

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
        if (Object.hasOwn(entries, entry)) return entry;
      }
    }
    return null;
  }

  function getModulesForCoreJSEntry(entry) {
    return compat({ modules: entries[entry], targets }).list;
  }

  function injectCoreJSModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForCoreJSEntry(entry)) {
      if (injectedModules.has(moduleName)) continue;
      injectedModules.add(moduleName);
      const modulePath = `${ pkg }/modules/${ moduleName }`;
      utils.injectGlobalImport(modulePath, moduleName);
      debug(moduleName);
    }
  }

  return {
    name: 'core-js@4',
    polyfills: modulesListForTargetVersion,
    entryGlobal({ source }, utils, path) {
      const entry = getCoreJSEntry(source);
      if (entry === null) return;
      injectCoreJSModulesForEntry(entry, utils);
      path.remove();
    },
    usageGlobal(meta, utils) {
      const resolved = resolve(meta);
      if (!resolved) return;
      const { kind, desc: { global: desc } } = resolved;
      const { dependencies } = kind === 'instance' ? desc.common : desc;
      for (const entry of dependencies) {
        injectCoreJSModulesForEntry(`${ mode }/${ entry }`, utils);
      }
      return true;
    },
    usagePure() { /* empty */ },
  };
});
