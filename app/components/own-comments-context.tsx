import { createContext, type ReactNode, useContext, useState } from "react"
import type { OwnComment } from "~/types"

type OwnCommentsContextType = {
  ownComments: OwnComment[]
  setOwnComments: (comments: OwnComment[]) => void
  addNewComment: (comment: OwnComment) => void
}
export const OwnCommentsContext = createContext<
  OwnCommentsContextType | undefined
>(undefined)

export const OwnCommentsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ownComments, setOwnComments] = useState<OwnComment[]>([])

  console.log(
    `OwnCommentsProvider rendered and it was ${ownComments.length} comments`,
  )

  function addNewComment(newComment: OwnComment) {
    setOwnComments((prevState) => {
      const newComments: OwnComment[] = []
      let edited = false
      for (const ownComment of prevState) {
        if (ownComment.hash === newComment.hash) {
          newComments.push(newComment)
          edited = true
        } else {
          newComments.push(ownComment)
        }
      }
      if (!edited) {
        newComments.push(newComment)
      }
      return newComments
    })
  }

  return (
    <OwnCommentsContext.Provider
      value={{ ownComments, setOwnComments, addNewComment }}
    >
      {children}
    </OwnCommentsContext.Provider>
  )
}

export const useOwnComments = (): OwnCommentsContextType => {
  const context = useContext(OwnCommentsContext)
  if (context === undefined) {
    throw new Error("useComments must be used within a OwnCommentsProvider")
  }
  return context
}
