'use strict';
/* global Bun, QUnit -- runtime guard */
// the first file of every bun leg: the leg is only worth running on Bun
QUnit.test('the bun leg runs on Bun', assert => {
  assert.same(typeof Bun, 'object', 'typeof Bun');
  assert.same(typeof process.versions.bun, 'string', 'process.versions.bun');
});
