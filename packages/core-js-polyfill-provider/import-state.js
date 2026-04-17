import { findUniqueName } from './helpers.js';

// import-emitter state; each plugin subclasses and implements `flush()`.
// augment via `super.foo()` overrides - plugin-specific bookkeeping stays in the subclass
export default class ImportInjectorState {
  absoluteImports;
  mode;
  pkg;
  importStyle;

  globalImports = new Set();
  pureImports = new Map(); // `${mode}/${entry}` -> binding name
  existingGlobalImports = new Set();
  existingPureImports = new Map();
  usedNames = new Set();
  // post-pass dead-import filter - null when inactive
  referencedInSource = null;

  constructor({ absoluteImports, mode, pkg, importStyle }) {
    this.absoluteImports = absoluteImports;
    this.mode = mode;
    this.pkg = pkg;
    this.importStyle = importStyle;
  }

  addGlobalImport(moduleName) {
    this.globalImports.add(moduleName);
  }

  addPureImport(entry, hint) {
    const source = `${ this.mode }/${ entry }`;
    if (this.existingPureImports.has(source)) return this.existingPureImports.get(source);
    if (this.pureImports.has(source)) return this.pureImports.get(source);
    const name = this.uniqueName(`_${ hint.replaceAll('.', '$') }`, null, 2);
    this.pureImports.set(source, name);
    return name;
  }

  registerUserGlobalImport(moduleName) {
    this.existingGlobalImports.add(moduleName);
  }

  registerUserPureImport(entry, name) {
    const source = `${ this.mode }/${ entry }`;
    this.existingPureImports.set(source, name);
    this.usedNames.add(name);
  }

  seedReservedNames(names) {
    for (const n of names) this.usedNames.add(n);
  }

  enableReferenceTracking() {
    this.referencedInSource = new Set();
  }

  trackReferencedName(name) {
    this.referencedInSource?.add(name);
  }

  uniqueName(prefix, startSuffix, minSuffix, extraCheck) {
    const name = findUniqueName(prefix, startSuffix, minSuffix,
      n => this.isNameTaken(n) || (extraCheck ? extraCheck(n) : false));
    this.usedNames.add(name);
    return name;
  }

  isNameTaken(name) { return this.usedNames.has(name); }

  // `_ref, _ref2, _ref3, ...` (no `_ref1`). `extraCheck` covers bindings the injector
  // doesn't track (e.g. caller's inner scope); subclass decides how the name is emitted
  #refCount = 0;
  generateRefName(extraCheck) {
    const n = this.#refCount++;
    return this.uniqueName('_ref', n === 0 ? null : n + 1, 2, extraCheck);
  }
}
