import Crop from '../models/crops.model.js';

export const createCrop = async (req, res) => {
  try {
    const cropData = req.body;
    if (!cropData.cropId) {
      cropData.cropId = `CROP-${Date.now()}`;
    }
    const crop = new Crop(cropData);
    const savedCrop = await crop.save();
    
    res.status(201).json({
      success: true,
      data: savedCrop,
      message: 'Crop created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: crops,
      count: crops.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getPaginatedCrops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const crops = await Crop.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Crop.countDocuments();
    
    res.status(200).json({
      success: true,
      data: crops,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findOne({ cropId: req.params.cropId });
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }    
    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { cropId: req.params.cropId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }    
    res.status(200).json({
      success: true,
      data: crop,
      message: 'Crop updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ cropId: req.params.cropId });
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};