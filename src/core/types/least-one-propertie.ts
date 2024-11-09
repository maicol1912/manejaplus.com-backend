export type AtLeastOneProperty<T> =
  | {
      [K in keyof T]?: T[K] | { [P: string]: any };
    }
  | { [P: string]: any };
