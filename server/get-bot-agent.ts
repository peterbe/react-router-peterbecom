const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const urlRegex =
  /https?:\/\/(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:\/[^\s)]*)?/g

export function getBotAgent(userAgent: string): string | null {
  for (let url of userAgent.match(urlRegex) || []) {
    if (url.startsWith("+")) {
      url = url.slice(1)
    }
    return url
  }
  for (let email of userAgent.match(emailRegex) || []) {
    if (email.startsWith("+")) {
      email = email.slice(1)
    }
    return email
  }

  // Exceptions abound!
  const transforms = {
    "+imagesift.com": "imagesift.com",
    "zoominfobot at zoominfo dot com": "zoominfobot@zoominfo.com",
    "Twitterbot/": "Twitterbot",
    HeadlessChrome: "HeadlessChrome",
    Site24x7: "Site24x7",
    YisouSpider: "YisouSpider",
    Brightbot: "Brightbot",
    "search.marginalia.nu": "search.marginalia.nu",
  }
  for (const [needle, replacement] of Object.entries(transforms)) {
    if (userAgent.includes(needle)) {
      return replacement
    }
  }
  return null
}
