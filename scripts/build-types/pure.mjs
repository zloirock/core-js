const { outputFile, pathExists, readdir } = fs;

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

function processLines(lines, prefix) {
  const prefixed = [];
  let noExport = false;
  return lines
    .map(line => {
      const options = parseOptions(line);

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

      if (line.includes('export {')) return null;

      // Process interfaces that either don’t need to extend other interfaces or have already been extended
      if (/^\s*(?:declare\s+)?interface\s+\w+\s*extends/.test(line)
        || options.noExtends && /^\s*(?:declare\s+)?interface\s+\w+(?:<[^>]+>)?\s*\{/.test(line)) {
        if (!options.noPrefix) {
          const m = line.match(/interface\s+(?<name>\w+)/);
          if (m && m.groups) {
            prefixed.push(m.groups.name);
          }
        }
        return line.replace(/^(?<indent>\s*)(?:declare\s+)?interface\s+(?<name>[\s\w,<=>]+)/,
          `$<indent>export interface ${ !options.noPrefix ? prefix : '' }$<name>`);
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
        const entityName = `${ !options.noPrefix ? prefix : '' }${ iName }`;
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
          `$<indent>export function ${ !options.noPrefix ? prefix : '' }$<name>`);
      }

      if (options.prefixReturnType) {
        return line.replace(/^(?<smth>.*):\s(?<rootType>[a-z_]\w*)(?<subType><[^;]+);/i,
          `$<smth>: ${ prefix }.${ prefix }$<rootType>$<subType>;`);
      }

      // Replace prefixed types in the entire file
      if (/(?::|\|)\s*\w/.test(line)) {
        const sortedPrefixed = prefixed.sort((a, b) => b.length - a.length);
        sortedPrefixed.forEach(item => {
          const reg = new RegExp(`(?<prepend>:||) ${ item }(?<type>[,;<)])`, 'g');
          line = line.replace(reg, `$<prepend> ${ prefix }${ item }$<type>`);
        });
      }

      // Handle vars: prefix variable name, keep original type
      if (/^\s*(?:declare)?\svar/.test(line)) {
        const m = line.match(/^(?<indent>\s*)(?:declare\s+)?var\s+(?<name>\w+):\s+(?<type>\w+)/);
        return `${ m?.groups?.indent ?? '' }var ${ !options.noPrefix ? prefix : '' }${ m?.groups?.name ?? '' }: ${ m?.groups?.type };\n`;
      }
      return line;
    })
    .filter(line => line !== null);
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

    // Update import paths and add to header
    if (/^\s*import /.test(line)) {
      headerLines.push(line.replace(/^\s*import\s.*from\s+["'].+["']/,
        (_, start, importPath, end) => `${ start }../${ importPath }${ end }`));
      continue;
    }

    // Comments & new lines add to header as is
    if (/^\s*\/\//.test(line) || /^\s*$/.test(line)) {
      headerLines.push(line);
      continue;
    }
    break;
  }

  const namespaceBody = processLines(lines.slice(i), NAMESPACE)
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
    if (entry.name === 'pure') continue;

    if (entry.isDirectory()) {
      await preparePureTypes(path.join(typesPath, entry.name), initialPath);
    } else {
      if (entry.name === 'core-js-types.d.ts') continue;

      const typePath = path.join(typesPath, entry.name);
      const resultFilePath = typePath.replace(initialPath, `${ initialPath }/pure/`);

      if (await pathExists(resultFilePath)) continue;

      const content = await fs.readFile(typePath, 'utf8'); // move to spread on top

      const result = content.includes('declare namespace') ? content : wrapInNamespace(content);

      await outputFile(resultFilePath, result);
    }
  }
}
