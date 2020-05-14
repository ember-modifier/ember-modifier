import { setModifierManager } from "@ember/modifier";
import FunctionalModifierManager from "./modifier-manager";
import { ModifierArgs } from "../interfaces";

export type FunctionalModifier<
  P extends ModifierArgs["positional"] = ModifierArgs["positional"],
  N extends ModifierArgs["named"] = ModifierArgs["named"]
> = (element: Element, positional: P, named: N) => unknown;

const MANAGERS: WeakMap<object, FunctionalModifierManager> = new WeakMap();

function managerFor(owner: object) {
  let manager = MANAGERS.get(owner);

  if (manager === undefined) {
    manager = new FunctionalModifierManager(owner);
  }

  return manager;
}

// TODO: simplify this -- it doesn't (and shouldn't) use the owner at all.
// See https://github.com/ember-modifier/ember-modifier/issues/26
/**
 * An API for writing simple modifiers.
 *
 * This function runs the first time when the element the modifier was applied
 * to is inserted into the DOM, and it *autotracks* while running. Any values
 * that it accesses will be tracked, including the arguments it receives, and if
 * any of them changes, the function will run again.
 *
 * The modifier can also optionally return a *destructor*. The destructor
 * function will be run just before the next update, and when the element is
 * being removed entirely. It should generally clean up the changes that the
 * modifier made in the first place.
 *
 * @param fn The function which defines the modifier.
 */
export default function modifier(fn: FunctionalModifier): unknown {
  return setModifierManager(managerFor, fn);
}
