import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import createResolver from '../../packages/core-js-service/internals/domain/resolver.js';
import parseUserAgent from '../../packages/core-js-service/internals/infrastructure/ua-bowser.js';
import { compare } from '@core-js/compat/helpers';
import corpus from './user-agents.json' with { type: 'json' };

const resolve = createResolver({ parseUserAgent });
const CHROMIUM_TOKEN = /\bChrome\/(?<version>\d+(?:\.\d+)*)/;

// real strings, kept as a fixture rather than fetched: what each of them resolves to is a fact about
// this code and about bowser, and a change in either has to show up HERE and not in production. the
// row carries where the string came from, because a hand-written user agent proves nothing - an
// invented version pair reads as a finding and is only a typo
ok(corpus.length > 30, `user-agents-1 #1: only ${ corpus.length } strings in the corpus`);

for (const [index, row] of corpus.entries()) {
  const target = resolve({ 'user-agent': row.userAgent });
  const label = `user-agents-1 #${ index + 2 }: ${ row.browser }`;

  if (row.engine === null) strictEqual(target, null, label);
  else deepStrictEqual(target && { engine: target.engine, version: target.version },
    { engine: row.engine, version: row.version }, label);
}

// and the rules that hold for a whole family, whatever string arrives in it - these survive a corpus
// refresh, where the row above is only as current as the day it was written
for (const row of corpus) {
  const { userAgent } = row;
  const target = resolve({ 'user-agent': userAgent });

  // on iOS every browser is WKWebView, whatever it calls itself - and a Mac string is a Mac string,
  // even when an iPad sent it
  if (/\((?:iPad|iPhone|iPod)/.test(userAgent)) {
    strictEqual(target?.engine, 'ios', `user-agents-2 #1: ${ row.browser }`);
  }

  // a Chromium under any name is never answered with more than the Chromium it says it runs
  if (target !== null && target.engine.startsWith('chrome')) {
    const token = CHROMIUM_TOKEN.exec(userAgent)?.groups.version;
    if (token !== undefined) {
      ok(compare(target.version, '<=', token), `user-agents-2 #2: ${ row.browser } answered ${ target.version } over ${ token }`);
    }
  }

  // an engine token outranks the name beside it: nothing but Internet Explorer carries `Trident/`,
  // and what it says is the engine, whatever the browser claims to be
  const trident = /\bTrident\/(?<version>\d\.\d)/.exec(userAgent)?.groups.version;
  const TRIDENT_IE = { '4.0': '8', '5.0': '9', '6.0': '10', '7.0': '11' };

  // compared as versions, not as strings: the parser spells IE 11 `11.0` and the token maps to `11`
  if (trident !== undefined && TRIDENT_IE[trident] !== undefined) {
    ok(target?.engine === 'ie' && compare(target.version, '==', TRIDENT_IE[trident]),
      `user-agents-2 #5: ${ row.browser } answered ${ target ? `${ target.engine } ${ target.version }` : 'baseline'
      } on Trident/${ trident }`);
  }

  // the second candidate is another row the same visitor could be on: the Chromium a named build
  // runs, or `ios` for a Mac string, which is what an iPad sends. It is never the Chromium of a
  // browser that never ran one
  if (target?.alternate?.engine.startsWith('chrome')) {
    ok(CHROMIUM_TOKEN.test(userAgent), `user-agents-2 #3: ${ row.browser }`);
    ok(!/\bEdge\/\d/.test(userAgent), `user-agents-2 #4: ${ row.browser } is EdgeHTML, which never ran Chromium`);
  }

  // and a MAC string always carries it, because nothing in the string tells a Mac from an iPad -
  // while a console that reports Safari is a console, and the row for iPhones says nothing about it
  if (target?.engine === 'safari' && /Macintosh/.test(userAgent)) {
    deepStrictEqual(target.alternate, { engine: 'ios', version: target.version },
      `user-agents-2 #6: ${ row.browser }`);
  }
}
