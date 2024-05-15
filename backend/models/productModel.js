const mongoose = require("mongoose");
const userModel = require("./userModel");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the product's name"],
  },

  discription: {
    type: String,
    required: [true, "Please enter the product's discription"],
  },

  price: {
    type: Number,
    required: [true, "Please enter product's price"],
    maxLength: [true, "Price can't exceed above 8 characters"],
  },

  actualPrice: {
    type: Number,
    required: [true, "Please enter product's price"],
    maxLength: [true, "Price can't exceed above 8 characters"],
  },

  ratings: {
    type: Number,
    default: 0,
  },

  images: [
    {
      public_id: {
        type: String,
        required: [true, "Specify Public Id Of image"],
      },
      url: {
        type: String,
        required: [true, "Specify Public URI Of image"],
      },
    },
  ],

  productType: {
    type: String,
  },

  category: {
    type: String,
    required: [true, "Kindly Specify The category"],
  },

  stock: {
    type: Number,
    required: [true, "Please Specify Available Stock of This Product"],
    maxLength: [4, "Stock cant Exceed above 4 characters"],
    default: 1,
  },
  boxContent: {
    type: String,
    required: [true, "What are the Box Content?"],
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },

  numberOfRatings: {
    type: Number,
    default: 0,
  },

  reviewsOfProduct: [
    {
      userCreated: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },

      rating: {
        type: Number,
        required: [true, "Please provide rating to give review"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot be more than 5"],
      },

      comment: {
        type: String,
      },
      images: [
        {
          url: {
            type: String,
            required: [true, "Specify Public URI Of image"],
          },
        },
      ],
      reviewdAt: {
        type: String,
        default: new Date().toLocaleDateString(),
      },
    },
  ],
  userCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  userUpdates: [
    {
      userUpdate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: "Not Yet Updated",
        required: true,
      },

      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  technicalDetails: {
    type: String,
    required: true,
  },

  productAbout: {
    type: String,
    required: true,
  },

  servicesAvailable: [
    {
      serviceType: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
      },
    },
  ],
  userOrderedItem: [
    {
      userDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
function arrayLimit(val) {
  return val.length <= 8;
}

module.exports = mongoose.model("Product", productSchema);
