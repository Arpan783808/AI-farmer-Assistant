import mongoose from "mongoose";
const { Schema } = mongoose;

const precautionSchema = new Schema({
  cropId: {
    // type: Schema.Types.ObjectId,
    // ref: "Crop", 
    type: String,
    required: true,
    index: true,
  },
  precautions: {
    type: Array,
    default: []
  }
}, { timestamps: true });

const Precaution = mongoose.model("Precaution", precautionSchema);
export default Precaution;
