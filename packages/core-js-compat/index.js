import compat from './compat.js';
import builtInDefinitions from './built-in-definitions.json' with { type: 'json' };
import data from './data.json' with { type: 'json' };
import entries from './entries.json' with { type: 'json' };
import getEntriesListForTargetVersion from './get-entries-list-for-target-version.js';
import getModulesListForTargetVersion from './get-modules-list-for-target-version.js';
import knownBuiltInReturnTypes from './known-built-in-return-types.json' with { type: 'json' };
import modules from './modules.json' with { type: 'json' };

export {
  builtInDefinitions,
  compat,
  data,
  entries,
  getEntriesListForTargetVersion,
  getModulesListForTargetVersion,
  knownBuiltInReturnTypes,
  modules,
};

export default Object.assign(compat, {
  builtInDefinitions,
  compat,
  data,
  entries,
  getEntriesListForTargetVersion,
  getModulesListForTargetVersion,
  knownBuiltInReturnTypes,
  modules,
});
