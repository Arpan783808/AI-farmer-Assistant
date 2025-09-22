import User from '../models/user.model.js';

export const updateUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId ) {
      return res.status(403).json({success: false, message: "unauthorized access"});
    }

    const updateData = {};

    const allowedFields = ['username', 'profilePicture', 'farmAddress', 'location', 'crops'];
    allowedFields.forEach(field => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.location) {
      if (!req.body.location.coordinates || !Array.isArray(req.body.location.coordinates) || 
          req.body.location.coordinates.length !== 2) {
        return res.status(400).json({success: false, message: "Invalid location format"});
      }
      updateData.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({success: false, message: "User not found."});
    }

    const { password, ...userData } = updatedUser._doc;
    res.status(200).json({success:true, data:userData});
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({success: false, message: "unauthorized access"});
    }

    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    
    if (!deletedUser) {
      return res.status(404).json({success: false, message: "User not found."});
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({success: false, message: "User not found."});
    }

    const { password, ...userData } = user._doc;
    res.status(200).json({success:true, data:userData});
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({success: false, message: "User not found."});
    }

    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};

export const getUsersNearby = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({success: false, message: "Longitude and latitude are required"});
    }

    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) || 10000 
        }
      }
    }).select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};

export const addCrop = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({success: false, message: "Unauthorized action"});
    }

    const { crop } = req.body;
    if (!crop) {
      return res.status(400).json({success: false, message: "Crop data is required"});
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { crops: crop } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({success: false, message: "User not found"});
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({success: false, message: "Admin access required"});
    }

    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({success: false, message: error.message});
  }
};