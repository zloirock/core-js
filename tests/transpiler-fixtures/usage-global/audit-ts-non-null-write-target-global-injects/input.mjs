// the write-position bail is usage-pure only (a frozen import cannot be the `||=` target). in
// usage-global there is no identifier rewrite, and the `||=` still reads `Map`, so the base
// `Map` constructor suite is injected as a side-effect import (over-injection is safe in global mode)
Map! ||= 1;
