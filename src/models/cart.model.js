const mongoose = require("mongoose");

// Modelo de carritos
const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        _id: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
