// Native receiver bindings: locate source paths through the provider and preserve their evaluation
// frames for this emitter's node-based consumers. Decisions belong to the shared provider.
import { findIifeArgPath, findIifeCallSite } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { stampNodeSite } from './nav-spine.js';
import { decidedRunningOperandPath, findSynthSwapReceiverPath } from '@core-js/polyfill-provider/detect-usage/destructure';

// The path of the IIFE argument operand that runs, through a sequence's tail and a selection the
// build decides (`decidedRunningOperandPath`), its node stamped with the call-site frame: the instance clause replaces
// it with its literal and types the dispatch off its own position
export function detectIifeArgReceiverPath(wrapperPath, objectPattern, adapter) {
  const argPath = findIifeArgPath(wrapperPath, objectPattern, adapter?.isMutatedStaticSlot ?? adapter?.isMutatedStatic);
  const receiverPath = argPath && decidedRunningOperandPath(argPath, adapter);
  if (!receiverPath?.node) return null;
  const callPath = findIifeCallSite(wrapperPath, objectPattern)?.callPath;
  stampNodeSite(receiverPath.node, callPath && { scope: callPath.scope, path: callPath });
  return receiverPath;
}

// Bind the shared source-slot choice to this emitter's node-based consumers. A receiver from
// another scope carries that frame; a local default already has the pattern's frame.
export function findSynthSwapReceiver(wrapperPath, objectPattern, adapter, resolvePure) {
  const path = findSynthSwapReceiverPath(wrapperPath, objectPattern, adapter, resolvePure);
  if (!path) return null;
  return path.scope === wrapperPath.scope ? path.node : stampNodeSite(path.node, { scope: path.scope, path });
}
