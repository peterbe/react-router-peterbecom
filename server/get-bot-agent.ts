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
  if (userAgent.includes("+imagesift.com")) return "imagesift.com"
  if (userAgent.includes("zoominfobot at zoominfo dot com"))
    return "zoominfobot@zoominfo.com"
  if (userAgent.includes("Twitterbot/")) return "Twitterbot"
  if (userAgent.includes("HeadlessChrome")) return "HeadlessChrome"
  return null
}
