import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, Clock, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { roadmapAPI, progressAPI } from '../services/api'
import { EmptyState, LoadingScreen, PageContainer, PageIntro, SectionCard } from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const ProgressPage = () => {
  useDocumentMeta({
    title: 'Progress | NextStep AI',
    description: 'Track roadmap completion, current activity, and learning progress across the platform.',
    robots: 'noindex, follow',
  })

  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const { data } = await roadmapAPI.getAll()
      const roadmapsWithProgress = await Promise.all(
        data.map(async (roadmap) => {
          try {
            const progressResponse = await progressAPI.getRoadmapProgress(roadmap.id)
            const progressData = progressResponse.data?.node_progress || progressResponse.data || []
            return { ...roadmap, progress: Array.isArray(progressData) ? progressData : [] }
          } catch (error) {
            return { ...roadmap, progress: [] }
          }
        }),
      )
      setRoadmaps(roadmapsWithProgress)
    } catch (error) {
      toast.error('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (roadmap) => {
    if (!roadmap.nodes || roadmap.nodes.length === 0) return 0
    const completed = roadmap.progress?.filter((item) => item.status === 'completed').length || 0
    return Math.round((completed / roadmap.nodes.length) * 100)
  }

  if (loading) {
    return <LoadingScreen label="Loading progress data..." />
  }

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Learning progress"
        title="Track progress across every roadmap"
        description="Review how much you have completed, what is still active, and where momentum is building."
      />

      {roadmaps.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No progress yet" description="Start a roadmap to begin tracking your learning performance." />
      ) : (
        <div className="space-y-5">
          {roadmaps.map((roadmap, index) => {
            const progressPercent = calculateProgress(roadmap)
            const completed = roadmap.progress?.filter((item) => item.status === 'completed').length || 0
            const inProgress = roadmap.progress?.filter((item) => item.status === 'in_progress').length || 0
            const total = roadmap.nodes?.length || 0

            return (
              <motion.div key={roadmap.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                <SectionCard>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{roadmap.target_role}</h2>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Created {new Date(roadmap.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-4xl font-extrabold text-[var(--brand-blue)]">{progressPercent}%</p>
                      <p className="text-sm font-semibold text-[var(--text-muted)]">Completed</p>
                    </div>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--surface)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-lilac)]"
                    />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {[
                      { icon: CheckCircle, label: 'Completed', value: completed, tone: 'text-[var(--brand-green)]' },
                      { icon: Clock, label: 'In Progress', value: inProgress, tone: 'text-[var(--brand-orange)]' },
                      { icon: Award, label: 'Total Nodes', value: total, tone: 'text-[var(--brand-lilac)]' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1.4rem] bg-[var(--surface)] p-4">
                        <div className="flex items-center gap-3">
                          <item.icon size={18} className={item.tone} />
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-muted)]">{item.label}</p>
                            <p className="text-xl font-bold">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}

export default ProgressPage
