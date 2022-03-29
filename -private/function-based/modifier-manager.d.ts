import type { FunctionalModifierDefinition, Teardown } from './modifier';
import type { ArgsFor, ElementFor } from '../signature';
import { Factory } from '../compat';
interface State<S> {
    instance: FunctionalModifierDefinition<S>;
}
interface CreatedState<S> extends State<S> {
    element: null;
}
interface InstalledState<S> extends State<S> {
    element: ElementFor<S>;
    teardown?: Teardown;
}
export default class FunctionBasedModifierManager<S> {
    capabilities: unknown;
    options: {
        eager: boolean;
    };
    constructor(options?: {
        eager: boolean;
    });
    createModifier(factoryOrClass: Factory<FunctionalModifierDefinition<S>> | FunctionalModifierDefinition<S>): CreatedState<S>;
    installModifier(createdState: CreatedState<S>, element: ElementFor<S>, args: ArgsFor<S>): void;
    updateModifier(state: InstalledState<S>, args: ArgsFor<S>): void;
    destroyModifier(state: InstalledState<S>): void;
}
export {};
