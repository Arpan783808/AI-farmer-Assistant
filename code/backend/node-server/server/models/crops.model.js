import mongoose from "mongoose";
const { Schema } = mongoose;

const cropSchema = new Schema({
  cropId: {
    type: String,
    required: true,
    unique: true,   
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  variety: {
    type: String,
    required: true,
  },
  scientificName: {
    type: String,
  },
  description: { // Features of given crop variety
    type: String,
    require: true
  },
  category: {
    type: String, 
  },
  season: {
    type: String, 
  },
  region: {
    type: Array,
    default: []
  },
  imageUrl: {
    type: String, 
  },
}, { timestamps: true });

const Crop = mongoose.model("Crop", cropSchema);
export default Crop;
