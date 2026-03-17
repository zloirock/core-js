import type $compat from './compat.js'
import type getEntriesListForTargetVersion from './get-entries-list-for-target-version.js';
import type getModulesListForTargetVersion from './get-modules-list-for-target-version.js';
import type { ModuleName, Target, TargetVersion } from './shared.js'

type BuiltInDefinitions = {
  Globals: {[name: string]: any},
  StaticProperties: {[className: string]: {[property: string]: any}},
  InstanceProperties: {[property: string]: any},
};

type CompatData = {
  [module: ModuleName]: {
    [target in Target]?: TargetVersion
  }
};

type KnownBuiltInReturnTypes = {
  staticMethods: {[className: string]: {[method: string]: string}},
  staticProperties: {[className: string]: {[method: string]: string}},
  instanceMethods: {[className: string]: {[method: string]: string}},
  instanceProperties: {[className: string]: {[method: string]: string}},
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
