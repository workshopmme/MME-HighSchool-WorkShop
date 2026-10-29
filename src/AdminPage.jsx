import { useEffect, useState } from 'react'
import AdminShell from './AdminShell.jsx'

function TeamCard({ team, api, onChanged }) {
  const [details, setDetails] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function open() { if (details) return setDetails(null); setError(''); try { setDetails(await api(`/teams/${team.id}`)) } catch (failure) { setError(failure.message) } }
  async function updateEntered() { setBusy(true); setError(''); try { const response = await api(`/teams/${team.id}/entered`, 'POST', { value: !team.entered }); onChanged(response.team); setDetails(response.team) } catch (failure) { setError(failure.message) } finally { setBusy(false) } }
  return <article className="card team-card"><div className="team-card-head"><button className="team-toggle" onClick={open} aria-expanded={Boolean(details)}><div><strong>{team.school_name}</strong><span>{team.member_count} {team.member_count === 1 ? 'student' : 'students'} · Interested in {team.interested_major}</span></div></button><span className={'tag ' + (team.entered ? 'paid' : 'unpaid')}>{team.entered ? 'Entered' : 'Not entered'}</span></div>{details && <div className="team-details"><h3>Team members</h3><ul>{details.members.map(member => <li key={member.id}><strong>{member.name}</strong><span>{member.email}</span><span>{member.phone}</span></li>)}</ul><button className={team.entered ? 'ghost' : 'ok'} disabled={busy} onClick={updateEntered}>{busy ? 'Saving…' : team.entered ? 'Undo entered' : 'Mark team as entered'}</button></div>}{error && <p className="msg err" role="alert">{error}</p>}</article>
}

export function Stats({ api }) {
  const [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => { let current = true; api('/stats').then(value => current && setData(value)).catch(failure => current && setError(failure.message)); return () => { current = false } }, [api])
  const metrics = data && [['Teams registered', data.totalTeams], ['Students registered', data.totalStudents], ['Schools represented', data.totalSchools], ['Teams entered', data.enteredTeams], ['Students entered', data.enteredStudents]]
  return <section className="overview"><div className="section-line"><h2>Workshop statistics</h2><span className="muted small">Live totals</span></div>{error ? <div className="msg err" role="alert">{error}</div> : !metrics ? <p className="muted" role="status">Loading statistics…</p> : <div className="metric-grid workshop-metrics">{metrics.map(([label, value]) => <div className="card metric" key={label}><span className="metric-label">{label}</span><strong>{value}</strong></div>)}</div>}</section>
}

function Teams({ api }) {
  const [query, setQuery] = useState(''), [entered, setEntered] = useState(''), [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => { let current = true; const timer = setTimeout(() => { api('/teams?' + new URLSearchParams({ q: query, entered })).then(value => current && setData(value)).catch(failure => current && setError(failure.message)) }, 180); return () => { current = false; clearTimeout(timer) } }, [api, query, entered])
  const replaceTeam = updated => setData(current => current && { ...current, teams: current.teams.map(team => team.id === updated.id ? { ...team, ...updated, member_count: updated.members?.length ?? team.member_count } : team) })
  return <section className="teams-section"><div className="section-line"><h2>Registered teams</h2><span className="muted small">{data ? `${data.count} teams` : 'Loading…'}</span></div><div className="card filter-panel workshop-filter"><label htmlFor="team-search">Search teams</label><input id="team-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="School, student, email, phone or interested major" /><label htmlFor="entered-filter">Check-in status</label><select id="entered-filter" value={entered} onChange={event => setEntered(event.target.value)}><option value="">All teams</option><option value="1">Entered</option><option value="0">Not entered</option></select></div>{error && <div className="msg err" role="alert">{error}</div>}{data?.teams.length === 0 && <div className="card empty-state"><h3>No teams found</h3><p className="muted">Try a different search.</p></div>}<div className="team-results">{data?.teams.map(team => <TeamCard key={team.id} team={team} api={api} onChanged={replaceTeam} />)}</div></section>
}

export default function Admin() { return <AdminShell>{api => <Teams api={api} />}</AdminShell> }