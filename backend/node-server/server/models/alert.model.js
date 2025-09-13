import mongoose from "mongoose";
const { Schema } = mongoose;

const alertSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  range: {
    type: Number,
    required: true,
    default: 1000, 
  },

  target: {
    crop: {
      type: String, 
    },
    region: {
      type: String, 
    },
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
    default: "info",
  },
  active: {
    type: Boolean,
    default: true,
  },

  expiresAt: {
    type: Date, 
    default: Date.now
  },
}, { timestamps: true });

alertSchema.index({ location: "2dsphere" });

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
