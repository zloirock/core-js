import { deepEqual } from 'node:assert/strict';
import platforms from './platforms.mjs';

deepEqual(platforms.find(({ name }) => name === 'firefox 7'), {
  name: 'firefox 7',
  w3c: false,
  capabilities: { browserName: 'firefox', version: '7', platform: 'Windows 10' },
}, 'runs Firefox 7 on Windows 10 with the JSON Wire protocol');

deepEqual(platforms.find(({ name }) => name === 'internet explorer 10'), {
  name: 'internet explorer 10',
  w3c: false,
  capabilities: { browserName: 'internet explorer', version: '10', platform: 'Windows 2012' },
}, 'runs IE10 on Windows 2012 with the JSON Wire protocol');
