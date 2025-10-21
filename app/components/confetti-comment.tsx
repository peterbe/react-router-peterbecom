import JSConfetti from "js-confetti"
import { useEffect, useRef } from "react"

export default function ConfettiComment() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches

  const confetti = useRef(new JSConfetti())
  useEffect(() => {
    if (!prefersReducedMotion) {
      confetti.current.addConfetti()
    }
  }, [prefersReducedMotion])

  return null
}
