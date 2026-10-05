import https from 'https';

/**
 * Server-Side AI Service
 * Secures all API keys on the server and provides curriculum generation
 * and automated course data enrichment.
 */

// Helper to make clean HTTPS requests to Gemini API
const callGeminiAPI = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const rawText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            resolve(JSON.parse(rawText));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(payload);
    req.end();
  });
};

/**
 * Enrich Course Data with executive summary, semantic tags, and estimated duration
 */
export const enrichCourseMetadata = async ({ title, description, category, level }) => {
  const prompt = `Analyze this course and return JSON with keys:
"summary" (a compelling 2-sentence executive summary),
"tags" (array of 3 to 5 keyword tags),
"learningOutcomes" (array of 3 concrete skills acquired),
"estimatedHours" (number).

Course Title: ${title}
Category: ${category}
Level: ${level}
Description: ${description}`;

  const aiResult = await callGeminiAPI(prompt, 'You are an enterprise course curriculum architect.');

  if (aiResult && aiResult.summary) {
    return {
      summary: aiResult.summary,
      tags: Array.isArray(aiResult.tags) ? aiResult.tags : ['Enterprise', 'Architecture'],
      learningOutcomes: Array.isArray(aiResult.learningOutcomes) ? aiResult.learningOutcomes : [],
      estimatedHours: typeof aiResult.estimatedHours === 'number' ? aiResult.estimatedHours : 10,
    };
  }

  // Resilient fallback heuristic if external key is not provisioned
  const generatedTags = [
    category || 'Engineering',
    level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Professional',
    'Enterprise',
    'Best Practices',
  ];

  return {
    summary: `${title} equips modern teams with end-to-end industry competencies and production-tested patterns.`,
    tags: generatedTags,
    learningOutcomes: [
      `Master core principles of ${title}`,
      `Design and implement production solutions in ${category}`,
      `Adopt security and reliability standards`,
    ],
    estimatedHours: level === 'advanced' ? 18 : level === 'intermediate' ? 12 : 6,
  };
};

/**
 * Generate Structured Course Curriculum
 */
export const generateCurriculumBlueprint = async (topic, category = 'Web Development', targetAudience = 'Engineers') => {
  const prompt = `Generate a structured enterprise course curriculum for topic: "${topic}" in category: "${category}" for audience: "${targetAudience}".
Return valid JSON format with keys:
"title": string,
"tagline": string,
"overview": string,
"modules": array of objects with { "moduleTitle": string, "summary": string, "lessons": array of strings },
"suggestedPrice": number,
"level": "beginner" | "intermediate" | "advanced",
"tags": array of strings`;

  const aiResult = await callGeminiAPI(prompt, 'You are an executive curriculum engineer.');

  if (aiResult && aiResult.modules) {
    return aiResult;
  }

  // High-fidelity fallback blueprint
  return {
    title: topic.trim(),
    tagline: `Enterprise Mastery & Scalable Implementation in ${category}`,
    overview: `A comprehensive curriculum engineered to take teams from core concepts to enterprise deployment.`,
    suggestedPrice: 79.99,
    level: 'intermediate',
    tags: [category, 'Architecture', 'Enterprise', 'Scalability'],
    modules: [
      {
        moduleTitle: 'Module 1: Foundations & Architecture',
        summary: 'Core paradigms, system boundaries, and initial configuration.',
        lessons: ['Architecture Overview & Design Goals', 'Environment Setup & Tooling', 'Foundational Patterns'],
      },
      {
        moduleTitle: 'Module 2: Core Engineering & Implementation',
        summary: 'Deep-dive into hands-on workflows and key operational mechanisms.',
        lessons: ['Core Feature Implementation', 'State Management & Concurrency', 'Data Pipelines & Persistence'],
      },
      {
        moduleTitle: 'Module 3: Enterprise Hardening & Production Operations',
        summary: 'Security audits, observability, CI/CD automation, and release strategy.',
        lessons: ['Security Hardening & Access Control', 'Performance Optimization & Benchmarks', 'Continuous Delivery & Monitoring'],
      },
    ],
  };
};
