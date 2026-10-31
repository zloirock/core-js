'use strict';
/* global Deno, QUnit -- runtime guard */
QUnit.test('the deno leg runs on Deno', assert => {
  assert.same(typeof Deno, 'object', 'typeof Deno');
  assert.same(typeof Deno.version.deno, 'string', 'Deno.version.deno');
});
