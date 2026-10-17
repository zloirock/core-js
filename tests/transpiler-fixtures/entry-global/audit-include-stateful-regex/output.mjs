// stateful regex (`/g`, `/y`) in `include` is normalized so `lastIndex` does not leak
// between matches.
import "core-js/modules/es.array.at";