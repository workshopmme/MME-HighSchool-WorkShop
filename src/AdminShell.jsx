import { useCallback, useEffect, useRef, useState } from 'react'
import { adminCall, apiCall } from './api.js'
import BrandHeader from './BrandHeader.jsx'

export function adminRoot() {
  const path = window.location.pathname
  return path.slice(0, path.lastIndexOf('/admin')) + '/admin/'
}

export default function AdminShell({ active = 'teams', children }) {
  const tokenKey = 'mme-workshop-admin-token'
  const [code, setCode] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '')
  const [ok, setOk] = useState(() => Boolean(localStorage.getItem(tokenKey)))
  const [checked, setChecked] = useState(() => Boolean(localStorage.getItem(tokenKey)))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const api = useCallback((path, method, body) => adminCall(token, path, method, body), [token])
  async function login(value) { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { const result = await apiCall('/api/admin/login', 'POST', { code: value }); localStorage.setItem(tokenKey, result.adminToken); setToken(result.adminToken); setOk(true); setChecked(true); setCode('') } catch (failure) { setError(failure.message) } finally { setBusy(false); lock.current = false } }
  useEffect(() => { let current = true; api('/state').then(() => current && setOk(true)).catch(() => { if (current) { localStorage.removeItem(tokenKey); setToken(''); setOk(false) } }).finally(() => current && setChecked(true)); return () => { current = false } }, [api])
  function logout() { api('/logout', 'POST').finally(() => { localStorage.removeItem(tokenKey); setToken(''); setOk(false); setChecked(true) }) }
  const root = adminRoot()
  return <div className="admin-app"><BrandHeader admin>{ok && <button className="ghost logout" onClick={logout}>Log out</button>}</BrandHeader><main className="site-width admin-wrap">{!checked ? <p className="muted" role="status">Checking admin session…</p> : !ok ? <form className="card login-card" onSubmit={event => { event.preventDefault(); login(code) }}><p className="eyebrow">Workshop access</p><h2>Admin login</h2><label htmlFor="admin-code">Admin code</label><input id="admin-code" type="password" required value={code} disabled={busy} onChange={event => setCode(event.target.value)} />{error && <p className="msg err" role="alert">{error}</p>}<button className="login-button" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button></form> : <><nav className="admin-nav" aria-label="Admin pages"><a href={root} aria-current={active === 'teams' ? 'page' : undefined}>Teams</a><a href={root + 'overview/'} aria-current={active === 'overview' ? 'page' : undefined}>Statistics</a><a href={root + 'deadline/'} aria-current={active === 'deadline' ? 'page' : undefined}>Registration deadline</a></nav>{children(api)}</>}</main></div>
}
