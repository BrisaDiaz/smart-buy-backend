import express from 'express';

import {getTrackedProduct, trackProduct, updateProductPrice} from '../../controllers';
const router = express.Router();

router.get('/products', getTrackedProduct);
router.post('/products', trackProduct);
router.put('/products', updateProductPrice);
export default router;
