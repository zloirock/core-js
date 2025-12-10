import { features, proposals } from '../build-entries/entries-definitions.mjs';
import { $path, $proposal } from '../build-entries/templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';
import { getModulesMetadata } from '../build-entries/get-dependencies.mjs';
import { argv, path, fs } from 'zx';
import { expandModules, modulesToStage } from '../build-entries/helpers.mjs';
import { preparePureTypes } from './pure.mjs';

const { copy, outputFile, pathExists, readdir, readFile, readJson, remove, writeJson } = fs;

const BUILD_DIR = 'packages/core-js-types/dist/';
const PACKAGE_JSON_DIR = 'packages/core-js-types/';
const PACKAGE_NAME = 'core-js/';
const PACKAGE_NAME_PURE = '@core-js/pure/';
const PACKAGE_TEMPLATE = 'scripts/build-types/package.tpl.json';
const SRC_DIR = 'packages/core-js-types/src/';
const SRC_BASE = 'base';
const TYPE_PREFIX = 'CoreJS.CoreJS';

const versionArg = argv._.find(item => item.startsWith('version='));
const VERSION = versionArg ? versionArg.slice('version='.length) : undefined;
const imports = {
  es: new Set(),
  stable: new Set(),
  actual: new Set(),
  full: new Set(),
  pure: new Set(),
  index: new Set(),
};

async function buildType(entry, options) {
  let {
    entryFromNamespace,
    subset = entryFromNamespace ?? 'full',
    template, templateStable, templateActual, templateFull, filter, modules, enforceEntryCreation,
    customType, tsVersion, proposal,
  } = options;

  switch (subset) {
    case 'es':
      filter ??= ESSet;
      break;
    case 'stable':
      filter ??= StableSet;
      template = templateStable ?? template;
      break;
    case 'actual':
      filter ??= ActualSet;
      template = templateActual ?? templateStable ?? template;
      break;
    case 'full':
      template = templateFull ?? templateActual ?? templateStable ?? template;
      break;
    case 'es-stage':
      filter ??= ESWithProposalsSet;
  }

  if (!enforceEntryCreation && !expandModules(modules[0], filter, AllModules).length) return;

  const rawModules = modules;

  modules = expandModules(modules, filter, AllModules);

  const level = entry.split('/').length - 1;

  const { dependencies, types } = await getModulesMetadata(modules);
  modules = dependencies;

  if (filter) modules = modules.filter(it => filter.has(it));

  types.forEach(type => {
    imports.index.add(type);
    imports[subset].add(type);
    imports.pure.add(path.join('pure', type));
  });
  if (customType) {
    imports.index.add(customType);
    imports[subset].add(customType);
    imports.pure.add(customType);
  }

  const indexPath = buildFilePath(tsVersion, 'index');
  const purePath = buildFilePath(tsVersion, 'pure');

  const entryWithTypes = template({ ...options, modules, rawModules, level, entry, types, packageName: PACKAGE_NAME });
  const entryWithTypesPure = template({ ...options, modules, rawModules, level, entry, types, packageName: PACKAGE_NAME_PURE,
    prefix: TYPE_PREFIX });

  await outputFile(indexPath, `${ entryWithTypes.types }${ entryWithTypes.types ? '\n\n' : '' }`, { flag: 'a' });
  await outputFile(purePath, `${ entryWithTypesPure.types }${ entryWithTypesPure.types ? '\n\n' : '' }`, { flag: 'a' });

  if (!entry.endsWith('/')) {
    const entryWithExt = `${ entry }.js`;
    const entryWithTypesWithExt = template({ ...options, modules, rawModules, level, types, entry: entryWithExt,
      packageName: PACKAGE_NAME });
    const entryWithTypesPureWithExt = template({ ...options, modules, rawModules, level, entry: entryWithExt,
      types, packageName: PACKAGE_NAME_PURE, prefix: TYPE_PREFIX });

    await outputFile(indexPath, `${ entryWithTypesWithExt.types }${ entryWithTypesWithExt.types ? '\n\n' : '' }`, { flag: 'a' });
    await outputFile(purePath, `${ entryWithTypesPureWithExt.types }${ entryWithTypesPureWithExt.types ? '\n\n' : '' }`, { flag: 'a' });
  }

  if (entry.endsWith('/index')) {
    const entryWithoutIndex = entry.replace(/\/index$/, '');
    const entryWithTypesWithoutIndex = template({ ...options, modules, rawModules, level, types, entry: entryWithoutIndex,
      packageName: PACKAGE_NAME });
    const entryWithTypesPureWithoutIndex = template({ ...options, modules, rawModules, level, entry: entryWithoutIndex, types,
      packageName: PACKAGE_NAME_PURE, prefix: TYPE_PREFIX });

    await outputFile(indexPath, `${ entryWithTypesWithoutIndex.types }${ entryWithTypesWithoutIndex.types ? '\n\n' : '' }`, { flag: 'a' });
    await outputFile(purePath, `${ entryWithTypesPureWithoutIndex.types }${ entryWithTypesPureWithoutIndex.types ? '\n\n' : '' }`, { flag: 'a' });
  }

  if (proposal) {
    const filePathProposal = buildFilePath(tsVersion, entry);
    const proposalImports = buildImports(types, 1);
    await outputFile(filePathProposal, `${ proposalImports }\n`, { flag: 'a' });
  }
}

const ESModules = AllModules.filter(it => it.startsWith('es.'));
const ESWithProposalsModules = AllModules.filter(it => it.startsWith('es'));
const StableModules = AllModules.filter(it => it.match(/^(?:es|web)\./));
const ActualModules = modulesToStage(StableModules, 3);

const ESSet = new Set(ESModules);
const ESWithProposalsSet = new Set(ESWithProposalsModules);
const StableSet = new Set(StableModules);
const ActualSet = new Set(ActualModules);

function buildFilePath(tsVersion, subset) {
  return path.join(BUILD_DIR, tsVersion.toString(), `${ subset }.d.ts`);
}

function buildImports(importsList, level = 0) {
  return Array.from(importsList, it => `/// <reference types="./${ '../'.repeat(level) }types/${ it }.d.ts" />`).join('\n');
}

async function prependImports(version) {
  for (const subset of Object.keys(imports)) {
    const filePath = buildFilePath(version, subset);
    const importLines = buildImports(imports[subset]);
    let originalContent = '';
    if (await pathExists(filePath)) {
      originalContent = await fs.readFile(filePath, 'utf8');
    }
    await outputFile(filePath, `${ importLines }\n\n${ originalContent }`, { flag: 'w' });
  }
}

async function fillCustomImportsForPure(typesPath, initialPath) {
  const entries = await readdir(typesPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await fillCustomImportsForPure(path.join(typesPath, entry.name), initialPath);
    } else {
      const filePath = path.join(typesPath, entry.name);
      const fileContent = await readFile(filePath).toString();
      if (fileContent.startsWith('// empty')) continue;
      imports.pure.add(filePath.replace(`${ initialPath }/`, '').replace('.d.ts', ''));
    }
  }
}

async function buildTypesForTSVersion(tsVersion) {
  tsVersion = `ts${ tsVersion.toString().replace('.', '-') }`;
  const bundlePath = path.join(BUILD_DIR, tsVersion);
  const distTypesPath = path.join(bundlePath, 'types');
  if (await pathExists(bundlePath)) await remove(bundlePath);
  await copy(path.join(SRC_DIR, SRC_BASE), path.join(BUILD_DIR, tsVersion, 'types'));
  const srcPath = path.join(SRC_DIR, tsVersion);
  if (await pathExists(srcPath)) {
    await copy(srcPath, distTypesPath);
  }
  await fillCustomImportsForPure(path.join(bundlePath, 'types', 'pure'), distTypesPath);
  await preparePureTypes(bundlePath, distTypesPath);

  for (const [entry, definition] of Object.entries(features)) {
    await buildType(`es/${ entry }`, { ...definition, entryFromNamespace: 'es', tsVersion });
    await buildType(`stable/${ entry }`, { ...definition, entryFromNamespace: 'stable', tsVersion });
    await buildType(`actual/${ entry }`, { ...definition, entryFromNamespace: 'actual', tsVersion });
    await buildType(`full/${ entry }`, { ...definition, entryFromNamespace: 'full', tsVersion });
  }

  for (const [name, definition] of Object.entries(proposals)) {
    await buildType(`proposals/${ name }`, { ...definition, template: $proposal, tsVersion, proposal: true });
  }

  await buildType('es/index', { template: $path, modules: ESModules, subset: 'es', tsVersion });
  await buildType('stable/index', { template: $path, modules: StableModules, subset: 'stable', tsVersion });
  await buildType('actual/index', { template: $path, modules: ActualModules, tsVersion });
  await buildType('full/index', { template: $path, modules: AllModules, tsVersion });
  await buildType('index', { template: $path, modules: ActualModules, tsVersion });

  await prependImports(tsVersion);
}

async function buildPackageJson(breakpoints, namespaces) {
  breakpoints = breakpoints.sort().reverse();
  const packageJson = await readJson(PACKAGE_TEMPLATE);
  const defaultBreakpoint = Math.max(...breakpoints);
  packageJson.typesVersions = {};
  breakpoints.forEach(breakpoint => {
    packageJson.typesVersions[`>=${ breakpoint }`] = {
      '*': [`./dist/ts${ breakpoint.toString().replace('.', '-') }/*`],
    };
  });
  packageJson.exports = {};
  Object.entries(namespaces).forEach(([namespace, options]) => {
    const namespaceKey = namespace !== 'index' ? `./${ namespace }${ options.isDir ? '/*' : '' }` : '.';
    packageJson.exports[namespaceKey] = {};
    breakpoints.forEach((breakpoint, index) => {
      const isLast = index === breakpoints.length - 1;
      const breakpointString = `ts${ breakpoint.toString().replace('.', '-') }`;
      packageJson.exports[namespaceKey][`types${ isLast ? '' : `@>=${ breakpoint }` }`] = `./dist/${ breakpointString }/${ namespace }${ options.isDir ? '/*' : '' }.d.ts`;
    });
    packageJson.exports[namespaceKey].default = `./dist/ts${ defaultBreakpoint.toString().replace('.', '-') }/${ namespace }${ options.isDir ? '/*' : '' }.d.ts`;
  });
  const exportsKeys = Object.keys(packageJson.exports).sort();
  const exports = {};
  exportsKeys.forEach(key => {
    exports[key] = packageJson.exports[key];
  });
  packageJson.exports = exports;
  writeJson(path.join(PACKAGE_JSON_DIR, 'package.json'), packageJson, { spaces: 2 });
}

if (VERSION) {
  await buildTypesForTSVersion(VERSION);
} else {
  const tsVersionBreakpoints = [5.2, 5.6];
  await remove(BUILD_DIR);
  tsVersionBreakpoints.forEach(async version => await buildTypesForTSVersion(version));
  const namespaces = {
    es: { isDir: false },
    stable: { isDir: false },
    actual: { isDir: false },
    full: { isDir: false },
    pure: { isDir: false },
    proposals: { isDir: true },
    index: { isDir: false },
  };
  await buildPackageJson(tsVersionBreakpoints, namespaces);
}
