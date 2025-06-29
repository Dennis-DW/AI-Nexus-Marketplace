const Blog = require('../models/Blog');

// Get all blog posts
const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      featured,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isPublished: true };
    
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content');

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / parseInt(limit));

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBlogs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
};

// Get blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, isPublished: true });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });

  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      isPublished: true, 
      isFeatured: true 
    })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select('-content');

    res.status(200).json({
      success: true,
      data: blogs
    });

  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured blogs',
      error: error.message
    });
  }
};

// Get blog categories
const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get recent blog posts
const getRecentBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('title slug excerpt publishedAt author category featuredImage readTime');

    res.status(200).json({
      success: true,
      data: blogs
    });

  } catch (error) {
    console.error('Error fetching recent blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent blogs',
      error: error.message
    });
  }
};

// Get popular blog posts
const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ isPublished: true })
      .sort({ views: -1, likes: -1 })
      .limit(parseInt(limit))
      .select('title slug excerpt views likes author category featuredImage readTime');

    res.status(200).json({
      success: true,
      data: blogs
    });

  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular blogs',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getBlogCategories,
  getRecentBlogs,
  getPopularBlogs
};