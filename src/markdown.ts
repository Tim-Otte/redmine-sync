export const LF = '\n\n'

export function noteAlert(text: string): string {
  return `> [!NOTE]${LF}> ${text}`
}

export function link(label: string, url: string): string {
  return `[${label}](${url})`
}
