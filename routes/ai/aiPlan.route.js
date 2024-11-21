const { Router } = require('express');
const  AiPlanController = require('../../controllers/ai/aiPlan.controller');

const aiPlanRouter = Router();
aiPlanRouter.post('/', AiPlanController);

module.exports = aiPlanRouter;
