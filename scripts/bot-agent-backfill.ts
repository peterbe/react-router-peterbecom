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
    where (meta->>'isbot')::boolean and (meta->>'botAgent') IS NULL
    order by created
    limit ${LIMIT}
  `
}
async function getBackfillablesCounts(limit = 10) {
  return await sql`
    select
      request->>'userAgent' as userAgent, count(request->>'userAgent') as count
    from base_requestlog
    where (meta->>'isbot')::boolean and (meta->>'botAgent') IS NULL
    group by request->>'userAgent'
    order by 2 desc
    limit ${limit}
  `
}
async function countBackfillables() {
  const results = await sql`
    select count(*)
    from base_requestlog
    where (meta->>'isbot')::boolean and (meta->>'botAgent') IS NULL
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
  const common = await getBackfillablesCounts()
  if (common.length) {
    console.log(`${common.length} most common unmatched`)
    common.forEach(({ useragent, count }, i) => {
      console.log(`${i + 1}`.padEnd(3), `${count}`.padEnd(3), useragent)
    })
  }
}
main().then(() => process.exit(0))
