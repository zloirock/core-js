// Static values retain receiver and key effects before lookup and arguments.
const direct = (source(), Number)[(key(), 'MAX_SAFE_INTEGER')].toFixed(argument());
const optional = (source(), Number)[(key(), 'MIN_SAFE_INTEGER')]?.toPrecision(argument());
const nested = (before(), (object(), globalThis[(ctor(), 'Number')])[(key(), 'MAX_SAFE_INTEGER')]).toString();
const read = (readBefore(), Number.MAX_SAFE_INTEGER)[(readKey(), 'toFixed')];
