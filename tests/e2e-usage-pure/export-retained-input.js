// Kept in another module so the consuming transform must handle an opaque receiver.
/* eslint-disable es/no-accessor-properties -- observable getters verify extraction order */
export const events = [];
export function before() {
  events.push('before');
  return 1;
}
export function make() {
  events.push('make');
  return {
    get at() { events.push('at'); return () => 'custom'; },
    get custom() { events.push('custom'); return 2; },
  };
}
export function key() { events.push('key'); }
export function after() {
  events.push('after');
  return 3;
}
export function last() {
  events.push('last');
  return 4;
}
export function unknownKey(overrides) { return overrides ? 'Q' : 'other'; }

export const nestedEvents = [];
export function makeNestedSource() {
  return {
    get Array() {
      nestedEvents.push('Array');
      return { prototype: {
        get at() { nestedEvents.push('at'); return () => 8; },
      } };
    },
    get Object() { nestedEvents.push('Object'); return { keys: () => ['custom'] }; },
    get other() { nestedEvents.push('other'); return 7; },
  };
}
