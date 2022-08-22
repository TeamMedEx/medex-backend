const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: { type: String },
  cover: { type: String },
  images: { type: Array },
  avgRating: { type: Number },
  ratings: { type: Number },
  price: { type: Number },
  oldPrice: { type: Number },
  stock: { type: Number },
  created_at: Date,
  updated_at: Date,
}, {
  versionKey: false
});
const ProductModel = mongoose.model('products', productSchema);

module.exports = ProductModel;