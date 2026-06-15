import type $compat from './compat.js'
import type getEntriesListForTargetVersion from './get-entries-list-for-target-version.js';
import type getModulesListForTargetVersion from './get-modules-list-for-target-version.js';
import type { ModuleName, Target, TargetVersion } from './shared.js'

type BuiltInDefinitions = {
  globals: {[name: string]: any},
  statics: {[className: string]: {[member: string]: any}},
  instance: {[member: string]: any},
};

type CompatData = {
  [module: ModuleName]: {
    [target in Target]?: TargetVersion
  }
};

/** `element` / `inherit` are resolution directives (defer to the container's element type), not type names */
type ReturnTypeDirective = 'element' | 'inherit';

type ReturnTypeHint = {
  /** the value's type name (`Array`, `string`, `Promise`, ...) */
  type: string,
  /** container element type, or a resolution directive */
  element?: ReturnTypeHint | ReturnTypeDirective,
  /** the settled inner type (e.g. the value a returned Promise resolves to), or a directive */
  resolved?: ReturnTypeHint | ReturnTypeDirective,
  /** zero-based indices of arguments the method mutates in place (e.g. `Object.assign` -> `[0]`) */
  mutatesArgument?: readonly number[],
  /** zero-based index of the argument the method returns unchanged (e.g. `Object.freeze` -> `0`) */
  returnsArgument?: number,
};

/** a method / property return hint, or a bare resolution directive (`Array#at` -> `element`) */
type ReturnTypeHintValue = ReturnTypeHint | ReturnTypeDirective;

type ConstructorReturnHint = {
  type: string | null,
  element?: ReturnTypeHint | ReturnTypeDirective,
};

type KnownBuiltInReturnTypes = {
  globalMethods: {[method: string]: ReturnTypeHintValue},
  globalProperties: {[property: string]: ReturnTypeHintValue},
  staticMethods: {[className: string]: {[method: string]: ReturnTypeHintValue}},
  staticProperties: {[className: string]: {[property: string]: ReturnTypeHintValue}},
  instanceMethods: {[className: string]: {[method: string]: ReturnTypeHintValue}},
  instanceProperties: {[className: string]: {[property: string]: ReturnTypeHintValue}},
  staticTypeGuards: {[className: string]: {[method: string]: ReturnTypeHintValue}},
  globalProxies: readonly string[],
  namespaces: readonly string[],
  constructors: {[name: string]: { new: ConstructorReturnHint, call: ConstructorReturnHint }},
};

declare const ExportedCompatObject: typeof $compat & {
  /** Built-in definitions - globals, static and instance properties mapped to polyfill modules */
  builtInDefinitions: BuiltInDefinitions,

  compat: typeof $compat,

  /** Full list compatibility data */
  data: CompatData,

  /** map of modules by `core-js` entry points */
  entries: {[entry_point: string]: readonly ModuleName[]},

  /** The subset of entries which available in the passed `core-js` version */
  getEntriesListForTargetVersion: typeof getEntriesListForTargetVersion,

  /** The subset of modules which available in the passed `core-js` version */
  getModulesListForTargetVersion: typeof getModulesListForTargetVersion,

  /** Known return types for built-in static and instance methods */
  knownBuiltInReturnTypes: KnownBuiltInReturnTypes,

  /** Full list of modules */
  modules: readonly ModuleName[]
}

export default ExportedCompatObject

export declare const builtInDefinitions: BuiltInDefinitions;
export declare const compat: typeof $compat;
export declare const data: CompatData;
export declare const entries: {[entry_point: string]: readonly ModuleName[]};
export { getEntriesListForTargetVersion, getModulesListForTargetVersion };
export declare const knownBuiltInReturnTypes: KnownBuiltInReturnTypes;
export declare const modules: readonly ModuleName[];
