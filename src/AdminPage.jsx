import { useEffect, useState } from 'react'
import AdminShell from './AdminShell.jsx'

function TeamRow({ team, api, onChanged }) {
  const [details, setDetails] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const expanded = Boolean(details)
  async function toggle() {
    if (expanded) return setDetails(null)
    setError('')
    try { setDetails(await api(`/teams/${team.id}`)) } catch (failure) { setError(failure.message) }
  }
  async function updateEntered(event) {
    event.stopPropagation(); setBusy(true); setError('')
    try { const response = await api(`/teams/${team.id}/entered`, 'POST', { value: !team.entered }); onChanged(response.team); setDetails(response.team) } catch (failure) { setError(failure.message) } finally { setBusy(false) }
  }
  return <article className={'team-row ' + (expanded ? 'is-open' : '')}>
    <div className="team-row-summary">
      <button className="team-summary-button" type="button" onClick={toggle} aria-expanded={expanded} aria-controls={`team-${team.id}`}>
        <span className={'team-chevron ' + (expanded ? 'open' : '')} aria-hidden="true">›</span>
        <span className="team-primary"><strong>{team.team_name || 'N/A'}</strong><small><b>{team.school_name}</b><i>•</i>{team.interested_major}<i>•</i>{team.member_count} {team.member_count === 1 ? 'student' : 'students'}</small></span>
      </button>
      <span className={'team-status ' + (team.entered ? 'entered' : 'not-entered')}>{team.entered ? 'Entered' : 'Not entered'}</span>
      <button className={team.entered ? 'team-action undo' : 'team-action'} type="button" disabled={busy} onClick={updateEntered}>{busy ? 'Saving…' : team.entered ? 'Undo entry' : 'Mark entered'}</button>
    </div>
    {expanded && <div className="team-member-list" id={`team-${team.id}`}>
      <div className="member-list-heading"><span>Student</span><span>Email</span><span>Phone number</span></div>
      {details.members.map(member => <div className="team-member" key={member.id}><strong>{member.name}</strong><a href={`mailto:${member.email}`}>{member.email}</a><a href={`tel:${member.phone}`}>{member.phone}</a></div>)}
    </div>}
    {error && <p className="msg err" role="alert">{error}</p>}
  </article>
}

export function Stats({ api }) {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { let current = true; api('/stats').then(value => current && setData(value)).catch(failure => current && setError(failure.message)); return () => { current = false } }, [api])
  const metrics = data && [
    ['Teams registered', data.totalTeams],
    ['Teams entered', `${data.enteredTeams} / ${data.totalTeams}`],
    ['Students registered', data.totalStudents],
    ['Students entered', `${data.enteredStudents} / ${data.totalStudents}`],
  ]
  return <section className="overview"><div className="section-line"><h2>Workshop statistics</h2><span className="muted small">Live totals</span></div>{error ? <div className="msg err" role="alert">{error}</div> : !metrics ? <p className="muted" role="status">Loading statistics…</p> : <><div className="metric-grid workshop-metrics">{metrics.map(([label, value]) => <div className="card metric" key={label}><span className="metric-label">{label}</span><strong>{value}</strong></div>)}</div><div className="card interest-statistics"><p>Teams interested in Mechatronics: <strong>{data.mechatronicsTeams ?? 0}</strong></p><p>Teams interested in Mechanical: <strong>{data.mechanicalTeams ?? 0}</strong></p></div></>}</section>
}

function Teams({ api }) {
  const [query, setQuery] = useState(''); const [entered, setEntered] = useState(''); const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { let current = true; const timer = setTimeout(() => { api('/teams?' + new URLSearchParams({ q: query, entered })).then(value => current && setData(value)).catch(failure => current && setError(failure.message)) }, 180); return () => { current = false; clearTimeout(timer) } }, [api, query, entered])
  const replaceTeam = updated => setData(current => current && { ...current, teams: current.teams.map(team => team.id === updated.id ? { ...team, ...updated, member_count: updated.members?.length ?? team.member_count } : team) })
  return <section className="teams-section"><div className="section-line"><h2>Registered teams</h2><span className="muted small">{data ? `${data.count} teams` : 'Loading…'}</span></div><div className="card workshop-filter"><div className="team-search"><label htmlFor="team-search">Search teams or students</label><input id="team-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Team name, student name, email, or phone" /></div><div className="team-filter"><label htmlFor="entered-filter">Entry status</label><select id="entered-filter" value={entered} onChange={event => setEntered(event.target.value)}><option value="">All teams</option><option value="1">Entered</option><option value="0">Not entered</option></select></div></div>{error && <div className="msg err" role="alert">{error}</div>}{data?.teams.length === 0 && <div className="card empty-state"><h3>No teams found</h3><p className="muted">Try a different team name, student, or filter.</p></div>}<div className="team-results">{data?.teams.map(team => <TeamRow key={team.id} team={team} api={api} onChanged={replaceTeam} />)}</div></section>
}

export default function Admin() { return <AdminShell>{api => <Teams api={api} />}</AdminShell> }
