import { deepEqual, throws } from 'node:assert/strict';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version.js';

const entries = await fs.readJson('packages/core-js-compat/entries.json');
const entriesList = Object.keys(entries);
const entriesByVersions = await fs.readJson('packages/core-js-compat/entries-by-versions.json');

const [entries40] = Object.values(entriesByVersions);
const filter = new Set([...entries40, ...entriesByVersions['4.1.0'] ?? []]);
const entries41 = entriesList.filter(it => filter.has(it));

deepEqual(getEntriesListForTargetVersion('4.0'), entries40, '4.0');
deepEqual(getEntriesListForTargetVersion('4.0.0'), entries40, '4.0.0');
deepEqual(getEntriesListForTargetVersion('4.0.1'), entries40, '4.0.1');
deepEqual(getEntriesListForTargetVersion('4.0.0-alpha.1'), entries40, '4.0.0-alpha.1');
deepEqual(getEntriesListForTargetVersion('4.1'), entries41, '4.1');
deepEqual(getEntriesListForTargetVersion('4.1.0'), entries41, '4.1.0');
deepEqual(getEntriesListForTargetVersion('4.1.1'), entries41, '4.1.1');

throws(() => getEntriesListForTargetVersion(4), TypeError, 'num 4');
throws(() => getEntriesListForTargetVersion('4'), TypeError, '4');
throws(() => getEntriesListForTargetVersion('3.0'), RangeError, '3.0');
throws(() => getEntriesListForTargetVersion('5.0'), RangeError, '5.0');
throws(() => getEntriesListForTargetVersion('x'), TypeError, 'x');
throws(() => getEntriesListForTargetVersion('*'), TypeError, '*');
throws(() => getEntriesListForTargetVersion(), TypeError, 'no arg');

echo(chalk.green('get-entries-list-for-target-version tested'));
