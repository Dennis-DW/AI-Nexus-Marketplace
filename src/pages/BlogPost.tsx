import { motion } from 'framer-motion';
import { Calendar, User, Clock, Eye, Heart, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogAPI } from '../services/api';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch blog post
  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => slug ? blogAPI.getBlogPost(slug) : null,
    enabled: !!slug,
  });

  // Fetch related posts
  const { data: relatedData } = useQuery({
    queryKey: ['relatedBlogs', blogData?.data?.category],
    queryFn: () => blogData?.data?.category ? blogAPI.getBlogPosts({
      category: blogData.data.category,
      limit: 3
    }) : null,
    enabled: !!blogData?.data?.category,
  });

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !blogData?.data) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const blog = blogData.data;
  const relatedPosts = relatedData?.data?.filter((post: any) => post._id !== blog._id) || [];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="mb-4">
            <span className="bg-blue-600 text-zinc-800 px-3 py-1 rounded-full text-sm font-medium">
              {blog.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            {blog.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <img
                src={blog.author.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={blog.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-gray-900">{blog.author.name}</span>
                </div>
                {blog.author.bio && (
                  <p className="text-sm text-gray-600">{blog.author.bio}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime} min read</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{blog.views} views</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{blog.likes} likes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mb-8">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Heart className="h-5 w-5" />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bookmark className="h-5 w-5" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </motion.header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="card p-8 mb-12"
        >
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.slice(0, 3).map((post: any, index: number) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card overflow-hidden group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featuredImage || 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-3 text-xs text-gray-600 mb-3">
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.readTime} min read</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Read More →
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}