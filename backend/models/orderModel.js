const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
  },
  orderItems: [
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quant: { type: Number, required: true },
        image: { type: String, required: true },
        product: { type: mongoose.Schema.Types.ObjectId,ref: "Product", required: true },
    }
],

userOrdered : {
    type: mongoose.Schema.Types.ObjectId, 
    ref : 'User',
    required: true
},
paymentIn: {
    id: { type: String, required: true },
    status: { type: String, required: true },
    },

    paymentDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },

    itemsPrice: {
        type: Number,
        default: 0,
        required: true
    },
    taxPrice: {
        type: Number,
        default: 0,
        required: true
    },
    shippingPrice: {
        type: Number,
        default: 0,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0,
        required: true
    },
    orderStatus:{
        type:String,
        required: true,
        default: "Processing",
    },
    deliveredAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order",orderSchema);