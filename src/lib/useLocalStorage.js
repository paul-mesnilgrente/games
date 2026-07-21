import { useEffect, useState } from 'react'

// Like useState, but persists the value in localStorage under `key`, so
// players and scores survive a refresh or an accidental tab close.
// `initialValue` may be a value or a lazy initializer function (as with useState).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored)
    } catch {
      // corrupt JSON or storage unavailable — fall back to the default
    }
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write failures (private mode / quota exceeded)
    }
  }, [key, value])

  return [value, setValue]
}
