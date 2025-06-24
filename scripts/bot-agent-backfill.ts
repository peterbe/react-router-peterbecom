import postgres from "postgres"
import { getBotAgent } from "../server/get-bot-agent"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error("DATABASE_URL not set")

const sql = postgres(DATABASE_URL)
const LIMIT = Number(process.env.LIMIT || "1000")

async function getBackfillables() {
  return await sql`
    select
      id, meta, request
    from base_requestlog
    where (meta->'isbot')::boolean and meta->'botAgent' is null
    order by created
    limit ${LIMIT}
  `
}
async function countBackfillables() {
  const results = await sql`
    select count(*)
    from base_requestlog
    where (meta->'isbot')::boolean and meta->'botAgent' is null
  `
  return results ? Number(results[0].count) : 0
}

const mem: Record<string, string | null> = {}
function getBotAgent_mem(userAgent: string): string | null {
  if (!(userAgent in mem)) {
    console.log("MISS", userAgent)

    mem[userAgent] = getBotAgent(userAgent)
  }
  return mem[userAgent] || null
}

async function main() {
  const countBefore = await countBackfillables()
  for (const row of await getBackfillables()) {
    const {
      id,
      meta,
      request: { userAgent },
    } = row
    if (meta.botAgent) continue
    // console.log(id, meta)
    const botAgent = getBotAgent_mem(userAgent)
    console.log(id, { userAgent, botAgent })
    meta.botAgent = botAgent
    meta.botUrl = undefined
    await sql`
    UPDATE base_requestlog
    SET meta = ${meta}
    WHERE id = ${id}
    `
  }
  const countAfter = await countBackfillables()
  console.log({ countBefore })
  console.log({ countAfter })
}
main().then(() => process.exit(0))
