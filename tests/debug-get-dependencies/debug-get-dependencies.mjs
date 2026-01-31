import { modules } from '@core-js/compat/src/data.mjs';
import { getModulesMetadata } from '../../scripts/build-entries-and-types/get-dependencies.mjs';

for (const module of modules) console.log(module, await getModulesMetadata([module]));
