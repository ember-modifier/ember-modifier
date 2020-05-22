// Define the Ember private types used in this addon. These type definitions are
// *not* intended to be robust or shared; they're *minimal* to cover exactly and
// only what is required for this addon.

import Ember from 'ember';

declare module 'ember' {
  export namespace Ember {
    export interface Meta {
      setSourceDestroying(): void;
      setSourceDestroyed(): void;
    }

    export function meta(obj: object): Meta;
    export function destroy(obj: object): void;
  }
}
