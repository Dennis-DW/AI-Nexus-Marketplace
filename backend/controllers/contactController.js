const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');

// Submit contact form
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, category, walletAddress } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'General',
      walletAddress: walletAddress ? walletAddress.toLowerCase() : undefined
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
};

// Get all contact submissions (for admin)
const getAllContacts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const contacts = await Contact.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalContacts = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(totalContacts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalContacts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email, preferences, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const existingSubscription = await Newsletter.findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(409).json({
          success: false,
          message: 'Email is already subscribed'
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.unsubscribedAt = undefined;
        if (preferences) existingSubscription.preferences = preferences;
        await existingSubscription.save();

        return res.status(200).json({
          success: true,
          message: 'Newsletter subscription reactivated',
          data: existingSubscription
        });
      }
    }

    const newsletter = new Newsletter({
      email: email.trim().toLowerCase(),
      preferences: preferences || {},
      source: source || 'website'
    });

    await newsletter.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: newsletter
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
      error: error.message
    });
  }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const newsletter = await Newsletter.findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in newsletter list'
      });
    }

    newsletter.isActive = false;
    newsletter.unsubscribedAt = new Date();
    await newsletter.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from newsletter',
      error: error.message
    });
  }
};

// Get newsletter subscribers (for admin)
const getNewsletterSubscribers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      source,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (source) filter.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const subscribers = await Newsletter.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalSubscribers = await Newsletter.countDocuments(filter);
    const totalPages = Math.ceil(totalSubscribers / parseInt(limit));

    // Get subscription stats
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: null,
          totalSubscribers: { $sum: 1 },
          activeSubscribers: { 
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
          },
          inactiveSubscribers: { 
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } 
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: subscribers,
      stats: stats.length > 0 ? stats[0] : {
        totalSubscribers: 0,
        activeSubscribers: 0,
        inactiveSubscribers: 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSubscribers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter subscribers',
      error: error.message
    });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers
};