'use strict';
const builder = require('@core-js/builder');
const compat = require('@core-js/compat/entries');
const normalizer = require('@core-js/ua-normalizer');

// experimental playground
module.exports = function ({ path = null, modules = compat['core-js/actual'], addModulesList = false }) {
  const normalized = new Map();
  const bundles = new Map();
  return async function (req, res, next) {
    if (path !== null && req.path !== path) return next();
    const ua = req.get('User-Agent');

    let browser = normalized.get(ua);
    if (!browser) {
      browser = normalizer(ua);
      normalized.set(ua, browser);
    }

    const key = browser.toString();
    if (!bundles.has(key)) {
      bundles.set(key, await builder({
        modules,
        targets: browser.toTarget(),
        addModulesList,
      }));
    }

    res.set('Content-Type', 'application/javascript');
    res.send(bundles.get(key));
  };
};
