// collapse cosmetic whitespace outside string / template / regex literals for the runner's
// formatting-insensitive cross-plugin comparison. spaces between identifier-like tokens
// (keywords, names) are preserved to catch broken codegen like `constfrom` instead of
// `const from`. line/block comments are consumed whole (dropped from the output) so
// apostrophes inside comments don't get mistaken for string delimiters.
// the scanner is a real (small) lexer, not a quote toggle:
//   - template literals recurse through `${ ... }` substitutions (a flat backtick toggle
//     mis-closed nested templates and swallowed the code after them - false PASS/FAIL);
//   - regex literals are recognized by the previous-significant-token heuristic and consumed
//     whole incl. `[...]` classes (a bare `/a"b/` used to open a phantom string at the quote).

// a `/` starts a regex (not division) when the previous significant output ends with an
// operator / opener / statement keyword - the standard prev-token heuristic, sufficient for
// generated code this comparator sees
const REGEX_ALLOWED_BEFORE = /(?:^|[!%&()*+,\-:;<=>?[^{|~]|\b(?:await|case|delete|do|else|in|instanceof|new|of|return|typeof|void|yield))\s*$/;

export function collapseWhitespace(code) {
  let result = '';
  // brace depth at which each enclosing template's `${` opened - the matching `}` at that
  // depth returns the scan to that template's literal mode
  const templateStack = [];
  let braceDepth = 0;
  let i = 0;

  // copy template-literal chars from `i` until the closing backtick (returns 'closed') or a
  // `${` substitution opener (returns 'substitution' with the stack pushed) - the caller's
  // code scan resumes either after the template or inside the substitution
  function copyTemplateChars() {
    while (i < code.length) {
      const ch = code[i];
      if (ch === '\\') {
        result += ch + (code[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (ch === '`') {
        result += ch;
        i++;
        return;
      }
      if (ch === '$' && code[i + 1] === '{') {
        result += '${';
        i += 2;
        templateStack.push(braceDepth);
        return;
      }
      result += ch;
      i++;
    }
  }

  while (i < code.length) {
    const ch = code[i];
    if (ch === '/' && code[i + 1] === '/') {
      // ECMA-262 LineTerminator: LF / CR / U+2028 / U+2029
      while (i < code.length && code[i] !== '\n' && code[i] !== '\r'
        && code[i] !== '\u2028' && code[i] !== '\u2029') i++;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      i += 2;
      while (i + 1 < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      result += ch;
      for (i++; i < code.length; i++) {
        result += code[i];
        if (code[i] === '\\') {
          result += code[++i] ?? '';
          continue;
        }
        if (code[i] === quote) break;
      }
      i++;
      continue;
    }
    if (ch === '`') {
      result += ch;
      i++;
      copyTemplateChars();
      continue;
    }
    if (ch === '}' && templateStack.length && braceDepth === templateStack.at(-1)) {
      // the closer of an enclosing template's `${` - resume that template's literal scan
      templateStack.pop();
      result += ch;
      i++;
      copyTemplateChars();
      continue;
    }
    if (ch === '/' && REGEX_ALLOWED_BEFORE.test(result)) {
      result += ch;
      let inClass = false;
      for (i++; i < code.length; i++) {
        result += code[i];
        if (code[i] === '\\') {
          result += code[++i] ?? '';
          continue;
        }
        if (code[i] === '[') inClass = true;
        else if (code[i] === ']') inClass = false;
        else if (code[i] === '/' && !inClass) break;
        else if (code[i] === '\n') break; // not a regex after all - bail without swallowing the file
      }
      for (i++; i < code.length && /[a-z]/i.test(code[i]); i++) result += code[i];
      continue;
    }
    if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
    if (/\s/.test(ch)) {
      // keep a single space only when both neighbors are word characters
      const before = result.at(-1);
      let j = i + 1;
      while (j < code.length && /\s/.test(code[j])) j++;
      const after = code[j];
      if (before && after && /[\w$]/.test(before) && /[\w$]/.test(after)) result += ' ';
      i = j;
      continue;
    }
    result += ch;
    i++;
  }
  return result.trim();
}
