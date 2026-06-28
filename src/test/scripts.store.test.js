import { setActivePinia, createPinia } from 'pinia'
import { useScriptStore } from '@/stores/scripts'
import { scriptApi } from '@/api/index.js'

// Mock the script API so the store can be tested independently of the network layer.
jest.mock('@/api/index.js', () => ({
    scriptApi: {
        list: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
    },
}))

// Verify the script store handles loading, creating, and deleting scripts correctly.
describe('useScriptStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        jest.clearAllMocks()
    })

    // Confirms the store fetches scripts and updates its loading and error state properly.
    it('loads scripts into state', async () => {
        scriptApi.list.mockResolvedValue({ data: [{ id: 1, name: 'Build' }] })

        const store = useScriptStore()
        await store.fetchScripts()

        expect(store.scripts).toEqual([{ id: 1, name: 'Build' }])
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
    })

    // Ensures newly created scripts are immediately inserted at the top of the list.
    it('adds a newly created script to the front of the list', async () => {
        scriptApi.create.mockResolvedValue({ data: { id: 2, name: 'Deploy' } })

        const store = useScriptStore()
        store.scripts = [{ id: 1, name: 'Build' }]

        const result = await store.createScript({ name: 'Deploy' })

        expect(result).toEqual({ success: true, data: { id: 2, name: 'Deploy' } })
        expect(store.scripts[0]).toEqual({ id: 2, name: 'Deploy' })
    })

    // Checks that successful deletion removes the selected script from the store state.
    it('removes a script when delete succeeds', async () => {
        scriptApi.remove.mockResolvedValue({})

        const store = useScriptStore()
        store.scripts = [{ id: 1, name: 'Build' }, { id: 2, name: 'Deploy' }]

        const result = await store.removeScript(1)

        expect(result).toEqual({ success: true })
        expect(store.scripts).toEqual([{ id: 2, name: 'Deploy' }])
    })
})
