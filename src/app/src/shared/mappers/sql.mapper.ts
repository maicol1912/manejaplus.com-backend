interface MapOptions<T> {
  omit?: (keyof T)[];
  get?: (keyof T)[];
}

export class SqlGlobalMapper {
  static mapClass<T, U>(source: T, options: MapOptions<T> = {}): U {
    let mappedSource: any = source;

    const destination: any = {};

    for (const key in mappedSource) {
      if ((options.omit && options.omit.includes(key as keyof T)) || key === '__v') {
        continue;
      }
      if (options.get && !options.get.includes(key as keyof T)) {
        continue;
      }
      if (key === '_id') {
        destination['id'] = String(mappedSource[key]);
      } else {
        destination[key] = mappedSource[key];
      }
    }

    return destination as U;
  }

  static mapClassMethos<T, U>(
    source: T,
    options: MapOptions<T> = {},
    TargetClass?: new () => U
  ): U {
    let mappedSource: any = source;

    // Create the destination object
    let destination: U;
    if (TargetClass) {
      destination = new TargetClass();
    } else {
      destination = {} as U;
    }

    // Copy properties from source to destination
    for (const key in mappedSource) {
      if ((options.omit && options.omit.includes(key as keyof T)) || key === '__v') {
        continue;
      }
      if (options.get && !options.get.includes(key as keyof T)) {
        continue;
      }
      if (key === '_id') {
        (destination as any)['id'] = String(mappedSource[key]);
      } else {
        (destination as any)[key] = mappedSource[key];
      }
    }

    // Log methods for debugging
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(destination)).filter(
      prop => typeof (destination as any)[prop] === 'function'
    );
    console.log('[methods mapper]', methods);

    return destination;
  }

  static mapClassList<T, U>(sourceList: T[], options: MapOptions<T> = {}): U[] {
    return sourceList.map(item => this.mapClass<T, U>(item, options));
  }
}
