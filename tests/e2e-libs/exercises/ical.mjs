// ical.js: an iCalendar document parsed, its weekly rule expanded past an EXDATE, times converted,
// moved by a duration and serialized back; a monthly "last Friday" rule iterated on its own. Occurrences,
// durations, week numbers and unescaped text are RFC 5545's, the component name `parse` returns is jCal's
// (RFC 7265); the time strings are ical.js's own `toString` form, and `floating` is its name for the local
// zone. Every time is UTC or floating, so no check reads the host's zone.
//
// Its reason is the SYNTAX axis: private STATIC fields, which the corpus spells nowhere. `Time.epochTime`,
// `Timezone.utcTimezone` and `Timezone.localTimezone` are lazy static getters over `this.#x`, all three
// read here. The checks hold each getter's value, and the cache behind both zones, which ical.js knows
// by identity: `Time#toString` writes `Z` only for the cached UTC zone, and `Timezone#utcOffset` answers
// 0 without a zone definition only for the two cached zones. A lost epoch cache rebuilds an equal time,
// which nothing here tells apart.
import ICAL from 'ical.js';
import { checker } from './checks.mjs';

const CALENDAR = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//core-js//e2e-libs//EN',
  'BEGIN:VEVENT',
  'UID:standup@example.com',
  'DTSTAMP:20240101T000000Z',
  'DTSTART:20240102T090000Z',
  'DTEND:20240102T091500Z',
  'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=5',
  'EXDATE:20240109T090000Z',
  'SUMMARY:Standup\\, daily',
  'ATTENDEE;CN=Ada;ROLE=CHAIR:mailto:ada@example.com',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

function collect(iterator) {
  const out = [];
  for (let next = iterator.next(); next; next = iterator.next()) out.push(next.toString());
  return out;
}

export function run() {
  const { checks, check } = checker();
  const component = new ICAL.Component(ICAL.parse(CALENDAR));
  const vevent = component.getFirstSubcomponent('vevent');
  const event = new ICAL.Event(vevent);

  check('event', [event.uid, event.summary, event.duration.toString(), event.attendees[0].getParameter('cn')],
    ['standup@example.com', 'Standup, daily', 'PT15M', 'Ada']);
  // COUNT=5 occurrences, the EXDATE one dropped
  check('rrule', collect(event.iterator()), ['2024-01-02T09:00:00Z', '2024-01-04T09:00:00Z', '2024-01-11T09:00:00Z', '2024-01-16T09:00:00Z']);

  const start = event.startDate;
  check('unix_time', [start.toUnixTime(), start.zone === ICAL.Timezone.utcTimezone, ICAL.Time.epochTime.toString()],
    [1704186000, true, '1970-01-01T00:00:00Z']);
  check('local_zone', ICAL.Timezone.localTimezone.tzid, 'floating');

  const later = start.clone();
  later.addDuration(ICAL.Duration.fromString('P1DT2H30M'));
  check('arithmetic', [later.toString(), later.subtractDate(start).toString(), later.dayOfWeek(), later.weekNumber(ICAL.Time.MONDAY)],
    ['2024-01-03T11:30:00Z', 'P1DT2H30M', ICAL.Time.WEDNESDAY, 1]);

  // `Recur#toString` puts COUNT before BYDAY whatever order the rule was written in; the component's own
  // serializer keeps the written order, as `stringify` below reads it
  const rule = ICAL.Recur.fromString('FREQ=MONTHLY;BYDAY=-1FR;COUNT=3');
  check('last_friday', [rule.toString(), collect(rule.iterator(ICAL.Time.fromDateString('2024-01-01')))],
    ['FREQ=MONTHLY;COUNT=3;BYDAY=-1FR', ['2024-01-26', '2024-02-23', '2024-03-29']]);

  vevent.updatePropertyWithValue('summary', 'Retro');
  const text = component.toString();
  check('stringify', [text.indexOf('SUMMARY:Retro') !== -1, text.indexOf('RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=5') !== -1, ICAL.parse(text)[0]],
    [true, true, 'vcalendar']);
  return { checks };
}
