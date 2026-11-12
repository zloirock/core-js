import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import remapping from '@jridgewell/remapping';
import { AnyMap, TraceMap, decodedMappings, encodedMappings } from '@jridgewell/trace-mapping';
import { stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import { buildOffsetToLoc } from '@core-js/polyfill-provider/helpers/source-scan';

// Consume only real parsed comments, never a URL in a string. The last directive wins even
// when unreadable. Missing, remote or malformed maps leave the ordinary transform map intact.
export function readInputSourceMap(comments, id) {
  const directives = new Set();
  let url;
  for (const comment of comments) {
    const match = /^\s*[#@]\s*sourceMappingURL\s*=\s*(?<url>\S+)\s*$/.exec(comment.value);
    if (match) {
      directives.add(comment);
      ({ url } = match.groups);
    }
  }
  if (!url) return null;
  try {
    const cleanId = stripQueryHash(id);
    const urlId = /^[a-z][\w+\-.]*:/i.test(cleanId) && !/^[a-z]:[/\\]/i.test(cleanId);
    let base = urlId ? new URL(cleanId) : pathToFileURL(resolve(cleanId));
    let text;
    if (url.startsWith('data:')) {
      const match = /^data:application\/json(?:;charset=[\w-]+)?(?<base64>;base64)?,(?<data>.*)$/i.exec(url);
      if (!match) return null;
      const data = decodeURIComponent(match.groups.data);
      text = match.groups.base64 ? Buffer.from(data, 'base64').toString('utf8') : data;
    } else {
      if (id.startsWith('\0')) return null;
      base = new URL(url, base);
      if (base.protocol !== 'file:') return null;
      // eslint-disable-next-line node/no-sync -- The direct transform API is synchronous, like Babel's input-map loading.
      text = readFileSync(base, 'utf8');
    }
    // Validate each section against its own tables before flattening can make a dangling index
    // point into a sibling. Keep the original mappings during printing; do not rebuild or encode them.
    function validateMap(input) {
      if (input.version !== 3) return null;
      if ('sections' in input) {
        let line = -1;
        let column = -1;
        for (const section of input.sections) {
          const { offset } = section;
          if (!Number.isSafeInteger(offset.line) || !Number.isSafeInteger(offset.column)
            || offset.line < 0 || offset.column < 0 || offset.line < line || offset.line === line && offset.column < column) return null;
          ({ line, column } = offset);
          section.map = validateMap(section.map);
          if (!section.map) return null;
        }
        return input;
      }
      const map = new TraceMap(input, base.href);
      for (const segments of decodedMappings(map)) for (const segment of segments) {
        const { length } = segment;
        if (length !== 1 && length !== 4 && length !== 5) return null;
        for (const value of segment) if (!Number.isSafeInteger(value) || value < 0) return null;
        if (length > 1 && (segment[1] >= map.sources.length || length === 5 && segment[4] >= map.names.length)) return null;
      }
      return input;
    }
    const parsed = validateMap(JSON.parse(text));
    return parsed && { comments: directives, map: AnyMap(parsed, base.href) };
  } catch {
    return null;
  }
}

// The parsed input map already resolves relative sources against its own URL (which can be
// in a different directory). Let the host compose maps passed through its transform channel.
export function composeInputSourceMap(map, inputMap) {
  return remapping([map, inputMap], () => null);
}

// esrap counts LF only. Repartition generated mappings when the printed text contains other
// ECMAScript line terminators, without changing strings, raw templates or JSX text. A stripped
// BOM changes only original first-line columns. Only these files decode and rebuild mappings.
export function restoreSourceMapColumns(map, code, bomLength = 0) {
  const multiline = /[\r\u2028\u2029]/.test(code);
  if (!multiline && !bomLength) return;
  const mappings = decodedMappings(new TraceMap(map));
  const locate = multiline ? buildOffsetToLoc(code) : null;
  const corrected = [];
  let offset = 0;
  for (const [line, segments] of mappings.entries()) {
    for (const segment of segments) {
      if (segment.length > 1 && segment[2] === 0) segment[3] += bomLength;
      const position = locate ? locate(offset + segment[0]) : { line: line + 1, column: segment[0] };
      while (corrected.length < position.line) corrected.push([]);
      segment[0] = position.column;
      corrected[position.line - 1].push(segment);
    }
    if (locate) offset = code.indexOf('\n', offset) + 1;
  }
  map.mappings = encodedMappings(new TraceMap({ ...map, mappings: corrected }));
}
