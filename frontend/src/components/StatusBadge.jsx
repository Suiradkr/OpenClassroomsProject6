// Turns the raw ETL status into a colored badge that matches the design.
const STATUS_MAP = {
  'INSTALLED': { label: 'Success', cls: 'success' },
  'IN PROGRESS': { label: 'In Progress', cls: 'progress' },
  'FAILED': { label: 'Failed', cls: 'failed' },
}

export default function StatusBadge({ status }) {
  const info = STATUS_MAP[status] || { label: status, cls: 'timeout' }
  return <span className={`badge badge-${info.cls}`}>{info.label}</span>
}
