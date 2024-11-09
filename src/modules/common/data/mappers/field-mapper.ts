import _ from 'lodash';

type AnyObject = { [key: string]: any };

export class OmitField {
  static omit<T extends AnyObject>(obj: T, fieldsToOmit: (keyof T)[]): Partial<T> {
    return _.omit(obj, fieldsToOmit) as Partial<T>;
  }

  static omitMth<T extends AnyObject>(obj: T, fieldsToOmit: (keyof T)[]): T {
    const result = _.omit(obj, fieldsToOmit) as T;
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), result);
  }

  static omitFromList<T extends AnyObject>(list: T[], fieldsToOmit: (keyof T)[]): Partial<T>[] {
    return list.map((obj) => _.omit(obj, fieldsToOmit) as Partial<T>);
  }

  static omitMthFromList<T extends AnyObject>(list: T[], fieldsToOmit: (keyof T)[]): T[] {
    return list.map((obj) => {
      const result = _.omit(obj, fieldsToOmit) as T;
      return Object.assign(Object.create(Object.getPrototypeOf(obj)), result);
    });
  }
}

export class GetField {
  static get<T extends AnyObject>(obj: T, fieldsToPick: (keyof T)[]): Partial<T> {
    return _.pick(obj, fieldsToPick);
  }

  static getMth<T extends AnyObject>(obj: T, fieldsToPick: (keyof T)[]): T {
    const result = _.pick(obj, fieldsToPick) as T;
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), result);
  }

  static getFromList<T extends AnyObject>(list: T[], fieldsToPick: (keyof T)[]): Partial<T>[] {
    return list.map((obj) => _.pick(obj, fieldsToPick));
  }

  static getMthFromList<T extends AnyObject>(list: T[], fieldsToPick: (keyof T)[]): T[] {
    return list.map((obj) => {
      const result = _.pick(obj, fieldsToPick) as T;
      return Object.assign(Object.create(Object.getPrototypeOf(obj)), result);
    });
  }
}
