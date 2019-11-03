import { setModifierManager } from '@ember/modifier';
import FunctionalModifierManager from './modifier-manager';
import ApplicationInstance from '@ember/application/instance';

const MANAGERS = new WeakMap();

function managerFor(owner: ApplicationInstance) {
  let manager = MANAGERS.get(owner);

  if (manager === undefined) {
    manager = new FunctionalModifierManager(owner);
  }

  return manager;
}

export default function modifier(fn: Function) {
  return setModifierManager(managerFor, fn);
}
