export const DEFAULT_TOO_MANY_REQUESTS_MESSAGE = 'Too many requests. Please wait a few minutes before trying again.'
export const DEFAULT_SERVER_ERROR_MESSAGE = 'Something went wrong on our side. Please try again in a moment.'

export function getTooManyRequestsMessage(message?: string) {
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''
  return normalizedMessage || DEFAULT_TOO_MANY_REQUESTS_MESSAGE
}

export function getRequestErrorMessage(status: number, message: unknown, fallbackMessage: string) {
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''

  if (normalizedMessage) {
    return normalizedMessage
  }

  if (status === 429) {
    return DEFAULT_TOO_MANY_REQUESTS_MESSAGE
  }

  if (status >= 500) {
    return DEFAULT_SERVER_ERROR_MESSAGE
  }

  return fallbackMessage
}
