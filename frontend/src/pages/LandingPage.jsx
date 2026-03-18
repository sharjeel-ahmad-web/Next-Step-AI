import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, CalendarDays, CheckCircle2, Globe2, Map, MoonStar, Sparkles, Target, TrendingUp, Users, FileText } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import LanguageSwitcher from '../components/LanguageSwitcher'

const LandingPage = () => {
  useDocumentMeta({
    title: 'NextStep AI | AI Roadmaps, Skill Gap Analysis, Certificates',
    description:
      'Help confused students understand what to learn, which skills are missing, how to become job ready, and how to study in their preferred language with matching videos.',
  })

  const features = [
    { icon: Target, title: 'Skill Gap Analysis', desc: 'Students upload their background, define a target role, and instantly see missing skills.' },
    { icon: Map, title: 'Guided Roadmaps', desc: 'Every roadmap breaks confusion into a sequence of practical lessons, skills, and milestones.' },
    { icon: Globe2, title: 'Language-Based Preparation', desc: 'Learners can prepare in a preferred language and fetch matching learning videos for that language.' },
    { icon: TrendingUp, title: 'Progress Visibility', desc: 'Track streaks, XP, completed skills, and what to study next without losing focus.' },
    { icon: Award, title: 'Verified Certificates', desc: 'Generate certificate-ready proof when roadmap milestones are completed successfully.' },
    { icon: Users, title: 'Engagement Loop', desc: 'Leaderboards, milestones, and clear next actions keep learners interested for longer.' },
  ]

  const highlights = [
    'Built for confused students who do not know what to learn first',
    'Useful for academies, institutes, bootcamps, and self-learners',
    'Responsive layout tuned for mobile, laptop, widescreen, and classroom displays',
  ]

  const trustPoints = [
    'Clear roadmap after every analysis',
    'Preparation language saved across the app',
    'Videos fetched according to selected learning language',
    'Progress-based certificate generation',
  ]

  const resumeTemplates = [
    ['Classic Serif', 'Finance, law, and polished leadership profiles', 'bg-[var(--brand-cream)]'],
    ['Tech Minimal', 'Software engineers, data roles, and startup teams', 'bg-[var(--brand-sky)]'],
    ['Creative Modern', 'Design, marketing, media, and portfolio-driven roles', 'bg-[var(--brand-orange)]/20'],
    ['Executive Bold', 'Director and C-suite applications with strong authority', 'bg-[var(--brand-charcoal)]/16'],
    ['Global Pro', 'Balanced international resume for cross-industry hiring', 'bg-[var(--brand-green)]/18'],
  ]

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="relative overflow-hidden pb-16">
      <div className="pointer-events-none absolute left-[-6rem] top-24 h-56 w-56 rounded-full bg-[var(--hero-orb)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-60 h-72 w-72 rounded-full bg-[var(--brand-lilac)]/20 blur-3xl" />

      <section className="px-3 pt-4 sm:px-5 lg:px-6">
        <div className="page-shell">
          <div className="surface-panel flex flex-col gap-4 rounded-[2rem] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--text-secondary)]">
              <span className="eyebrow">
                <Sparkles size={14} />
                Education-first AI platform
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-3 py-2">
                <CalendarDays size={15} />
                {today}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-10 pt-8 sm:px-5 sm:pt-10 lg:px-6 lg:pt-14">
        <div className="page-shell grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="space-y-6"
          >
            <span className="eyebrow">
              <MoonStar size={14} />
              Day and night mode included
            </span>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl">
                Students stop guessing. <span className="text-[var(--brand-orange)]">NextStep AI</span> shows what to learn, what is missing, and how to get job ready.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                This platform is built for learners who feel confused after joining a course, finishing videos, or
                trying to apply for jobs without a proper roadmap. Analyze your skills, generate a clear path,
                prepare in your chosen language, and stay engaged until certificate stage.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="btn-primary text-base sm:text-lg">
                Start Your Roadmap
                <ArrowRight size={18} />
              </Link>
              <Link to="/resume-builder" className="btn-secondary text-base sm:text-lg">
                Build International Resume
              </Link>
              <Link to="/login" className="btn-secondary text-base sm:text-lg">
                Open Learner Workspace
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4">
                    <p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
              <div className="absolute inset-x-8 top-0 h-24 rounded-b-[2rem] bg-[var(--brand-orange)]/10 blur-2xl" />
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Student journey</p>
                    <h2 className="mt-2 text-2xl font-bold">From confusion to confidence</h2>
                  </div>
                  <div className="rounded-full bg-[var(--brand-green)]/16 px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                    AdSense-ready content
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[
                    'var(--brand-lilac)',
                    'var(--brand-orange)',
                    'var(--brand-green)',
                    'var(--brand-sky)',
                    'var(--brand-charcoal)',
                    'var(--brand-blue)',
                  ].map((color, index) => (
                    <div
                      key={color}
                      className={`animate-float-y h-20 rounded-[1.4rem] shadow-lg ${index % 2 === 0 ? '' : '[animation-delay:1s]'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[var(--surface-strong)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-muted)]">Learner flow</p>
                    <p className="mt-2 text-3xl font-extrabold">Analyze to roadmap to job preparation</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[var(--brand-sky)] p-4 text-[var(--brand-charcoal)]">
                    <p className="text-sm font-semibold opacity-75">Language support</p>
                    <p className="mt-2 text-3xl font-extrabold">Study in your preferred language</p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-muted)]">Why students stay engaged</p>
                      <p className="mt-1 text-xl font-bold">The interface keeps the next step visible</p>
                    </div>
                    <span className="rounded-full bg-[var(--brand-cream)] px-3 py-2 text-sm font-bold text-[var(--brand-charcoal)]">
                      2026 UX
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      ['Missing skills', 'Visible after analysis'],
                      ['Learning language', 'Saved across sessions'],
                      ['Certificate issuance', 'Generated from progress'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-2xl bg-[var(--surface-elevated)] px-4 py-3">
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">{label}</span>
                        <span className="text-sm font-extrabold text-[var(--text-primary)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 lg:px-6">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-3">
              <span className="eyebrow">Core capabilities</span>
              <h2 className="max-w-3xl text-3xl font-extrabold sm:text-4xl">Everything a confused learner needs to move from course enrollment to job preparation.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">
              The product message is simple: understand your goal, identify the missing skills, follow a roadmap, learn in a chosen language, and prove progress with certificates.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card group"
              >
                <div className="mb-5 inline-flex rounded-[1.2rem] bg-[var(--surface-strong)] p-3 text-[var(--brand-blue)]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-base leading-7 text-[var(--text-secondary)]">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 lg:px-6">
        <div className="page-shell grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionBlock
            eyebrow="Why this app matters"
            title="Most students are not lazy. They are directionless."
            description="They finish random tutorials, collect incomplete knowledge, and still do not know whether they are job ready. NextStep AI solves that by turning learning into an understandable path."
          />

          <div className="glass-card rounded-[2rem]">
            <div className="grid gap-3 md:grid-cols-2">
              {trustPoints.map((item) => (
                <div key={item} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 text-[var(--brand-green)]" size={18} />
                    <p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 lg:px-6">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-3">
              <span className="eyebrow">Resume builder</span>
              <h2 className="max-w-3xl text-3xl font-extrabold sm:text-4xl">Create an international resume, improve an old CV, and export it in a professional design.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">
              Users can paste a short prompt or upload an existing resume, let AI improve it, compare old vs new content, and choose from five professional layouts.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {resumeTemplates.map(([title, desc, accent], index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="glass-card group"
              >
                <div className={`mb-4 h-20 rounded-[1.4rem] ${accent}`} />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{desc}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <span className="eyebrow">
                <FileText size={14} />
                Resume preview
              </span>
              <h3 className="text-3xl font-extrabold sm:text-4xl">A polished resume becomes part of the learning journey, not an afterthought.</h3>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                Learners can improve an old resume, compare weak content with AI-enhanced content, and export a cleaner international format while they are still building skills.
              </p>
            </div>

            <div className="glass-card rounded-[2rem]">
              <div className="rounded-[1.6rem] border border-[var(--border-soft)] bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-2xl font-extrabold">Ali Hassan</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Frontend Developer | React | UI Systems</p>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Summary</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Results-focused frontend developer with experience building responsive interfaces, improving usability, and shipping production-ready dashboard features.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['React', 'Tailwind CSS', 'APIs', 'JavaScript', 'UI Testing'].map((item) => (
                        <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Experience</p>
                    <div className="mt-2 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-bold">Frontend Developer - Semsons</p>
                      <p className="mt-1 text-xs text-slate-500">Jan 2023 - Present</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Spearheaded reusable dashboard UI development, reducing delivery time by [ADD METRIC] and improving consistency across product screens.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/resume-builder" className="btn-primary">
              Build International Resume
            </Link>
            <Link to="/register" className="btn-secondary">
              Start With Account
            </Link>
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 lg:px-6">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-[2.2rem] px-5 py-8 sm:px-8 lg:px-10"
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <span className="eyebrow">Launch your learning ecosystem</span>
                <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to give learners a roadmap they can actually follow?</h2>
                <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                  NextStep AI is designed to remove confusion, improve engagement, and present enough meaningful content and trust pages for a stronger production launch.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link to="/register" className="btn-primary">
                  Create Account
                </Link>
                <Link to="/login" className="btn-secondary">
                  Open Platform
                </Link>
                <Link to="/resume-builder" className="btn-secondary">
                  Build International Resume
                </Link>
                <Link to="/contact" className="btn-secondary">
                  Contact Team
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="px-3 pb-8 pt-2 sm:px-5 lg:px-6">
        <div className="page-shell flex flex-col gap-3 rounded-[1.6rem] border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-5 text-sm font-semibold text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>Roadmap-based learning platform for students, institutes, and job-focused self-learners.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const SectionBlock = ({ eyebrow, title, description }) => (
  <div className="space-y-4">
    <span className="eyebrow">{eyebrow}</span>
    <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
    <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)]">{description}</p>
  </div>
)

export default LandingPage
