import type Owner from '@ember/owner';
import type ClassBasedModifier from './modifier';
import type { ArgsFor, ElementFor } from '../signature';
/**
 * The state bucket used throughout the life-cycle of the modifier. Basically a
 * state *machine*, where the framework calls us with the version we hand back
 * to it at each phase. The two states are the two `extends` versions of this
 * below.
 *
 * @internal
 */
interface State<S> {
    instance: ClassBasedModifier<S>;
}
/**
 * The `State` after calling `createModifier`, and therefore the state available
 * at the start of `InstallModifier`.
 * @internal
 */
interface CreatedState<S> extends State<S> {
    element: null;
}
/**
 * The `State` after calling `installModifier`, and therefore the state
 * available in all `updateModifier` calls and in `destroyModifier`.
 * @internal
 */
interface InstalledState<S> extends State<S> {
    element: ElementFor<S>;
}
export default class ClassBasedModifierManager<S> {
    private owner;
    capabilities: unknown;
    constructor(owner: Owner);
    createModifier(modifierClass: typeof ClassBasedModifier, args: ArgsFor<S>): CreatedState<S>;
    installModifier(createdState: CreatedState<S>, element: ElementFor<S>, args: ArgsFor<S>): void;
    updateModifier(state: InstalledState<S>, args: ArgsFor<S>): void;
    destroyModifier({ instance }: InstalledState<S>): void;
}
export {};
//# sourceMappingURL=modifier-manager.d.ts.map