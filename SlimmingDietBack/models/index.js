// SlimmingDietBack/models/index.js
const User = require('./user');
const WeightRecord = require('./WeightRecord');
const DietRecord = require('./DietRecord');
const SportRecord = require('./SportRecord');
const MetabolicCalculation = require('./MetabolicCalculation');
const HealthyHabit = require('./HealthyHabit');
const DietGoal = require('./DietGoal');
const VerificationCode = require('./verificationCode');
const DietData = require('./DietData');
const DietSelection = require('./dietSelection');
const SportSelection = require('./sportSelection');
const UserPlan = require('./UserPlan');

module.exports = {
    User,
    WeightRecord,
    DietRecord,
    SportRecord,
    MetabolicCalculation,
    HealthyHabit,
    DietGoal,
    VerificationCode,
    DietData,
    DietSelection,
    SportSelection,
    UserPlan
};
