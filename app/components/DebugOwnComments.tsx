import { useOwnComments } from "./own-comments-context"

export function DebugOwnComments() {
  const { ownComments } = useOwnComments()
  return null
  return (
    <div>
      <code>You have {ownComments.length} own comments</code>
      <ul>
        {ownComments.map((c) => (
          <li key={c.oid}>
            <code>
              "{c.comment}" (oid: {c.oid}, parent: {c.parent}, depth: {c.depth},
              postOid: {c.postOid})
            </code>
          </li>
        ))}
      </ul>
    </div>
  )
}
