import OpenAI from "openai";

/*
This is using Replit's AI Integrations service, which provides OpenAI-compatible API access 
without requiring your own OpenAI API key. Charges are billed to your Replit credits.

Follow these instructions when using this blueprint:
1. Note that the newest OpenAI model is "gpt-5", not "gpt-4o" or "gpt-4". gpt-5 was released August 7, 2025 after your knowledge cutoff. 
   Always prefer using gpt-5 as it is the latest model. 
   // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
2. Use the response_format: { type: "json_object" } option
3. Request output in JSON format in the prompt
*/

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface GenerateBlogRequest {
  topic: string;
  keywords: string[];
  tone: string;
  wordCount: number;
}

export interface GeneratedBlog {
  title: string;
  content: string;
  summary: string;
  slug: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
}

export async function generateBlogContent(request: GenerateBlogRequest): Promise<GeneratedBlog> {
  const { topic, keywords, tone, wordCount } = request;
  
  const prompt = `You are a professional blog writer for Academy for Skill and Knowledge (ASK), a behavioral training and leadership development organization founded by Zane E. Cuxton.

Generate a comprehensive, well-structured blog post with the following specifications:

TOPIC: ${topic}
KEYWORDS TO INCLUDE: ${keywords.join(', ')}
TONE/STYLE: ${tone}
TARGET WORD COUNT: Approximately ${wordCount} words

The blog should:
1. Be engaging, informative, and professionally written
2. Include relevant examples and actionable insights
3. Naturally incorporate the provided keywords
4. Follow best practices for SEO and readability
5. Be relevant to behavioral training, leadership, emotional intelligence, or professional development
6. Include a compelling introduction and conclusion

Return your response as a JSON object with the following structure:
{
  "title": "Engaging blog post title (50-60 characters)",
  "content": "Full blog post content in markdown format with proper headings (##, ###), bullet points, and formatting. Should be approximately ${wordCount} words.",
  "summary": "Compelling 2-3 sentence summary for previews (150-160 characters)",
  "slug": "url-friendly-slug-version-of-title",
  "tags": ["array", "of", "relevant", "tags"],
  "metaTitle": "SEO-optimized meta title (50-60 characters)",
  "metaDescription": "SEO-optimized meta description (150-160 characters)",
  "readingTime": estimated_reading_time_in_minutes_as_number
}`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert blog writer specializing in behavioral training, leadership development, and professional skills content. You write engaging, SEO-optimized content that provides real value to readers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No content generated from AI");
    }

    const generatedBlog = JSON.parse(responseContent) as GeneratedBlog;
    
    // Validate the response has all required fields
    if (!generatedBlog.title || !generatedBlog.content || !generatedBlog.slug) {
      throw new Error("Generated blog is missing required fields");
    }

    return generatedBlog;
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error("Failed to generate blog content. Please try again.");
  }
}
