import { act, renderHook } from '@testing-library/react'
import { useDebouncedState } from './useDebouncedState.js' // Adjust path if needed

const DELAY = 300
const SMALL_DELAY = 100

describe('useDebouncedState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should initialize value and debouncedValue with the provided initial state', () => {
    const { result } = renderHook(() => useDebouncedState('hello'))

    const [value, , debouncedValue] = result.current

    expect(value).toBe('hello')
    expect(debouncedValue).toBe('hello')
  })

  it('should initialize value and debouncedValue with the result of initialState function', () => {
    const { result } = renderHook(() => useDebouncedState(() => 'computed'))

    const [value, , debouncedValue] = result.current

    expect(value).toBe('computed')
    expect(debouncedValue).toBe('computed')
  })

  it('should update value immediately but debouncedValue after delay', async () => {
    const { result } = renderHook(() => useDebouncedState('initial', DELAY))

    const [, setValue] = result.current

    // Update the value
    act(() => {
      setValue('updated')
    })

    const [value, , debouncedValue] = result.current

    // Immediately, value should be updated, debouncedValue should still be old
    expect(value).toBe('updated')
    expect(debouncedValue).toBe('initial')

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(DELAY)
    })

    const [, , debouncedValueAfter] = result.current

    // After debounce time, debouncedValue should match value
    expect(debouncedValueAfter).toBe('updated')
  })

  it('should only update debouncedValue to the last value after multiple quick updates', async () => {
    const { result } = renderHook(() => useDebouncedState('start', DELAY))

    const [, setValue] = result.current

    // Multiple quick updates
    act(() => {
      setValue('one')
      setValue('two')
      setValue('three')
    })

    const [value, , debouncedValue] = result.current

    // Immediately
    expect(value).toBe('three')
    expect(debouncedValue).toBe('start')

    // Advance time
    act(() => {
      vi.advanceTimersByTime(DELAY)
    })

    const [, , debouncedValueAfter] = result.current

    expect(debouncedValueAfter).toBe('three')
  })

  it('should reset the timer if called again before delay', () => {
    const { result } = renderHook(() => useDebouncedState('initial', DELAY))

    act(() => {
      result.current[1]('first call')
    })

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(SMALL_DELAY)
    })

    expect(result.current[2]).toBe('initial')

    act(() => {
      result.current[1]('second call')
    })

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(SMALL_DELAY)
    })

    expect(result.current[2]).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(DELAY - SMALL_DELAY)
    })

    expect(result.current[2]).toBe('second call')
  })

  it('should immediately update both value and debouncedValue when reset is called', () => {
    const { result } = renderHook(() => useDebouncedState('initial', DELAY))

    const [, , , reset] = result.current

    act(() => {
      reset('reset-value')
    })

    const [value, , debouncedValue] = result.current

    expect(value).toBe('reset-value')
    expect(debouncedValue).toBe('reset-value')
  })

  it('should support function updater for setValue and reset', () => {
    const { result } = renderHook(() => useDebouncedState(0, DELAY))

    const [, setValue, , reset] = result.current

    // setValue with function
    act(() => {
      setValue((prev) => prev + 1)
    })

    const [valueAfterSet] = result.current
    expect(valueAfterSet).toBe(1)

    act(() => {
      vi.advanceTimersByTime(DELAY)
    })

    const [, , debouncedValueAfterSet] = result.current
    expect(debouncedValueAfterSet).toBe(1)

    // reset with function
    act(() => {
      reset((prev) => prev + 10)
    })

    const [valueAfterReset, , debouncedValueAfterReset] = result.current
    expect(valueAfterReset).toBe(11)
    expect(debouncedValueAfterReset).toBe(11)
  })

  it('should support undefined as an initial state', () => {
    const { result } = renderHook(() =>
      useDebouncedState<string>(undefined, 300),
    )

    const [value, , debouncedValue] = result.current

    expect(value).toBeUndefined()
    expect(debouncedValue).toBeUndefined()
  })

  it('should call the callback when the debounced value changes', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useDebouncedState<string>('initial', DELAY, callback),
    )

    const [, setValue] = result.current

    act(() => {
      setValue('updated')
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(SMALL_DELAY)
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(DELAY - SMALL_DELAY)
    })

    expect(callback).toHaveBeenCalledWith('updated')
  })
})
