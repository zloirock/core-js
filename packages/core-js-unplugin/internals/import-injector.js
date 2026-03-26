export default class ImportInjector {
  constructor(ms, pkg, mode, absoluteImports, importStyle) {
    this.ms = ms;
    this.pkg = pkg;
    this.mode = mode;
    this.absoluteImports = absoluteImports;
    this.importStyle = importStyle;
    this.globalModules = new Set();
    this.pureImports = new Map();
    this.usedNames = new Set();
    this.rootScope = null;
    this.refs = [];
  }

  // usage-global / entry-global: collect side-effect module import
  addGlobalImport(moduleName) {
    this.globalModules.add(moduleName);
  }

  // usage-pure: register default import, return binding name
  // hint is sanitized to a valid JS identifier: 'Array.from' -> '_Array$from'
  // Avoids collisions with user-defined variables via scope.hasBinding()
  addPureImport(entry, hint) {
    const key = `${ this.mode }/${ entry }`;
    if (this.pureImports.has(key)) return this.pureImports.get(key);
    const sanitized = hint.replaceAll('.', '$');
    let name = `_${ sanitized }`;
    let counter = 2;
    while (this.usedNames.has(name) || this.rootScope?.hasBinding(name)) {
      name = `_${ sanitized }${ counter++ }`;
    }
    this.usedNames.add(name);
    this.pureImports.set(key, name);
    return name;
  }

  addRef(name) {
    this.usedNames.add(name);
    this.refs.push(name);
  }

  // Resolve import path - absolute or package-relative
  resolvePath(subpath) {
    if (!this.absoluteImports) return `${ this.pkg }/${ subpath }`;
    try {
      const resolved = import.meta.resolve(`${ this.pkg }/${ subpath }`);
      return resolved.startsWith('file://') ? resolved.slice(7) : resolved;
    } catch {
      return `${ this.pkg }/${ subpath }`;
    }
  }

  // Apply all collected imports at the top of the file
  flush() {
    let header = '';
    if (this.refs.length) header += `var ${ this.refs.join(', ') };\n`;
    if (this.importStyle === 'require') {
      for (const mod of this.globalModules) {
        header += `require("${ this.resolvePath(`modules/${ mod }`) }");\n`;
      }
      for (const [entry, name] of this.pureImports) {
        header += `var ${ name } = require("${ this.resolvePath(entry) }");\n`;
      }
    } else {
      for (const mod of this.globalModules) {
        header += `import "${ this.resolvePath(`modules/${ mod }`) }";\n`;
      }
      for (const [entry, name] of this.pureImports) {
        header += `import ${ name } from "${ this.resolvePath(entry) }";\n`;
      }
    }
    if (header) this.ms.prepend(header);
  }
}
