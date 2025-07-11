import { useEffect } from "react"

export function CarbonAd() {
  useEffect(() => {
    const script = document.querySelector("div.carbonads_outer")
    if (!script) {
      return
    }

    const s = document.createElement("script")
    s.async = true
    s.id = "_carbonads_js"
    s.src =
      // "https://cdn.carbonads.com/carbon.js?serve=CKYI52Q7&amp;placement=peterbecom"
      "https://cdn.carbonads.com/carbon.js?serve=CW7ILKQN&placement=wwwpeterbecom&format=cover"
    script.appendChild(s)
    return () => {
      script.removeChild(s)
    }
  }, [])

  if (!import.meta.env.PROD) {
    return null
  }

  // The outer wrapper is to be able to set a min-height so
  // as to avoid a CLS when the ad loads in.
  return <div className="carbonads_outer" />
}
