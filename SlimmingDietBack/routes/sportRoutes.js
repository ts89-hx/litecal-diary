const express = require('express');
const sportController = require('../controllers/sportController');

const router = express.Router();

router.get('/', sportController.getAllSportRecords);
router.post('/', sportController.createSportRecord);
router.put('/:id', sportController.updateSportRecord);
router.delete('/:id', sportController.deleteSportRecord);

module.exports = router; 