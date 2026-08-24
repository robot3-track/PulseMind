import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { SymptomInput, SymptomAnalysisResult } from '@/lib/types';
import { generateFallbackSymptomAnalysis } from '@/lib/fallbackData';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  let body: SymptomInput | null = null;
  try {
    body = (await req.json()) as SymptomInput;

    if (!body || !body.primarySymptoms || body.primarySymptoms.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one symptom for screening.' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResult = generateFallbackSymptomAnalysis(body);
      return NextResponse.json(fallbackResult);
    }

    const promptText = `
You are a clinical decision support system assisting with symptom screening and triage guidance.
Analyze the following patient data carefully and objectively:

Patient Demographics & Symptoms:
- Age Group: ${body.ageGroup || 'Adult'}
- Gender: ${body.gender || 'Not specified'}
- Duration of Symptoms: ${body.duration || 'Not specified'}
- Severity: ${body.severity ?? 3}/10
- Primary Anatomical Area: ${body.bodySystem || 'General'}
- Primary Symptoms: ${Array.isArray(body.primarySymptoms) ? body.primarySymptoms.join(', ') : 'None'}
- Medical History: ${Array.isArray(body.preExistingConditions) && body.preExistingConditions.length > 0 ? body.preExistingConditions.join(', ') : 'None reported'}
- Additional Notes: ${body.additionalNotes || 'None'}
${body.imageBase64 ? '- Visual attachment provided: Image of affected area.' : ''}

CLINICAL INSTRUCTIONS:
1. Provide risk stratification (Low, Moderate, High, or Critical).
2. Calculate a 0-100 risk score based on acuity and red flags.
3. List 2 to 4 probable differential causes with likelihood, clear explanations, and clinical urgency.
4. Highlight any immediate "Red Flag" warning symptoms that require immediate medical attention.
5. Provide clear triage recommendations (e.g., Emergency Department, Urgent Care, Primary Care, Home Monitoring).
6. Provide supportive self-care recommendations.
7. Provide specific questions for the patient to ask their healthcare provider.
`;

    const contentsPayload: any = body.imageBase64
      ? [
          {
            inlineData: {
              mimeType: body.imageMimeType || 'image/jpeg',
              data: body.imageBase64,
            },
          },
          {
            text: promptText,
          },
        ]
      : promptText;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contentsPayload,
      config: {
        systemInstruction:
          'You are a clinical health assessment and triage guidance engine. Output your evaluation strictly as valid JSON adhering to the provided schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              description: 'One of: Low, Moderate, High, Critical',
            },
            riskScore: {
              type: Type.NUMBER,
              description: 'Integer from 0 to 100 representing clinical urgency and risk',
            },
            summary: {
              type: Type.STRING,
              description: 'Clear, concise 2-3 sentence clinical summary of the reported symptoms.',
            },
            triageRecommendation: {
              type: Type.STRING,
              description: 'Actionable primary triage instruction.',
            },
            timeframeToAct: {
              type: Type.STRING,
              description: 'Recommended timeframe to seek medical attention.',
            },
            possibleCauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  likelihood: { type: Type.STRING, description: 'High, Medium, or Low' },
                  overview: { type: Type.STRING },
                  urgency: { type: Type.STRING, description: 'Routine, Prompt, Urgent, or Emergency' },
                  keySymptomsMatch: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['name', 'likelihood', 'overview', 'urgency', 'keySymptomsMatch'],
              },
            },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Warning signs requiring immediate emergency evaluation.',
            },
            homeCareAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Supportive care measures and monitoring advice.',
            },
            doctorDiscussionQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Questions to discuss with a healthcare provider.',
            },
            suggestedSpecialty: {
              type: Type.STRING,
              description: 'Recommended medical specialty or care setting.',
            },
          },
          required: [
            'riskLevel',
            'riskScore',
            'summary',
            'triageRecommendation',
            'timeframeToAct',
            'possibleCauses',
            'redFlags',
            'homeCareAdvice',
            'doctorDiscussionQuestions',
            'suggestedSpecialty',
          ],
        },
      },
    });

    const rawOutput = response.text || '';
    const cleanJson = rawOutput.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    if (!cleanJson) {
      throw new Error('Empty model output');
    }

    const parsedData = JSON.parse(cleanJson) as SymptomAnalysisResult;
    parsedData.sourceType = 'gemini-live';

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Symptom analysis service error:', error);
    const fallbackInput: SymptomInput = body || {
      ageGroup: 'adult',
      gender: 'Prefer not to say',
      duration: '1-3days',
      severity: 3,
      bodySystem: 'General',
      primarySymptoms: ['General Discomfort'],
      additionalNotes: '',
      preExistingConditions: [],
    };
    const fallback = generateFallbackSymptomAnalysis(fallbackInput);
    return NextResponse.json(fallback);
  }
}
