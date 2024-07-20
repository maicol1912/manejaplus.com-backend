export type AtLeastOneProperty<T> = {
  [K in keyof T]-?: Record<K, T[K]>;
}[keyof T];
