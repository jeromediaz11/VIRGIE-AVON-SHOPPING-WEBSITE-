import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Like from '../models/likeModel.js';
import { isAuth } from '../utils.js';
import Product from '../models/productModel.js';

const likeRoute = express.Router();

likeRoute.post(
'/',
isAuth,
expressAsyncHandler(async (req, res) => {
    const { productId } = req.body;
  
    try {
      // Check if the user already liked the product
      const existingLike = await Like.findOne({product: productId, user: req.user._id });
  
      if (existingLike) {
        // If already liked, remove the like
        await Like.findOneAndRemove({product: productId, user:  req.user._id });
      } else {
        // If not liked, add a new like
        const newLike = new Like({
          product: productId,
          user:  req.user._id,
        });
  
        await newLike.save();
      }
  
      res.status(200).json({ message: 'Like updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
    })
);
  
  // Get likes for a specific user
likeRoute.get('/', isAuth, async (req, res) => {
    const user = req.user._id;

    try {
        const userLikes = await Like.find({ user }).populate('product');
        res.json(userLikes);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all likes for a specific user
likeRoute.get(
  '/product',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      // Fetch liked products from the Like collection
      const likedProducts = await Like.find({ user: req.user._id });
  
      // Extract product IDs from likedProducts
      const productIds = likedProducts.map(like => like.product);
  
      // Fetch details of the liked products from the Product collection
      const products = await Product.find({ _id: { $in: productIds } });
  
      res.json(products);
    } catch (error) {
      console.error('Error fetching liked products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  })
);

// Other like-related routes can be added as needed
  export default likeRoute;