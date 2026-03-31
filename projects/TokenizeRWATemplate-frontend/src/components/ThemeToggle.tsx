import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition shadow-sm border ${
        dark
          ? 'bg-[#1a2744] border-[#2a3d6e] text-yellow-200'
          : 'bg-sky-200 border-sky-300 text-orange-500'
      }`}
      aria-label="Toggle theme"
    >
      {dark ? 'dark' : 'light'}
    </button>
  )
}