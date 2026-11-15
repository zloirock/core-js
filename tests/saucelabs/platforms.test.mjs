import { deepEqual, equal } from 'node:assert/strict';
import platforms, { android, desktop } from './platforms.mjs';

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

deepEqual(
  Object.fromEntries(platforms.filter(({ pool }) => pool).map(({ name, pool }) => [name, pool])),
  {
    'safari 14': 'mac_vms', 'safari 16': 'mac_vms', 'safari 18': 'mac_arm_vms', 'safari 26': 'mac_arm_vms', 'safari 27': 'mac_arm_vms',
    'ios 26.1': 'mac_arm_vms', 'ios 27.0': 'mac_arm_vms',
  },
  'assigns the Mac sessions to the Intel and Apple Silicon pools of Sauce Labs',
);

equal(android('Google ARM Medium Phone Emulator', '14.0').pool, 'android_arm_vms', 'assigns an ARM Android emulator to its own pool');

for (const [version, w3c, capabilities] of [
  ['74', false, { browserName: 'chrome', version: '74', platform: 'Windows 10' }],
  ['75', true, { browserName: 'chrome', browserVersion: '75', platformName: 'Windows 10' }],
]) {
  const selected = desktop('chrome', version, 'Windows 10');
  equal(selected.w3c, w3c, `uses ${ w3c ? 'W3C' : 'JSON Wire' } for Chrome ${ version }`);
  deepEqual(selected.capabilities, capabilities, `sends the ${ w3c ? 'W3C' : 'JSON Wire' } capabilities for Chrome ${ version }`);
}
