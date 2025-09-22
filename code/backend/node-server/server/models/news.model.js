import mongoose from "mongoose";
const { Schema } = mongoose;

const newsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  content: {
    type: String, 
    required: true,
  },
  author: {
    type: String, 
    default: "Admin",
  },
  target: {
    crop: {
        type: String,
    //   type: Schema.Types.ObjectId,
    //   ref: "Crop", 
    },
    region: {
      type: String, 
    },
  },
  tags: [
    {
      type: Array, 
      default: []
    },
  ],
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const News = mongoose.model("News", newsSchema);
export default News;
