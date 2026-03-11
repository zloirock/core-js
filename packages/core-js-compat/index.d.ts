import type compat from './compat'
import type getEntriesListForTargetVersion from './get-entries-list-for-target-version';
import type getModulesListForTargetVersion from './get-modules-list-for-target-version';
import type { ModuleName, Target, TargetVersion } from './shared'

type CompatData = {
  [module: ModuleName]: {
    [target in Target]?: TargetVersion
  }
};

type KnownBuiltInReturnTypes = {
  static: {[className: string]: {[method: string]: string}},
  instance: {[className: string]: {[method: string]: string}},
};

declare const ExportedCompatObject: typeof compat & {
  compat: typeof compat,

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

export = ExportedCompatObject
