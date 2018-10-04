import { extend as extendModel, BaseModel } from '../src/model'
import { extend as extendCollection } from '../src/collection'

let saganCollectionInstance
const SaganModel = extendModel({
    props: {
        name: 'string'
    }
})

const saganCollection = extendCollection({
    model: SaganModel
})

beforeEach(() => {
    saganCollectionInstance= new saganCollection([
        {
            name: 'Sagan'
        }
    ])
})

describe('Collection', () => {
    it('exposes the public API', () => {
        const methods = Object.keys(Object.getPrototypeOf(saganCollectionInstance))

        expect(methods.length).toBe(6)
        expect(methods).toContain('addItem')
        expect(methods).toContain('removeItem')
        expect(methods).toContain('setState')
        expect(methods).toContain('getState')
        expect(methods).toContain('setModel')
        expect(methods).toContain('setReducers')
    })

    it('sets the initial state', () => {

        const state = saganCollectionInstance.getState()
    
        expect(state).toEqual([
            {
                name: 'Sagan'
            }
        ])
    
    })
    
    it('adds item to collection state', () => {
    
        const collectionPrototype = Object.getPrototypeOf(saganCollectionInstance)
    
        const state = saganCollectionInstance.getState()
    
        expect(state).toEqual([
            {
                name: 'Sagan'
            }
        ])
    
        const newState = collectionPrototype.addItem(state, {name: 'Atreyu'})
    
        expect(newState).toEqual([
            {
                name: 'Sagan'
            },
            {
                name: 'Atreyu'
            }
        ])
    
    })
    
    it('removes item from collection state', () => {
    
        const collectionPrototype = Object.getPrototypeOf(saganCollectionInstance)
    
        const state = saganCollectionInstance.getState()
    
        expect(state).toEqual([
            {
                name: 'Sagan'
            }
        ])
    
        const newState = collectionPrototype.addItem(state, {name: 'Atreyu'})
    
        expect(newState).toEqual([
            {
                name: 'Sagan'
            },
            {
                name: 'Atreyu'
            }
        ])
    
        const removedState = collectionPrototype.removeItem(newState, 0)
    
        expect(removedState).toEqual([
            {
                name: 'Atreyu'
            }
        ])
    
    })
    
    it('throws if reducer is not a function', () => {
    
        const collectionPrototype = Object.getPrototypeOf(saganCollectionInstance)
        const reducers = {
            addUser: function(state, payload) {
                return [
                    ...state,
                    payload
                ]
            }
        }
    
        expect(() => {
            return collectionPrototype.setReducers([])
        }).toThrow();
    
        expect(() => {
            return collectionPrototype.setReducers(0)
        }).toThrow();
    
        expect(() => {
            return collectionPrototype.setReducers(true)
        }).toThrow();
    
        expect(() => {
            return collectionPrototype.setReducers({addUser: []})
        }).toThrow();
    
        expect(() => {
            return collectionPrototype.setReducers(reducers)
        }).not.toThrow();
        
    })
    
    it('throws if model is not instance of Sagan model', () => {
        expect(saganCollectionInstance.Model.prototype).toBeInstanceOf(BaseModel)
    })

})