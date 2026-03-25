import { useState, useEffect, useCallback } from 'react'
import { db, ref, onValue, set } from './firebase'
import { groups, days } from './data'

const BASE = import.meta.env.BASE_URL

function getGroupDayCount(progress, gId) {
  return days.filter(d => progress?.[gId]?.[d.id]).length
}

// ─── Group Avatar ────────────────────────────────────────────────────────────

function GroupAvatar({ group, size = 20, border = 2, faded = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      border: `${border}px solid ${group.color}`,
      opacity: faded ? 0.35 : 1, transition: 'opacity 0.2s ease', flexShrink: 0
    }}>
      <img src={`${BASE}${group.photo}`} alt={group.label}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

// ─── Scripture Block ─────────────────────────────────────────────────────────

function ScriptureBlock({ scripture }) {
  const [expanded, setExpanded] = useState(false)
  const lines = scripture.text.split('\n')
  const preview = lines.slice(0, 3)
  const isLong = lines.length > 4
  const displayed = isLong && !expanded ? preview : lines

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#5a4e3c', fontFamily: 'var(--sans)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>📖</span> {scripture.ref}
      </div>
      <div style={{ background: '#fdfcf7', borderRadius: 10, padding: '14px 16px', borderLeft: '3px solid #d4c9a8', fontSize: 13.5, lineHeight: 1.75, color: '#3a3525', fontFamily: 'var(--serif)' }}>
        {displayed.map((v, i) => <p key={i} style={{ margin: '0 0 10px 0' }}>{v}</p>)}
        {isLong && (
          <button onClick={() => setExpanded(!expanded)} style={{ display: 'block', background: 'none', border: 'none', color: '#8b7a5e', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {expanded ? 'Collapse ↑' : 'Read full passage ↓'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Day Card ────────────────────────────────────────────────────────────────

function DayCard({ data, groupId, progress, onToggle }) {
  const [open, setOpen] = useState(false)
  const done = progress?.[groupId]?.[data.id]
  const group = groups.find(g => g.id === groupId)
  const accent = group?.color || '#6B5CA5'

  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: done ? `2px solid ${accent}66` : '2px solid #e8e4dc',
      marginBottom: 16, overflow: 'hidden',
      boxShadow: open ? `0 6px 28px ${accent}14` : '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease'
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', background: open ? `${accent}08` : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left'
      }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{data.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: accent, fontFamily: 'var(--sans)' }}>
            {data.day} · {data.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', fontFamily: 'var(--serif)', marginTop: 1, lineHeight: 1.3 }}>
            {data.theme}
          </div>
          {/* Group photo dots */}
          <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
            {groups.map(g => (
              <GroupAvatar key={g.id} group={g} size={22} border={2}
                faded={!progress?.[g.id]?.[data.id]} />
            ))}
          </div>
        </div>
        <span style={{
          fontSize: 20, color: accent,
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease', flexShrink: 0
        }}>›</span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 20px 16px', animation: 'fadeSlide 0.3s ease' }}>
          <div style={{ background: `${accent}0a`, borderRadius: 12, padding: '12px 14px', marginBottom: 14, borderLeft: `3px solid ${accent}44` }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, marginBottom: 5, fontFamily: 'var(--sans)' }}>Study Plan</div>
            <p style={{ fontSize: 13.5, color: '#3a3a50', lineHeight: 1.7, margin: 0, fontFamily: 'var(--sans)' }}>{data.studyPlanSummary}</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#7a6e58', marginBottom: 8, fontFamily: 'var(--sans)' }}>Scriptures</div>
            {data.scriptures.map((s, i) => <ScriptureBlock key={i} scripture={s} />)}
          </div>
          <div style={{ background: '#f8f5ee', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>💭</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#8b7a5e', marginBottom: 3, fontFamily: 'var(--sans)' }}>Ponder</div>
              <p style={{ fontSize: 13, color: '#4a4535', lineHeight: 1.65, margin: 0, fontFamily: 'var(--sans)' }}>{data.invitation}</p>
            </div>
          </div>
          {data.activity && (
            <>
              <div style={{ background: `${accent}0a`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: accent, marginBottom: 6, fontFamily: 'var(--sans)' }}>Activity</div>
                <p style={{ fontSize: 13.5, color: '#2a2a3e', lineHeight: 1.7, margin: 0, fontFamily: 'var(--sans)' }}>{data.activity}</p>
              </div>
              <div style={{ background: '#fafafa', borderRadius: 10, padding: '8px 12px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>✨</span>
                <p style={{ fontSize: 12.5, color: '#666', lineHeight: 1.6, margin: 0, fontFamily: 'var(--sans)' }}>
                  <strong style={{ color: '#444' }}>Bonus:</strong> {data.bonus}
                </p>
              </div>
            </>
          )}
          <button onClick={() => onToggle(data.id)} style={{
            width: '100%', padding: '12px 0', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)',
            fontWeight: 700, fontSize: 14, marginTop: 4,
            transition: 'all 0.2s ease',
            background: done ? accent : `${accent}15`,
            color: done ? '#fff' : accent
          }}>
            {done ? '✅ Completed!' : 'Mark as Done'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [groupId, setGroupId] = useState(() => {
    try { return localStorage.getItem('holyweek-group') || null } catch { return null }
  })
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const progressRef = ref(db, 'progress')
      const unsubscribe = onValue(progressRef, (snapshot) => {
        setProgress(snapshot.val() || {})
        setLoading(false)
      }, (err) => {
        console.error('Firebase error:', err)
        setError('Could not connect to Firebase. Check your config.')
        setLoading(false)
      })
      return () => unsubscribe()
    } catch (err) {
      console.error('Firebase setup error:', err)
      setError('Firebase config error. See README for setup instructions.')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (groupId) {
      try { localStorage.setItem('holyweek-group', groupId) } catch {}
    }
  }, [groupId])

  const handleToggle = useCallback(async (dayId) => {
    const newVal = !progress?.[groupId]?.[dayId]
    setProgress(prev => {
      const next = { ...prev }
      if (!next[groupId]) next[groupId] = {}
      next[groupId] = { ...next[groupId], [dayId]: newVal }
      return next
    })
    try {
      await set(ref(db, `progress/${groupId}/${dayId}`), newVal || null)
    } catch (err) { console.error('Write error:', err) }
  }, [groupId, progress])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 36 }}>✦</div>
        <div style={{ fontFamily: 'var(--sans)', color: '#888', fontSize: 14 }}>Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, color: '#1a1a2e', margin: '0 0 8px' }}>Connection Error</h2>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#888', lineHeight: 1.6, maxWidth: 320 }}>{error}</p>
      </div>
    )
  }

  // ─── Group Selection ─────────────────────────────────────────────────
  if (!groupId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✦</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px', textAlign: 'center' }}>
          Holy Week
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: '#a09888', margin: '0 0 32px', textAlign: 'center', fontStyle: 'italic' }}>
          Study Experience
        </p>
        <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map(g => {
            const count = getGroupDayCount(progress, g.id)
            return (
              <button key={g.id} onClick={() => setGroupId(g.id)} style={{
                padding: '14px 16px', borderRadius: 14, border: `2px solid ${g.color}22`,
                background: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 14, transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <GroupAvatar group={g} size={52} border={3} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{g.label}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#999', marginTop: 2 }}>
                    {count} / {days.length} days
                  </div>
                </div>
                <span style={{ fontSize: 18, color: '#ccc' }}>→</span>
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8FA89E' }} />
          <p style={{ fontSize: 11, color: '#8FA89E', fontFamily: 'var(--sans)', fontWeight: 600, margin: 0 }}>
            Live — synced across all devices
          </p>
        </div>
      </div>
    )
  }

  // ─── Main Tracker ────────────────────────────────────────────────────
  const myGroup = groups.find(g => g.id === groupId)

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '20px 16px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => { setGroupId(null); try { localStorage.removeItem('holyweek-group') } catch {} }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888', padding: '4px 8px' }}>←</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <GroupAvatar group={myGroup} size={32} border={2} />
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Holy Week</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#888' }}>{myGroup.label}</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, color: myGroup.color, background: `${myGroup.color}15`, padding: '4px 10px', borderRadius: 8 }}>
          {getGroupDayCount(progress, groupId)}/{days.length}
        </div>
      </div>

      {/* Family Progress Scoreboard */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 12 }}>
          Family Progress
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map(g => {
            const count = getGroupDayCount(progress, g.id)
            const pct = Math.round((count / days.length) * 100)
            const isMe = g.id === groupId
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GroupAvatar group={g} size={30} border={2} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: isMe ? 700 : 500, color: isMe ? '#1a1a2e' : '#666', marginBottom: 4 }}>
                    {g.label}
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: '#f0ece4', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: g.color, borderRadius: 4,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, color: '#888', minWidth: 32, textAlign: 'right' }}>
                  {count}/{days.length}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Cards */}
      {days.map(d => (
        <DayCard key={d.id} data={d} groupId={groupId} progress={progress} onToggle={handleToggle} />
      ))}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 24, padding: '16px 0', borderTop: '1px solid #ddd8d0' }}>
        <p style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, margin: 0, fontFamily: 'var(--sans)' }}>
          Based on the{' '}
          <a href="https://www.churchofjesuschrist.org/study/manual/easter-plan?lang=eng" target="_blank" rel="noopener noreferrer" style={{ color: myGroup.color }}>
            Holy Week Study Experience
          </a>
        </p>
      </div>
    </div>
  )
}
