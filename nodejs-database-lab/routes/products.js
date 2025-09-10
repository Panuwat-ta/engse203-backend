const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - ดึงข้อมูล products ทั้งหมด
router.get('/', async (req, res) => {
    try {
        console.log('📖 Getting all products...');
        const products = await Product.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            message: 'Products retrieved successfully',
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('❌ Error getting products:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message
        });
    }
});

// GET /api/products/:id - ดึงข้อมูล product ตาม ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📖 Getting product with ID: ${id}`);
        
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Product not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            message: 'Product retrieved successfully',
            data: product
        });
    } catch (error) {
        console.error('❌ Error getting product:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get product',
            error: error.message
        });
    }
});

// POST /api/products - เพิ่ม product ใหม่
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        console.log('📝 Creating new product:', productData);
        
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        });
    } catch (error) {
        console.error('❌ Error creating product:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// PUT /api/products/:id - อัพเดท product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;
        console.log(`✏️ Updating product ID: ${id}`, productData);
        
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            productData, 
            { new: true } // return updated document
        );
        
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: `Product not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('❌ Error updating product:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// DELETE /api/products/:id - ลบ product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting product ID: ${id}`);
        
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: `Product not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting product:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

module.exports = router;