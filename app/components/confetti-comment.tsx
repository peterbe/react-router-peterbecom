import JSConfetti from "js-confetti"
import { useEffect, useRef } from "react"

export default function ConfettiComment() {
  const confetti = useRef(new JSConfetti())
  useEffect(() => {
    confetti.current.addConfetti()
  }, [])

  return null
}
