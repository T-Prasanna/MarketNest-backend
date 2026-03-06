const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, status } = req.body;
    
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, price, category' 
      });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
          publicId: file.filename
        });
      });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      status: status || 'draft',
      images,
      brand: req.user.userId
    });

    const savedProduct = await product.save();
    res.status(201).json({ 
      message: 'Product created successfully', 
      product: savedProduct 
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category } = req.query;
    const query = { isDeleted: false, status: 'published' };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('brand', 'brandName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('brand', 'brandName email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBrandProducts = async (req, res) => {
  try {
    const products = await Product.find({
      brand: req.user.userId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      brand: req.user.userId,
      isDeleted: false
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    const { name, description, price, category, status } = req.body;
    
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (status) product.status = status;

    if (req.files && req.files.length > 0) {
      const images = [];
      req.files.forEach(file => {
        images.push({
          url: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
          publicId: file.filename
        });
      });
      product.images = images;
    }

    const updatedProduct = await product.save();
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      brand: req.user.userId,
      isDeleted: false
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    product.isDeleted = true;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Product.countDocuments({
      brand: req.user.userId,
      isDeleted: false
    });

    const published = await Product.countDocuments({
      brand: req.user.userId,
      status: 'published',
      isDeleted: false
    });

    const archived = await Product.countDocuments({
      brand: req.user.userId,
      isDeleted: true
    });

    res.json({ total, published, archived });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
