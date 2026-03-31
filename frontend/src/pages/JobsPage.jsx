import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { MapPin, RefreshCcw, Compass, Satellite, Sparkles, Clock3, Target, BadgeCheck, Filter, PlusCircle, Send } from 'lucide-react'
import { jobsAPI, profileAPI } from '../services/api'
import useAuthStore from '../store/authStore'

const palette = ['#60a5fa', '#22d3ee', '#fbbf24', '#f472b6', '#c084fc', '#34d399']

const distanceKm = (a, b) => {
  if (!a || !b) return null
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav))
  return Math.round(R * c)
}

const MapCanvas = ({ jobs, userLocation }) => {
  const markers = (jobs || []).slice(0, 12).map((job, idx) => {
    const lat = Number(job.lat ?? 0)
    const lng = Number(job.lng ?? 0)
    const point = {
      x: ((lng + 180) / 360) * 100,
      y: ((90 - lat) / 180) * 100,
    }
    return { ...job, point, color: palette[idx % palette.length] }
  })

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface-strong)] to-[var(--brand-charcoal)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.2),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(244,114,182,0.18),transparent_30%)]" />
      <AnimatePresence>
        {markers.map((marker) => (
          <motion.div
            key={marker._id || marker.job_url || marker.title + marker.company}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute flex items-center gap-2"
            style={{
              left: `${marker.point.x}%`,
              top: `${marker.point.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="h-3 w-3 rounded-full shadow-lg"
              style={{ background: marker.color, boxShadow: `0 0 0 8px ${marker.color}30` }}
            />
            <div className="hidden rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur sm:flex">
              {marker.company}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {userLocation && (
        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
          style={{ zIndex: 5 }}
        >
          <div className="h-4 w-4 rounded-full bg-[var(--brand-green)] shadow-lg" />
          <span className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            You are here
          </span>
        </div>
      )}
    </div>
  )
}

const JobCard = ({ job, distance }) => (
  <motion.div
    layout
    className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-soft)]"
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--brand-sky)]/15 px-3 py-1 text-xs font-bold text-[var(--brand-sky-dark)]">
            {job.domain || 'Role match'}
          </span>
          {job.match_score !== undefined && (
            <span className="rounded-full bg-[var(--brand-green)]/15 px-3 py-1 text-xs font-bold text-[var(--brand-green-dark)]">
              {job.match_score}% match
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-bold text-[var(--text-primary)]">{job.title}</h3>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{job.company}</p>
      </div>
      <div className="flex flex-col items-end gap-2 text-right">
        {distance !== null && <div className="text-xs font-semibold text-[var(--text-secondary)]">{distance} km away</div>}
        <div className="rounded-lg bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text-muted)]">
          {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Fresh'}
        </div>
      </div>
    </div>
    <p className="mt-3 line-clamp-3 text-sm text-[var(--text-secondary)]">{job.description || 'No description provided'}</p>

    <div className="mt-4 flex flex-wrap gap-2">
      {(job.skills || []).slice(0, 6).map((skill) => (
        <span key={skill} className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          {skill}
        </span>
      ))}
      {job.source && (
        <span className="rounded-full bg-[var(--brand-charcoal)]/10 px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
          {job.source.toUpperCase()}
        </span>
      )}
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <a
        href={job.job_url || '#'}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-bold text-[var(--brand-sky-dark)] transition hover:underline"
      >
        View details →
      </a>
      <JobApplyButton jobId={job._id} />
    </div>
  </motion.div>
)

const JobApplyButton = ({ jobId }) => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ cover_note: '', resume_url: '' })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      await jobsAPI.apply(jobId, form)
      toast.success('Application submitted')
      setOpen(false)
      setForm({ cover_note: '', resume_url: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Apply failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn-secondary" onClick={() => setOpen((v) => !v)}>
        <Send className="h-4 w-4" />
        Apply
      </button>
      {open && (
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)]">
          <textarea
            className="input"
            rows="3"
            placeholder="Cover note (optional)"
            value={form.cover_note}
            onChange={(e) => setForm({ ...form, cover_note: e.target.value })}
          />
          <input
            className="input mt-2"
            placeholder="Resume URL (optional)"
            value={form.resume_url}
            onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
const JobsPage = () => {
  const { user, setUser } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [nearbyJobs, setNearbyJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const userLocation = user?.location
  const [manual, setManual] = useState({ lat: '', lng: '' })
  const [showManual, setShowManual] = useState(false)
  const [locationText, setLocationText] = useState('')
  const [filters, setFilters] = useState({ q: '', source: '', min_match: '', max_age_days: '' })
  const [showPostForm, setShowPostForm] = useState(false)
  const [postJob, setPostJob] = useState({
    title: '',
    company: '',
    description: '',
    location_text: '',
    job_url: '',
    domain: '',
  })

  const loadJobs = async () => {
    try {
      setLoading(true)
      const [all, near] = await Promise.all([
        jobsAPI.list(filters),
        jobsAPI.nearby().catch(() => ({ data: { jobs: [] } })),
      ])
      setJobs(all.data || [])
      setNearbyJobs(near.data?.jobs || [])
    } catch (error) {
      toast.error('Jobs load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const handleFetchLatest = async () => {
    try {
      setFetching(true)
      const payload = {}
      if (locationText.trim()) {
        payload.location_text = locationText.trim()
      }
      await jobsAPI.fetchLatest(payload)
      toast.success('Latest jobs fetched')
      await loadJobs()
    } catch (error) {
      toast.error('Fetching failed — check API keys or network')
    } finally {
      setFetching(false)
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }

    // If permission was previously denied, guide the user to unblock.
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          toast.error('Location blocked in browser. Unblock for this site, then click again.')
        }
      })
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          await profileAPI.saveLocation(coords)
          setUser({ ...user, location: coords })
          toast.success('Location saved — now fetch nearby jobs')
          await loadJobs()
        } catch (error) {
          toast.error('Could not save location')
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Permission denied. Allow location for this site and try again.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error('Location unavailable. Try again or use manual entry.')
        } else {
          toast.error('Location error. Try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  }

  const handleManualSave = async () => {
    if (!manual.lat || !manual.lng) {
      toast.error('Enter both latitude and longitude')
      return
    }
    const coords = { lat: Number(manual.lat), lng: Number(manual.lng) }
    try {
      await profileAPI.saveLocation(coords)
      setUser({ ...user, location: coords })
      toast.success('Location saved manually')
      await loadJobs()
      setShowManual(false)
    } catch (error) {
      toast.error('Could not save manual location')
    }
  }

  const jobsWithDistance = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        distance:
          userLocation && job.lat && job.lng
            ? distanceKm(userLocation, { lat: Number(job.lat), lng: Number(job.lng) })
            : null,
      })),
    [jobs, userLocation],
  )

  return (
    <div className="page-shell space-y-8 py-10">
      <div className="rounded-3xl border border-[var(--border-strong)] bg-gradient-to-r from-[var(--brand-charcoal)] via-[#0f172a] to-[var(--brand-sky-dark)] p-[1px] shadow-[var(--shadow-strong)]">
        <div className="rounded-[22px] bg-[var(--surface-elevated)]/80 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">Fresh Grad Launchpad</p>
              <h1 className="mt-3 text-3xl font-[var(--font-heading)] font-black leading-tight text-[var(--text-primary)] sm:text-4xl">
                Learning-to-Job cockpit — fetch roles, map companies, and apply faster.
              </h1>
              <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
                We turn your resume signals into live job leads, score them against your skills, and spotlight companies around you. No hunting,
                just straight-to-apply momentum.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                <span className="badge-soft"><Sparkles size={14} />AI-curated roles</span>
                <span className="badge-soft"><Compass size={14} />Location-aware</span>
                <span className="badge-soft"><BadgeCheck size={14} />Industry-ready</span>
              </div>
            </div>
            <div className="grid w-full max-w-sm gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Location (city/state/country for search)
                <input
                  type="text"
                  placeholder="e.g., San Francisco, CA, USA"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="input mt-2"
                />
              </label>
              <button
                type="button"
                onClick={handleFetchLatest}
                disabled={fetching}
                className="btn-primary"
              >
                <RefreshCcw className="h-4 w-4" />
                {fetching ? 'Fetching…' : 'Fetch latest jobs'}
              </button>
              <button
                type="button"
                onClick={handleLocateMe}
                className="btn-secondary"
              >
                <MapPin className="h-4 w-4" />
                Use my location
              </button>
              <button
                type="button"
                onClick={() => setShowManual((v) => !v)}
                className="btn-secondary"
              >
                <Compass className="h-4 w-4" />
                Enter location manually
              </button>
              {showManual && (
                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-3 space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">Manual coordinates</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      className="input"
                      value={manual.lat}
                      onChange={(e) => setManual({ ...manual, lat: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      className="input"
                      value={manual.lng}
                      onChange={(e) => setManual({ ...manual, lng: e.target.value })}
                    />
                  </div>
                  <button type="button" className="btn-primary w-full" onClick={handleManualSave}>
                    Save location
                  </button>
                </div>
              )}
              <div className="rounded-xl bg-[var(--surface-strong)] p-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <Satellite size={16} />
                  Live status
                </div>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>Jobs loaded: {jobs.length}</li>
                  <li>Nearby matches: {nearbyJobs.length}</li>
                  <li>Location set: {userLocation ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Filter size={16} />
                Filters
              </div>
              <div className="grid gap-2">
                <input
                  className="input"
                  placeholder="Keyword or company"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="input"
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  >
                    <option value="">Any source</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="adzuna">Adzuna</option>
                    <option value="jsearch">JSearch</option>
                    <option value="arbeitnow">Arbeitnow</option>
                    <option value="internal">User listed</option>
                  </select>
                  <select
                    className="input"
                    value={filters.max_age_days}
                    onChange={(e) => setFilters({ ...filters, max_age_days: e.target.value })}
                  >
                    <option value="">Any age</option>
                    <option value="2">Last 2 days</option>
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="input"
                    placeholder="Min match %"
                    value={filters.min_match}
                    onChange={(e) => setFilters({ ...filters, min_match: e.target.value })}
                  />
                  <button type="button" className="btn-secondary" onClick={loadJobs}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => setShowPostForm((v) => !v)}
              >
                <PlusCircle className="h-4 w-4" />
                {showPostForm ? 'Close job form' : 'Post a job (manual)'}
              </button>
              {showPostForm && (
                <div className="mt-3 space-y-2">
                  <input
                    className="input"
                    placeholder="Job title"
                    value={postJob.title}
                    onChange={(e) => setPostJob({ ...postJob, title: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Company"
                    value={postJob.company}
                    onChange={(e) => setPostJob({ ...postJob, company: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Location (city/state/country)"
                    value={postJob.location_text}
                    onChange={(e) => setPostJob({ ...postJob, location_text: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Job URL (optional)"
                    value={postJob.job_url}
                    onChange={(e) => setPostJob({ ...postJob, job_url: e.target.value })}
                  />
                  <textarea
                    className="input"
                    placeholder="Short description"
                    rows="3"
                    value={postJob.description}
                    onChange={(e) => setPostJob({ ...postJob, description: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={async () => {
                      if (!postJob.title || !postJob.company || !postJob.description || !postJob.location_text) {
                        toast.error('Fill required fields')
                        return
                      }
                      try {
                        await jobsAPI.create(postJob)
                        toast.success('Job posted')
                        setShowPostForm(false)
                        setPostJob({ title: '', company: '', description: '', location_text: '', job_url: '', domain: '' })
                        await loadJobs()
                      } catch (err) {
                        toast.error('Posting failed')
                      }
                    }}
                  >
                    Publish job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Job Feed</p>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Matched roles for you</h2>
            </div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <Clock3 size={14} /> Auto-pruning stale jobs (30 days)
            </div>
          </div>

          <div className="grid gap-4">
            <AnimatePresence>
              {loading ? (
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-[var(--text-secondary)]">
                  Loading jobs…
                </div>
              ) : jobsWithDistance.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-[var(--text-secondary)]">
                  No jobs yet. Fetch latest to populate your feed.
                </div>
              ) : (
                jobsWithDistance.map((job) => <JobCard key={job._id || job.job_url} job={job} distance={job.distance} />)
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Nearby Companies</p>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Map radar</h3>
              </div>
              <Target className="text-[var(--brand-sky-dark)]" size={18} />
            </div>
            <div className="mt-4">
              <MapCanvas jobs={nearbyJobs} userLocation={userLocation} />
            </div>
            <div className="mt-4 space-y-2">
              {(nearbyJobs || []).slice(0, 5).map((job, idx) => (
                <div key={job._id || idx} className="flex items-center justify-between rounded-xl bg-[var(--surface)] px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{job.company}</p>
                    <p className="text-xs text-[var(--text-muted)]">{job.title}</p>
                  </div>
                  <span className="rounded-full bg-[var(--surface-strong)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
                    {job.lat && userLocation ? `${distanceKm(userLocation, { lat: job.lat, lng: job.lng })} km` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <BadgeCheck size={16} className="text-[var(--brand-green)]" />
              How to get hired faster
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>• Keep your resume updated (use Resume Builder) so matches stay accurate.</li>
              <li>• Set location once; nearby map pulls higher-priority leads.</li>
              <li>• Re-fetch daily; jobs older than 48h are trimmed automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobsPage
