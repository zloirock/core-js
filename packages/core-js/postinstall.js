/* eslint-disable max-len -- for better formatting */
var fs = require('fs');
var os = require('os');
var path = require('path');
var env = process.env;

var PLEASE_SHOW_ADS = is(env.PLEASE_SHOW_ADS)
var COLOR = is(env.npm_config_color)
var MINUTE = 60 * 1000;

var BANNER = '\u001B[96mThank you for using core-js (\u001B[94m https://github.com/zloirock/core-js \u001B[96m) for polyfilling JavaScript standard library!\u001B[0m\n\n' +
             '\u001B[96mThe project needs your help! Please consider supporting of core-js on Open Collective or Patreon: \u001B[0m\n' +
             '\u001B[96m>\u001B[94m https://opencollective.com/core-js \u001B[0m\n' +
             '\u001B[96m>\u001B[94m https://www.patreon.com/zloirock \u001B[0m\n\n' +
             '\u001B[96mAlso, the author of core-js (\u001B[94m https://github.com/zloirock \u001B[96m) is looking for a good job -)\u001B[0m\n';

function is(it) {
  return !!it && it !== '0' && it !== 'false';
}

function isBannerRequired() {
  if (!PLEASE_SHOW_ADS) return false
  var file = path.join(os.tmpdir(), 'core-js-banners');
  var banners = [];
  try {
    var DELTA = Date.now() - fs.statSync(file).mtime;
    if (DELTA >= 0 && DELTA < MINUTE * 3) {
      banners = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (banners.indexOf(BANNER) !== -1) return false;
    }
  } catch (error) {
    banners = [];
  }
  try {
    banners.push(BANNER);
    fs.writeFileSync(file, JSON.stringify(banners), 'utf8');
  } catch (error) { /* empty */ }
  return true;
}

function showBanner() {
  // eslint-disable-next-line no-console,no-control-regex -- output
  console.log(COLOR ? BANNER : BANNER.replace(/\u001B\[\d+m/g, ''));
}

if (isBannerRequired()) showBanner();
