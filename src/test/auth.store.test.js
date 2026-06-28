import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/index.js'

// Mock the auth API so the store can be tested in isolation.
jest.mock('@/api/index.js', () => ({
    authApi: {
        login: jest.fn(),
        register: jest.fn(),
        getMe: jest.fn(),
    },
}))

// Verify the authentication store handles login, registration, and logout flows correctly.
describe('useAuthStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        localStorage.clear()
        jest.clearAllMocks()
    })

    // Confirms a successful login stores the token and fetches the current user.
    it('logs in successfully and stores the auth token', async () => {
        authApi.login.mockResolvedValue({ data: { token: 'abc123' } })
        authApi.getMe.mockResolvedValue({ data: { id: 1, name: 'Ada' } })

        const store = useAuthStore()
        const result = await store.login({ email: 'ada@example.com', password: 'secret' })

        expect(result).toEqual({ success: true })
        expect(store.token).toBe('abc123')
        expect(store.isLoggedIn).toBe(true)
        expect(localStorage.getItem('token')).toBe('abc123')
        expect(authApi.getMe).toHaveBeenCalled()
    })

    // Ensures failed login attempts return a clear error without leaving a token behind.
    it('returns an error message when login fails', async () => {
        authApi.login.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } })

        const store = useAuthStore()
        const result = await store.login({ email: 'ada@example.com', password: 'wrong' })

        expect(result).toEqual({ success: false, error: 'Invalid credentials' })
        expect(store.token).toBeNull()
    })

    // Checks that registration succeeds without automatically logging the user in.
    it('registers a new user and leaves the store logged out', async () => {
        authApi.register.mockResolvedValue({})

        const store = useAuthStore()
        const result = await store.register({ name: 'Grace', email: 'grace@example.com' })

        expect(result).toEqual({ success: true })
        expect(store.isLoggedIn).toBe(false)
        expect(authApi.register).toHaveBeenCalledWith({ name: 'Grace', email: 'grace@example.com' })
    })

    // Verifies logout removes stored auth data from both memory and local storage.
    it('clears auth state on logout', () => {
        localStorage.setItem('token', 'abc123')

        const store = useAuthStore()
        store.token = 'abc123'
        store.user = { id: 1, name: 'Ada' }
        store.logout()

        expect(store.token).toBeNull()
        expect(store.user).toBeNull()
        expect(localStorage.getItem('token')).toBeNull()
    })
})
