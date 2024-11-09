class BuilderImpl<T extends object> {
  private obj: Partial<T>;

  constructor(obj: Partial<T> = {}) {
    this.obj = obj;
  }

  public set<K extends keyof T>(key: K, value: T[K]): BuilderImpl<T> {
    this.obj[key] = value;
    return this;
  }

  public build(): T {
    return this.obj as T;
  }
}

export function Builder<T extends object>(): BuilderImpl<T> {
  return new BuilderImpl<T>();
}
