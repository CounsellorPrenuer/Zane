import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LogOut, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  FileText,
  Star,
  BookOpen,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Blog, InsertBlog } from "@shared/schema";
import { insertBlogSchema } from "@shared/schema";
import { AIBlogCreationModal } from "@/components/AIBlogCreationModal";

interface AdminStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  featuredBlogs: number;
}

// Blog form schema - extends the shared schema with UI-specific validation
const blogFormSchema = insertBlogSchema.extend({
  tags: z.string().optional(), // Keep as string for form input, transform in mutations
}).omit({
  publishedAt: true, // Handled automatically by the backend
});

type BlogFormData = z.infer<typeof blogFormSchema>;

export default function AdminBlogs() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Check admin authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/status");
        setIsAuthenticated(response.ok);
        if (!response.ok) {
          navigate("/admin/login");
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/admin/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
    }
  });

  // Fetch all blogs (admin method)
  const {
    data: blogs = [],
    isLoading: blogsLoading,
    error: blogsError,
  } = useQuery<Blog[]>({
    queryKey: ["/api/admin/blogs"],
    enabled: isAuthenticated === true,
  });

  // Calculate blog statistics
  const stats: AdminStats = {
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter(blog => blog.status === 'published').length,
    draftBlogs: blogs.filter(blog => blog.status === 'draft').length,
    featuredBlogs: blogs.filter(blog => blog.featured).length,
  };

  // Filter blogs based on search and status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchTerm === "" || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === "all" || blog.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create blog");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
      setIsCreateDialogOpen(false);
      reset();
      toast({
        title: "Success!",
        description: "Blog post created successfully.",
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

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlogFormData }) => {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update blog");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
      setIsEditDialogOpen(false);
      setSelectedBlog(null);
      reset();
      toast({
        title: "Success!",
        description: "Blog post updated successfully.",
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

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete blog");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
      toast({
        title: "Success!",
        description: "Blog post deleted successfully.",
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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      navigate("/admin/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateBlog = (data: BlogFormData) => {
    createBlogMutation.mutate(data);
  };

  const handleUpdateBlog = (data: BlogFormData) => {
    if (selectedBlog) {
      updateBlogMutation.mutate({ id: selectedBlog.id, data });
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    reset({
      title: blog.title,
      content: blog.content,
      summary: blog.summary || "",
      slug: blog.slug,
      author: blog.author,
      status: blog.status as 'draft' | 'published' | 'archived',
      featured: blog.featured,
      tags: blog.tags?.join(', ') || "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      readingTime: blog.readingTime || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteBlog = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteBlogMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (blogsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
              <p className="text-sm text-muted-foreground">Manage your blog posts and content</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/bookings")}
              data-testid="button-back-to-dashboard"
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Blogs</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalBlogs}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-3xl font-bold text-green-600">{stats.publishedBlogs}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.draftBlogs}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Featured</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.featuredBlogs}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Blog Posts</CardTitle>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                data-testid="button-create-blog"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Blog Post
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search blogs by title, author, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-blogs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blogs Table */}
            {blogsError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading blog posts. Please try again later.
                </AlertDescription>
              </Alert>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No blog posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria." 
                    : "Create your first blog post to get started."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium" data-testid={`text-blog-title-${blog.id}`}>
                            {blog.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {blog.summary || "No summary"}
                          </p>
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {blog.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {blog.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{blog.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-blog-author-${blog.id}`}>
                            {blog.author}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span data-testid={`badge-blog-status-${blog.id}`}>
                          {getStatusBadge(blog.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {blog.featured ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span data-testid={`text-blog-date-${blog.id}`}>
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {blog.readingTime && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {blog.readingTime} min read
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBlog(blog)}
                            data-testid={`button-edit-blog-${blog.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-blog-${blog.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>
                Update the blog post content and metadata.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdateBlog)} className="space-y-4">
              {/* Same form fields as create, but pre-populated */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    {...register("title")}
                    placeholder="Enter blog title"
                    data-testid="input-edit-blog-title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug *</Label>
                  <Input
                    id="edit-slug"
                    {...register("slug")}
                    placeholder="url-friendly-slug"
                    data-testid="input-edit-blog-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author *</Label>
                  <Input
                    id="edit-author"
                    {...register("author")}
                    placeholder="Author name"
                    data-testid="input-edit-blog-author"
                  />
                  {errors.author && (
                    <p className="text-sm text-red-600">{errors.author.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value) => setValue("status", value as 'draft' | 'published' | 'archived')}
                  >
                    <SelectTrigger data-testid="select-edit-blog-status">
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
                <Label htmlFor="edit-summary">Summary</Label>
                <Textarea
                  id="edit-summary"
                  {...register("summary")}
                  placeholder="Brief summary or excerpt"
                  data-testid="textarea-edit-blog-summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  {...register("content")}
                  placeholder="Blog post content (supports markdown)"
                  className="min-h-[200px]"
                  data-testid="textarea-edit-blog-content"
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    {...register("tags")}
                    placeholder="tag1, tag2, tag3"
                    data-testid="input-edit-blog-tags"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-readingTime">Reading Time (minutes)</Label>
                  <Input
                    id="edit-readingTime"
                    type="number"
                    {...register("readingTime", { valueAsNumber: true })}
                    placeholder="5"
                    data-testid="input-edit-blog-reading-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-metaTitle">Meta Title (SEO)</Label>
                  <Input
                    id="edit-metaTitle"
                    {...register("metaTitle")}
                    placeholder="SEO-optimized title"
                    data-testid="input-edit-blog-meta-title"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => setValue("featured", checked)}
                    data-testid="switch-edit-blog-featured"
                  />
                  <Label htmlFor="edit-featured">Featured Post</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-metaDescription">Meta Description (SEO)</Label>
                <Textarea
                  id="edit-metaDescription"
                  {...register("metaDescription")}
                  placeholder="Brief description for search engines"
                  data-testid="textarea-edit-blog-meta-description"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedBlog(null);
                    reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateBlogMutation.isPending}
                  data-testid="button-update-blog"
                >
                  {updateBlogMutation.isPending ? "Updating..." : "Update Blog Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* AI Blog Creation Modal */}
        <AIBlogCreationModal 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onBlogCreated={handleCreateBlog}
        />
      </main>
    </div>
  );
}