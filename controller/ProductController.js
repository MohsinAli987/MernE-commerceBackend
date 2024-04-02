const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const Product = require("../models/ProductModels");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");

// create product
exports.createProduct = catchAsyncFunc(async(req, res, next) => {
    // get the id of user that we store while login the user
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Product
exports.getAllProducts = catchAsyncFunc(async(req, res, next) => {
    const resultPerPage = 4;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filters();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productCount,
        resultPerPage,
        filteredProductsCount,
    });
});
// next is just a call back function
exports.updateProduct = catchAsyncFunc(async(req, res, next) => {
    let product = await Product.findById(req.params.id); // wait to find the product
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    // if the product found
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// delete product by id

exports.deleteProduct = catchAsyncFunc(async(req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});

// get a single product from database
exports.getSingleProduct = catchAsyncFunc(async(req, res, next) => {
    //   return next(new ErrorHandler("error details"), 404);
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product,
    });
});

// create a review for the product
exports.createProductReview = catchAsyncFunc(async(req, res, next) => {
    // get the variable
    const { rating, comment, productId } = req.body;

    // create object
    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    // find the product

    const product = await Product.findById(productId);

    // check the review of user
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user.id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((element) => {
            if (element.user.toString() === req.user.id) {
                element.rating = rating;
                element.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // calculate the total rating
    let avg = 0;

    product.reviews.forEach((element) => {
        avg += element.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

// get all reviews of products
exports.getProductReviews = catchAsyncFunc(async(req, res, next) => {
    // get the product review
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

exports.deleteProductReview = catchAsyncFunc(async(req, res, next) => {
    console.log(req.query);
    // find product
    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    // calculate the total rating
    let avg = 0;

    reviews.forEach((element) => {
        avg += element.rating;
    });
    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    // find and update
    await Product.findByIdAndUpdate(
        req.query.productId, {
            reviews,
            ratings,
            numOfReviews,
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});