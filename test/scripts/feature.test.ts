import type { Constructor } from "@looper-utils/types";
import { Feature, fMixinTools, WithFeatures, type IFeatureClass } from "@src/feature";
import { QoopObject } from "@src/Qoop";
import { describe, expect, test } from "vitest";

interface IBar {
get attr(): string;
meth (): string;
};

class Bar extends Feature(){
  static applyFeature(Base: Constructor){
    const {self, d} = fMixinTools(Bar as IFeatureClass<IBar>);
    return class extends Base{
      get attr(){ return self(this).attr as string; }
      meth = d('meth') as ()=>string;
      constructor(... args: any[]){
        super(... args);
        new Bar().inject(this);
      }
    }
  }
  readonly attr = 'bar';
  meth(){ return 'meth'; }
}

const FBar = Bar as IFeatureClass<IBar>

class Foo extends WithFeatures( QoopObject(), FBar ){
}

describe('feature', ()=>{
  const foo = new Foo();
  test('basic', ()=>{
    expect(foo.attr).toEqual('bar');
    expect(foo.meth()).toEqual('meth');
  });
});
