const express = require('express');
const {
    getUserData,
    getHabits,
    getWeightRecords,
    getDietRecords,
    getSportRecords,
    saveDietData,
    saveWeightRecord,
    saveDietRecord,
    saveSportRecord,
    saveMetabolicCalculation,
    getMetabolicCalculation,
    saveOrUpdateHabit,
    getDietGoals,
    saveSelectedFoods,
    getSelectedFoods,
    getDietData,
    clearSportRecords,
    clearDietRecords,
    saveDietGoals,
    updateAccountInfo,
    updateUserAge,
    updateUserGender,
    updateUserHeight,
    updateUserActivityLevel,
    updateUserTarget
} = require('../controllers/recordController');

const router = express.Router();

router.get('/user/:userId', getUserData);
router.get('/habits/:userId', getHabits);
router.get('/weight/:userId', getWeightRecords);
router.get('/diet/:userId', getDietRecords);
router.get('/sport/:userId', getSportRecords);
router.post('/diet-data', saveDietData);
router.post('/weight', saveWeightRecord);
router.post('/diet', saveDietRecord);
router.post('/sport', saveSportRecord);
router.post('/metabolic', saveMetabolicCalculation);
router.get('/metabolic/:userId', getMetabolicCalculation);
router.post('/habit', saveOrUpdateHabit);
// router.post('/diet-goals', getDietGoals);
router.post('/user/age', updateUserAge);
router.post('/user/gender', updateUserGender);
router.post('/user/height', updateUserHeight);
router.post('/user/activityLevel', updateUserActivityLevel);
router.post('/user/target', updateUserTarget);
router.get('/diet-goals/:userId', getDietGoals);
router.post('/selected-foods', saveSelectedFoods);
router.get('/selected-foods/:userId', getSelectedFoods);
router.get('/diet-data/:userId', getDietData);
router.delete('/sport/:userId', clearSportRecords);
router.delete('/diet/:userId', clearDietRecords);
router.post('/diet-goals', saveDietGoals);
router.put('/account/:userId', updateAccountInfo);
router.post('/account/:userId', updateAccountInfo);
module.exports = router; 