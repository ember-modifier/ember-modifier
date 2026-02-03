declare const Brand: unique symbol;
declare class _Opaque<T> {
    private readonly [Brand];
}
interface Opaque<T> extends _Opaque<T> {
}
export default Opaque;
//# sourceMappingURL=opaque.d.ts.map