import { extend as extendModel, BaseModel } from '../src/model'


let saganModelInstance
const SaganModel = extendModel({
    props: {
        name: 'string'
    }
})

beforeEach(() => {

    saganModelInstance= new SaganModel({
        name: 'Sagan'
    })

})

describe('Model', () => {

    it('exposes the public API', () => {
        const methods = Object.keys(BaseModel.prototype)

        expect(methods.length).toBe(12)
        expect(methods).toContain('createPropMap')
        expect(methods).toContain('update')
        expect(methods).toContain('setState')
        expect(methods).toContain('checkDerivedDeps')
        expect(methods).toContain('setDerivedState')
        expect(methods).toContain('validateProps')
        expect(methods).toContain('checkIsRequired')
        expect(methods).toContain('checkTypes')
        expect(methods).toContain('getBaseState')
        expect(methods).toContain('getState')
        expect(methods).toContain('setReducers')
        expect(methods).toContain('setDerived')
    })

    it('extendModel is instance of BaseModel', () => {
        expect(SaganModel.prototype).toBeInstanceOf(BaseModel)
    })

    it('sets the initial state', () => {

        const state = saganModelInstance.getState()

        expect(state).toEqual(
            {
                name: 'Sagan'
            }
        )

    })

    it('update returns the next state', () => {

        const state = saganModelInstance.getState()

        expect(state).toEqual(
            {
                name: 'Sagan'
            }
        )

        const newState = saganModelInstance.update(state, {name: 'New Name'})

        expect(newState).toEqual(
            {
                name: 'New Name'
            }
        )

    })

    it('throws if derived is not an object', () => {
        expect(() => {
            return BaseModel.prototype.setDerived([])
        }).toThrow();

        expect(() => {
            return BaseModel.prototype.setDerived({fullName: []})
        }).toThrow();
    })

    it('throws if derived prop does not pass dependencies as array', () => {
        expect(() => {
            return BaseModel.prototype.setDerived({fullName: {
                deps: {},
                fn: function () {}
            }})
        }).toThrow();

        expect(() => {
            return BaseModel.prototype.setDerived({fullName: {
                deps: ['firstName', 'lastName'],
                fn: {}
            }})
        }).toThrow();
    })

    it('throws if derived prop is not a function', () => {

        const derived = {
            fullName: {
                deps: ['firstName', 'lastName'],
                fn: function () {
                    return this.state.firstName + ' ' + this.state.lastName
                }
            }
        }

        expect(() => {
            return BaseModel.prototype.setDerived(derived)
        }).not.toThrow();

    })

    it('throws if reducer is not a function', () => {

        const reducers = {
            setFirstName: function(state, payload) {
                return {
                    ...state,
                    firstName: payload
                }
            }
        }

        expect(() => {
            return BaseModel.prototype.setReducers([])
        }).toThrow();

        expect(() => {
            return BaseModel.prototype.setReducers(0)
        }).toThrow();

        expect(() => {
            return BaseModel.prototype.setReducers(true)
        }).toThrow();

        expect(() => {
            return BaseModel.prototype.setReducers({setFirstName: []})
        }).toThrow();

        expect(() => {
            return BaseModel.prototype.setReducers(reducers)
        }).not.toThrow();
        
    })

    it('throws if props don\'t pass validation', () => {

        const typeMap = BaseModel.prototype.createPropMap({
            name: 'string',
            user: {
                type: 'string',
                required: true,
            }
        })

        const spy1 = jest.spyOn(global.console, 'error')
        BaseModel.prototype.checkTypes({name: 'Sagan', user: 'Atreyu'}, typeMap)
        expect(spy1).not.toHaveBeenCalled()

        const spy2 = jest.spyOn(global.console, 'error')
        BaseModel.prototype.checkTypes({name: 'Sagan'}, typeMap)
        expect(spy2).toHaveBeenCalled()

    })

    it('returns base state', () => {
        const state = saganModelInstance.getBaseState()

        expect(state).toEqual(
            {
                name: 'Sagan'
            }
        )
    })

    it('returns base and derived state', () => {

        const Model = extendModel({
            props: {
                firstName: 'string',
                lastName: 'string'
            },
            derived: {
                fullName: {
                    deps: ['firstName', 'lastName'],
                    fn: function () {
                        return this.state.firstName + ' ' + this.state.lastName
                    }
                }
            }
        })

        const ModelInstance = new Model({
            firstName: 'Sagan',
            lastName: 'App'
        })

        const state = ModelInstance.getState()

        expect(state).toEqual(
            {
                firstName: 'Sagan',
                lastName: 'App',
                fullName: 'Sagan App'
            }
        )
    })

})