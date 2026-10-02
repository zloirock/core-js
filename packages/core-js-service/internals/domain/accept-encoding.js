// the header is parsed in full rather than searched for a substring: testing whether it contains
// `gzip` breaks on exactly `gzip;q=0`, which is the case the uncompressed copy is stored for
export default function parseAcceptEncoding(header) {
  const quality = new Map();
  let wildcard = null;

  for (const part of header.split(',')) {
    const [name, ...parameters] = part.split(';');
    const encoding = name.trim().toLowerCase();

    if (!encoding) continue;

    let q = 1;

    for (const parameter of parameters) {
      const match = /^\s*q=(?<q>[\d.]+)/i.exec(parameter);
      if (match) q = Number.parseFloat(match.groups.q);
    }

    if (Number.isNaN(q)) q = 1;

    if (encoding === '*') wildcard ??= q;
    else if (!quality.has(encoding)) quality.set(encoding, q);
  }

  return { quality, wildcard };
}
