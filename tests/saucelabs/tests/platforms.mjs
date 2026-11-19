import { deepEqual, equal } from 'node:assert/strict';
import platforms, { android, desktop } from '../platforms.mjs';

deepEqual(platforms.find(({ name }) => name === 'firefox 15'), {
  name: 'firefox 15',
  w3c: false,
  capabilities: { browserName: 'firefox', version: '15', platform: 'Windows 10' },
}, 'runs Firefox 15 on Windows 10 with the JSON Wire protocol');

deepEqual(desktop('internet explorer', '11', 'Windows 10'), {
  name: 'internet explorer 11',
  w3c: false,
  capabilities: { browserName: 'internet explorer', version: '11', platform: 'Windows 10' },
}, 'runs IE11 of the full matrix with the JSON Wire protocol');

for (const name of ['firefox 7', 'firefox 11', 'internet explorer 10']) {
  equal(platforms.some(platform => platform.name === name), false, `${ name } is below the supported baseline`);
}

deepEqual(
  Object.fromEntries(platforms.filter(({ pool }) => pool).map(({ name, pool }) => [name, pool])),
  {
    'safari 14': 'mac_vms',
    'safari 15': 'mac_vms',
    'safari 16': 'mac_vms',
    'safari 17': 'mac_vms',
    'safari 18': 'mac_arm_vms',
    'safari 26': 'mac_arm_vms',
    'ios 14.0': 'mac_vms',
    'ios 15.4': 'mac_vms',
    'ios 16.0': 'mac_vms',
    'ios 17.0': 'mac_vms',
    'ios 18.6': 'mac_arm_vms',
    'ios 26.1': 'mac_arm_vms',
    'ios 27.0': 'mac_arm_vms',
  },
  'assigns the Mac sessions to the Intel and Apple Silicon pools of Sauce Labs',
);

equal(android('Google ARM Medium Phone Emulator', '14.0').pool, 'android_arm_vms', 'assigns an ARM Android emulator to its own pool');

for (const [browserName, version, w3c, capabilities] of [
  ['chrome', '74', false, { browserName: 'chrome', version: '74', platform: 'Windows 10' }],
  ['chrome', '75', true, { browserName: 'chrome', browserVersion: '75', platformName: 'Windows 10' }],
  ['firefox', '47', false, { browserName: 'firefox', version: '47', platform: 'Windows 10' }],
  ['firefox', '48', false, { browserName: 'firefox', version: '48', platform: 'Windows 10', seleniumVersion: '3.4.0' }],
  ['firefox', '52', false, { browserName: 'firefox', version: '52', platform: 'Windows 10', seleniumVersion: '3.4.0' }],
  ['firefox', '53', false, { browserName: 'firefox', version: '53', platform: 'Windows 10' }],
  ['firefox', '77', false, { browserName: 'firefox', version: '77', platform: 'Windows 10' }],
  ['firefox', '78', true, { browserName: 'firefox', browserVersion: '78', platformName: 'Windows 10' }],
]) {
  const selected = desktop(browserName, version, 'Windows 10');
  equal(selected.w3c, w3c, `uses ${ w3c ? 'W3C' : 'JSON Wire' } for ${ browserName } ${ version }`);
  deepEqual(selected.capabilities, capabilities, `sends the ${ w3c ? 'W3C' : 'JSON Wire' } capabilities for ${ browserName } ${ version }`);
}

echo(chalk.green('Sauce Labs matrix tested'));
