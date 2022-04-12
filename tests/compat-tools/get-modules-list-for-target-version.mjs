import { deepStrictEqual, throws } from 'assert';
import getModulesListForTargetVersion from 'core-js-compat/get-modules-list-for-target-version.js';

const modules = require('core-js-compat/modules');
const modulesByVersions = require('../../packages/core-js-compat/modules-by-versions');

const modules30 = modulesByVersions['3.0'];
const filter = new Set([...modules30, ...modulesByVersions['3.1']]);
const modules31 = modules.filter(it => filter.has(it));

deepStrictEqual(getModulesListForTargetVersion(3), modules30, 'num 3'); // TODO: Make it throw in core-js@4
deepStrictEqual(getModulesListForTargetVersion('3'), modules30, '3'); // TODO: Make it throw in core-js@4
deepStrictEqual(getModulesListForTargetVersion('3.0'), modules30, '3.0');
deepStrictEqual(getModulesListForTargetVersion('3.0.0'), modules30, '3.0.0');
deepStrictEqual(getModulesListForTargetVersion('3.0.1'), modules30, '3.0.1');
deepStrictEqual(getModulesListForTargetVersion('3.0.0-alpha.1'), modules30, '3.0.0-alpha.1');
deepStrictEqual(getModulesListForTargetVersion('3.1'), modules31, '3.1');
deepStrictEqual(getModulesListForTargetVersion('3.1.0'), modules31, '3.1.0');
deepStrictEqual(getModulesListForTargetVersion('3.1.1'), modules31, '3.1.1');

throws(() => getModulesListForTargetVersion('2.0'), RangeError, '2.0');
throws(() => getModulesListForTargetVersion('4.0'), RangeError, '4.0');
throws(() => getModulesListForTargetVersion('x'), TypeError, 'x');
throws(() => getModulesListForTargetVersion('*'), TypeError, '*');
throws(() => getModulesListForTargetVersion(), TypeError, 'no arg');

console.log(chalk.green('get-modules-list-for-target-version tested'));
