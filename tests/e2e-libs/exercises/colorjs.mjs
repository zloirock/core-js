// colorjs.io, the colour-science library: parsing, conversion between colour spaces, and the
// differences defined over them. Every expected value below is DEFINED, by one of four things and
// never by a run. By the INPUT, for what the parser and the serialiser hand back. By an IDENTITY of
// the operation - the ends of a mix are its endpoints, a colour differs from itself by nothing, a
// mapped colour is in gamut. By CSS COLOR 4, which prints `lab(54.29% 80.8 69.89)` and
// `oklch(62.8% 0.2577 29.23)` for sRGB red and names `rebeccapurple` as `#663399`, which colorjs
// serialises in the short form `#639`; each such number is rounded to the digits the specification
// prints, one scale per component where they differ, because a digit past them would be this
// implementation's. And by a FORMULA outside it: sRGB's transfer function puts mid grey at L* 53.39,
// WCAG 2.1 makes white on black 1.05/0.05, and CIEDE2000 fixes the distance between red and blue,
// which three majors of the library agree on.
//
// Its reason is the SYNTAX axis. The provider has a second detector beside the usage one -
// `detect-syntax.js`, a table of forms and the entries each form's DOWNGRADE reads - and one arm of
// it no library here reaches: a regexp literal that names its capture groups. `src/Type.js` parses
// every coordinate definition SPELLED AS A STRING with one, so Babel lowers it to `_wrapRegExp`,
// which re-dispatches `Symbol.replace`, keeps the group map in a `WeakMap` and calls the original
// through `RegExp.exec`. The library names none of those three itself, so `es.symbol.replace` and
// its pure twin enter the baselines from the FORM alone - unlike `object/from-entries` and the
// `reflect/has`/`set` pair beside them, which are new to the corpus but named by the library and so
// owed to usage detection. The percentage checks are what drive the form: a coordinate's range comes
// out of `params.groups`, so a lowering that hands back no groups object throws here rather than
// rounding differently.
//
// A run-time `new RegExp` would not do: es-toolkit and chrono-node build named groups from strings,
// which Babel cannot lower, and only the global version installs core-js's RegExp - the pure one
// dies on such a pattern on IE11. The same rules out the sticky twin of this literal, remeda's.
//
// Nothing here reads a coordinate through a space ACCESSOR (`color.oklch.l`). Those are served by a
// `Proxy` behind a `typeof Proxy === 'undefined'` guard, so IE11 takes the library's fallback and
// the accessor path is the one thing this exercise could not answer for. That is also what the
// `reflect/has`/`set` pair in these baselines is: injected from the Proxy branch, and executed by
// nothing here, while the other two new entries do run - the named-group literal 12 times over the
// checks below and `Object.fromEntries` 6.
import Color from 'colorjs.io';
import { checker } from './checks.mjs';

function round(value, scale = 1e4) {
  return Math.round(value * scale) / scale;
}

function coords(color, scale) {
  return color.coords.map(value => round(value, scale));
}

export function run() {
  const { checks, check } = checker();
  const red = new Color('srgb', [1, 0, 0]);

  // --- the parser, and the named groups under it: a percentage carries the range its type declares,
  // and serialising an LCH lightness prints one back ---
  const percent = new Color('rgb(0% 50% 100% / 0.5)');
  check('percent_parse', [percent.coords, percent.alpha], [[0, 0.5, 1], 0.5]);
  check('percent_serialize', new Color('lch', [50, 40, 200], 0.5).toString(), 'lch(50% 40 200 / 0.5)');
  check('hex_named', new Color('rebeccapurple').toString({ format: 'hex' }), '#639');

  // --- conversion: CSS Color 4 prints the first two for red, white pins the top of L*, and mid sRGB
  // grey follows from the sRGB transfer function - 0.5 is 0.2140 of the light, and L* of that is
  // 53.39, not the 50 a linear reading would put it at ---
  check('lab_red', coords(red.to('lab'), 1e2), [54.29, 80.8, 69.89]);
  // the three oklch components are printed to three different precisions, and each is rounded to its
  // own, so no digit of this expectation comes from the implementation
  const oklch = red.to('oklch').coords;
  check('oklch_red', [round(oklch[0], 1e3), round(oklch[1], 1e4), round(oklch[2], 1e2)], [0.628, 0.2577, 29.23]);
  check('lab_white', coords(new Color('srgb', [1, 1, 1]).to('lab'), 1e6), [100, 0, 0]);
  check('lab_gray', coords(new Color('srgb', [0.5, 0.5, 0.5]).to('lab'), 1e2), [53.39, 0, 0]);

  // --- the differences: a colour differs from itself by nothing, and WCAG 2.1 defines the contrast
  // of white against black as 1.05/0.05 and of anything against itself as 1 ---
  check('delta_e', [round(red.deltaE('blue', '2000'), 1e2), red.deltaE(red, '2000')], [55.8, 0]);
  check('contrast', [new Color('white').contrast('black', 'WCAG21'), red.contrast(red, 'WCAG21')], [21, 1]);

  // --- interpolation and gamut mapping, asserted where the answer is the operation's own identity:
  // the ends of a mix are its endpoints, half way from white to black in Lab is L* 50, and a colour
  // outside sRGB is inside it once mapped ---
  check('mix_endpoints', [
    coords(Color.mix('red', 'blue', 0, { space: 'lch' }).to('srgb')),
    coords(Color.mix('red', 'blue', 1, { space: 'lch' }).to('srgb')),
  ], [[1, 0, 0], [0, 0, 1]]);
  check('mix_midpoint', round(Color.mix('white', 'black', 0.5, { space: 'lab' }).to('lab').coords[0]), 50);
  const wide = new Color('oklch', [0.9, 0.4, 30]);
  check('gamut', [wide.inGamut('srgb'), wide.toGamut({ space: 'srgb' }).inGamut('srgb')], [false, true]);

  return { checks };
}
