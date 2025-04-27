import { useState, type Dispatch, type SetStateAction } from 'react'
import { useDebounce } from '../useDebounce/useDebounce.js'

/**
 * A state hook that provides both immediate and debounced state values.
 *
 * Works like `useState`, but also returns a debounced version of the value, useful for scenarios like search inputs, filters, or expensive computations.
 *
 * @param initialValue - The initial state value.
 * @param delay - Debounce delay in milliseconds. Defaults to `500ms`.
 *
 * @returns `[value, setValue, debouncedValue, reset]`
 * - `value`: The current state value (updated immediately).
 * - `setValue`: Function to update the state (triggers debounced value update).
 * - `debouncedValue`: The debounced state value (updated after delay).
 * - `reset`: Function to reset both immediate and debounced values to a given value instantly.
 *
 * @example
 * const [value, setValue, debouncedValue, reset] = useDebouncedState('', 300);
 *
 * <input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 */

// Overloads
export function useDebouncedState<S>(
  initialState: S | (() => S),
  delay?: number,
  callback?: (value: S) => void,
): readonly [S, Dispatch<SetStateAction<S>>, S, Dispatch<SetStateAction<S>>]
export function useDebouncedState<S = undefined>(
  initialState?: S,
  delay?: number,
  callback?: (value?: S) => void,
): readonly [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
]

export function useDebouncedState<T>(
  initialState: T | (() => T),
  delay = 500,
  callback?: (value: T) => void,
) {
  const [value, setValue] = useState<T>(initialState)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialState)

  const debounce = useDebounce((newValue: T) => {
    setDebouncedValue(newValue)
    callback?.(newValue)
  }, delay)

  const setBoth: Dispatch<SetStateAction<T>> = (action) => {
    setValue((prev) => {
      const newValue =
        typeof action === 'function'
          ? (action as (prevState: T) => T)(prev)
          : action

      debounce(newValue)
      return newValue
    })
  }

  const reset: Dispatch<SetStateAction<T>> = (action) => {
    setValue((prev) => {
      const newValue =
        typeof action === 'function'
          ? (action as (prevState: T) => T)(prev)
          : action

      setDebouncedValue(newValue)
      return newValue
    })
  }

  return [value, setBoth, debouncedValue, reset] as const
}
