import { features, proposals } from '../build-entries/entries-definitions.mjs';
import { $path, $proposal } from '../build-entries/templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';
import { getModulesMetadata, sort } from '../build-entries/get-dependencies.mjs';
import config from './config.mjs';
import { argv, path, fs } from 'zx';

const { copy, outputFile, pathExists, readdir, remove } = fs;

const versionArg = argv._.find(item => item.startsWith('version='));
const VERSION = versionArg ? versionArg.slice('version='.length) : undefined;

function modulesToStage(x) {
  return sort([
    ...StableModules,
    ...Object.values(proposals).flatMap(({ stage, modules }) => stage >= x ? modules : []),
  ]);
}

function expandModules(modules, filter) {
  if (!Array.isArray(modules)) modules = [modules];
  modules = modules.flatMap(it => it instanceof RegExp ? AllModules.filter(p => it.test(p)) : [it]);
  if (filter) modules = modules.filter(it => typeof it != 'string' || filter.has(it));
  return modules;
}

async function buildType(typeFilePath, entry, options) {
  let {
    entryFromNamespace,
    subset = entryFromNamespace ?? 'full',
    template, templateStable, templateActual, templateFull, filter, modules, enforceEntryCreation,
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

  if (!enforceEntryCreation && !expandModules(modules[0], filter).length) return;

  const rawModules = modules;

  modules = expandModules(modules, filter);

  const level = entry.split('/').length - 1;

  const { dependencies, types } = await getModulesMetadata(modules);
  modules = dependencies;

  if (filter) modules = modules.filter(it => filter.has(it));

  const tpl = template({ ...options, modules, rawModules, level, entry, types, packageName: config.packageName });

  await outputFile(typeFilePath, `${ tpl.dts }\n\n`, { flag: 'a' });
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
    await copy(path.join(config.srcDir, v.toString()), path.join(config.buildDir, version.toString()));
  }
}

async function addImports(filePath, fromPath) {
  const entries = await readdir(fromPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await addImports(filePath, path.join(fromPath, entry.name));
    } else {
      const typePath = path.join(fromPath, entry.name).replace(config.buildDir, '');
      await outputFile(filePath, `/// <reference path="./${ typePath }" />\n`, { flag: 'a' });
    }
  }
}

const ESModules = AllModules.filter(it => it.startsWith('es.'));
const ESWithProposalsModules = AllModules.filter(it => it.startsWith('es'));
const StableModules = AllModules.filter(it => it.match(/^(?:es|web)\./));
const ActualModules = modulesToStage(3);

const ESSet = new Set(ESModules);
const ESWithProposalsSet = new Set(ESWithProposalsModules);
const StableSet = new Set(StableModules);
const ActualSet = new Set(ActualModules);

async function buildTypesForTSVersion(tsVersion) {
  tsVersion = tsVersion.toString().replace('.', '');
  const bundleName = `${ config.bundleName }.${ tsVersion === config.latestTsVersion ? 'latest' : tsVersion }.d.ts`;
  const bundlePath = path.join(config.buildDir, bundleName);
  const typesPath = path.join(config.buildDir, tsVersion.toString());
  if (await pathExists(bundlePath)) await remove(bundlePath);
  if (await pathExists(typesPath)) await remove(typesPath);
  await buildTypesDirForTSVersion(tsVersion);
  await addImports(bundlePath, typesPath);

  for (const [entry, definition] of Object.entries(features)) {
    await buildType(bundlePath, `es/${ entry }`, { ...definition, entryFromNamespace: 'es' });
    await buildType(bundlePath, `stable/${ entry }`, { ...definition, entryFromNamespace: 'stable' });
    await buildType(bundlePath, `actual/${ entry }`, { ...definition, entryFromNamespace: 'actual' });
    await buildType(bundlePath, `full/${ entry }`, { ...definition, entryFromNamespace: 'full' });
  }

  for (const [name, definition] of Object.entries(proposals)) {
    await buildType(bundlePath, `proposals/${ name }`, { ...definition, template: $proposal });
  }

  await buildType(bundlePath, 'stage/3', { template: $path, modules: ActualModules, subset: 'es-stage' });
  await buildType(bundlePath, 'stage/2.7', { template: $path, modules: modulesToStage(2.7), subset: 'es-stage' });
  await buildType(bundlePath, 'stage/2', { template: $path, modules: modulesToStage(2), subset: 'es-stage' });
  await buildType(bundlePath, 'stage/1', { template: $path, modules: modulesToStage(1), subset: 'es-stage' });
  await buildType(bundlePath, 'stage/0', { template: $path, modules: AllModules, subset: 'es-stage' });

  await buildType(bundlePath, 'es/index', { template: $path, modules: ESModules, subset: 'es' });
  await buildType(bundlePath, 'stable/index', { template: $path, modules: StableModules, subset: 'stable' });
  await buildType(bundlePath, 'actual/index', { template: $path, modules: ActualModules });
  await buildType(bundlePath, 'full/index', { template: $path, modules: AllModules });
  await buildType(bundlePath, 'index', { template: $path, modules: ActualModules });
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
