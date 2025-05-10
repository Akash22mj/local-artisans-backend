// Trying the new code
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Product = require('../models/productModel'); 

// ✅ Debugging Line
console.log("Debug: Imported Product Model:", Product);

// ✅ Add a new product
router.post('/add', async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Error adding product", error });
    }
});

// ✅ Get all products
router.get('/getall', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
});

// ✅ Get product by ID
router.get('/getid/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product", error });
    }
});

// ✅ Delete product by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
});

// ✅ Update product by ID
router.put('/update/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
});

// ✅ Add a review to a product (with averageRating update)
router.post('/review/:id', async (req, res) => {
    try {
        console.log("Received Product ID:", req.params.id);
        console.log("Review Data:", req.body);

        const { id } = req.params;
        const { user, rating, comment } = req.body;

        if (!user || !rating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const product = await Product.findById(id);
        console.log("Fetched Product:", product);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ Add new review
        product.reviews.push({ user, rating, comment });

        // ✅ Calculate new average rating
        const totalReviews = product.reviews.length;
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.averageRating = totalRating / totalReviews;

        await product.save();

        res.status(201).json({ message: "Review added successfully!", product });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Error adding review", error });
    }
});

// ✅ Get all reviews for a product
router.get('/reviews/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select("reviews");
        if (!product) return res.status(404).json({ message: "Product not found" });

        res.json(product.reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error });
    }
});

module.exports = router;
