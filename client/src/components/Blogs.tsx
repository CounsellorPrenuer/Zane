import { useState, useEffect } from "react";
import { client } from "@/lib/sanity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface Blog {
    _id: string;
    title: string;
    slug: { current: string };
    summary: string;
    content: any[];
    author: string;
    publishedAt: string;
    featured: boolean;
    mainImage?: any;
}

export default function Blogs() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // Fetch blocks with full content for rendering
                const result = await client.fetch(`*[_type == "blog"] | order(publishedAt desc)`);
                setBlogs(result);
            } catch (error) {
                console.error("Error fetching blogs from Sanity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                duration: 0.6
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    if (loading) {
        return (
            <section id="blogs" className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-48 bg-muted rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (blogs.length === 0) return null;

    return (
        <section id="blogs" className="py-16 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-muted/30">
            <motion.div
                className="max-w-7xl mx-auto relative z-10"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <motion.div className="text-center mb-12 lg:mb-16" variants={itemVariants}>
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
                        Latest <span className="gradient-text">Insights</span> & Blogs
                    </h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Expert advice on career planning, skill development, and education
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {blogs.map((blog) => (
                        <motion.div
                            key={blog._id}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="flex flex-col h-full glass border-2 hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                                <div className="h-48 overflow-hidden">
                                    {blog.mainImage ? (
                                        <img
                                            src={urlFor(blog.mainImage).url()}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className="glass">
                                            {blog.featured ? "Featured" : "Guide"}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl lg:text-2xl mb-2 leading-tight font-bold line-clamp-2">
                                        {blog.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-6 flex-1">
                                        {blog.summary}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <User className="w-3 h-3" />
                                            <span>{blog.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full mt-4 text-primary p-0 h-auto hover:bg-transparent justify-start group"
                                        onClick={() => setSelectedBlog(blog)}
                                    >
                                        <span>Read More</span>
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Blog Detail Modal */}
            <Dialog open={!!selectedBlog} onOpenChange={(open) => !open && setSelectedBlog(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border border-white/20 shadow-2xl p-0">
                    {selectedBlog && (
                        <div className="flex flex-col">
                            {/* Header Image */}
                            <div className="h-64 sm:h-80 w-full relative">
                                {selectedBlog.mainImage ? (
                                    <img
                                        src={urlFor(selectedBlog.mainImage).url()}
                                        alt={selectedBlog.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
                                    onClick={() => setSelectedBlog(null)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="px-6 py-8 sm:px-12 sm:pb-16 -mt-12 relative z-10">
                                <Badge variant="outline" className="mb-4 glass bg-primary/10 text-primary border-primary/20">
                                    {selectedBlog.featured ? "Featured Post" : "Career Guide"}
                                </Badge>
                                
                                <DialogHeader className="mb-8">
                                    <DialogTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-left">
                                        {selectedBlog.title}
                                    </DialogTitle>
                                    <div className="flex flex-wrap gap-4 text-muted-foreground text-sm border-b border-border/50 pb-6">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-primary" />
                                            By {selectedBlog.author}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                                            {new Date(selectedBlog.publishedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary">
                                    {selectedBlog.content ? (
                                        <PortableText value={selectedBlog.content} />
                                    ) : (
                                        <p>{selectedBlog.summary}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
