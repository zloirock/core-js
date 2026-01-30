const { outputFile, pathExists, readdir, readFile } = fs;

const NAMESPACE = 'CoreJS';

function parseOptions(line) {
  const hasOptions = line.includes('@type-options');
  const optionsStr = hasOptions ? line.match(/@type-options:\s+(?<options>[A-Za-z][\s\w,-]+)$/)?.groups?.options : '';
  return {
    noExtends: hasOptions && optionsStr.includes('no-extends'),
    noPrefix: hasOptions && optionsStr.includes('no-prefix'),
    noConstructor: hasOptions && optionsStr.includes('no-constructor'),
    exportBaseConstructor: hasOptions && optionsStr.includes('export-base-constructor'),
    noExport: hasOptions && optionsStr.includes('no-export'),
    noRedefine: hasOptions && optionsStr.includes('no-redefine'),
    prefixReturnType: hasOptions && optionsStr.includes('prefix-return-type'),
  };
}

function processLines(lines) {
  const prefixed = [];
  let noExport = false;
  return lines
    .flatMap(line => {
      const options = parseOptions(line);

      if (noExport && /^[^{]*\}/.test(line)) {
        noExport = false;
        return [];
      }
      if (noExport) return [];
      if (options.noExport) {
        if (/^[^{]*$/.test(line) || /\{[^}]?\}/.test(line)) return [];
        noExport = true;
        return [];
      }

      if (line.includes('export {')) return [];

      // Process interfaces that either don’t need to extend other interfaces or have already been extended
      if (/^\s*(?:declare\s+)?interface\s+\w+\s*extends/.test(line)
        || options.noExtends && /^\s*(?:declare\s+)?interface\s+\w+(?:<[^>]+>)?\s*\{/.test(line)) {
        if (!options.noPrefix) {
          const m = line.match(/interface\s+(?<name>\w+)/);
          if (m?.groups) {
            prefixed.push(m.groups.name);
          }
        }
        return line.replace(/^(?<indent>\s*)(?:declare\s+)?interface\s+(?<name>[\s\w,<=>]+)/,
          `$<indent>export interface ${ !options.noPrefix ? NAMESPACE : '' }$<name>`);
      }

      // Process interfaces: prefix name, emit backing var (constructor) and make it extend original
      if (!options.noExtends && /^\s*(?:declare\s+)?interface\s+\w+/.test(line)) {
        const match = line.match(/^(?<indent>\s*)(?:declare\s+)?interface\s+(?<name>\w+)(?<extend><[^>]+>)?/);
        const iIndent = match?.groups?.indent ?? '';
        const iName = match?.groups?.name ?? '';
        const iExtend = match?.groups?.extend ?? '';
        if (!options.noPrefix && iName !== '') {
          prefixed.push(iName);
        }
        const genericsForExtends = iExtend.replace(/\sextends\s[^,>]+/g, '').replace(/\s?=\s?\w+/g, '');
        const entityName = `${ !options.noPrefix ? NAMESPACE : '' }${ iName }`;
        const isConstructor = iName.includes('Constructor');
        let constructorDeclaration;
        if (isConstructor) {
          constructorDeclaration = !options.noRedefine ?
            `${ iIndent }var ${ entityName.replace('Constructor', '') }: ${ entityName };\n` : '';
        } else {
          constructorDeclaration = !options.noRedefine ? `${ iIndent }var ${ entityName }: ${
            options.exportBaseConstructor ? iName : entityName }${ options.noConstructor ? '' : 'Constructor' };\n` : '';
        }
        return `${ constructorDeclaration }${ iIndent }export interface ${
          entityName }${ iExtend } extends ${ iName }${ genericsForExtends } {\n`;
      }

      // Process function
      if (/^\s*(?:declare\s+)?function/.test(line)) {
        return line.replace(/^(?<indent>\s*)(?:declare\s+)?function\s+(?<name>\w+)/,
          `$<indent>export function ${ !options.noPrefix ? NAMESPACE : '' }$<name>`);
      }

      if (options.prefixReturnType) {
        return line.replace(/^(?<smth>.*):\s(?<rootType>[a-z_]\w*)(?<subType><[^;]+);/i,
          `$<smth>: ${ NAMESPACE }.${ NAMESPACE }$<rootType>$<subType>;`);
      }

      // Replace prefixed types in the entire file
      if (/(?::|\|)\s*\w/.test(line)) {
        prefixed.sort((a, b) => b.length - a.length);
        prefixed.forEach(item => {
          const reg = new RegExp(`(?<prepend>:||) ${ item }(?<type>[,;<)])`, 'g');
          line = line.replace(reg, `$<prepend> ${ NAMESPACE }${ item }$<type>`);
        });
      }

      // Handle vars: prefix variable name, keep original type
      if (/^\s*(?:declare)?\svar/.test(line)) {
        const m = line.match(/^(?<indent>\s*)(?:declare\s+)?var\s+(?<name>\w+):\s+(?<type>\w+)/);
        return `${ m?.groups?.indent ?? '' }var ${ !options.noPrefix ? NAMESPACE : '' }${ m?.groups?.name ?? '' }: ${ m?.groups?.type };\n`;
      }
      return line;
    });
}

function wrapInNamespace(content) {
  const lines = content.split('\n');
  const headerLines = [];

  let i = 0;
  // Process the header section up to the start of the main content
  for (; i < lines.length; i++) {
    const line = lines[i];

    // Update reference paths and add to header
    if (/\/\/\/\s*<reference types/.test(line)) {
      const match = line.match(/\/\/\/\s*<reference types="(?<path>[^"]+)"/);
      const typePath = match.groups.path;
      headerLines.push(line.replace(typePath, `../${ typePath }`));
      continue;
    }

    // Comments & new lines add to header as is
    if (/^\s*(?:\/\/|$)/.test(line)) {
      headerLines.push(line);
      continue;
    }
    break;
  }

  const namespaceBody = processLines(lines.slice(i))
    .reduce((res, line) => {
      if (line.trim() || res.at(-1)?.trim()) res.push(line);
      return res;
    }, [])
    .map(line => line ? `  ${ line }` : '')
    .join('\n');

  return `${ headerLines.length ? `${ headerLines.join('\n') }\n` : '' }declare namespace ${ NAMESPACE } {\n${ namespaceBody }\n}\n`;
}

export async function preparePureTypes(typesPath, initialPath) {
  const entries = await readdir(typesPath, { withFileTypes: true });
  for (const entry of entries) {
    if (['pure', 'core-js-types.d.ts'].includes(entry.name)) continue;

    if (entry.isDirectory()) {
      await preparePureTypes(path.join(typesPath, entry.name), initialPath);
    } else {
      const typePath = path.join(typesPath, entry.name);
      const resultFilePath = typePath.replace(initialPath, `${ initialPath }/pure/`);

      if (await pathExists(resultFilePath)) continue;

      const content = await readFile(typePath, 'utf8');

      const result = content.includes('declare namespace') ? content : wrapInNamespace(content);

      await outputFile(resultFilePath, result);
    }
  }
}
