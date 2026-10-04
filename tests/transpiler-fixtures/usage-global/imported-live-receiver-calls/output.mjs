import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// A source import is a live binding: its exporter can replace the receiver during
// the method getter. Plain and optional calls must retain the originally selected
// receiver for dispatch and this; usage-global only injects the instance modules.
import { receiver } from './receiver.mjs';
receiver.at(0);
receiver?.flat?.();