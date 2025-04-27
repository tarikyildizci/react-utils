# @tarikyildizci/react-utils

Miscellaneous utilities for react projects

## Installation

```bash
npm install @tarikyildizci/react-utils
```

## Utilities

### useDebounce

useDebounce is a hook that returns a function that will call the given effect after the delay has passed. If the function is called again before the delay has passed, the timeout is reset.

It can be used to debounce events, such as input changes where you don't want to call a function multiple times in a short period of time.

```tsx
import { useDebounce } from '@tarikyildizci/react-utils'

const debouncedChange = useDebounce(onChange, 400)

// debouncedChange will be called after 400ms of inactivity
debouncedChange()
```

### useDebouncedState

useDebouncedState is a state hook that provides both immediate and debounced state values. It works like `useState`, but also returns a debounced version of the value, useful for scenarios like search inputs, filters, or expensive computations.

It can be used to track two states: the current value and the debounced value. You can pass the current value to your input element, and the debounced value to your useQuery arguments for example.

It also accepts a callback function that will be called whenever the debounced value changes.

```tsx
import { useDebouncedState } from '@tarikyildizci/react-utils'

const [value, setValue, debouncedValue, reset] = useDebouncedState('', 300)

useEffect(() => {
  // Do something with debouncedValue
}, [debouncedValue])

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

Or with a callback:

```tsx
import { useDebouncedState } from '@tarikyildizci/react-utils'

const afterDebounce = (value: string) => {
  // Do something with value
}

const [value, setValue, debouncedValue, reset] = useDebouncedState('', 300, afterDebounce)

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```
