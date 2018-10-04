import Store from '../src/store'
import { extend as extendModel } from '../src/model'


const About = extendModel({
    props: {
        name: 'string'
    }
})

let saganModelInstance
let store

beforeEach(() => {
    
    saganModelInstance= new About({
        name: ''
    })

    store = new Store({
        models: {
            sagan: saganModelInstance
        }
    })
});

describe('Store', () => {

    it('exposes the public API', () => {

        const methods = Object.keys(Store.prototype)

        expect(methods.length).toBe(9)
        expect(methods).toContain('connectDevTools')
        expect(methods).toContain('subscribe')
        expect(methods).toContain('emit')
        expect(methods).toContain('getState')
        expect(methods).toContain('areEqualShallow')
        expect(methods).toContain('applyMiddlewares')
        expect(methods).toContain('splitPayloadType')
        expect(methods).toContain('dispatch')

    })

    it('passes the initial state', () => {

        const About = extendModel({
            props: {
                name: 'string'
            }
        })

        const saganModelInstance= new About({
            name: 'Sagan'
        })

        const store = new Store({
            models: {
                sagan: saganModelInstance
            }
        })

        expect(store.getState()).toEqual(
            {
                sagan: {
                    name: 'Sagan'
                }
            }
        )
    })

    it('update method applies to the previous state', () => {
        const About = extendModel({
            props: {
                name: 'string'
            },
            reducers: {
                setName: function(state, payload) {
                    return {
                        ...state,
                        name: payload
                    }
                }
            }
        })

        const saganModelInstance= new About({
            name: ''
        })

        const store = new Store({
            models: {
                sagan: saganModelInstance
            }
        })

        expect(store.getState().sagan.name).toEqual('')

        store.dispatch({type: 'sagan:update', payload: {name: 'Sagan'}})

        expect(store.getState()).toEqual(
            {
                sagan: {
                    name: 'Sagan'
                }
            }
        )

    })

    it('reducer applies to the previous state', () => {
        const About = extendModel({
            props: {
                name: 'string'
            },
            reducers: {
                setName: function(state, payload) {
                    return {
                        ...state,
                        ...payload
                    }
                }
            }
        })

        const saganModelInstance= new About({
            name: ''
        })

        const store = new Store({
            models: {
                sagan: saganModelInstance
            }
        })

        expect(store.getState().sagan.name).toEqual('')


        store.dispatch({type: 'sagan/setName', payload: {name: 'Sagan'}})

        expect(store.getState()).toEqual(
            {
                sagan: {
                    name: 'Sagan'
                }
            }
        )
    })

    it('throws if models is not an object', () => {
        expect(() => {
            return store.setModels([])
        }).toThrow();

        expect(() => {
            return store.setModels('')
        }).toThrow();

        expect(() => {
            return store.setModels(0)
        }).toThrow();
    })

    it('throws if model passed to models is not instance of Model', () => {
        const About = extendModel({
            props: {
                name: 'string'
            }
        })

        const saganModelInstance= new About({
            name: ''
        })

        expect(() => {
            return store.setModels({sagan: saganModelInstance})
        }).not.toThrow();

        class TestModel {}

        expect(() => {
            return store.setModels({sagan: new TestModel()})
        }).toThrow();

    })

    it('supports multiple subscriptions to store update', () => {

        const listenerA = jest.fn()
        const listenerB = jest.fn()

        let unsubscribeA = store.subscribe(listenerA)

        store.dispatch({type: 'sagan/update', payload: {name: 'Sagan'}})
        expect(listenerA.mock.calls.length).toBe(1)

        let unsubscribeB = store.subscribe(listenerB)
        store.dispatch({type: 'sagan/update', payload: {name: 'Sagan'}})
        expect(listenerA.mock.calls.length).toBe(2)
        expect(listenerB.mock.calls.length).toBe(1)
    })

    it('only removes relevant listener when unsubscribe is called', () => {

        const listenerA = jest.fn()
        const listenerB = jest.fn()

        const unsubscribeA = store.subscribe(listenerA)
        store.subscribe(listenerB)

        unsubscribeA()

        store.dispatch({type: 'sagan/update', payload: {name: 'Sagan'}})
        expect(listenerA.mock.calls.length).toBe(0)
        expect(listenerB.mock.calls.length).toBe(1)
    })

    it('should return a subscription object when subscribed', () => {

        const listener = jest.fn()
        const unsubscribe = store.subscribe(listener)

        expect(typeof unsubscribe).toBe('function')
    })

    it('subscription should return store state', () => {

        const listener = jest.fn()

        let unsubscribe = store.subscribe(listener)

        store.dispatch({type: 'sagan:update', payload: {name: 'Sagan'}})

        expect(listener.mock.calls[0][0]).toEqual({ sagan: { name: 'Sagan' } })

    })
    
})