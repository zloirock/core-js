import { deepEqual, throws } from 'node:assert/strict';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version.js';

const modules = await fs.readJson('packages/core-js-compat/modules.json');
const modulesByVersions = await fs.readJson('packages/core-js-compat/modules-by-versions.json');

const modules30 = modulesByVersions['3.0'];
const filter = new Set([...modules30, ...modulesByVersions['3.1'] ?? []]);
const modules31 = modules.filter(it => filter.has(it));

deepEqual(getModulesListForTargetVersion('3.0'), modules30, '3.0');
deepEqual(getModulesListForTargetVersion('3.0.0'), modules30, '3.0.0');
deepEqual(getModulesListForTargetVersion('3.0.1'), modules30, '3.0.1');
deepEqual(getModulesListForTargetVersion('3.0.0-alpha.1'), modules30, '3.0.0-alpha.1');
deepEqual(getModulesListForTargetVersion('3.1'), modules31, '3.1');
deepEqual(getModulesListForTargetVersion('3.1.0'), modules31, '3.1.0');
deepEqual(getModulesListForTargetVersion('3.1.1'), modules31, '3.1.1');

throws(() => getModulesListForTargetVersion(3), TypeError, 'num 3');
throws(() => getModulesListForTargetVersion('3'), TypeError, '3');
throws(() => getModulesListForTargetVersion('2.0'), RangeError, '2.0');
throws(() => getModulesListForTargetVersion('4.0'), RangeError, '4.0');
throws(() => getModulesListForTargetVersion('x'), TypeError, 'x');
throws(() => getModulesListForTargetVersion('*'), TypeError, '*');
throws(() => getModulesListForTargetVersion(), TypeError, 'no arg');

echo(chalk.green('get-modules-list-for-target-version tested'));
