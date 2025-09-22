import express from 'express';
import {
  createCrop,
  getAllCrops,
  getPaginatedCrops,
  getCropById,
  updateCrop,
  deleteCrop
} from '../controllers/crop.controller.js';

const router = express.Router();

router.post('/', createCrop); // creating new entry
router.get('/', getAllCrops); // get all at once
router.get('/paginated', getPaginatedCrops); // paginated list
router.get('/:cropId', getCropById); // specific crop info
router.put('/:cropId', updateCrop); // update info
router.delete('/:cropId', deleteCrop); // deleting

export default router;