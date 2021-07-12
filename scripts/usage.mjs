/* eslint-disable no-console -- output */
import puppeteer from 'puppeteer';
import pTimeout from 'p-timeout';

async function getTopK(i) {
  const res = await fetch(`https://stuffgate.com/stuff/website/top-${ i }000-sites`);
  const html = await res.text();
  const [, table] = html.match(/Analyze<\/th><\/tr><\/thead><tbody><tr>(.+)<\/tr><\/tbody><\/table><\/div>/s);
  return Array.from(table.matchAll(/<a href=["']([^"']+)["'] target='_blank'>/g), ([, href]) => href);
}

const { cyan, green, gray, red } = chalk;
const { TimeoutError } = puppeteer.errors;
const timeout = new TimeoutError();
const sites = [];
let limit = argv.l || 100;
let index = 0;
let tested = 0;
let withCoreJS = 0;

for (let i = 1, top = Math.ceil(limit / 1e3); i <= top; i++) {
  sites.push(...await getTopK(i));
}

limit = Math.min(limit, sites.length);

await Promise.all(Array(os.cpus().length).fill(0).map(async (i, n) => {
  let browser, page, site, name;
  await sleep(n * 3e3);

  async function evaluate() {
    // seems js on some sites hangs, so added a time limit
    const { core, vm, vl } = await pTimeout(page.evaluate(`({
      core: !!window['__core-js_shared__'] || !!window.core,
      vm: window['__core-js_shared__']?.versions,
      vl: window.core?.version,
    })`), 1e4, timeout);
    const versions = vm ? vm.map(({ version, mode }) => `${ version } (${ mode } mode)`) : vl ? [vl] : [];

    return { core, versions };
  }

  async function check(ua) {
    await page.setUserAgent(ua);
    await page.goto(site);
    const result = await evaluate();
    if (result.core) return result;
    await page.waitForTimeout(1e4);
    return evaluate();
  }

  while (index < limit) try {
    // restart it each some pages for prevent possible `puppeteer` crash and memory leaks
    if (!(i++ % 32)) {
      if (browser) await browser.close();
      browser = await puppeteer.launch();
    }
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(12e4);
    site = sites[index++];
    name = site.replace(/^https?:\/\//, '');

    let { core, versions } = await check((await browser.userAgent()).replaceAll('Headless', ''));
    if (!core) ({ // double check, try with another UA
      core, versions,
    } = await check('Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'));

    tested++;
    if (core) withCoreJS++;

    console.log(`${ cyan(`${ name }:`) } ${ core
      ? green(`\`core-js\` is detected, ${ versions.length > 1
        ? `${ cyan(versions.length) } versions: ${ cyan(versions.join(', ')) }`
        : `version ${ cyan(versions[0]) }` }`)
      : gray('`core-js` is not detected') }`);

    await page.close();
  } catch (error) {
    if (error instanceof TimeoutError || (error instanceof Error && error.message.startsWith('net::'))) {
      console.log(`${ cyan(`${ name }:`) } ${ red('problems with access') }`);
    }
  }
  return browser.close();
}));

console.log(green(`\n\`core-js\` is detected on ${ cyan(withCoreJS) } from ${ cyan(tested) } tested websites, ${
  cyan(`${ (withCoreJS / tested * 100).toFixed(2) }%`) }, problems with access to ${ cyan(limit - tested) } websites`));
