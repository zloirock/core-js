import { deepEqual, throws } from 'node:assert/strict';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version.js';

const modules = await fs.readJson('packages/core-js-compat/modules.json');
const modulesByVersions = await fs.readJson('packages/core-js-compat/modules-by-versions.json');

const modules40 = modulesByVersions['4.0'];
const filter = new Set([...modules40, ...modulesByVersions['4.1'] ?? []]);
const modules41 = modules.filter(it => filter.has(it));

deepEqual(getModulesListForTargetVersion('4.0'), modules40, '4.0');
deepEqual(getModulesListForTargetVersion('4.0.0'), modules40, '4.0.0');
deepEqual(getModulesListForTargetVersion('4.0.1'), modules40, '4.0.1');
deepEqual(getModulesListForTargetVersion('4.0.0-alpha.1'), modules40, '4.0.0-alpha.1');
deepEqual(getModulesListForTargetVersion('4.1'), modules41, '4.1');
deepEqual(getModulesListForTargetVersion('4.1.0'), modules41, '4.1.0');
deepEqual(getModulesListForTargetVersion('4.1.1'), modules41, '4.1.1');

throws(() => getModulesListForTargetVersion(4), TypeError, 'num 4');
throws(() => getModulesListForTargetVersion('4'), TypeError, '4');
throws(() => getModulesListForTargetVersion('3.0'), RangeError, '3.0');
throws(() => getModulesListForTargetVersion('5.0'), RangeError, '5.0');
throws(() => getModulesListForTargetVersion('x'), TypeError, 'x');
throws(() => getModulesListForTargetVersion('*'), TypeError, '*');
throws(() => getModulesListForTargetVersion(), TypeError, 'no arg');

echo(chalk.green('get-modules-list-for-target-version tested'));
