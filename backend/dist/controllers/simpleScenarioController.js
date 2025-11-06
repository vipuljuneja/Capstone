"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDefaultScenarios = exports.deleteScenario = exports.updateScenarioQuestions = exports.updateScenario = exports.getScenarioById = exports.getAllScenarios = exports.createScenario = void 0;
const SimpleScenario_1 = __importDefault(require("../models/SimpleScenario"));
const createScenario = async (req, res) => {
    try {
        const scenarioData = req.body;
        const scenario = await SimpleScenario_1.default.create(scenarioData);
        res.status(201).json({ success: true, data: scenario });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.createScenario = createScenario;
const getAllScenarios = async (req, res) => {
    try {
        const scenarios = await SimpleScenario_1.default.find().sort({ id: 1 });
        res.json({ success: true, data: scenarios });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getAllScenarios = getAllScenarios;
const getScenarioById = async (req, res) => {
    try {
        const { id } = req.params;
        let scenario;
        // Check if id is a valid MongoDB ObjectId (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
            scenario = await SimpleScenario_1.default.findById(id);
        }
        else {
            // Try finding by custom id field (1, 2, 3)
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                scenario = await SimpleScenario_1.default.findOne({ id: numericId });
            }
        }
        if (!scenario) {
            res.status(404).json({ success: false, error: 'Scenario not found' });
            return;
        }
        res.json({ success: true, data: scenario });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getScenarioById = getScenarioById;
const updateScenario = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Try to find by MongoDB _id first, then by custom id field
        let scenario = await SimpleScenario_1.default.findById(id);
        if (!scenario) {
            // Try finding by custom id field (1, 2, 3)
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                scenario = await SimpleScenario_1.default.findOne({ id: numericId });
            }
        }
        if (!scenario) {
            res.status(404).json({ success: false, error: 'Scenario not found' });
            return;
        }
        const updatedScenario = await SimpleScenario_1.default.findByIdAndUpdate(scenario._id, updateData, { new: true, runValidators: true });
        res.json({ success: true, data: updatedScenario });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateScenario = updateScenario;
const updateScenarioQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const { level, questions } = req.body;
        if (!level || !questions) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: level, questions'
            });
            return;
        }
        if (!['level1', 'level2', 'level3'].includes(level)) {
            res.status(400).json({
                success: false,
                error: 'Level must be level1, level2, or level3'
            });
            return;
        }
        // Try to find by MongoDB _id first, then by custom id field
        let scenario = await SimpleScenario_1.default.findById(id);
        if (!scenario) {
            // Try finding by custom id field (1, 2, 3)
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                scenario = await SimpleScenario_1.default.findOne({ id: numericId });
            }
        }
        if (!scenario) {
            res.status(404).json({ success: false, error: 'Scenario not found' });
            return;
        }
        // Update the specific level's questions
        const updateField = `${level}.questions`;
        const updatedScenario = await SimpleScenario_1.default.findByIdAndUpdate(scenario._id, { $set: { [updateField]: questions } }, { new: true, runValidators: true });
        res.json({ success: true, data: updatedScenario });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateScenarioQuestions = updateScenarioQuestions;
const deleteScenario = async (req, res) => {
    try {
        const { id } = req.params;
        // Try to find by MongoDB _id first, then by custom id field
        let scenario = await SimpleScenario_1.default.findById(id);
        if (!scenario) {
            // Try finding by custom id field (1, 2, 3)
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                scenario = await SimpleScenario_1.default.findOne({ id: numericId });
            }
        }
        if (!scenario) {
            res.status(404).json({ success: false, error: 'Scenario not found' });
            return;
        }
        await SimpleScenario_1.default.findByIdAndDelete(scenario._id);
        res.json({ success: true, message: 'Scenario deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.deleteScenario = deleteScenario;
const initializeDefaultScenarios = async (req, res) => {
    try {
        // Check if scenarios already exist
        const existingScenarios = await SimpleScenario_1.default.find({});
        if (existingScenarios.length > 0) {
            res.json({
                success: true,
                message: `Found ${existingScenarios.length} existing scenarios, skipping creation`,
                data: existingScenarios
            });
            return;
        }
        // Create default scenarios
        const scenarios = [
            {
                id: 1,
                title: 'Ordering Coffee',
                description: 'Practice ordering drinks',
                emoji: '☕',
                level1: {
                    questions: [
                        { order: 1, text: "Welcome to our café! What would you like to order today?", videoUrl: "coffee_level1_q1.mp4" },
                        { order: 2, text: "Great choice! What size would you prefer - small, medium, or large?", videoUrl: "coffee_level1_q2.mp4" },
                        { order: 3, text: "Would you like any modifications to your drink?", videoUrl: "coffee_level1_q3.mp4" },
                        { order: 4, text: "Perfect! Your total is $4.50. How would you like to pay?", videoUrl: "coffee_level1_q4.mp4" },
                        { order: 5, text: "Thank you! Your order will be ready in 5 minutes. Have a great day!", videoUrl: "coffee_level1_q5.mp4" }
                    ]
                },
                level2: {
                    questions: [
                        { order: 1, text: "Good morning! I see you're looking at our seasonal menu. Can I help you decide?", videoUrl: "coffee_level2_q1.mp4" },
                        { order: 2, text: "That's a popular choice! Would you like to try our new oat milk alternative?", videoUrl: "coffee_level2_q2.mp4" },
                        { order: 3, text: "Excellent! I can also recommend our fresh pastries. The croissant pairs perfectly with that drink.", videoUrl: "coffee_level2_q3.mp4" },
                        { order: 4, text: "Your order comes to $7.25. We accept card, cash, or mobile payments.", videoUrl: "coffee_level2_q4.mp4" },
                        { order: 5, text: "Perfect! I'll have that ready for you in about 8 minutes. Enjoy your visit!", videoUrl: "coffee_level2_q5.mp4" }
                    ]
                },
                level3: {
                    questions: [
                        { order: 1, text: "Welcome back! I remember you tried our signature blend last time. How did you like it?", videoUrl: "coffee_level3_q1.mp4" },
                        { order: 2, text: "Wonderful! Today we have a special limited edition blend from Colombia. Would you like to try it?", videoUrl: "coffee_level3_q2.mp4" },
                        { order: 3, text: "Great choice! I can prepare it as a pour-over to really bring out the flavor notes. What do you think?", videoUrl: "coffee_level3_q3.mp4" },
                        { order: 4, text: "Excellent! That will be $9.50. Are you interested in joining our loyalty program for future discounts?", videoUrl: "coffee_level3_q4.mp4" },
                        { order: 5, text: "Perfect! Your pour-over will be ready in 12 minutes. I'll bring it to your table when it's done.", videoUrl: "coffee_level3_q5.mp4" }
                    ]
                }
            },
            {
                id: 2,
                title: 'Restaurant',
                description: 'Order food confidently',
                emoji: '🍽️',
                level1: {
                    questions: [
                        { order: 1, text: "Good evening! Welcome to our restaurant. How many people are in your party?", videoUrl: "restaurant_level1_q1.mp4" },
                        { order: 2, text: "Perfect! Right this way. Here are your menus. I'll be back in a moment to take your order.", videoUrl: "restaurant_level1_q2.mp4" },
                        { order: 3, text: "Are you ready to order? What would you like to start with?", videoUrl: "restaurant_level1_q3.mp4" },
                        { order: 4, text: "Excellent choices! How would you like your steak cooked?", videoUrl: "restaurant_level1_q4.mp4" },
                        { order: 5, text: "Perfect! Your food will be ready in about 20 minutes. Enjoy your meal!", videoUrl: "restaurant_level1_q5.mp4" }
                    ]
                },
                level2: {
                    questions: [
                        { order: 1, text: "Good evening! Welcome to our fine dining experience. Do you have a reservation?", videoUrl: "restaurant_level2_q1.mp4" },
                        { order: 2, text: "Wonderful! I see you're celebrating a special occasion. Let me show you to our best table.", videoUrl: "restaurant_level2_q2.mp4" },
                        { order: 3, text: "Our chef has prepared some amazing specials today. Would you like me to tell you about them?", videoUrl: "restaurant_level2_q3.mp4" },
                        { order: 4, text: "Excellent choice! I recommend pairing that with our house wine. Shall I bring the wine list?", videoUrl: "restaurant_level2_q4.mp4" },
                        { order: 5, text: "Perfect! Your meal will be prepared with the finest ingredients. I'll check on you shortly.", videoUrl: "restaurant_level2_q5.mp4" }
                    ]
                },
                level3: {
                    questions: [
                        { order: 1, text: "Good evening! Welcome to our Michelin-starred restaurant. I'm honored to serve you tonight.", videoUrl: "restaurant_level3_q1.mp4" },
                        { order: 2, text: "I see you're interested in our tasting menu. It's a 7-course journey through our chef's vision. Shall we begin?", videoUrl: "restaurant_level3_q2.mp4" },
                        { order: 3, text: "Each course is paired with carefully selected wines. Do you have any dietary restrictions I should know about?", videoUrl: "restaurant_level3_q3.mp4" },
                        { order: 4, text: "Perfect! Our sommelier has prepared an exceptional wine pairing. Would you like to start with champagne?", videoUrl: "restaurant_level3_q4.mp4" },
                        { order: 5, text: "Excellent! Your culinary journey will begin in 10 minutes. I'll personally guide you through each course.", videoUrl: "restaurant_level3_q5.mp4" }
                    ]
                }
            },
            {
                id: 3,
                title: 'Shopping',
                description: 'Shopping conversations',
                emoji: '🛍️',
                level1: {
                    questions: [
                        { order: 1, text: "Welcome to our store! How can I help you find what you're looking for today?", videoUrl: "shopping_level1_q1.mp4" },
                        { order: 2, text: "Great! The electronics section is on the second floor. Would you like me to show you the way?", videoUrl: "shopping_level1_q2.mp4" },
                        { order: 3, text: "I see you're looking at laptops. What will you be using it for?", videoUrl: "shopping_level1_q3.mp4" },
                        { order: 4, text: "Perfect! This model is on sale today for $899. Would you like to see the warranty options?", videoUrl: "shopping_level1_q4.mp4" },
                        { order: 5, text: "Excellent choice! I'll ring this up for you at the register. Follow me!", videoUrl: "shopping_level1_q5.mp4" }
                    ]
                },
                level2: {
                    questions: [
                        { order: 1, text: "Welcome! I'm here to help you find exactly what you need. What brings you in today?", videoUrl: "shopping_level2_q1.mp4" },
                        { order: 2, text: "I see you're interested in our premium collection. Let me show you our latest arrivals.", videoUrl: "shopping_level2_q2.mp4" },
                        { order: 3, text: "This piece is from our exclusive designer line. Would you like to try it on?", videoUrl: "shopping_level2_q3.mp4" },
                        { order: 4, text: "It looks perfect on you! We also have matching accessories. Shall I show you?", videoUrl: "shopping_level2_q4.mp4" },
                        { order: 5, text: "Wonderful! I'll prepare everything for checkout. Would you like to join our VIP program?", videoUrl: "shopping_level2_q5.mp4" }
                    ]
                },
                level3: {
                    questions: [
                        { order: 1, text: "Welcome to our flagship store! I'm your personal shopping consultant. How may I assist you today?", videoUrl: "shopping_level3_q1.mp4" },
                        { order: 2, text: "I see you're looking for something special. We have some exclusive pieces that just arrived from Paris.", videoUrl: "shopping_level3_q2.mp4" },
                        { order: 3, text: "This is a limited edition piece by our featured designer. Only 50 were made worldwide.", videoUrl: "shopping_level3_q3.mp4" },
                        { order: 4, text: "I can arrange for our master tailor to make any adjustments you need. Would you like a private fitting?", videoUrl: "shopping_level3_q4.mp4" },
                        { order: 5, text: "Perfect! I'll arrange everything and have it delivered to your home. Thank you for choosing us!", videoUrl: "shopping_level3_q5.mp4" }
                    ]
                }
            }
        ];
        for (const scenarioData of scenarios) {
            await SimpleScenario_1.default.create(scenarioData);
        }
        const createdScenarios = await SimpleScenario_1.default.find({}).sort({ id: 1 });
        res.json({
            success: true,
            message: 'Default scenarios created successfully',
            data: createdScenarios
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.initializeDefaultScenarios = initializeDefaultScenarios;
//# sourceMappingURL=simpleScenarioController.js.map