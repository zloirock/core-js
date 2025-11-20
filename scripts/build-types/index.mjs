import { features, proposals } from '../build-entries/entries-definitions.mjs';
import { $path, $proposal } from '../build-entries/templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';
import { getModulesMetadata } from '../build-entries/get-dependencies.mjs';
import config from './config.mjs';
import { argv, path, fs } from 'zx';
import { expandModules, modulesToStage } from '../build-entries/helpers.mjs';

const { copy, outputFile, pathExists, readdir, remove } = fs;

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
    customType, tsVersion,
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

  const tplPure = template({ ...options, modules, rawModules, level, entry, types, packageName: `${ config.packageName }pure/` });
  const tpl = template({ ...options, modules, rawModules, level, entry, types, packageName: config.packageName });

  types.forEach(type => {
    imports[subset].add(type);
    imports.pure.add(type);
  });
  if (customType) {
    imports[subset].add(customType);
    imports.pure.add(customType);
  }

  const filePath = buildFilePath(tsVersion, subset);
  const filePathPure = buildFilePath(tsVersion, 'pure');

  await outputFile(filePath, `${ tpl.dts }${ tpl.dts ? '\n\n' : '' }`, { flag: 'a' });
  await outputFile(filePathPure, `${ tplPure.dts }${ tplPure.dts ? '\n\n' : '' }`, { flag: 'a' });
}

async function getVersions() {
  const versions = [];
  const entries = await readdir(config.srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      versions.push(parseInt(entry.name, 10));
    }
  }
  return versions.sort();
}

async function buildTypesDirForTSVersion(version) {
  const versions = await getVersions();
  for (const v of versions) {
    if (v > version) break;
    await copy(path.join(config.srcDir, v.toString()), path.join(config.buildDir, version.toString(), 'types'));
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

async function prependImports(version) {
  for (const subset of Object.keys(imports)) {
    const filePath = buildFilePath(version, subset);
    const importLines = Array.from(imports[subset], it => `/// <reference types="./types/${ it }.d.ts" />`).join('\n');
    const originalContent = await fs.readFile(filePath, 'utf8');
    await outputFile(filePath, `${ importLines }\n\n${ originalContent }`);
  }
}

async function buildTypesForTSVersion(tsVersion) {
  tsVersion = tsVersion.toString().replace('.', '');
  const bundlePath = path.join(config.buildDir, tsVersion);
  if (await pathExists(bundlePath)) await remove(bundlePath);
  await buildTypesDirForTSVersion(tsVersion);

  for (const [entry, definition] of Object.entries(features)) {
    await buildType(`es/${ entry }`, { ...definition, entryFromNamespace: 'es', tsVersion });
    await buildType(`stable/${ entry }`, { ...definition, entryFromNamespace: 'stable', tsVersion });
    await buildType(`actual/${ entry }`, { ...definition, entryFromNamespace: 'actual', tsVersion });
    await buildType(`full/${ entry }`, { ...definition, entryFromNamespace: 'full', tsVersion });
  }

  for (const [name, definition] of Object.entries(proposals)) {
    await buildType(`proposals/${ name }`, { ...definition, template: $proposal, tsVersion });
  }

  await buildType('es/index', { template: $path, modules: ESModules, subset: 'es', tsVersion });
  await buildType('stable/index', { template: $path, modules: StableModules, subset: 'stable', tsVersion });
  await buildType('actual/index', { template: $path, modules: ActualModules, tsVersion });
  await buildType('full/index', { template: $path, modules: AllModules, tsVersion });
  await buildType('index', { template: $path, modules: ActualModules, tsVersion });

  await prependImports(tsVersion);
}

if (VERSION) {
  await buildTypesForTSVersion(VERSION);
} else {
  const tsVersionBreakpoints = [
    5.2,
    5.6,
  ];
  await remove(config.buildDir);
  tsVersionBreakpoints.forEach(async version => await buildTypesForTSVersion(version));
}
