import GetHandler from '../../../dist/proxy/handler/get-list-first';
import GetOwnPropertyDescriptorListAll from '../../../dist/proxy/handler/get-own-property-descriptor-list-all';
import MergeAnonymous from '../../../dist/proxy/handler/merge-anonymous';
import GetPrototypeOfListMerge from '../../../dist/proxy/handler/prototype-of-list-merge';


it('enable console log', () => { spyOn(console, 'log').and.callThrough();});

type Type<Value = any> = {data:Value};

const plain = {
    get data() {return 'plain';}
};

class Symbol_ implements Iterable<string> {

    constructor(
        public iterable : string[]
    ) {

    }

    * [Symbol.iterator](): IterableIterator<string> {

        yield * this.iterable;
    }
}

class Getter  {
    get data() {return 'getter';}
}

class Setter  {

    public value : any;

    set data(value) {

        this.value = value;
    }
}

class Property {

    constructor(
        public data : string = 'property'
    ) {

    }

}

class Method {

    data() : string {

        return 'method';
    }
}

let property1 = new Property('property 1');
let property2 = new Symbol_(['1', '2', '2', '3']);

describe('original handler', () => {

    let getter = new GetHandler([property1, property2]);
    let proxy = <Property & Symbol_> new Proxy({}, getter);

    let getter1 = new GetHandler([proxy]);
    let proxy1 = <Property & Symbol_> new Proxy({}, getter1);

    let getter2 = new GetHandler([proxy1]);
    let proxy2 = <Property & Symbol_> new Proxy({}, getter2);

    it('check value', ()=>{

        expect<any>(proxy2.data).toBe(undefined);
        expect(proxy2[Symbol.iterator]).toBe(undefined);

        let iterated : boolean = false;

        try {

            for (let string of proxy2) {

                iterated = true;
            }

            fail('error should be thorwn');

        } catch (e) {

            expect(e).toBeInstanceOf(Error);
        }

    });

});


describe('minimum working combination', () => {

    let getter = new GetHandler([property1, property2]);
    let prototypeOfListMerge = new GetPrototypeOfListMerge([property1, property2]);
    let descriptor = new GetOwnPropertyDescriptorListAll([property1, property2]);

    let proxy = <Property & Symbol_> new Proxy({}, MergeAnonymous(getter, descriptor,  prototypeOfListMerge));

    let getter1 = new GetHandler([proxy]);
    let prototypeOfListMerge1 = new GetPrototypeOfListMerge([proxy]);
    let descriptor1 = new GetOwnPropertyDescriptorListAll([proxy]);

    let proxy1 = <Property & Symbol_> new Proxy({}, MergeAnonymous(getter1, descriptor1,  prototypeOfListMerge1));

    let getter2 = new GetHandler([proxy1]);
    let proxy2 = <Property & Symbol_> new Proxy({}, getter2);

    it('check value', ()=>{

        let iterated : boolean = false;

        let i = 0;

        for (let string of proxy2) {

            iterated = true;

            expect(proxy2.data).toBe('property 1');

            expect(property2.iterable[i]).toBe(string);

            i++;
        }

        expect(iterated).toBeTrue();

    });

});
