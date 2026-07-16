// The backend sends dates like "20/03/2019 08:15 AM UTC" (day/month/year).
// These helpers turn that into a Date (for sorting) and a short label
// like "04 Sep 2019" (to match the design).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function parseCreated(text) {
  if (!text || text === 'data not found') return null
  const [datePart, timePart, ampm] = text.split(' ')
  const [day, month, year] = datePart.split('/').map(Number)
  let [hours, minutes] = timePart.split(':').map(Number)
  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return new Date(Date.UTC(year, month - 1, day, hours, minutes))
}

export function formatCreated(text) {
  const date = parseCreated(text)
  if (!date) return text
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}
