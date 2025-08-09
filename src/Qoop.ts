import 'reflect-metadata';
import type { Constructor, PPick } from "@looper-utils/types";
import { gensym } from '@looper-utils/string';

export type CParams<PropsT, DefaultT> = PPick<PropsT, Exclude<keyof PropsT, keyof DefaultT>>;

const PROPS = ` * qoop PROPS ${gensym()} * `;
export function Qoop<TBase extends Constructor, PropsT = any>(Base: TBase) {
  return class extends Base {
    public [PROPS]: PropsT;
    static paramsDefault: Record<string, any> = {};

    constructor(...args: any[]) {
      const [a0] = args;
      const {$base, ... params} = a0 ?? {};
      super(... Array.isArray($base) ? $base : []);
      this[PROPS] = { ...(params ?? {}) } as PropsT;
    }
  };
}
Qoop.PROPS = PROPS;

export function QoopObject<T=any>(){ return Qoop<typeof Object, T>(Object); }


export function Prop(opts: {writeable: boolean} =  {writeable:false}) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get: function () {
        const props = this[Qoop.PROPS];
        return props ? props[propertyKey] : undefined;
      },
      set: opts.writeable ? function (this: any, value: any) {
        const props = this[Qoop.PROPS];
        if (props) {
          props[propertyKey] = value;
        }
      } : undefined,
      enumerable: true,
      configurable: true,
    });
  };
}

export function Setter(propName: string) {
  return function (_target: any, methodName: string, descriptor: PropertyDescriptor) {
    // const originalMethod = descriptor.value;

    descriptor.value = function (this:any, ...args: any[]) {

      const valueToSet = args[0];
      const props = this[Qoop.PROPS];

      if (props) {
        props[propName] = valueToSet;
      } else {
        console.warn(`[${methodName}] Property store (Qoop.PROPS) not found on instance.`);
      }

    };

    return descriptor;
  };
}

export function Delegate(propertyName: string, methodNameOpt?: string) {
  return function (target: any, key: string, _descriptor?: PropertyDescriptor) {
    const methodName = methodNameOpt ?? key;
    Object.defineProperty(target, key, {
      get: function (this: any) {
        const delegatedObject = this[Qoop.PROPS]?.[propertyName];

        if (!delegatedObject) {
          console.warn(`[${key}] Delegation failed: Property '${propertyName}' not found on Qoop.PROPS.`);
          return undefined;
        }

        const originalMethod = delegatedObject[methodName];

        if (typeof originalMethod !== 'function') {
          console.warn(`[${key}] Delegation failed: Method '${methodName}' not found or not a function on '${propertyName}'.`);
          return undefined;
        }

        return originalMethod.bind(delegatedObject);
      },
      //*
      set: function (this: any, _value: any) {
        console.warn(`[${key}] Attempted to set delegated method. Delegated methods are typically read-only.`);
      },
      //*/
      enumerable: true,
      configurable: true,
    });
  };
}
