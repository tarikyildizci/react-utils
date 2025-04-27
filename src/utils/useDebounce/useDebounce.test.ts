// useDebounce.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce.js'

const DELAY = 500
const SMALL_DELAY = 300

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should call the effect after the delay', () => {
    const effect = vi.fn()
    const { result } = renderHook(() => useDebounce(effect, DELAY))

    act(() => {
      result.current('test')
    })

    // Effect should not be called immediately
    expect(effect).not.toHaveBeenCalled()

    // Fast-forward time
    vi.advanceTimersByTime(DELAY)

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledWith('test')
  })

  it('should reset the timer if called again before delay', () => {
    const effect = vi.fn()
    const { result } = renderHook(() => useDebounce(effect, DELAY))

    act(() => {
      result.current('first call')
    })

    vi.advanceTimersByTime(SMALL_DELAY) // 300ms, not enough for debounce to fire

    act(() => {
      result.current('second call')
    })

    vi.advanceTimersByTime(SMALL_DELAY) // another 300ms, still should not fire

    expect(effect).not.toHaveBeenCalled()

    vi.advanceTimersByTime(DELAY - SMALL_DELAY) // now total 500ms after second call

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledWith('second call')
  })

  it('should clean up timeout on unmount', () => {
    const effect = vi.fn()
    const { result, unmount } = renderHook(() => useDebounce(effect, DELAY))

    act(() => {
      result.current('cleanup test')
    })

    unmount()

    // Timeout should be cleared and effect should never be called
    vi.advanceTimersByTime(DELAY)

    expect(effect).not.toHaveBeenCalled()
  })

  it("should accept an object as the effect's argument", () => {
    const effect = vi.fn()
    const { result } = renderHook(() => useDebounce(effect, DELAY))

    act(() => {
      result.current({ foo: 'bar' })
    })

    vi.advanceTimersByTime(DELAY)

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('should accept multiple arguments', () => {
    const effect = vi.fn()
    const { result } = renderHook(() => useDebounce(effect, DELAY))

    act(() => {
      result.current('foo', 'bar')
    })

    vi.advanceTimersByTime(DELAY)

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledWith('foo', 'bar')
  })
})
