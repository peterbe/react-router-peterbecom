export function ScrollToTop() {
  return (
    <p className="scroll-to-top">
      <a
        href="#top"
        // biome-ignore lint/a11y/useSemanticElements: I *think* this comes from Picocss
        role="button"
        className="outline"
        onClick={(event) => {
          event.preventDefault()
          window.scrollTo(0, 0)
        }}
      >
        Go to top of the page
      </a>
    </p>
  )
}
