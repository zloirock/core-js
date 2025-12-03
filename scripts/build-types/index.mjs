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
  await buildTypesDirForTSVersion(tsVersion);
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

function extractDeclareGlobalSections(lines) {
  const sections = [];
  const outside = [];
  for (let i = 0; i < lines.length;) {
    if (/^\s*declare\s+global\s*\{/.test(lines[i])) {
      let depth = 1;
      const section = [];
      for (++i; i < lines.length && depth > 0; ++i) {
        depth += (lines[i].match(/\{/g) || []).length;
        depth -= (lines[i].match(/\}/g) || []).length;
        if (depth === 0 && /^\s*\}\s*$/.test(lines[i])) break;
        if (depth > 0) section.push(lines[i]);
      }
      ++i;
      sections.push(section);
    } else {
      outside.push(lines[i++]);
    }
  }
  return { sections, outside };
}

function processLines(lines, prefix) {
  const prefixed = [];
  let noExport = false;
  return lines
    .map(line => {
      const hasOptions = line.includes('@type-options');
      const optionsStr = hasOptions ? line.match(/@type-options\s+(?<options>[\s\w,-]+)/)?.groups?.options : '';
      const options = {
        noExtends: !hasOptions ? false : optionsStr.includes('no-extends'),
        noPrefix: !hasOptions ? false : optionsStr.includes('no-prefix'),
        noConstructor: !hasOptions ? false : optionsStr.includes('no-constructor'),
        exportBaseConstructor: !hasOptions ? false : optionsStr.includes('export-base-constructor'),
        noExport: !hasOptions ? false : optionsStr.includes('no-export'),
        noRedefine: !hasOptions ? false : optionsStr.includes('no-redefine'),
      };
      if (noExport && /^[^{]*\}/.test(line)) {
        noExport = false;
        return null;
      }
      if (noExport) return null;
      if (options.noExport) {
        if (/^[^{]*$/.test(line) || /\{[^}]?\}/.test(line)) return null;
        noExport = true;
        return null;
      }
      if (/^\s*(?:declare\s+)?interface\s+\w+\s*extends/.test(line) || options.noExtends && /^\s*(?:declare\s+)?interface\s+\w+\s*\{/.test(line)) {
        if (!options.noPrefix) {
          const m = line.match(/interface\s+(?<name>\w+)/);
          if (m && m.groups) {
            prefixed.push(m.groups.name);
          }
        }
        return line.replace(/^(?<indent>\s*)(?:declare\s+)?interface\s+(?<name>[\s\w,<=>]+)/, `$<indent>export interface ${ !options.noPrefix ? prefix : '' }$<name>`);
      }
      if (!options.noExtends && /^\s*(?:declare\s+)?interface\s+\w+/.test(line)) {
        const m = line.match(/^(?<indent>\s*)(?:declare\s+)?interface\s+(?<name>\w+)(?<extend><[^>]+>)?/);
        const iIndent = m?.groups?.indent ?? '';
        const iName = m?.groups?.name ?? '';
        const iExtend = m?.groups?.extend ?? '';
        if (!options.noPrefix && iName !== '') {
          prefixed.push(iName);
        }
        const genericsForExtends = iExtend.replace(/\sextends\s[^,>]+/g, '').replace(/\s?=\s?\w+/g, '');
        const entityName = `${ !options.noPrefix ? prefix : '' }${ iName }`;
        const isConstructor = iName.includes('Constructor');
        let constructorDeclaration;
        if (isConstructor) {
          constructorDeclaration = !options.noRedefine ? `${ iIndent }var ${ entityName.replace('Constructor', '') }: ${ entityName };\n` : '';
        } else {
          constructorDeclaration = !options.noRedefine ? `${ iIndent }var ${ entityName }: ${ options.exportBaseConstructor ? iName : entityName }${ options.noConstructor ? '' : 'Constructor' };\n` : '';
        }
        return `${ constructorDeclaration }${ iIndent }export interface ${ entityName }${ iExtend } extends ${ iName }${ genericsForExtends } {\n`;
      }
      if (/^\s*(?:declare\s+)?function/.test(line)) {
        return line.replace(/^(?<indent>\s*)(?:declare\s+)?function\s+(?<name>\w+)/, `$<indent>export function ${ !options.noPrefix ? prefix : '' }$<name>`);
      }
      if (/:\s*\w/.test(line)) {
        const sortedPrefixed = prefixed.sort((a, b) => b.length - a.length);
        sortedPrefixed.forEach(item => {
          const reg = new RegExp(`: ${ item }([,;<)])`, 'g');
          line = line.replace(reg, `: ${ prefix }${ item }$1`);
        });
      }
      if (/^\s*(?:declare)?\svar/.test(line)) {
        const m = line.match(/^(?<indent>\s*)(?:declare\s+)?var\s+(?<name>\w+):\s+(?<type>\w+)/);
        return `${ m?.groups?.indent ?? '' }var ${ !options.noPrefix ? prefix : '' }${ m?.groups?.name ?? '' }: ${ m?.groups?.type };\n`;
      }
      return line;
    })
    .filter(line => line !== null);
}

function wrapDTSInNamespace(content, namespace = 'CoreJS') {
  const lines = content.split('\n');
  const preamble = [];
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/\/\/\/\s*<reference types/.test(line)) {
      const m = line.match(/\/\/\/\s*<reference types="(?<path>[^"]+)"/);
      const typePath = m?.groups?.path ?? '';
      preamble.push(line.replace(typePath, `../${ typePath }`));
      continue;
    }
    if (/^\s*import /.test(line)) {
      preamble.push(line.replace(/^\s*import\s.*from\s+["'].+["']/, (_, a, b, c) => `${ a }../${ b }${ c }`));
    } else if (/^\s*\/\//.test(line) || /^\s*$/.test(line)) {
      preamble.push(line);
    } else break;
  }
  const mainLines = lines.slice(i);
  const { sections, outside } = extractDeclareGlobalSections(mainLines);
  const nsBody = [...processLines(outside, namespace), ...sections.flatMap(s => processLines(s, namespace))]
    .reduce((res, line) => {
      if ((line && line.trim() !== '') || (res.at(-1) && res.at(-1).trim() !== '')) res.push(line);
      return res;
    }, []).map(line => line ? `  ${ line }` : '').join('\n');
  return `${ preamble.length ? `${ preamble.join('\n') }\n` : '' }declare namespace ${ namespace } {\n${ nsBody }}\n`;
}

async function preparePureTypes(typesPath) {
  const entries = await readdir(typesPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'pure') continue;
    if (entry.isDirectory()) {
      await preparePureTypes(path.join(typesPath, entry.name));
    } else {
      if (entry.name.includes('core-js-types.d.ts')) continue;
      const typePath = path.join(typesPath, entry.name);
      const resultFilePath = typePath.replace(entry.name, `pure/${ entry.name }`);
      if (await pathExists(resultFilePath)) continue;
      const content = await fs.readFile(typePath, 'utf8');
      if (content.includes('declare namespace')) continue;
      const result = wrapDTSInNamespace(content);
      await outputFile(resultFilePath, result);
    }
  }
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
