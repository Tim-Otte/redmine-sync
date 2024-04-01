/**
 * Line feed
 */
export const LF = '\n'

/**
 * A markdown compatible line break
 */
export const LINE_BREAK = LF + LF

/**
 * Create a note alert
 * @param text The text to display in the note
 * @returns The GitHub markdown string for a note alert
 */
export function noteAlert(text: string): string {
  return `> [!NOTE]${LF}> ${text}`
}

/**
 * Create a link
 * @param label The text to display in the link
 * @param url The url of the link
 * @returns The GitHub markdown string for a link
 */
export function link(label: string, url: string): string {
  return `[${label}](${url})`
}
