const express = require('express');
const controller = require('../controllers/mvpController');

const router = express.Router();

router.get('/profile/plan', controller.getProfilePlan);
router.put('/profile/plan', controller.saveProfilePlan);
router.delete('/profile/demo-data', controller.clearDemoData);
router.post('/recognition/food', controller.recognizeFood);
router.get('/catalog/foods', controller.getFoodCatalog);
router.get('/catalog/sports', controller.getSportCatalog);
router.get('/dashboard/daily', controller.getDailyDashboard);
router.get('/diet-records', controller.getDietRecords);
router.post('/diet-records', controller.createDietRecord);
router.patch('/diet-records/:id', controller.updateDietRecord);
router.delete('/diet-records/:id', controller.deleteDietRecord);
router.get('/sport-records', controller.getSportRecords);
router.post('/sport-records', controller.createSportRecord);
router.delete('/sport-records/:id', controller.deleteSportRecord);
router.post('/weights', controller.saveWeight);

module.exports = router;
