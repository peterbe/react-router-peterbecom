import { Contact } from "~/components/contact"
import styles from "~/styles/contact.css?url"
import { absoluteURL } from "~/utils/utils"

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "canonical", href: absoluteURL("/contact") },
  ]
}

export function meta() {
  return [
    {
      title: "Contact Peter",
    },
  ]
}

export function headers() {
  const seconds = 60 * 60 * 12
  return {
    "cache-control": `public, max-age=${seconds}`,
  }
}

export default function Component() {
  return <Contact />
}
