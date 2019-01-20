'use strict';
const ChromeToElectronModule = require('electron-to-chromium/chromium-versions');
const ChromeToElectron = Object
  .keys(ChromeToElectronModule)
  .map(chrome => [chrome, ChromeToElectronModule[chrome]]);

module.exports = {
  ChromeToNode: [
    [14, '0.10'],
    [28, '0.12'],
    [45, '4.0'],
    [46, '5.0'],
    [50, '6.0'],
    [51, '6.5'],
    [54, '7.0'],
    [55, '7.6'],
    [58, '8.0'],
    [60, '8.3'],
    [61, '8.7'],
    [62, '8.10'],
    [68, '10.13'],
  ],
  ChromeToSamsung: [
    [34, '2.1'],
    [38, '3.0'],
    [42, '3.4'],
    [44, '4.0'],
    [51, '5.0'],
    [56, '6.2'],
    [59, '7.2'],
    [63, '8.2'],
  ],
  ChromeToAndroid: [
    [30, '4.4'],
    [33, '4.4.3'],
  ],
  ChromeToElectron,
  SafariToIOS: [
    ['5.1', '6.0'],
    ['7.0', '7.0'],
    ['7.1', '8.0'],
    ['9.0', '9.0'],
    ['10.0', '10.0'],
    ['10.1', '10.3'],
    ['11.0', '11.0'],
    ['11.1', '11.3'],
    ['12.0', '12.0'],
  ],
  SafariToPhantomJS: [
    ['6.0', '2.0'],
  ],
};
