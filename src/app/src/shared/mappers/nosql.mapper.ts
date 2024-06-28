interface MongoEntity {
  createdAt?: Date;
  updatedAt?: Date;
  _id?: any;
}

export class NoSqlGlobalMapper {
  static mapClass<T, U>(source: T, attributesOmit: (keyof T | keyof MongoEntity)[] = []): U {
    if (!source) {
      return {} as U;
    }

    const omitKeys = new Set([...attributesOmit, '__v']);

    const destination: U = {} as U;
    const mappedSource = this.isMongooseDocument(source) ? (source as any)._doc : source;

    for (const key in mappedSource) {
      if (!omitKeys.has(key) && key !== '_id') {
        destination[key] = mappedSource[key];
      } else if (key === '_id') {
        destination['id'] = String(mappedSource[key]);
      }
    }

    return destination;
  }

  static mapClassList<T, U>(
    sourceList: T[],
    attributesOmit: (keyof T | 'createdAt' | 'updatedAt')[] = []
  ): U[] {
    return sourceList.map(item => this.mapClass<T, U>(item, attributesOmit));
  }

  private static isMongooseDocument(obj: any): obj is Document {
    return obj && typeof obj === 'object' && '_doc' in obj;
  }
}
