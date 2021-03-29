'use strict';
/* eslint-disable no-console -- output */
const { promisify } = require('util');
const eq = require('semver/functions/eq');
const coerce = require('semver/functions/coerce');
const minVersion = require('semver/ranges/min-version');
const getDependencies = promisify(require('david').getDependencies);

const root = require('../package');
const builder = require('@core-js/builder/package');
const compat = require('@core-js/compat/package');

async function checkDependencies(pkg, title) {
  const dependencies = await getDependencies(pkg);
  const devDependencies = await getDependencies(pkg, { dev: true });
  Object.assign(dependencies, devDependencies);
  for (const name of Object.keys(dependencies)) {
    const { required, stable, warn } = dependencies[name];
    if (/^(git|file)/.test(required) || warn || eq(minVersion(required), coerce(stable))) {
      delete dependencies[name];
    }
  }
  if (Object.keys(dependencies).length) {
    console.log(`\u001B[94m${ title || pkg.name }:\u001B[0m`);
    console.table(dependencies);
  }
}

(async () => {
  await checkDependencies(root, 'root');
  await checkDependencies(builder);
  await checkDependencies(compat);
  console.log('\u001B[32mdependencies checked\u001B[0m');
})();
