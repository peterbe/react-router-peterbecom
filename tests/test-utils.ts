import axios, { type AxiosResponse } from "axios"
import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry"
import dotenv from "dotenv"

dotenv.config()

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000"

const RETRIES = 1
const TIMEOUT = 1500

axiosRetry(axios, {
  retries: RETRIES,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    if (
      isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED"
    ) {
      return true
    }
    console.warn("NOT going to retry on error:", error)
    return false
  },
  onRetry: (retryCount, error) => {
    console.log(`Retrying (${retryCount}) on ${error.request.path}`)
    return
  },
  retryDelay: (retryCount) => {
    return retryCount * 1000
  },
})

export async function get(
  uri: string,
  followRedirect = false,
  throwHttpErrors = false,
  { timeout = TIMEOUT, decompress = true, method = "get", headers = {} } = {},
) {
  try {
    const response = await axios(SERVER_URL + uri, {
      method,
      timeout,
      decompress,
      maxRedirects: followRedirect ? 10 : 0,
      validateStatus: (status) => {
        if (throwHttpErrors) return status >= 200 && status < 300 // default
        return true
      },
      headers,
    })
    return response
  } catch {
    throw new Error(
      `Axios network error on ${method.toUpperCase()} ${uri} (${JSON.stringify({
        followRedirect,
        throwHttpErrors,
        timeout,
        decompress,
      })})`,
    )
  }
}
export async function post(
  uri: string,
  followRedirect = false,
  throwHttpErrors = false,
) {
  return get(uri, followRedirect, throwHttpErrors, { method: "post" })
}

export function isCached(res: AxiosResponse) {
  const cc = res.headers["cache-control"]
  if (!cc) return false
  const maxAge = Number.parseInt(cc.match(/max-age=(\d+)/)[1], 10)
  return maxAge > 0 && /public/.test(cc)
}
