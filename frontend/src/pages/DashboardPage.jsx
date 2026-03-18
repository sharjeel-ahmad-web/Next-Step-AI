import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Map, TrendingUp, Award, Zap, Calendar, ArrowRight, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { gamificationAPI, roadmapAPI } from '../services/api'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, roadmapsResponse] = await Promise.all([gamificationAPI.getStats(), roadmapAPI.getAll()])
        setStats(statsResponse.data)
        setRoadmaps(roadmapsResponse.data)
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
      { icon: Target, title: 'Analyze Skills', desc: 'Upload a resume and identify learning gaps.', link: '/analyze', tone: 'orange' },
      { icon: FileText, title: 'Resume Builder', desc: 'Generate an ATS-focused international resume from a prompt or old CV.', link: '/resume-builder', tone: 'blue' },
      { icon: Map, title: 'Roadmaps', desc: 'Open your guided learning paths.', link: '/roadmaps', tone: 'lilac' },
      { icon: TrendingUp, title: 'Progress', desc: 'Track completion and current momentum.', link: '/progress', tone: 'green' },
      { icon: Award, title: 'Certificates', desc: 'Review and export earned certificates.', link: '/certificates', tone: 'blue' },
    ],
    [],
  )

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

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Zap} label="Total XP" value={stats?.xp || 0} tone="orange" detail="Gamified progress across your roadmap work." />
        <StatCard icon={TrendingUp} label="Current Level" value={stats?.level || 1} tone="blue" detail="Your current learner rank." />
        <StatCard icon={Map} label="Active Roadmaps" value={roadmaps.length} tone="green" detail="Paths currently available to continue." />
        <StatCard icon={Calendar} label="Day Streak" value={stats?.streak || 0} tone="lilac" detail="Consistency tracked day by day." />
      </div>

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
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Weekly focus</p>
          <h2 className="mt-2 text-2xl font-bold">Build job-ready habits</h2>
          <div className="mt-5 space-y-3">
            {[
              ['Revision first', 'Repeat one weak skill before starting a completely new topic'],
              ['Project proof', 'Turn roadmap skills into at least one portfolio-ready task every week'],
              ['Interview readiness', 'Use resume builder after each roadmap milestone to reflect real improvement'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

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

      <SectionCard className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">Professional path</p>
          <h2 className="mt-2 text-2xl font-bold">How this app helps you become job ready</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['1. Find the gap', 'Analyze your current skill level against a real target role.'],
            ['2. Learn with order', 'Follow a roadmap instead of random videos and disconnected tutorials.'],
            ['3. Validate knowledge', 'Use quizzes, repetition, and progress tracking to reduce weak points.'],
            ['4. Present yourself', 'Update your resume with stronger achievements and apply with more confidence.'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  )
}

export default DashboardPage
