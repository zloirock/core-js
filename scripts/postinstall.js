/* eslint-disable no-console,max-len */
var env = process.env;
var CI = !!env.CI && env.CI !== '0' && env.CI !== 'false';
var SILENT = !!~['silent', 'error', 'warn'].indexOf(env.npm_config_loglevel);

if (!CI && !SILENT) {
  console.log('\u001B[96mThank you for using core-js (\u001B[94m https://github.com/zloirock/core-js \u001B[96m)!\u001B[0m\n');
  console.log('\u001B[96mPlease consider supporting of core-js on Open Collective or Patreon: \u001B[0m');
  console.log('\u001B[96m>\u001B[94m https://opencollective.com/core-js \u001B[0m');
  console.log('\u001B[96m>\u001B[94m https://www.patreon.com/zloirock \u001B[0m\n');
  console.log('\u001B[96mAlso, the author of core-js (\u001B[94m https://github.com/zloirock \u001B[96m) is looking for a good job -)\u001B[0m\n');
}
