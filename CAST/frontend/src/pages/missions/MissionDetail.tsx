import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { MISSION_CONTENT } from '@/data/missions'
import { useAppStore } from '@/store/useAppStore'
import { getApi } from '@/lib/api'
import { ShieldAlert, ChevronRight, ArrowLeft, CheckCircle2, XCircle, Zap, BookOpen, Trophy } from 'lucide-react'

type Stage = 'brief' | 'slides' | 'quiz' | 'debrief'

export function MissionDetail() {
  const { missionId = '' } = useParams()
  const navigate = useNavigate()
  const refreshAll = useAppStore((s) => s.refreshAll)
  const content = MISSION_CONTENT[missionId]

  const [stage, setStage] = useState<Stage>('brief')
  const [slideIdx, setSlideIdx] = useState(0)
  const [quizIdx, setQuizIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [result, setResult] = useState<{ score: number; total: number; pct: number } | null>(null)

  if (!content) {
    return (
      <div className="mx-auto max-w-lg text-center mt-20">
        <ShieldAlert size={40} className="mx-auto text-danger" />
        <p className="mt-4 text-muted">Mission content not found.</p>
        <Button className="mt-4" onClick={() => navigate('/learning-path')}>Back to Map</Button>
      </div>
    )
  }

  const currentQ = content.quiz[quizIdx]
  const currentSlide = content.slides[slideIdx]
  const isCorrect = selectedAnswer === currentQ?.correctIndex

  function handleAnswer(optIdx: number) {
    if (answered) return
    setSelectedAnswer(optIdx)
    setAnswered(true)
    if (optIdx === currentQ.correctIndex) {
      setCorrectCount((c) => c + 1)
    }
  }

  async function advanceQuiz() {
    setSelectedAnswer(null)
    setAnswered(false)
    if (quizIdx + 1 < content.quiz.length) {
      setQuizIdx((i) => i + 1)
    } else {
      const finalCorrect = correctCount
      const total = content.quiz.length
      const pct = Math.round((finalCorrect / total) * 100)
      setResult({ score: finalCorrect, total, pct })
      await getApi().complete_mission(missionId, pct)
      await refreshAll()
      setStage('debrief')
    }
  }

  // ─── BRIEF STAGE ─────────────────────────────────────
  if (stage === 'brief') {
    return (
      <div className="mx-auto max-w-2xl">
        <button onClick={() => navigate('/learning-path')} className="flex items-center gap-1 text-xs font-mono text-slate-light hover:text-teal transition mb-6 cursor-pointer">
          <ArrowLeft size={14} /> MISSION MAP
        </button>

        <div className="relative border border-teal/10 bg-[#1E1F22]/60 backdrop-blur-md rounded-lg p-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(63,125,119,0.08)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.04)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-teal/50 uppercase">
              <ShieldAlert size={12} /> MISSION BRIEFING
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">
              {content.id.replace(/^m\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>

            <p className="mt-2 text-sm font-mono text-teal/70 italic">
              "{content.briefTagline}"
            </p>

            <p className="mt-6 text-sm text-slate-light leading-relaxed">
              {content.brief}
            </p>

            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="text-[10px] font-mono text-teal/40 uppercase tracking-wider mb-2">Learning Objectives</div>
              <ul className="space-y-1.5">
                {content.learningGoals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-light">
                    <span className="text-teal mt-0.5">▸</span> {g}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="mt-8 w-full" onClick={() => setStage('slides')}>
              <BookOpen size={15} /> Start Training
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── SLIDES STAGE ────────────────────────────────────
  if (stage === 'slides') {
    return (
      <div className="mx-auto max-w-2xl">
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {content.slides.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slideIdx ? 'w-8 bg-teal' : i < slideIdx ? 'w-4 bg-teal/50' : 'w-4 bg-white/10'
              }`} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-slate-light">
            {slideIdx + 1} / {content.slides.length}
          </span>
        </div>

        <div className="border border-teal/10 bg-[#1E1F22]/60 backdrop-blur-md rounded-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(63,125,119,0.06)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-[#EFEDE6]">{currentSlide.title}</h2>
            <p className="mt-4 text-sm text-slate-light leading-relaxed">{currentSlide.body}</p>

            {currentSlide.example && (
              <div className="mt-4 rounded-md border border-teal/10 bg-teal/5 p-4">
                <div className="text-[9px] font-mono text-teal/50 uppercase tracking-wider mb-1">Real-World Example</div>
                <p className="text-xs text-slate-light italic leading-relaxed">{currentSlide.example}</p>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2 rounded-md border border-teal/20 bg-teal/5 p-3">
              <Zap size={14} className="text-teal shrink-0 mt-0.5" />
              <p className="text-xs text-teal font-medium">{currentSlide.rule}</p>
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                variant="secondary"
                onClick={() => slideIdx > 0 ? setSlideIdx(slideIdx - 1) : setStage('brief')}
              >
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={() => {
                if (slideIdx + 1 < content.slides.length) {
                  setSlideIdx(slideIdx + 1)
                } else {
                  setStage('quiz')
                }
              }}>
                {slideIdx + 1 < content.slides.length ? (
                  <>Got it <ChevronRight size={14} /></>
                ) : (
                  <>Start Quiz <ChevronRight size={14} /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── QUIZ STAGE ──────────────────────────────────────
  if (stage === 'quiz') {
    return (
      <div className="mx-auto max-w-2xl">
        {/* Score header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {content.quiz.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i === quizIdx ? 'w-8 bg-teal' : i < quizIdx ? 'w-4 bg-teal/50' : 'w-4 bg-white/10'
              }`} />
            ))}
          </div>
          <span className="text-[10px] font-mono text-teal/60 tracking-wider">
            Q{quizIdx + 1} / {content.quiz.length} · {correctCount} correct
          </span>
        </div>

        <div className="border border-teal/10 bg-[#1E1F22]/60 backdrop-blur-md rounded-lg p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-[10px] font-mono text-teal/40 uppercase tracking-wider mb-3">Challenge Question</div>
            <h2 className="text-lg font-semibold text-[#EFEDE6] leading-snug">{currentQ.question}</h2>

            <div className="mt-6 flex flex-col gap-2.5">
              {currentQ.options.map((opt, oi) => {
                let optClass = 'border-white/10 bg-white/5 hover:border-teal/30 hover:bg-teal/5'
                if (answered) {
                  if (oi === currentQ.correctIndex) optClass = 'border-teal bg-teal/10 text-teal'
                  else if (oi === selectedAnswer) optClass = 'border-danger bg-danger/10 text-danger'
                  else optClass = 'border-white/5 bg-white/[0.02] opacity-50'
                } else if (selectedAnswer === oi) {
                  optClass = 'border-teal bg-teal/10'
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleAnswer(oi)}
                    disabled={answered}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer disabled:cursor-default ${optClass}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-mono shrink-0">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && oi === currentQ.correctIndex && <CheckCircle2 size={16} className="text-teal shrink-0" />}
                    {answered && oi === selectedAnswer && oi !== currentQ.correctIndex && <XCircle size={16} className="text-danger shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Feedback panel */}
            {answered && (
              <div className={`mt-5 rounded-lg border p-4 transition-all duration-300 ${
                isCorrect ? 'border-teal/20 bg-teal/5' : 'border-danger/20 bg-danger/5'
              }`}>
                <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-teal' : 'text-danger'}`}>
                  {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {isCorrect ? 'Correct!' : 'Not quite.'}
                </div>
                <p className="mt-2 text-xs text-slate-light leading-relaxed">{currentQ.explain}</p>
              </div>
            )}

            {answered && (
              <Button className="mt-6 w-full" onClick={advanceQuiz}>
                {quizIdx + 1 < content.quiz.length ? (
                  <>Next Question <ChevronRight size={14} /></>
                ) : (
                  <>See Results <Trophy size={14} /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── DEBRIEF STAGE ───────────────────────────────────
  if (stage === 'debrief' && result) {
    const passed = result.pct >= 70
    return (
      <div className="mx-auto max-w-2xl">
        <div className={`relative border rounded-lg p-8 overflow-hidden text-center ${
          passed ? 'border-teal/20 bg-teal/5' : 'border-warning/20 bg-warning/5'
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(63,125,119,0.1)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10">
            <Trophy size={48} className={`mx-auto ${passed ? 'text-teal' : 'text-warning'}`} />

            <h1 className="mt-4 text-2xl font-bold text-[#EFEDE6]">
              {passed ? 'Mission Complete!' : 'Keep Training'}
            </h1>

            <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
              <span className="text-3xl font-bold font-mono text-teal">{result.score}</span>
              <span className="text-slate-light">/</span>
              <span className="text-3xl font-bold font-mono text-slate-light">{result.total}</span>
              <span className="text-sm text-slate-light ml-2">({result.pct}%)</span>
            </div>

            <p className="mt-4 text-sm text-slate-light">
              {passed
                ? 'Great work! The next mission has been unlocked.'
                : 'Review the material and try again to improve your score.'}
            </p>

            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate('/learning-path')}>
                <ArrowLeft size={14} /> Mission Map
              </Button>
              {!passed && (
                <Button onClick={() => {
                  setStage('brief')
                  setSlideIdx(0)
                  setQuizIdx(0)
                  setSelectedAnswer(null)
                  setAnswered(false)
                  setCorrectCount(0)
                  setResult(null)
                }}>
                  Retry Mission
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
