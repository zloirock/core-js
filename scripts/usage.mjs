import puppeteer from 'puppeteer';
import pTimeout from 'p-timeout';

const { cyan, green, gray, red } = chalk;
const msie = 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
const limit = argv.l || 100;
const attempts = new Map();
let sites = [];
let tested = 0;
let withCoreJS = 0;

// parse Alexa rank
for (let i = 1, top = Math.ceil(limit / 1e3); i <= top; i++) {
  const response = await fetch(`https://stuffgate.com/stuff/website/top-${ i }000-sites`);
  const html = await response.text();
  const [, table] = html.match(/Analyze<\/th><\/tr><\/thead><tbody><tr>(.+)<\/tr><\/tbody><\/table><\/div>/s);
  sites.push(...Array.from(table.matchAll(/<a href=["']([^"']+)["'] target='_blank'>/g), match => match[1]));
}

sites = sites.slice(0, Math.min(limit, sites.length)).reverse();

// run in parallel
await Promise.all(Array(Math.ceil(os.cpus().length / 2)).fill(0).map(async i => {
  let browser, page, site, name;

  async function check(ua) {
    await page.setUserAgent(ua);
    await page.goto(site);
    // seems js hangs on some sites, so added a time limit
    const { core, vm, vl } = await pTimeout(page.evaluate(`({
      core: !!window['__core-js_shared__'] || !!window.core || !!window._babelPolyfill,
      vm: window['__core-js_shared__']?.versions,
      vl: window.core?.version,
    })`), 1e4);
    const versions = vm ? vm.map(({ version, mode }) => `${ version } (${ mode } mode)`) : vl ? [vl] : [];
    return { core, versions };
  }

  while (sites.length) try {
    site = sites.pop();
    name = site.replace(/^https?:\/\//, '');
    // restart browser each some pages for prevent possible `puppeteer` crash and memory leaks
    if (!(i++ % 64) || !browser) {
      if (browser) await browser.close();
      browser = await puppeteer.launch();
    }
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(12e4);

    let { core, versions } = await check((await browser.userAgent()).replaceAll('Headless', ''));
    // double check, try with another UA
    if (!core) ({ core, versions } = await check(msie));

    await page.close();

    tested++;
    if (core) withCoreJS++;

    console.log(`${ cyan(`${ name }:`) } ${ core
      ? green(`\`core-js\` is detected, ${ versions.length > 1
        ? `${ cyan(versions.length) } versions: ${ cyan(versions.join(', ')) }`
        : `version ${ cyan(versions[0]) }` }`)
      : gray('`core-js` is not detected') }`);
  } catch {
    const attempting = (attempts.get(site) | 0) + 1;
    attempts.set(site, attempting);
    if (attempting < 4) sites.push(site);
    else console.log(red(`${ cyan(`${ name }:`) } problems with access`));
    await sleep(3e3);
  }

  return browser.close();
}));

console.log(green(`\n\`core-js\` is detected on ${ cyan(withCoreJS) } from ${ cyan(tested) } tested websites, ${
  cyan(`${ (withCoreJS / tested * 100).toFixed(2) }%`) }, problems with access to ${ cyan(limit - tested) } websites`));
