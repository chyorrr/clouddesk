'use client'

import { useEffect, useState } from 'react'

export default function Clock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, '0')
      const m = now.getMinutes().toString().padStart(2, '0')
      setTime(`${h}:${m}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <time className="taskbar-clock" title={new Date().toLocaleDateString()}>
      {time}
    </time>
  )
}
