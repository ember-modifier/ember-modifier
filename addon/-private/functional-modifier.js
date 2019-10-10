import { setModifierManager } from '@ember/modifier';
import FunctionalModifierManager from './functional-modifier-manager';

const MANAGERS = new WeakMap();

function managerFor(owner) {
  let manager = MANAGERS.get(owner);

  if (manager === undefined) {
    manager = new FunctionalModifierManager(owner);
  }

  return manager;
}

export default function modifier(fn) {
  return setModifierManager(managerFor, fn);
}
