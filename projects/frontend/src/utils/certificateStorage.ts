// Certificate storage utilities
export interface CertificateData {
  username: string
  workshopName: string
  date: string
  certificateId: string
  score: number
  status: 'pending' | 'completed'
}

export const saveCertificateData = (username: string, data: Omit<CertificateData, 'certificateId'>) => {
  const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const certificateData: CertificateData = {
    ...data,
    certificateId,
  }

  try {
    const existingCerts = localStorage.getItem('certificates')
    const certs = existingCerts ? JSON.parse(existingCerts) : {}

    if (!certs[username]) {
      certs[username] = []
    }

    certs[username].push(certificateData)
    localStorage.setItem('certificates', JSON.stringify(certs))

    return certificateData
  } catch (error) {
    console.error('Error saving certificate:', error)
    throw error
  }
}

export const getCertificates = (username: string): CertificateData[] => {
  try {
    const existingCerts = localStorage.getItem('certificates')
    if (!existingCerts) return []

    const certs = JSON.parse(existingCerts)
    return certs[username] || []
  } catch (error) {
    console.error('Error retrieving certificates:', error)
    return []
  }
}

export const deleteCertificate = (username: string, certificateId: string) => {
  try {
    const existingCerts = localStorage.getItem('certificates')
    if (!existingCerts) return

    const certs = JSON.parse(existingCerts)
    if (certs[username]) {
      certs[username] = certs[username].filter((cert: CertificateData) => cert.certificateId !== certificateId)
      localStorage.setItem('certificates', JSON.stringify(certs))
    }
  } catch (error) {
    console.error('Error deleting certificate:', error)
  }
}

// Quiz question storage
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is blockchain technology used for?',
    options: [
      'A. To store and record transactions securely',
      'B. To play online games',
      'C. To design websites',
      'D. To edit photos',
    ],
    correctAnswer: 'A',
    explanation: 'Blockchain is a distributed ledger technology that securely records transactions.',
  },
  {
    id: 'q2',
    question: 'What does a smart contract do?',
    options: [
      'A. It automatically executes code when conditions are met',
      'B. It improves your contract writing skills',
      'C. It signs legal documents',
      'D. It stores personal contracts',
    ],
    correctAnswer: 'A',
    explanation: 'Smart contracts are self-executing contracts where code runs automatically on blockchain.',
  },
  {
    id: 'q3',
    question: 'What is the primary benefit of decentralization?',
    options: [
      'A. Removes single points of failure and increases transparency',
      'B. Makes systems slower',
      'C. Requires fewer computers',
      'D. Eliminates the need for participants',
    ],
    correctAnswer: 'A',
    explanation: 'Decentralization distributes control and data across a network, improving security and transparency.',
  },
]

export const getQuizQuestions = (): QuizQuestion[] => {
  try {
    const stored = localStorage.getItem('quizQuestions')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading quiz questions:', error)
  }
  return DEFAULT_QUIZ_QUESTIONS
}

export const saveQuizQuestions = (questions: QuizQuestion[]) => {
  try {
    localStorage.setItem('quizQuestions', JSON.stringify(questions))
  } catch (error) {
    console.error('Error saving quiz questions:', error)
  }
}

// Track quiz attempts
export interface QuizAttempt {
  username: string
  timestamp: string
  answers: Record<string, string>
  score: number
  passed: boolean
}

export const saveQuizAttempt = (attempt: QuizAttempt) => {
  try {
    const existing = localStorage.getItem('quizAttempts')
    const attempts = existing ? JSON.parse(existing) : []
    attempts.push(attempt)
    localStorage.setItem('quizAttempts', JSON.stringify(attempts))
  } catch (error) {
    console.error('Error saving quiz attempt:', error)
  }
}

export const getQuizAttempts = (username: string): QuizAttempt[] => {
  try {
    const existing = localStorage.getItem('quizAttempts')
    if (!existing) return []
    const attempts = JSON.parse(existing)
    return attempts.filter((a: QuizAttempt) => a.username === username)
  } catch (error) {
    console.error('Error retrieving quiz attempts:', error)
    return []
  }
}
