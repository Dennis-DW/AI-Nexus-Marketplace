const Cookie = require('../models/Cookie');

// Get user cookie preferences
const getCookiePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let preferences = await Cookie.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences
      preferences = new Cookie({
        userId,
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false
      });
      await preferences.save();
    }

    res.status(200).json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Error fetching cookie preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cookie preferences',
      error: error.message
    });
  }
};

// Update user cookie preferences
const updateCookiePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { necessary, analytics, marketing, preferences } = req.body;

    const cookiePrefs = await Cookie.findOneAndUpdate(
      { userId },
      {
        userId,
        necessary: necessary !== undefined ? necessary : true,
        analytics: analytics !== undefined ? analytics : false,
        marketing: marketing !== undefined ? marketing : false,
        preferences: preferences !== undefined ? preferences : false,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    // Set appropriate cookies based on preferences
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    };

    // Always set necessary cookies
    res.cookie('ainexus_session', 'active', cookieOptions);
    
    if (cookiePrefs.analytics) {
      res.cookie('ainexus_analytics', 'enabled', cookieOptions);
    } else {
      res.clearCookie('ainexus_analytics');
    }

    if (cookiePrefs.marketing) {
      res.cookie('ainexus_marketing', 'enabled', cookieOptions);
    } else {
      res.clearCookie('ainexus_marketing');
    }

    if (cookiePrefs.preferences) {
      res.cookie('ainexus_preferences', 'enabled', cookieOptions);
    } else {
      res.clearCookie('ainexus_preferences');
    }

    res.status(200).json({
      success: true,
      message: 'Cookie preferences updated successfully',
      data: cookiePrefs
    });

  } catch (error) {
    console.error('Error updating cookie preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cookie preferences',
      error: error.message
    });
  }
};

// Get cookie consent status
const getCookieConsent = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const preferences = await Cookie.findOne({ userId });
    
    res.status(200).json({
      success: true,
      data: {
        hasConsent: !!preferences,
        preferences: preferences || null
      }
    });

  } catch (error) {
    console.error('Error fetching cookie consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cookie consent',
      error: error.message
    });
  }
};

// Clear all user cookies
const clearAllCookies = async (req, res) => {
  try {
    const { userId } = req.params;

    // Update database to disable all non-necessary cookies
    await Cookie.findOneAndUpdate(
      { userId },
      {
        analytics: false,
        marketing: false,
        preferences: false,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    // Clear cookies from browser
    res.clearCookie('ainexus_analytics');
    res.clearCookie('ainexus_marketing');
    res.clearCookie('ainexus_preferences');

    res.status(200).json({
      success: true,
      message: 'All non-necessary cookies cleared'
    });

  } catch (error) {
    console.error('Error clearing cookies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cookies',
      error: error.message
    });
  }
};

module.exports = {
  getCookiePreferences,
  updateCookiePreferences,
  getCookieConsent,
  clearAllCookies
};