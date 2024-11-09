type Primitive = string | number | boolean | null | undefined;

type PathImpl<T, D extends number = 3> = [D] extends [never]
  ? never
  : T extends Primitive
    ? ''
    : {
        [K in keyof T]: K extends string | number
          ? `${K}` | (T[K] extends Primitive ? `${K}` : `${K}.${PathImpl<T[K], Prev[D]>}`)
          : never;
      }[keyof T];

type Path<T> = PathImpl<T> | keyof T;

type Prev = [never, 0, 1, 2, 3, ...0[]];

type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

class BuilderImpl<T extends new () => any> {
  private readonly obj: InstanceType<T>;

  constructor(classConstructor: T) {
    this.obj = new classConstructor();
  }

  public set<P extends Path<InstanceType<T>>>(path: P, value: PathValue<InstanceType<T>, P>): BuilderImpl<T> {
    const keys = (path as string).split('.');
    let current: any = this.obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return this;
  }

  public build(): InstanceType<T> {
    return this.obj;
  }
}

export function BuilderObj<T extends new () => any>(classConstructor: T): BuilderImpl<T> {
  return new BuilderImpl<T>(classConstructor);
}
