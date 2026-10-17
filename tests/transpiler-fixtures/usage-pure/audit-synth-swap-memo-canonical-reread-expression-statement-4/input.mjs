// hop-key SE: the erased `self` hop's key effect is harvested the same way
let tick = 0;
function hopKeySe({ groupBy: gb, more } = globalThis[(tick++, 'self')].Map) { return [gb, more]; }
hopKeySe();
