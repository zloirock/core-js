import { LEAST_UPPER_BOUND, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';

const MAPPING_PROBE_LIMIT = 200;

// TraceMap tolerates invalid base64 and pads incomplete segments. Validate field boundaries
// before asking it to resolve a position, including in entirely synthetic entry output.
export function fixtureMappingsError(map, method) {
  const field = /[+/0-9g-z]*[A-Za-f]/y;
  // Six digits use 30 bits. The seventh has two bits left, followed only by zero extension.
  const highDigits = /[A-D]|[g-j]g*A/y;
  const { mappings } = map;
  for (let i = 0; i < mappings.length;) {
    if (mappings[i] === ';') {
      i++;
      continue;
    }
    let fields = 0;
    field.lastIndex = i;
    while (field.test(mappings)) {
      if (field.lastIndex - i > 6) {
        highDigits.lastIndex = i + 6;
        if (!highDigits.test(mappings)) return 'VLQ value exceeds 32 bits';
      }
      fields++;
      i = field.lastIndex;
    }
    if (fields !== 1 && fields !== 4 && fields !== 5) return 'invalid VLQ segment width';
    if (i === mappings.length || mappings[i] === ';') continue;
    if (mappings[i++] !== ',' || i === mappings.length || mappings[i] === ';') return 'invalid VLQ segment';
  }
  if (method === 'entry-global') return null;
  const tm = new TraceMap(map);
  const lines = (map.mappings.match(/;/g) ?? []).length + 1;
  // both ENDS of the output: a file may lead with hundreds of synthetic import lines (no
  // mapping by design), leaving the reprinted user code - the mapping the probe is after -
  // beyond a head-only window
  const probed = new Set();
  for (let i = 0; i < Math.min(lines, MAPPING_PROBE_LIMIT); i++) {
    probed.add(1 + i);
    probed.add(lines - i);
  }
  for (const line of probed) {
    // the first segment AT OR AFTER the line start: the AST reprint's first mapped token may
    // sit past column 0 (a leading paren carries no mapping of its own), which the default
    // at-or-before bias reads as unmapped; an all-zero or malformed map still yields nothing
    const probe = originalPositionFor(tm, { line, column: 0, bias: LEAST_UPPER_BOUND });
    if (probe.source !== undefined && probe.source !== null
        && probe.line !== undefined && probe.line !== null) return null;
  }
  return `no user-code mapping resolves to a valid source position (${ lines } lines, ${ MAPPING_PROBE_LIMIT }-line window at each end)`;
}
