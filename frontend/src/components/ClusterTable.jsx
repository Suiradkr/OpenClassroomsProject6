import StatusBadge from './StatusBadge'
import { formatCreated } from '../dates'

// The table of clusters. Columns match the design:
// ID, POD, DESCRIPTION, CREATED, USER, STATUS, SELECT.
// The SELECT checkbox is only enabled on rows the user is allowed to delete.
export default function ClusterTable({ clusters, selectedIds, onToggleRow, onToggleAll }) {
  const deletableIds = clusters.filter((c) => c.canDelete).map((c) => c.id)
  const allDeletableSelected =
    deletableIds.length > 0 && deletableIds.every((id) => selectedIds.includes(id))

  return (
    <div className="table-card">
      <table className="cluster-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>POD</th>
            <th>DESCRIPTION</th>
            <th>CREATED</th>
            <th>USER</th>
            <th>STATUS</th>
            <th className="col-select">
              SELECT
              <input
                type="checkbox"
                checked={allDeletableSelected}
                onChange={onToggleAll}
                disabled={deletableIds.length === 0}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {clusters.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                No clusters to show.
              </td>
            </tr>
          )}
          {clusters.map((cluster) => (
            <tr key={cluster.id}>
              <td>{cluster.id}</td>
              <td>{cluster.podbox}</td>
              <td>{cluster.version}</td>
              <td>{formatCreated(cluster.created)}</td>
              <td>{cluster.username}</td>
              <td>
                <StatusBadge status={cluster.status} />
              </td>
              <td className="col-select">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cluster.id)}
                  onChange={() => onToggleRow(cluster.id)}
                  disabled={!cluster.canDelete}
                  title={
                    cluster.canDelete
                      ? 'Select this cluster'
                      : "You can only delete your own clusters"
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
