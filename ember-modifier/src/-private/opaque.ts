// Type-only utilities used for representing the type of a Modifier in a way
// that (a) has no runtime overhead and (b) makes no public API commitment: by
// extending it with an interface representing the modifier, its internals
// become literally invisible. The private field for the "brand" is not visible
// when interacting with an interface which extends this, but it makes the type
// non-substitutable with an empty object. This is borrowed from, and basically
// identical to, the same time used internally in Ember's types.
declare const Brand: unique symbol;
declare class _Opaque<T> {
  private readonly [Brand]: T;
}

// This provides a signature whose only purpose here is to represent the runtime
// type of a function-based modifier: an opaque item. The fact that it's an
// empty interface is actually the point: it makes the private `[Brand]` above
// is not visible to end users. By exporting only this interface, we also ensure
// we don't *ourselves* try to treat it as a class in the rest of the package.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Opaque<T> extends _Opaque<T> {}

export default Opaque;
