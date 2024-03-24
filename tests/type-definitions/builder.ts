import builder from '@core-js/builder';

const a: Promise<string> = builder({ targets: { node: 17 } });
const b: string = await builder({ targets: { node: 17 } });

await builder();
await builder({});
await builder({ modules: 'core-js/actual' });
await builder({ modules: 'es.array.push' });
await builder({ modules: /^es\.array\./ });
await builder({ modules: ['core-js/actual', /^es\.array\./] });
await builder({ exclude: 'core-js/actual' });
await builder({ exclude: 'es.array.push' });
await builder({ exclude: /^es\.array\./ });
await builder({ exclude: ['core-js/actual', /^es\.array\./] });
await builder({ modules: 'core-js/actual', exclude: /^es\.array\./ });
await builder({ targets: '> 1%' });
await builder({ targets: ['defaults', 'last 5 versions'] });
await builder({ targets: { esmodules: true, node: 'current', browsers: ['> 1%'] } });
await builder({ targets: { chrome: '26', firefox: 4 } });
await builder({ targets: { browsers: { chrome: '26', firefox: 4 } } });
await builder({ targets: { chrome: '26', firefox: 4, esmodules: true, node: 'current', browsers: ['> 1%'] } });
await builder({ format: 'bundle' });
await builder({ format: 'esm' });
await builder({ format: 'cjs' });
await builder({ filename: '/foo/bar/baz.js' });
await builder({ summary: { comment: true } });
await builder({ summary: { comment: { size: true } } });
await builder({ summary: { comment: { size: false, modules: true } } });
await builder({ summary: { console: true } });
await builder({ summary: { console: { size: true } } });
await builder({ summary: { console: { size: false, modules: true } } });
await builder({ summary: { console: { size: false, modules: true }, comment: { size: false, modules: true } } });
await builder({
  modules: 'core-js/actual',
  exclude: /^es\.array\./,
  targets: {
    android: 1,
    bun: '1',
    chrome: 1,
    chrome_mobile: '1',
    deno: 1,
    edge: '1',
    electron: 1,
    firefox: '1',
    firefox_mobile: 1,
    hermes: '1',
    ie: 1,
    ios: '1',
    opera: 1,
    opera_mobile: '1',
    quest: '1',
    react_native: 1,
    rhino: '1',
    safari: 1,
    samsung: '1',
    node: 'current',
    esmodules: true,
    browsers: ['> 1%'],
  },
  format: 'bundle',
  filename: '/foo/bar/baz.js',
  summary: {
    console: { size: false, modules: true },
    comment: { size: false, modules: true },
  },
});
