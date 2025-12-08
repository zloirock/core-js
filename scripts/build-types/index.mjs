import { features, proposals } from '../build-entries/entries-definitions.mjs';
import { $path, $proposal } from '../build-entries/templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';
import { getModulesMetadata } from '../build-entries/get-dependencies.mjs';
import config from './config.mjs';
import { argv, path, fs } from 'zx';
import { expandModules, modulesToStage } from '../build-entries/helpers.mjs';
import { preparePureTypes } from './pure.mjs';

const { copy, outputFile, pathExists, readdir, readJson, remove, writeJson } = fs;

const versionArg = argv._.find(item => item.startsWith('version='));
const VERSION = versionArg ? versionArg.slice('version='.length) : undefined;
const imports = {
  es: new Set(),
  stable: new Set(),
  actual: new Set(),
  full: new Set(),
  pure: new Set(),
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

  const tplPure = template({ ...options, modules, rawModules, level, entry, types, packageName: `${ config.packageName }pure/`, prefix: 'CoreJS.CoreJS' });
  const tpl = template({ ...options, modules, rawModules, level, entry, types, packageName: config.packageName });

  types.forEach(type => {
    imports[subset].add(type);
    const fileName = path.basename(type);
    imports.pure.add(type.replace(fileName, path.join('pure', fileName)));
  });
  if (customType) {
    imports[subset].add(customType);
    imports.pure.add(customType);
  }

  const filePath = buildFilePath(tsVersion, subset);
  const filePathPure = buildFilePath(tsVersion, 'pure');

  await outputFile(filePath, `${ tpl.dts }${ tpl.dts ? '\n\n' : '' }`, { flag: 'a' });
  await outputFile(filePathPure, `${ tplPure.dts }${ tplPure.dts ? '\n\n' : '' }`, { flag: 'a' });

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
  return path.join(config.buildDir, tsVersion.toString(), `${ subset }.d.ts`);
}

function buildImports(importsList, level = 0) {
  return Array.from(importsList, it => `/// <reference types="./${ '../'.repeat(level) }types/${ it }.d.ts" />`).join('\n');
}

async function prependImports(version) {
  for (const subset of Object.keys(imports)) {
    const filePath = buildFilePath(version, subset);
    const importLines = buildImports(imports[subset]);
    const originalContent = await fs.readFile(filePath, 'utf8');
    await outputFile(filePath, `${ importLines }\n\n${ originalContent }`);
  }
}

async function fillCustomImportsForPure(typesPath, initialPath) {
  const entries = await readdir(typesPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await fillCustomImportsForPure(path.join(typesPath, entry.name), initialPath);
    } else {
      const dirName = path.basename(typesPath);
      if (dirName !== 'pure') continue;
      const filePath = path.join(typesPath, entry.name);
      const fileStats = await fs.stat(filePath);
      if (fileStats.size === 0) continue;
      imports.pure.add(filePath.replace(`${ initialPath }/`, '').replace('.d.ts', ''));
    }
  }
}

async function buildTypesForTSVersion(tsVersion) {
  tsVersion = tsVersion.toString().replace('.', '');
  const bundlePath = path.join(config.buildDir, tsVersion);
  if (await pathExists(bundlePath)) await remove(bundlePath);
  await copy(path.join(config.srcDir, tsVersion), path.join(config.buildDir, tsVersion, 'types'));
  await fillCustomImportsForPure(bundlePath, path.join(bundlePath, 'types'));
  await preparePureTypes(bundlePath);

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
  const packageJson = await readJson(config.packageTemplate);
  const defaultBreakpoint = Math.max(...breakpoints);
  packageJson.typesVersions = {};
  breakpoints.forEach(breakpoint => {
    packageJson.typesVersions[`>=${ breakpoint }`] = {
      '*': [`./dist/${ breakpoint.toString().replace('.', '') }/*`],
    };
  });
  packageJson.exports = {};
  Object.entries(namespaces).forEach(([namespace, options]) => {
    const namespaceKey = namespace ? `./${ namespace }${ options.isDir ? '/*' : '' }` : '.';
    packageJson.exports[namespaceKey] = {};
    breakpoints.forEach((breakpoint, index) => {
      const isLast = index === breakpoints.length - 1;
      const breakpointString = breakpoint.toString().replace('.', '');
      packageJson.exports[namespaceKey][`types${ isLast ? '' : `@>=${ breakpoint }` }`] = `./dist/${ breakpointString }/${ namespace }${ options.isDir ? '/*' : '' }.d.ts`;
    });
    packageJson.exports[namespaceKey].default = `./dist/${ defaultBreakpoint.toString().replace('.', '') }/${ namespace }${ options.isDir ? '/*' : '' }.d.ts`;
    if (options.default) {
      packageJson.exports['.'] = packageJson.exports[namespaceKey];
    }
  });
  const exportsKeys = Object.keys(packageJson.exports).sort();
  const exports = {};
  exportsKeys.forEach(key => {
    exports[key] = packageJson.exports[key];
  });
  packageJson.exports = exports;
  writeJson(path.join(config.packageDir, 'package.json'), packageJson, { spaces: 2 });
}

if (VERSION) {
  await buildTypesForTSVersion(VERSION);
} else {
  const tsVersionBreakpoints = [5.2, 5.6];
  await remove(config.buildDir);
  tsVersionBreakpoints.forEach(async version => await buildTypesForTSVersion(version));
  const namespaces = {
    es: { isDir: false, default: false },
    stable: { isDir: false, default: false },
    actual: { isDir: false, default: true },
    full: { isDir: false, default: false },
    pure: { isDir: false, default: false },
    proposals: { isDir: true, default: false },
  };
  await buildPackageJson(tsVersionBreakpoints, namespaces);
}
