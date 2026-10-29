import { useEffect, useState } from 'react'
import { apiCall } from './api.js'
import roboticsLogo from './assets/rhu-robotics-club.png'
import asmeLogo from './assets/rhu-asme.png'

const blankMember = () => ({ name: '', email: '', phone: '' })

function Deadline({ value }) {
  if (!value) return null
  const date = new Date(value)
  return <div className="hero-deadline"><span className="deadline-label">Registration closes at:</span><strong className="deadline-value">{date.toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}</strong></div>
}

export default function WorkshopRegistration() {
  const [schoolName, setSchoolName] = useState('')
  const [interestedMajor, setInterestedMajor] = useState('')
  const [memberCount, setMemberCount] = useState(1)
  const [members, setMembers] = useState([blankMember()])
  const [publicInfo, setPublicInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  useEffect(() => { apiCall('/api/public').then(setPublicInfo).catch(() => setPublicInfo({ closed: false })) }, [])
  function changeCount(value) {
    const count = Number(value)
    setMemberCount(count)
    setMembers(current => Array.from({ length: count }, (_, index) => current[index] || blankMember()))
  }
  function changeMember(index, field, value) {
    setMembers(current => current.map((member, memberIndex) => memberIndex === index ? { ...member, [field]: value } : member))
  }
  async function submit(event) {
    event.preventDefault()
    setBusy(true); setError('')
    try { setDone(await apiCall('/api/teams', 'POST', { schoolName, interestedMajor, members })) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  const closed = publicInfo?.closed
  return <div className="student-app workshop-app">
    <header className="student-hero workshop-hero"><div className="order-width hero-content"><div className="hero-brand"><div><p className="eyebrow">Rafik Hariri University</p><h1>High School Workshop</h1><p className="hero-subtitle">Explore engineering with MME.</p></div><div className="partner-logos" aria-label="RHU Robotics and Technology Club and ASME RHU Student Chapter"><img src={roboticsLogo} alt="RHU Robotics and Technology Club" /><img src={asmeLogo} alt="ASME Rafik Hariri University Student Chapter" /></div></div><Deadline value={publicInfo?.deadline} /></div></header>
    <main className="order-width student-main">{closed ? <section className="card orders-closed" role="status"><span className="closed-icon" aria-hidden="true">×</span><p className="welcome-kicker">Registration closed</p><h2>Workshop registration has ended.</h2><p>The registration deadline has passed. Please contact the workshop organizers if you need help.</p></section> : done ? <section className="card confirmation"><p className="eyebrow">Registration complete</p><h2>Your team is registered.</h2><p>We received registration for <strong>{done.members} {done.members === 1 ? 'student' : 'students'}</strong>. We look forward to seeing you at the workshop.</p></section> : <><section className="workshop-intro"><p className="welcome-kicker">High school workshop</p><h2>Bring your curiosity. Build your future.</h2><p>Register your team to take part in an engineering workshop with the Mechanical &amp; Mechatronics Engineering community at RHU.</p></section><form onSubmit={submit} noValidate><fieldset disabled={busy} className="order-flow"><section className="card form-section workshop-form"><h2><span className="step-number">01</span>Team details</h2><label htmlFor="school-name">High school name</label><input id="school-name" required value={schoolName} onChange={event => setSchoolName(event.target.value)} placeholder="e.g. Rafik Hariri High School" /><label htmlFor="interested-major">Interested major</label><input id="interested-major" required value={interestedMajor} onChange={event => setInterestedMajor(event.target.value)} placeholder="e.g. Mechatronics Engineering" /><label htmlFor="member-count">How many team members?</label><select id="member-count" value={memberCount} onChange={event => changeCount(event.target.value)}><option value="1">1 student</option><option value="2">2 students</option><option value="3">3 students</option></select></section><section className="card form-section member-section"><h2><span className="step-number">02</span>Team members</h2><p className="muted">Add the contact details for each student in your team.</p><div className="member-list">{members.map((member, index) => <fieldset className="member-card" key={index}><legend>Student {index + 1}</legend><label htmlFor={`member-${index}-name`}>Full name</label><input id={`member-${index}-name`} required value={member.name} onChange={event => changeMember(index, 'name', event.target.value)} /><label htmlFor={`member-${index}-email`}>Email</label><input id={`member-${index}-email`} required type="email" value={member.email} onChange={event => changeMember(index, 'email', event.target.value)} /><label htmlFor={`member-${index}-phone`}>Phone number</label><input id={`member-${index}-phone`} required type="tel" value={member.phone} onChange={event => changeMember(index, 'phone', event.target.value)} /></fieldset>)}</div></section><section className="card checkout-section"><p>By submitting, you register this team for the RHU MME high school workshop.</p>{error && <div className="msg err" role="alert">{error}</div>}<button className="submit-order">{busy ? 'Registering team…' : 'Register team'}</button></section></fieldset></form></>}</main>
  </div>
}