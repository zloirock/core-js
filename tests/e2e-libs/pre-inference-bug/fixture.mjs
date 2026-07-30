// Own DATA FIELDS whose names collide with iterator-helper methods. Nothing here is an iterator and
// nothing is even called: every use is an assignment, a comparison, or an array operation, and the
// assignment that proves the type sits in the same class in the same file.
//
// Both shapes are copied verbatim in spirit from real libraries, where this was observed:
//   `this.filter` - three.js, three/build/three.core.js:50806 (an audio node, never invoked)
//   `this.chunks` - @codemirror/state, dist/index.js:3451 (a plain array)
//
// NO genuine iterator use lives in this file, on purpose: any iterator-helper polyfill injected for
// it is keyed off the property NAME, not a proven receiver type. (control.mjs holds the positive
// case.) Whether that name-keyed injection happens depends on the plugin version — none here on this
// branch's plugin on linux, five on windows, and five everywhere on current v4 — see REPORT.md.

// --- three.js shape: a field assigned null, compared, and passed along. Never called. ---
export class AudioNode {
  constructor() {
    this.filter = null;
    this.gain = { disconnect() {} };
  }

  disconnectAll(destination) {
    if (this.filter !== null) {
      this.gain.disconnect(this.filter);
      this.filter.disconnect(destination);
    }
    return this.filter;
  }
}

// --- CodeMirror shape: a field assigned an array literal, then used as an array. ---
export class RangeSetBuilder {
  constructor() {
    this.chunks = [];
  }

  add(chunk) {
    this.chunks.push(chunk);
    return this.chunks.length;
  }

  finish() {
    if (this.chunks.length === 0) return null;
    return this.chunks;
  }
}

export function run() {
  const audio = new AudioNode();
  const builder = new RangeSetBuilder();
  builder.add(1);
  return { filter: audio.disconnectAll(null), chunks: builder.finish() };
}
