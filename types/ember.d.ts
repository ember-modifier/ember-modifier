export interface Meta {
  setSourceDestroyed(): void;
  setSourceDestroying(): void;
}

export function meta(obj: any): Meta;
export function destroy(obj: any): any;
