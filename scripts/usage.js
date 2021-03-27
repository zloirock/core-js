'use strict';
/* eslint-disable no-console -- output */
const puppeteer = require('puppeteer');
const os = require('os');
const sites = require('./sites');
const { argv } = process;

(async () => {
  const browser = await puppeteer.launch({ timeout: 9e4 });
  const CPUS = os.cpus().length;
  let limit = sites.length;
  let index = 0;
  let tested = 0;
  let errors = 0;
  let withCoreJS = 0;

  for (const arg of argv) {
    if (arg.startsWith('-l=')) limit = +arg.slice(3);
  }

  await Promise.all(new Array(CPUS).fill().map(async () => {
    const page = await browser.newPage();
    while (index < limit) {
      const site = sites[index++];
      try {
        try {
          await page.goto(`https://${ site }`);
        } catch {
          await page.goto(`http://${ site }`);
        }
        const { core, vm, vl } = await page.evaluate(`({
          core: !!window['__core-js_shared__'] || !!window.core,
          vm: window['__core-js_shared__']?.versions,
          vl: window.core?.version,
        })`);
        const versions = vm ? vm.map(({ version, mode }) => `${ version } (${ mode } mode)`) : vl ? [vl] : [];
        tested++;
        if (core) withCoreJS++;
        console.log(`\u001B[36m${ site }: ${ core
          ? `\u001B[32m\`core-js\` is detected, ${ versions.length > 1
              ? `\u001B[36m${ versions.length }\u001B[32m versions: \u001B[36m${ versions.join(', ') }`
              : `version \u001B[36m${ versions[0] }`
            }`
          : '\u001B[90m`core-js` is not detected'
        }\u001B[0m`);
      } catch {
        errors++;
        console.log(`\u001B[36m${ site }:\u001B[91m problems with access\u001B[0m`);
      }
    }
  }));

  console.log(`\u001B[32m\n\`core-js\` is used on \u001B[36m${
    withCoreJS
  }\u001B[32m from \u001B[36m${
    tested
  }\u001B[32m tested websites, \u001B[36m${
    (withCoreJS / tested * 100).toFixed(2)
  }%\u001B[32m, problems with access to \u001B[36m${
    errors
  }\u001B[32m websites\u001B[0m`);
  await browser.close();
})();
