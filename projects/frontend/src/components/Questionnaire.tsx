import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { getQuizQuestions, QuizQuestion, saveQuizAttempt } from '../utils/certificateStorage'

interface QuestionnaireProps {
  username: string
  workshopName: string
  onQuizComplete: (score: number, passed: boolean) => void
  onCancel: () => void
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  username,
  workshopName,
  onQuizComplete,
  onCancel,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const loadedQuestions = getQuizQuestions()
    setQuestions(loadedQuestions)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="card bg-white shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 justify-center">
            <span className="loading loading-spinner loading-lg"></span>
            <span>Loading questionnaire...</span>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="card bg-white shadow-xl text-center">
        <div className="card-body">
          <p className="text-red-600">No questions available</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isAnswered = answers[currentQuestion.id]

  const handleAnswerSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option,
    })
  }

  const handleNext = () => {
    if (!isAnswered) {
      enqueueSnackbar('Please select an answer before proceeding', { variant: 'warning' })
      return
    }

    if (isLastQuestion) {
      submitQuiz()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = () => {
    // Calculate score
    let correctCount = 0
    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      const answerLetter = userAnswer?.split('.')[0] || ''
      if (answerLetter === question.correctAnswer) {
        correctCount++
      }
    })

    const calculatedScore = Math.round((correctCount / questions.length) * 100)
    const passed = calculatedScore >= 70 // Pass if 70% or above

    setScore(calculatedScore)
    setSubmitted(true)

    // Save quiz attempt
    saveQuizAttempt({
      username,
      timestamp: new Date().toISOString(),
      answers,
      score: calculatedScore,
      passed,
    })

    // Notify parent component
    onQuizComplete(calculatedScore, passed)

    if (passed) {
      enqueueSnackbar(`✓ Congratulations! You scored ${calculatedScore}% and passed!`, {
        variant: 'success',
      })
    } else {
      enqueueSnackbar(`Your score: ${calculatedScore}%. You need 70% to pass.`, {
        variant: 'warning',
      })
    }
  }

  if (submitted) {
    const passed = score >= 70
    const correctCount = Object.keys(answers).filter((qId) => {
      const question = questions.find((q) => q.id === qId)
      if (!question) return false
      const userAnswer = answers[qId]?.split('.')[0] || ''
      return userAnswer === question.correctAnswer
    }).length

    return (
      <div className="card bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center">Quiz Results</h2>
          <div className="divider"></div>

          <div className="text-center space-y-6">
            {passed ? (
              <div className="text-6xl">🎉</div>
            ) : (
              <div className="text-6xl">📝</div>
            )}

            <div>
              <p className="text-4xl font-bold text-teal-700">{score}%</p>
              <p className="text-gray-600 text-lg">
                {correctCount} out of {questions.length} correct
              </p>
            </div>

            <div className={`alert ${passed ? 'alert-success' : 'alert-warning'}`}>
              <span>
                {passed
                  ? 'Great! You passed the questionnaire. Your certificate will be generated.'
                  : 'You did not reach the passing score of 70%. You can try again later.'}
              </span>
            </div>

            {!passed && (
              <div className="text-left bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
                <h3 className="font-bold mb-3">Review Your Answers:</h3>
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id]
                  const userAnswerLetter = userAnswer?.split('.')[0] || ''
                  const isCorrect = userAnswerLetter === question.correctAnswer

                  return (
                    <div key={question.id} className="mb-4 pb-4 border-b">
                      <p className="font-semibold text-sm">Q{index + 1}: {question.question}</p>
                      <p className={`text-sm mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        Your answer: {userAnswer || 'Not answered'}
                      </p>
                      <p className="text-sm text-green-600">Correct answer: {question.correctAnswer}</p>
                      {question.explanation && (
                        <p className="text-xs text-gray-600 mt-1 italic">{question.explanation}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onCancel} className="btn btn-outline flex-1">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl text-teal-700 mb-2">📝 Workshop Questionnaire</h2>
        <p className="text-sm text-gray-600 mb-4">
          Workshop: <span className="font-semibold">{workshopName}</span>
        </p>

        {/* Progress Bar */}
        <div className="progress progress-info mb-6">
          <div
            className="progress-bar"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>

        <div className="divider my-2"></div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{currentQuestion.question}</h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                style={{
                  borderColor: answers[currentQuestion.id] === option ? '#0c7792' : '#ccc',
                  backgroundColor: answers[currentQuestion.id] === option ? '#e0f7fa' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswerSelect(option)}
                  className="mr-3 cursor-pointer"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn btn-ghost"
          >
            ← Previous
          </button>
          <button onClick={onCancel} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="btn btn-primary"
          >
            {isLastQuestion ? 'Submit' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Questionnaire
