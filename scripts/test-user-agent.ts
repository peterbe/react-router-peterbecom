/** For example
 *
 * bun run test-user-agent "Mozilla/5.0 (compatible; bla blabot)"
 *
 */

import { isbot } from "isbot"
import { getBotAgent } from "../server/get-bot-agent"

async function run(...args: string[]) {
  for (const arg of args) {
    console.log("USER AGENT STRING:".padEnd(20), arg)
    console.log("IS BOT:".padEnd(20), isbot(arg))
    const botAgent = getBotAgent(arg)
    console.log("BOT AGENT:".padEnd(20), botAgent)
    console.log("")
  }
}
async function main() {
  await run(...process.argv.slice(2))
}
main().then(() => process.exit(0))
