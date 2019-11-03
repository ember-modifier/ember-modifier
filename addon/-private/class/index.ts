import { setModifierManager } from '@ember/modifier';
import ClassBasedModifier  from './modifier';
import Manager from './modifier-manager';

setModifierManager(() => Manager, ClassBasedModifier);
