import { Link, useLocation } from "react-router"

import { links } from "~/components/nav"

const THIS_YEAR = new Date().getFullYear()

export function Footer() {
  const { pathname } = useLocation()
  if (pathname.startsWith("/plog/blogitem-040601-1")) {
    return <LyricspostFooter />
  }

  return (
    <footer className="container footer">
      <nav>
        <ul>
          {links.map(([to, text]) => {
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={pathname === to ? "secondary" : undefined}
                >
                  {text}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <p>&copy; peterbe.com 2003 - {THIS_YEAR}</p>
      <p>
        Check out my side project:{" "}
        {/* <a href="https://thatsgroce.web.app" title="That's Groce!">
          That&apos;s Groce!
        </a> */}
        <a
          href="https://spot-the-difference.peterbe.com"
          title="Spot the Difference"
        >
          Spot the Difference
        </a>
      </p>
    </footer>
  )
}

function LyricspostFooter() {
  return (
    <footer className="container footer">
      <p>
        &copy; <Link to="/">peterbe.com</Link> 2003 - {THIS_YEAR}
      </p>
    </footer>
  )
}
