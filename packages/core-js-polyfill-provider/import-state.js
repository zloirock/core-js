import { findUniqueName } from './helpers.js';

// matches the prefix used by `generateRefName`; consumed by post-pass orphan adoption
// in plugins - keep this in sync if the prefix or numbering scheme changes
export const ORPHAN_REF_PATTERN = /^_ref\d*$/;

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
    // mark name so `flush()`'s post-pass dead-import filter keeps it even when the
    // generated identifier never appeared in source (sibling-injected usage between
    // pre and post). no-op when tracking isn't enabled
    this.trackReferencedName(name);
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

  // amortize O(1) per prefix: without this cache, `_at, _at2, ..., _atN` from user code
  // would force each new allocation to linear-probe all N taken names from scratch
  #nextSuffixByPrefix = new Map();

  uniqueName(prefix, startSuffix, minSuffix, extraCheck) {
    const cached = this.#nextSuffixByPrefix.get(prefix);
    const effective = cached > (startSuffix ?? -Infinity) ? cached : startSuffix;
    const name = findUniqueName(prefix, effective, minSuffix,
      n => this.isNameTaken(n) || (extraCheck ? extraCheck(n) : false));
    this.usedNames.add(name);
    // `+name.slice(prefix.length) || 1` handles the bare-prefix case (slice = '' -> NaN -> 1)
    this.#nextSuffixByPrefix.set(prefix, (+name.slice(prefix.length) || 1) + 1);
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
