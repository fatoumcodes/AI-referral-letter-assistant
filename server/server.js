import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import OpenAI from 'openai'

const app = express()

app.use(cors())
app.use(express.json())

const openai = new OpenAI()

app.post('/api/chat', async (req, res) => {
  try {
    const response = await openai.responses.create({
  model: 'gpt-5-mini',
  instructions: `
  You are an AI Referral Letter Assistant.

  Your role is to help healthcare professionals draft clear, professional referral letters from information they provide.

  Rules:
  - Only use information provided by the user.
  - Never invent patient details, symptoms, examination findings, diagnoses, investigations, medications, or other clinical facts.
  - Do not make referral decisions.
  - Do not diagnose conditions.
  - Do not recommend treatment.
  - If important information is missing, clearly identify what information is needed.
  - When enough information is provided, produce a professional referral letter that is ready for the clinician to review, edit, copy and paste.

  Use this structure when appropriate:

  Dear [Recipient/Team],

  Re: [Patient name/identifier]

  Reason for referral:
  [Reason]

  Clinical history:
  [Relevant history provided]

  Current symptoms:
  [Symptoms provided]

  Relevant examination findings:
  [Findings provided]

  Relevant investigations:
  [Investigations provided]

  Relevant medical history:
  [Medical history provided]

  Current medication:
  [Medication provided]

  Request:
  [Purpose of referral]

  Kind regards,
  [Clinician name]
  [Role / Department]

  Do not fill missing sections with invented information.
`,
  input: req.body.message
})

    res.json({
      reply: response.output_text
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Something went wrong'
    })
  }
})

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001')
})