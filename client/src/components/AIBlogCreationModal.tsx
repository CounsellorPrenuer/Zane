import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertBlogSchema } from "@shared/schema";

const blogFormSchema = insertBlogSchema.extend({
  tags: z.string().optional(),
}).omit({
  publishedAt: true,
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface AIBlogCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlogCreated: (data: BlogFormData) => void;
}

interface GeneratedBlog {
  title: string;
  content: string;
  summary: string;
  slug: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
}

export function AIBlogCreationModal({ 
  open, 
  onOpenChange, 
  onBlogCreated 
}: AIBlogCreationModalProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiWordCount, setAiWordCount] = useState("800");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
      author: 'Zane E. Cuxton',
    }
  });

  // AI Blog Generation Mutation
  const generateBlogMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/blogs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic: aiTopic,
          keywords: aiKeywords.split(',').map(k => k.trim()).filter(Boolean),
          tone: aiTone,
          wordCount: parseInt(aiWordCount) || 800,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate blog");
      }

      return response.json() as Promise<GeneratedBlog>;
    },
    onSuccess: (data) => {
      // Populate the form with AI-generated content
      setValue("title", data.title);
      setValue("content", data.content);
      setValue("summary", data.summary || "");
      setValue("slug", data.slug);
      setValue("tags", data.tags?.join(', ') || "");
      setValue("metaTitle", data.metaTitle || "");
      setValue("metaDescription", data.metaDescription || "");
      setValue("readingTime", data.readingTime || undefined);

      toast({
        title: "Success!",
        description: "Blog content generated successfully. Review and edit as needed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateBlog = () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the blog post.",
        variant: "destructive",
      });
      return;
    }
    generateBlogMutation.mutate();
  };

  const handleFormSubmit = (data: BlogFormData) => {
    onBlogCreated(data);
    reset();
    setAiTopic("");
    setAiKeywords("");
    setAiTone("professional");
    setAiWordCount("800");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
          <DialogDescription>
            Use AI to generate professional blog content or create manually.
          </DialogDescription>
        </DialogHeader>

        {/* AI Blog Generation Section */}
        <div className="border rounded-lg p-4 bg-primary/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Blog Generation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a professional blog post using AI based on your topic and preferences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-topic">Topic *</Label>
              <Input
                id="ai-topic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., How to transition to leadership roles"
                data-testid="input-ai-topic"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-keywords">Keywords (comma separated)</Label>
              <Input
                id="ai-keywords"
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                placeholder="e.g., leadership, career, management"
                data-testid="input-ai-keywords"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai-tone">Tone/Style</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger data-testid="select-ai-tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-wordcount">Word Count (Target: 700-1000 words)</Label>
              <Input
                id="ai-wordcount"
                value={aiWordCount}
                onChange={(e) => setAiWordCount(e.target.value)}
                placeholder="800"
                type="number"
                data-testid="input-ai-wordcount"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerateBlog}
            disabled={generateBlogMutation.isPending}
            className="w-full"
            data-testid="button-generate-blog"
          >
            {generateBlogMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Blog Post...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>

        {/* Traditional Blog Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter blog title"
                data-testid="input-blog-title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="url-friendly-slug"
                data-testid="input-blog-slug"
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register("author")}
                placeholder="Author name"
                data-testid="input-blog-author"
              />
              {errors.author && (
                <p className="text-sm text-red-600">{errors.author.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as 'draft' | 'published' | 'archived')}
              >
                <SelectTrigger data-testid="select-blog-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Brief summary or excerpt"
              data-testid="textarea-blog-summary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Blog post content (supports markdown)"
              className="min-h-[300px] font-mono text-sm"
              data-testid="textarea-blog-content"
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register("tags")}
                placeholder="tag1, tag2, tag3"
                data-testid="input-blog-tags"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="readingTime">Reading Time (minutes)</Label>
              <Input
                id="readingTime"
                type="number"
                {...register("readingTime", { valueAsNumber: true })}
                placeholder="5"
                data-testid="input-blog-reading-time"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
              <Input
                id="metaTitle"
                {...register("metaTitle")}
                placeholder="SEO-optimized title"
                data-testid="input-blog-meta-title"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={watch("featured")}
                onCheckedChange={(checked) => setValue("featured", checked)}
                data-testid="switch-blog-featured"
              />
              <Label htmlFor="featured">Featured Post</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Textarea
              id="metaDescription"
              {...register("metaDescription")}
              placeholder="Brief description for search engines"
              data-testid="textarea-blog-meta-description"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
                setAiTopic("");
                setAiKeywords("");
              }}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-save-blog"
            >
              Create Blog Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
