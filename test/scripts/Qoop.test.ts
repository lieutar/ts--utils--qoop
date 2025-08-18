import { Prop, QoopObject } from "@src/Qoop";
import { describe, expect, test } from "vitest";

interface T0000Props{
fStr00: string;
fNum00: number;
fBool00: boolean;
}
class T0000 extends QoopObject(){
  @Prop() fStr00!: string;
  @Prop() fNum00!: number;
  @Prop() fBool00!: boolean;
  constructor(params: T0000Props){super(params)}
}

describe('Qoop', ()=>{
  test('simple', ()=>{
    const o = new T0000({fStr00:"foo", fNum00: 123, fBool00: true});
    expect(o.fStr00).toBe('foo');
    expect(o.fNum00).toBe(123);
    expect(o.fBool00).toBe(true);
  });
});
