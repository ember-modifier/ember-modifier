import { ModifierArgs } from 'ember-modifier/-private/interfaces';

// This is a workaround for a change in the autotracking semantics of the args
// proxy introduced in `3.22`. Arguments are no longer eagerly consumed, so if
// you didn’t use an argument, it
export function consumeArgs({ positional, named }: ModifierArgs): void {
  for (let i = 0; i < positional.length; i++) {
    positional[i];
  }

  Object.values(named);
}
