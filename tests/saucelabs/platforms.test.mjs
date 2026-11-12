import assert from 'node:assert/strict';
import { test } from 'node:test';
import platforms from './platforms.mjs';

test('runs IE10 on Windows 2012 with the JSON Wire protocol', () => {
  assert.deepEqual(platforms.find(({ name }) => name === 'internet explorer 10'), {
    name: 'internet explorer 10',
    w3c: false,
    capabilities: { browserName: 'internet explorer', version: '10', platform: 'Windows 2012' },
  });
});
