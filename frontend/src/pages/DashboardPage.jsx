import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Map, TrendingUp, Award, Zap, Calendar, ArrowRight, FileText, Briefcase, Compass } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { gamificationAPI, roadmapAPI, jobsAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro, SectionCard, StatCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLearningLanguage } from '../components/LanguageProvider'

const DashboardPage = () => {
  const { language } = useLearningLanguage()

  useDocumentMeta({
    title: 'Dashboard | NextStep AI',
    description: 'Review your education progress, active roadmaps, XP, and quick actions in one dashboard.',
    robots: 'noindex, follow',
  })

  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [roadmaps, setRoadmaps] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, roadmapsResponse, jobsResponse] = await Promise.all([
          gamificationAPI.getStats(),
          roadmapAPI.getAll(),
          jobsAPI.list().catch(() => ({ data: [] })),
        ])
        setStats(statsResponse.data)
        setRoadmaps(roadmapsResponse.data)
        setJobs(jobsResponse.data || [])
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickActions = useMemo(
    () => [
      { icon: Target, title: 'Analyze skills', desc: 'Upload a resume and find gaps.', link: '/analyze', tone: 'orange' },
      { icon: Map, title: 'Open roadmap', desc: 'Jump back into your path.', link: '/roadmaps', tone: 'blue' },
      { icon: Briefcase, title: 'Find jobs', desc: 'Fetch roles near you.', link: '/jobs', tone: 'green' },
      { icon: Award, title: 'Download certificate', desc: 'Export and share proof.', link: '/certificates', tone: 'green' },
    ],
    [],
  )

  const primaryNextAction = useMemo(() => {
    if (roadmaps.length > 0) {
      return { label: 'Continue roadmap', link: `/roadmap/${roadmaps[0].id}` }
    }
    return { label: 'Start with skill analysis', link: '/analyze' }
  }, [roadmaps])

  if (loading) {
    return <LoadingScreen label="Loading your dashboard..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Learner dashboard"
        title={`Welcome back, ${user?.name || 'Learner'}`}
        description={`Review your roadmap activity, current streak, and the fastest next actions. Your preparation language is set to ${language.label}.`}
        actions={<LanguageSwitcher />}
      />

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Zap} label="XP" value={stats?.xp || 0} tone="orange" detail="Total earned" />
        <StatCard icon={Map} label="Active roadmaps" value={roadmaps.length} tone="green" detail="Keep momentum" />
        <StatCard icon={Calendar} label="Day streak" value={stats?.streak || 0} tone="lilac" detail="Consistency" />
      </div>

      <SectionCard className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Next action</p>
            <h2 className="mt-2 text-2xl font-bold">Stay on track</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">One clear step to move forward.</p>
          </div>
          <Link to={primaryNextAction.link} className="btn-primary">
            {primaryNextAction.label}
          </Link>
        </div>
      </SectionCard>

      <div className="mb-8 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Quick actions</p>
              <h2 className="mt-2 text-2xl font-bold">What do you want to do next?</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <motion.div key={action.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                <Link to={action.link} className="block rounded-[1.6rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition hover:-translate-y-1 hover:border-[var(--border-strong)]">
                  <div className={`mb-4 inline-flex rounded-2xl p-3 ${
                    action.tone === 'orange'
                      ? 'bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]'
                      : action.tone === 'lilac'
                        ? 'bg-[var(--brand-lilac)]/15 text-[var(--brand-lilac)]'
                        : action.tone === 'green'
                          ? 'bg-[var(--brand-green)]/15 text-[var(--brand-green)]'
                          : 'bg-[var(--brand-blue)]/12 text-[var(--brand-blue)]'
                  }`}>
                    <action.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Quick actions</p>
          <h2 className="mt-2 text-2xl font-bold">Pick one and go</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <motion.div key={action.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                <Link to={action.link} className="block rounded-[1.6rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition hover:-translate-y-1 hover:border-[var(--border-strong)]">
                  <div
                    className={`mb-4 inline-flex rounded-2xl p-3 ${
                      action.tone === 'orange'
                        ? 'bg-[var(--brand-orange)]/12 text-[var(--brand-orange)]'
                        : action.tone === 'green'
                          ? 'bg-[var(--brand-green)]/15 text-[var(--brand-green)]'
                          : 'bg-[var(--brand-blue)]/12 text-[var(--brand-blue)]'
                    }`}
                  >
                    <action.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Job matches</p>
            <h2 className="mt-2 text-2xl font-bold">Fresh roles for you</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">AI-scored against your resume. Fetch more anytime.</p>
          </div>
          <Link to="/jobs" className="btn-secondary">
            Open Jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Tap the fetch button on Jobs page to pull fresh roles."
            action={
              <Link to="/jobs" className="btn-primary">
                Go to Jobs
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {jobs.slice(0, 3).map((job, idx) => (
              <div
                key={job._id || idx}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{job.domain || 'Role match'}</p>
                    <h3 className="mt-1 text-lg font-bold">{job.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{job.company}</p>
                  </div>
                  {job.match_score !== undefined && (
                    <span className="rounded-full bg-[var(--brand-green)]/15 px-3 py-1 text-xs font-bold text-[var(--brand-green)]">
                      {job.match_score}% match
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Compass size={14} />
                  <span>{job.location?.city || job.location?.address || 'Location pending'}</span>
                </div>
                <Link to="/jobs" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)]">
                  View details
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Recent roadmaps</p>
            <h2 className="mt-2 text-2xl font-bold">Continue where you left off</h2>
          </div>
          <Link to="/roadmaps" className="btn-secondary">
            View All
          </Link>
        </div>

        {roadmaps.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No roadmaps yet"
            description="Start with skill analysis and generate your first roadmap."
            action={
              <Link to="/analyze" className="btn-primary">
                Create Your First Roadmap
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roadmaps.slice(0, 3).map((roadmap, index) => (
              <motion.div key={roadmap.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                <Link to={`/roadmap/${roadmap.id}`} className="block rounded-[1.6rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 transition hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{roadmap.target_role}</h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Created {new Date(roadmap.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--brand-sky)] px-3 py-2 text-xs font-bold text-[var(--brand-charcoal)]">
                      {roadmap.nodes?.length || 0} Skills
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[var(--brand-blue)]">
                    <span>Open roadmap</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Removed extra educational blocks to keep the dashboard lightweight and focused on next actions. */}
    </PageContainer>
  )
}

export default DashboardPage
