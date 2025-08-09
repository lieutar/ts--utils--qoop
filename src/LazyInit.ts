import {gensym} from '@looper-utils/string';
const SYM_CACHE = ` * qoop lazy ${gensym()} * `;
export function LazyInit(){
  return (
    _target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const init = descriptor.get;
    if(!init) throw new Error();
    descriptor.get = function() {
      if (!this.hasOwnProperty(SYM_CACHE)) {
        Object.defineProperty(this, SYM_CACHE, {
          value: {},
          writable: true,
          configurable: true,
        });
      }

      if (!(propertyName in (this as any)[SYM_CACHE])) {
        (this as any)[SYM_CACHE][propertyName] = init.call(this);
      }

      return (this as any)[SYM_CACHE][propertyName];
    };
    return descriptor;
  };
}
LazyInit.SYM_CACHE = SYM_CACHE;
