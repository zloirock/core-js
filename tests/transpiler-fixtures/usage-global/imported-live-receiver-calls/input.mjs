// A source import is a live binding: its exporter can replace the receiver during
// the method getter. Plain and optional calls must retain the originally selected
// receiver for dispatch and this; usage-global only injects the instance modules.
import { receiver } from './receiver.mjs';
receiver.at(0);
receiver?.flat?.();
