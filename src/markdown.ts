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

/**
 * Create a section
 * @param title The title of the section
 * @param content The content to display in the collapsed section
 * @returns The GitHub markdown string for a section
 * @see https://docs.github.com/de/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections
 */
export function section(title: string, content: string): string {
  return `<details>${LF}<summary>${title}</summary>${LF}${content}${LF}</details>`
}
