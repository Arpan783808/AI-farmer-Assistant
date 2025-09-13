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
  scientificName: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String, 
  },
  season: {
    type: String, 
  },
  imageUrl: {
    type: String, 
  },
}, { timestamps: true });

const Crop = mongoose.model("Crop", cropSchema);
export default Crop;
