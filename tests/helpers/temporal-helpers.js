// This is a `core-js` friendly version of Test262's Temporal test helpers:
// https://github.com/tc39/test262/blob/7f2001f611ef96532c68e000b413c5599df94147/harness/js
// The above link is a copy of the `js` file at the time of writing

import { GLOBAL } from './constants.js';

const Symbol = GLOBAL.Symbol || {};

const ASCII_IDENTIFIER = /^[$A-Z_a-z][\w$]*$/u;

// eslint-disable-next-line no-unused-vars -- Helper function to be used in later test helpers
function formatPropertyName(propertyKey, objectName = '') {
  switch (typeof propertyKey) {
    case 'symbol': {
      if (Symbol.keyFor(propertyKey) !== undefined) {
        return `${ objectName }[Symbol.for('${ Symbol.keyFor(propertyKey) }')]`;
      }

      const description = propertyKey.description || '';

      if (description.startsWith('Symbol.')) {
        return `${ objectName }[${ description }]`;
      }

      return `${ objectName }[Symbol('${ description }')]`;
    }
    case 'string':
      if (propertyKey !== String(Number(propertyKey))) {
        if (ASCII_IDENTIFIER.test(propertyKey)) {
          return objectName ? `${ objectName }.${ propertyKey }` : propertyKey;
        }
        return `${ objectName }['${ propertyKey.replace(/'/g, "\\'") }']`;
      }
      break;
      // fall through
    default:
      // integer or string integer-index
      return `${ objectName }[${ propertyKey }]`;
  }
}

const SKIP_SYMBOL = Symbol('Skip');

export function createTemporalHelpers(Temporal, assert) {
  /*
  * Codes and maximum lengths of months in the ISO 8601 calendar.
  */
  const ISOMonths = [
    { month: 1, monthCode: 'M01', daysInMonth: 31 },
    { month: 2, monthCode: 'M02', daysInMonth: 29 },
    { month: 3, monthCode: 'M03', daysInMonth: 31 },
    { month: 4, monthCode: 'M04', daysInMonth: 30 },
    { month: 5, monthCode: 'M05', daysInMonth: 31 },
    { month: 6, monthCode: 'M06', daysInMonth: 30 },
    { month: 7, monthCode: 'M07', daysInMonth: 31 },
    { month: 8, monthCode: 'M08', daysInMonth: 31 },
    { month: 9, monthCode: 'M09', daysInMonth: 30 },
    { month: 10, monthCode: 'M10', daysInMonth: 31 },
    { month: 11, monthCode: 'M11', daysInMonth: 30 },
    { month: 12, monthCode: 'M12', daysInMonth: 31 },
  ];

  /*
  * List of known calendar eras and their possible aliases.
  *
  * https://tc39.es/proposal-intl-era-monthcode/#table-eras
  */
  const CalendarEras = {
    buddhist: [
      { era: 'be' },
    ],
    coptic: [
      { era: 'am' },
    ],
    ethiopic: [
      { era: 'aa' },
      { era: 'am' },
    ],
    ethioaa: [
      { era: 'aa' },
    ],
    gregory: [
      { era: 'bce', aliases: ['bc'] },
      { era: 'ce', aliases: ['ad'] },
    ],
    hebrew: [
      { era: 'am' },
    ],
    indian: [
      { era: 'shaka' },
    ],
    'islamic-civil': [
      { era: 'bh' },
      { era: 'ah' },
    ],
    'islamic-tbla': [
      { era: 'bh' },
      { era: 'ah' },
    ],
    'islamic-umalqura': [
      { era: 'bh' },
      { era: 'ah' },
    ],
    japanese: [
      { era: 'bce', aliases: ['bc'] },
      { era: 'ce', aliases: ['ad'] },
      { era: 'heisei' },
      { era: 'meiji' },
      { era: 'reiwa' },
      { era: 'showa' },
      { era: 'taisho' },
    ],
    persian: [
      { era: 'ap' },
    ],
    roc: [
      { era: 'roc' },
      { era: 'broc' },
    ],
  };

  /**
   * Apple's fork of ICU contains code for these calendars, but they are not yet
   * allowed to be supported in AvailableCalendars. See
   * https://github.com/tc39/ecma402/blob/main/meetings/notes-2025-12-04.md#datetimeformatconstructor-options-calendar-islamic-fallbackjs-should-allow-other-fallback-values-4677
   */
  const NotYetSupportedCalendars = [
    'bangla',
    'gujarati',
    'kannada',
    'marathi',
    'odia',
    'tamil',
    'telugu',
    'vikram',
  ];

  /*
  * Used for substituteMethod to indicate default behavior instead of a
  * substituted value
  */
  const SUBSTITUTE_SKIP = SKIP_SYMBOL;

  /*
  * An object containing further methods that return arrays of ISO strings, for
  * testing parsers.
  */
  const ISO = {
    /*
    * PlainMonthDay strings that are not valid.
    */
    plainMonthDayStringsInvalid() {
      return [
        '11-18junk',
        '11-18[u-ca=gregory]',
        '11-18[u-ca=hebrew]',
        '11-18[U-CA=iso8601]',
        '11-18[u-CA=iso8601]',
        '11-18[FOO=bar]',
        '-999999-01-01[u-ca=gregory]',
        '-999999-01-01[u-ca=chinese]',
        '+999999-01-01[u-ca=gregory]',
        '+999999-01-01[u-ca=chinese]',
      ];
    },

    /*
    * PlainMonthDay strings that are valid and that should produce October 1st.
    */
    plainMonthDayStringsValid() {
      return [
        '10-01',
        '1001',
        '1965-10-01',
        '1976-10-01T152330.1+00:00',
        '19761001T15:23:30.1+00:00',
        '1976-10-01T15:23:30.1+0000',
        '1976-10-01T152330.1+0000',
        '19761001T15:23:30.1+0000',
        '19761001T152330.1+00:00',
        '19761001T152330.1+0000',
        '+001976-10-01T152330.1+00:00',
        '+0019761001T15:23:30.1+00:00',
        '+001976-10-01T15:23:30.1+0000',
        '+001976-10-01T152330.1+0000',
        '+0019761001T15:23:30.1+0000',
        '+0019761001T152330.1+00:00',
        '+0019761001T152330.1+0000',
        '1976-10-01T15:23:00',
        '1976-10-01T15:23',
        '1976-10-01T15',
        '1976-10-01',
        '--10-01',
        '--1001',
        '-999999-10-01',
        '-999999-10-01[u-ca=iso8601]',
        '+999999-10-01',
        '+999999-10-01[u-ca=iso8601]',
      ];
    },

    /*
    * PlainTime strings that may be mistaken for PlainMonthDay or
    * PlainYearMonth strings, and so require a time designator.
    */
    plainTimeStringsAmbiguous() {
      const ambiguousStrings = [
        '2021-12',  // ambiguity between YYYY-MM and HHMM-UU
        '2021-12[-12:00]',  // ditto, TZ does not disambiguate
        '1214',     // ambiguity between MMDD and HHMM
        '0229',     //   ditto, including MMDD that doesn't occur every year
        '1130',     //   ditto, including DD that doesn't occur in every month
        '12-14',    // ambiguity between MM-DD and HH-UU
        '12-14[-14:00]',  // ditto, TZ does not disambiguate
        '202112',   // ambiguity between YYYYMM and HHMMSS
        '202112[UTC]',  // ditto, TZ does not disambiguate
      ];
      const stringsWithCalendar = [];

      // Adding a calendar annotation to one of these strings must not cause
      // disambiguation in favour of time.
      for (let i = 0; i < ambiguousStrings.length; i++) {
        const ambString = ambiguousStrings[i];

        stringsWithCalendar.push(`${ ambString }[u-ca=iso8601]`);
      }

      return ambiguousStrings.concat(stringsWithCalendar);
    },

    /*
    * PlainTime strings that are of similar form to PlainMonthDay and
    * PlainYearMonth strings, but are not ambiguous due to components that
    * aren't valid as months or days.
    */
    plainTimeStringsUnambiguous() {
      return [
        '2021-13',          // 13 is not a month
        '202113',           //   ditto
        '2021-13[-13:00]',  //   ditto
        '202113[-13:00]',   //   ditto
        '0000-00',          // 0 is not a month
        '000000',           //   ditto
        '0000-00[UTC]',     //   ditto
        '000000[UTC]',      //   ditto
        '1314',             // 13 is not a month
        '13-14',            //   ditto
        '1232',             // 32 is not a day
        '0230',             // 30 is not a day in February
        '0631',             // 31 is not a day in June
        '0000',             // 0 is neither a month nor a day
        '00-00',            //   ditto
      ];
    },

    /*
    * PlainYearMonth-like strings that are not valid.
    */
    plainYearMonthStringsInvalid() {
      return [
        '2020-13',
        '1976-11[u-ca=gregory]',
        '1976-11[u-ca=hebrew]',
        '1976-11[U-CA=iso8601]',
        '1976-11[u-CA=iso8601]',
        '1976-11[FOO=bar]',
        '+999999-01',
        '-999999-01',
      ];
    },

    /*
    * PlainYearMonth-like strings that are valid and should produce November
    * 1976 in the ISO 8601 calendar.
    */
    plainYearMonthStringsValid() {
      return [
        '1976-11',
        '1976-11-10',
        '1976-11-01T09:00:00+00:00',
        '1976-11-01T00:00:00+05:00',
        '197611',
        '+00197611',
        '1976-11-18T15:23:30.1-02:00',
        '1976-11-18T152330.1+00:00',
        '19761118T15:23:30.1+00:00',
        '1976-11-18T15:23:30.1+0000',
        '1976-11-18T152330.1+0000',
        '19761118T15:23:30.1+0000',
        '19761118T152330.1+00:00',
        '19761118T152330.1+0000',
        '+001976-11-18T152330.1+00:00',
        '+0019761118T15:23:30.1+00:00',
        '+001976-11-18T15:23:30.1+0000',
        '+001976-11-18T152330.1+0000',
        '+0019761118T15:23:30.1+0000',
        '+0019761118T152330.1+00:00',
        '+0019761118T152330.1+0000',
        '1976-11-18T15:23',
        '1976-11-18T15',
        '1976-11-18',
      ];
    },

    /*
    * PlainYearMonth-like strings that are valid and should produce November of
    * the ISO year -9999.
    */
    plainYearMonthStringsValidNegativeYear() {
      return [
        '-009999-11',
      ];
    },
  };

  /*
  * Return the canonical era code.
  */
  function canonicalizeCalendarEra(calendarId, eraName) {
    if (typeof calendarId !== 'string') throw new TypeError('calendar must be string in canonicalizeCalendarEra');

    if (!Object.prototype.hasOwnProperty.call(CalendarEras, calendarId)) {
      if (eraName !== undefined) throw new Error('eraName must be undefined');
      return undefined;
    }

    if (typeof eraName !== 'string') throw new TypeError('eraName must be string or undefined in canonicalizeCalendarEra');

    for (const { era, aliases = [] } of CalendarEras[calendarId]) {
      if (era === eraName || aliases.includes(eraName)) {
        return era;
      }
    }
    throw new Error(`Unsupported era name: ${ eraName }`);
  }

  /*
  * assertDuration(duration, years, ...,  nanoseconds[, description]):
  *
  * Shorthand for asserting that each field of a Temporal.Duration is equal to
  * an expected value.
  */
  function assertDuration(
    duration,
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds,
    description = '',
  ) {
    const prefix = description ? `${ description }: ` : '';

    assert.true(Object.prototype.toString.call(duration) === '[object Temporal.Duration]', `${ prefix }instanceof`);
    assert.same(duration.years, years, `${ prefix }years result:`);
    assert.same(duration.months, months, `${ prefix }months result:`);
    assert.same(duration.weeks, weeks, `${ prefix }weeks result:`);
    assert.same(duration.days, days, `${ prefix }days result:`);
    assert.same(duration.hours, hours, `${ prefix }hours result:`);
    assert.same(duration.minutes, minutes, `${ prefix }minutes result:`);
    assert.same(duration.seconds, seconds, `${ prefix }seconds result:`);
    assert.same(duration.milliseconds, milliseconds, `${ prefix }milliseconds result:`);
    assert.same(duration.microseconds, microseconds, `${ prefix }microseconds result:`);
    assert.same(duration.nanoseconds, nanoseconds, `${ prefix }nanoseconds result`);
  }

  return {
    ISOMonths,
    CalendarEras,
    NotYetSupportedCalendars,
    SUBSTITUTE_SKIP,
    ISO,
    canonicalizeCalendarEra,
    assertDuration,
  };
}
