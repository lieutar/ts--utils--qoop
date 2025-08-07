import type { Constructor } from "@looper-utils/types";

export interface IFeature { inject(owner: any): void; }

export abstract class AbstractFeature implements IFeature {
  _init(){};
  public abstract inject(owner: any): void;
}

export interface IFeatureClass<TAddedInstance = {}> {
  new (...args: any[]): IFeature;
  SYM_SLOT: symbol;
  applyFeature<TBase extends Constructor>(
    ownerClass: TBase
  ): Constructor<InstanceType<TBase> & TAddedInstance>;
}

type WithFeaturesReturnType< TBase extends Constructor,
                             TFeatures extends IFeatureClass<any>[]> = TFeatures extends [
  infer VFeature extends IFeatureClass<infer _VAddedInstance>,
                                        ...infer VRestFeatures extends IFeatureClass<any>[]
]
  ? VFeature extends { applyFeature: infer VApplyFn }
    ? VApplyFn extends (ownerBase: Constructor) => Constructor<infer VAppliedInstance>
      ? WithFeaturesReturnType<
          Constructor<InstanceType<TBase> & VAppliedInstance>,
          VRestFeatures
        >
      : never //
    : never //
  : TBase; // TFeatures = []

export function WithFeatures<TBase extends Constructor, TFeatures extends IFeatureClass<any>[]>(
  Base: TBase,
  ...Features: TFeatures
): WithFeaturesReturnType<TBase, TFeatures> {
  return Features.reduce((CurrentBase: Constructor, FeatureClass: IFeatureClass<any>) => {
    return FeatureClass.applyFeature(CurrentBase) as Constructor;
  }, Base) as WithFeaturesReturnType<TBase, TFeatures>;
}

export function Feature(symbolName:string = 'QoopFeature'){
  const SYM_SLOT = Symbol( symbolName );
  return class extends AbstractFeature{
    static SYM_SLOT = SYM_SLOT;
    owner!: any;
    public inject(owner: any): void {
      this.owner  = owner;
      owner[SYM_SLOT] = this;
      this._init();
    }
  }
}

export function fMixinTools<T extends IFeatureClass>(FeatureClass: T) {
  const self = (owner: any): any => {
    if (!owner[FeatureClass.SYM_SLOT]) {
      throw new Error(`Feature instance not found at slot: ${String(FeatureClass.SYM_SLOT)}`);
    }
    return owner[FeatureClass.SYM_SLOT];
  };

  const d = (name: string) => function(this: any, ... args:any[]):any{
    const featureInstance = self(this);
    return featureInstance[name].apply(featureInstance, args);
    };

  return { self, d };
}
