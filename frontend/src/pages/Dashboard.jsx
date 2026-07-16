import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchClusters, deleteCluster } from '../api'
import { getUser, clearAuth } from '../auth'
import { parseCreated } from '../dates'
import TopBar from '../components/TopBar'
import ClusterTable from '../components/ClusterTable'

const PAGE_SIZE = 9

export default function Dashboard() {
  const navigate = useNavigate()
  const user = getUser()

  const [scope, setScope] = useState('mine') // 'mine' or 'all'
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters / search / sorting / paging
  const [search, setSearch] = useState('')
  const [podboxFilter, setPodboxFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('') // '', 'newest', 'oldest'
  const [page, setPage] = useState(1)

  const [selectedIds, setSelectedIds] = useState([])

  // Load clusters whenever the scope (My / All) changes.
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchClusters(scope)
      .then((data) => {
        if (!active) return
        setClusters(data || [])
        setSelectedIds([])
        setPage(1)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [scope])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function resetFilters() {
    setSearch('')
    setPodboxFilter('')
    setUserFilter('')
    setSortOrder('')
    setPage(1)
  }

  // Build dropdown options from the loaded data.
  const podboxOptions = [...new Set(clusters.map((c) => c.podbox))].sort()
  const userOptions = [...new Set(clusters.map((c) => c.username))].sort()

  // Apply filters + search.
  let visible = clusters.filter((c) => {
    if (podboxFilter && c.podbox !== podboxFilter) return false
    if (userFilter && c.username !== userFilter) return false
    if (search) {
      const term = search.toLowerCase()
      const haystack =
        String(c.id) + ' ' + c.username + ' ' + c.podbox + ' ' + c.version
      if (!haystack.toLowerCase().includes(term)) return false
    }
    return true
  })

  // Sort by created date if chosen.
  if (sortOrder) {
    visible = [...visible].sort((a, b) => {
      const da = parseCreated(a.created)
      const db = parseCreated(b.created)
      if (!da || !db) return 0
      return sortOrder === 'newest' ? db - da : da - db
    })
  }

  // Pagination.
  const total = visible.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = visible.slice(start, start + PAGE_SIZE)

  const from = total === 0 ? 0 : start + 1
  const to = Math.min(start + PAGE_SIZE, total)

  // Row selection (for bulk delete).
  function toggleRow(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    const deletableOnPage = pageItems.filter((c) => c.canDelete).map((c) => c.id)
    const allSelected = deletableOnPage.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !deletableOnPage.includes(id)))
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...deletableOnPage])])
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return
    const ok = window.confirm(
      `Delete ${selectedIds.length} cluster(s)? This cannot be undone.`
    )
    if (!ok) return
    try {
      for (const id of selectedIds) {
        await deleteCluster(id)
      }
      const data = await fetchClusters(scope)
      setClusters(data || [])
      setSelectedIds([])
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <TopBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        user={user}
        onLogout={handleLogout}
      />

      <main className="content">
        <h1 className="page-title">Cluster Manager</h1>

        <div className="tabs">
          <button
            className={scope === 'mine' ? 'tab tab-active' : 'tab'}
            onClick={() => setScope('mine')}
          >
            My Clusters
          </button>
          <button
            className={scope === 'all' ? 'tab tab-active' : 'tab'}
            onClick={() => setScope('all')}
          >
            All Clusters
          </button>
        </div>

        <div className="toolbar">
          <div className="filter-card">
            <span className="funnel">⧩</span>
            <span className="filter-label">Filter By</span>

            <select
              className="filter-select"
              value={podboxFilter}
              onChange={(e) => {
                setPodboxFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Podbox</option>
              {podboxOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Created</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>

            <select
              className="filter-select"
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">User</option>
              {userOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <button className="reset-filter" onClick={resetFilters}>
              ↺ Reset Filter
            </button>
          </div>

          <div className="toolbar-actions">
            <button
              className="icon-btn"
              title="Adding clusters isn't available in this tool"
              disabled
            >
              +
            </button>
            <button
              className="icon-btn icon-btn-danger"
              title="Delete selected clusters"
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
            >
              🗑
            </button>
          </div>
        </div>

        {error && <div className="banner-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading clusters…</div>
        ) : (
          <ClusterTable
            clusters={pageItems}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
          />
        )}

        <div className="table-footer">
          <span className="showing">
            Showing {from}-{to} of {total}
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              ‹
            </button>
            <button
              className="page-btn"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
