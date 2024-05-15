const Product = require("../backend/models/productModel");
const asyncErrorCatcher = require("../backend/utils/asyncErrorHandler");
const ApiFeature = require("../backend/utils/apiFeatures");
const ErrorHandler = require("../backend/errorHandler/errorHandler");
const User = require("../backend/models/userModel");
const cloudinary = require("cloudinary");
// Add New Product (ADMIN)
exports.createProduct = asyncErrorCatcher(async (req, res, next) => {
  req.body.userCreated = req.user.id;

  if (parseInt(req.body.actualPrice) <= parseInt(req.body.price)) {
    return next(
      new ErrorHandler(
        "Actual price can't be smaller or equal to discounted price",
        400
      )
    );
  }

  let images = [];
  req.body.images = JSON.parse(req.body.images);
  req.body.servicesAvailable = JSON.parse(req.body.servicesAvailable);
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLink = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
      overwrite: true,
      invalidate: true,
      width: 400,
      crop: "scale",
    });

    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.images = imagesLink;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get All Porduct
exports.getProduct = asyncErrorCatcher(async (req, res, next) => {
  const contentPerPage = 8;
  // Create a separate query for counting documents after filter
  const categories = new ApiFeature(Product.find(), req.query).search();
  // Execute the count query
  const totalProduct = await categories.query;
  const category = totalProduct.map((i) => i.category);
  const totalCategories = [...new Set(category)];
  // Create a separate query for counting documents after filter
  const countQuery = new ApiFeature(Product.find(), req.query)
    .search()
    .filter();
  // Execute the count query
  const filteredProductCount = await countQuery.query.countDocuments();

  // Continue with the main query and pagination
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .search()
    .filter()
    .pagination(contentPerPage);

  const products = await apiFeature.query;

  res.status(200).json({
    success: true,
    products,
    productCount: filteredProductCount,
    contentPerPage,
    totalCategories,
  });
});

exports.getProductAdmin = asyncErrorCatcher(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getStartProduct = asyncErrorCatcher(async (req, res, next) => {
  const product = await Product.find({ productType: "star" });
  const productCount = await Product.find({
    productType: "star",
  }).countDocuments();
  const shuffledProducts = shuffleArray(product);
  const selectedProducts = shuffledProducts.slice(0, 2);
  res.status(200).json({
    success: true,
    selectedProducts,
    productCount,
  });
});
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// Update Product (ADMIN)

exports.updateProduct = asyncErrorCatcher(async (req, res, next) => {
  // const userId = req.user.id;
  // const productUpdate = await Product.findById(req.params.id)
  // await productUpdate.save() future proofing for maintaining updates records

  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  let { price, actualPrice } = product;
  if (
    req.body.actualPrice !== undefined &&
    ((req.body.price !== undefined &&
      parseInt(req.body.price) >= parseInt(req.body.actualPrice)) ||
      (req.body.price === undefined &&
        parseInt(price) >= parseInt(req.body.actualPrice)))
  ) {
    return next(
      new ErrorHandler(
        "Actual price can't be smaller or equal to discounted price",
        400
      )
    );
  }
  if (
    req.body.price !== undefined &&
    req.body.actualPrice === undefined &&
    req.body.price >= actualPrice
  ) {
    return next(new ErrorHandler("Price can't exceed actual price", 400));
  }

  req.body.servicesAvailable = JSON.parse(req.body.servicesAvailable);

  let images = [];
  if (req.body.images !== undefined && JSON.parse(req.body.images).length > 0) {
    req.body.images = JSON.parse(req.body.images);

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  }
  if (images.length > 0) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLink = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
        overwrite: true,
        invalidate: true,
        width: 400,
        height: 450,
        crop: "pad",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
 
    req.body.images = imagesLink; 
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  product.userUpdates.push({ userUpdate: req.user._id });
  res.status(200).json({
    success: true,
    message: "Product Updated",
    product,
  });
});

// Delete Product (ADMIN)

exports.deleteProduct = asyncErrorCatcher(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

// Get Single Product

exports.getSingleProduct = asyncErrorCatcher(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: "userOrderedItem",
      populate: {
        path: "userDetails",
        select: "_id name email mobileNumber", // Specify the fields you want to retrieve
      },
    })
    .exec();
  const productCount = await Product.countDocuments();
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  res.status(200).json({
    success: true,
    product,
    productCount,
  });
});

// Updating or creating review

exports.appendReview = asyncErrorCatcher(async (req, res, next) => {
  const { rating, comment, productID, images } = req.body;
  if (rating < 1 || rating > 5) {
    return next(new ErrorHandler("Rating can't preceed 0 or exceed 5"), 400);
  }

  const reviews = {
    userCreated: req.user,
    name: req.user.name,
    rating,
    comment,
    images,
  };
  const product = await Product.findById(productID);
  const isRated = product.reviewsOfProduct.find(
    (rev) => rev.userCreated.toString() === req.user.id.toString()
  );
  if (isRated) {
    product.reviewsOfProduct.forEach((rev) => {
      if (rev.userCreated.toString() === isRated.userCreated.toString()) {
        rev.comment = reviews.comment;
        rev.rating = reviews.rating;
        rev.images = reviews.images;
        const date = new Date();
        rev.reviewdAt = date.toLocaleDateString();
      }
    });
  } else {
    if (rating !== undefined) {
      product.reviewsOfProduct.push(reviews);
    } else
      return next(
        new ErrorHandler("Please give rating before giving review"),
        400
      );
  }
  let avgRating = 0;
  product.reviewsOfProduct.forEach((rev) => {
    avgRating += rev.rating;
  });

  product.ratings = (avgRating / product.reviewsOfProduct.length).toFixed(1);

  product.numberOfReviews = product.reviewsOfProduct.filter(
    (rev) => rev.comment !== undefined
  ).length;
  product.numberOfRatings = product.reviewsOfProduct.length;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});
// Get all Review

exports.getProductReview = asyncErrorCatcher(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: "reviewsOfProduct",
      populate: {
        path: "userCreated",
        select: "avatar", // Specify the fields you want to retrieve
      },
    })
    .exec();

  if (!product) {
    return next(new ErrorHandler("Product ID not Found", 404));
  }

  let avgRating = 0;
  product.reviewsOfProduct.forEach((rev) => {
    avgRating += rev.rating; 
  });

  const ratingsOfProduct = (
    avgRating / product.reviewsOfProduct.length
  ).toFixed(1);

  const numberOfReviewsOfProduct = product.reviewsOfProduct.filter(
    (rev) => rev.comment !== undefined
  ).length;
  const numberOfRatingsOfProduct = product.reviewsOfProduct.length;

  res.status(200).json({
    success: true,
    reviews: product.reviewsOfProduct,
    ratingsOfProduct,
    numberOfRatingsOfProduct,
    numberOfReviewsOfProduct,
  });
});

// Delete Review

exports.deleteReview = asyncErrorCatcher(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  //ratings
  if (!product) {
    return next(new ErrorHandler("Product ID not Found", 404));
  }
  const rev = product.reviewsOfProduct.filter(
    (rev) => rev._id.toString() !== req.query.revId.toString()
  );
  let avgRating = 0;

  rev.forEach((rev) => {
    avgRating += rev.rating;
  });

  let ratings = (avgRating / rev.length).toFixed(1);
  if (rev.length === 0) {
    ratings = 0;
  }
  const numberOfRatings = rev.length;
  const numberOfReviews = rev.filter((rev) => rev.comment !== undefined).length;

  await Product.findByIdAndUpdate(
    req.params.id,
    {
      reviewsOfProduct: rev,
      ratings,
      numberOfReviews,
      numberOfRatings,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
  });
});
