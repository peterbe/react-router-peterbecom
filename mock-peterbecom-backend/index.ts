import express from "express"
import morgan from "morgan"
import { router } from "./api.ts"

export const app = express()

app.disable("x-powered-by")
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? ":method :url [:date[iso]] :status :res[content-length] - :response-time ms"
      : "tiny",
  ),
)
app.use("/api", router)

const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})
