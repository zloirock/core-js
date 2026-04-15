import { findUniqueName } from './helpers.js';

// pure state bookkeeping for import emitters - each plugin subclasses and implements flush().
// optional subclass override points (called via `?.`): isNameTaken, hookNameAllocated,
// hookPureImportCreated, hookUserPureImportRegistered, hookUserGlobalImportRegistered
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
    this.hookPureImportCreated?.(name, source, hint);
    return name;
  }

  registerUserGlobalImport(moduleName) {
    this.existingGlobalImports.add(moduleName);
    this.hookUserGlobalImportRegistered?.(moduleName);
  }

  registerUserPureImport(entry, name) {
    const source = `${ this.mode }/${ entry }`;
    this.existingPureImports.set(source, name);
    this.usedNames.add(name);
    this.hookUserPureImportRegistered?.(name, source);
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

  uniqueName(prefix, startSuffix, minSuffix = 1) {
    const name = findUniqueName(prefix, startSuffix, minSuffix, n => this.isNameTaken(n));
    this.usedNames.add(name);
    this.hookNameAllocated?.(name);
    return name;
  }

  isNameTaken(name) { return this.usedNames.has(name); }
}
