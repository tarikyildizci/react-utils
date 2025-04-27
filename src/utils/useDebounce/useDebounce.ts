import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns a function that will call the given effect after the delay has passed.
 * If the function is called again before the delay has passed, the timeout is reset.
 *
 * @example
 * const debouncedChange = useDebounce(onChange, 400);
 * // debouncedChange will be called after 400ms of inactivity
 * debouncedChange();
 */

export function useDebounce<T>(
  effect: (...args: Array<T>) => unknown,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clean up the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debounce = useCallback(
    (...args: Array<T>) => {
      // Clear the previous timeout when debounce is called again
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set a new timeout to call the effect after the delayInMs
      timeoutRef.current = setTimeout(() => effect(...args), delay)
    },
    [effect, delay],
  )

  return debounce
}
