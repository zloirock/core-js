// The catch pattern reads a static from the thrown constructor.
try { throw Promise; } catch ({ resolve }) { use(resolve); }
