import type { FunctionBasedModifierDefinition, Teardown } from './modifier';
import type { ArgsFor, ElementFor } from '../signature';
interface State<S> {
    instance: FunctionBasedModifierDefinition<S>;
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
    createModifier(instance: FunctionBasedModifierDefinition<S>): CreatedState<S>;
    installModifier(createdState: CreatedState<S>, element: ElementFor<S>, args: ArgsFor<S>): void;
    updateModifier(state: InstalledState<S>, args: ArgsFor<S>): void;
    destroyModifier(state: InstalledState<S>): void;
    getDebugName(state: InstalledState<S>): string;
    getDebugInstance(state: InstalledState<S>): InstalledState<S>;
}
export {};
//# sourceMappingURL=modifier-manager.d.ts.map