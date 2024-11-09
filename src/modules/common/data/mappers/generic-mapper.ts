class Builder<T extends object> {
  private obj: Partial<T>;

  constructor(obj: Partial<T> = {}) {
    this.obj = obj;
  }

  public set<K extends keyof T>(key: K, value: T[K]): Builder<T> {
    this.obj[key] = value;
    return this;
  }

  public build(): T {
    return this.obj as T;
  }
}

export function GenericBuilder<T extends object>(): Builder<T> {
  return new Builder<T>();
}
