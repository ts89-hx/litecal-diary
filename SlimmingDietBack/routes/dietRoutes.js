const express = require('express');
const dietController = require('../controllers/dietController');

const router = express.Router();

router.get('/', dietController.getAllDietRecords);
router.get('/search', dietController.searchDietRecords);
router.post('/', dietController.createDietRecord);
router.put('/:id', dietController.updateDietRecord);
router.delete('/:id', dietController.deleteDietRecord);

module.exports = router; 