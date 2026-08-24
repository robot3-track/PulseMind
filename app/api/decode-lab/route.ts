import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { LabDecodeResult } from '@/lib/types';
import { generateFallbackLabDecode } from '@/lib/fallbackData';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  let rawText = '';
  try {
    const body = await req.json();
    rawText = body?.rawText || '';
    const imageBase64 = body?.imageBase64;
    const imageMimeType = body?.imageMimeType;

    if (!rawText && !imageBase64) {
      return NextResponse.json(
        { error: 'Please provide lab text or an image of the medical document to decode.' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResult = generateFallbackLabDecode(rawText);
      return NextResponse.json(fallbackResult);
    }

    const promptText = `
You are a medical health literacy specialist.
Your mission is to translate complex laboratory results, imaging reports (MRI, X-ray, CT), biopsy notes, or clinical notes into clear, patient-friendly plain English.

Medical Document Content:
${rawText || 'Refer to the attached medical report image.'}

Translation Guidelines:
1. "Grade-Level Explanation": Use simple analogies and zero medical jargon.
2. "Overall Summary": Explain what the report as a whole indicates in a balanced, reassuring, and honest manner.
3. "Decoded Items": For each key medical term or test marker in the report:
   - Provide the term name
   - Original line/value
   - Plain English meaning
   - Status: 'Normal', 'Elevated', 'Low', 'Abnormal', 'Critical', or 'Informational'
   - Reference range and patient value if listed
   - Clinical significance
4. "Questions for Doctor": Practical questions the patient can ask their doctor.
5. "Lifestyle or Next Steps": Supportive non-pharmacological recommendations.
`;

    const contentsPayload: any = imageBase64
      ? [
          {
            inlineData: {
              mimeType: imageMimeType || 'image/jpeg',
              data: imageBase64,
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
          'You are a medical health literacy specialist. Output your translation strictly as valid JSON adhering to the provided schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportTitle: {
              type: Type.STRING,
              description: 'Clear title for the report (e.g. Lipid Cholesterol Panel, Complete Blood Count, Lumbar Spine MRI)',
            },
            gradeLevelExplanation: {
              type: Type.STRING,
              description: 'A plain-language explanation with simple metaphors and accessible wording.',
            },
            overallSummary: {
              type: Type.STRING,
              description: 'A clear 2-3 sentence summary of what the overall results mean for the patient.',
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key bullet points highlighting the most important findings.',
            },
            decodedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  plainEnglishMeaning: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    description: 'One of: Normal, Elevated, Low, Abnormal, Critical, Informational',
                  },
                  referenceRange: { type: Type.STRING },
                  patientValue: { type: Type.STRING },
                  clinicalSignificance: { type: Type.STRING },
                },
                required: ['term', 'originalText', 'plainEnglishMeaning', 'status', 'clinicalSignificance'],
              },
            },
            questionsForDoctor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            lifestyleOrNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'reportTitle',
            'gradeLevelExplanation',
            'overallSummary',
            'keyTakeaways',
            'decodedItems',
            'questionsForDoctor',
            'lifestyleOrNextSteps',
          ],
        },
      },
    });

    const rawOutput = response.text || '';
    const cleanJson = rawOutput.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    if (!cleanJson) {
      throw new Error('Empty model output');
    }

    const parsedData = JSON.parse(cleanJson) as LabDecodeResult;
    parsedData.sourceType = 'gemini-live';

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Lab decode service error:', error);
    const fallback = generateFallbackLabDecode(rawText || 'Diagnostic Report');
    return NextResponse.json(fallback);
  }
}
