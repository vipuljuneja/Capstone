import { 
  getAllScenarios,
  getScenarioById,
  initializeDefaultScenarios,
  updateScenarioQuestions,
  SimpleScenario
} from './api';

class ScenarioService {
  /**
   * Get all scenarios
   */
  async getPublishedScenarios(): Promise<SimpleScenario[]> {
    try {
      return await getAllScenarios();
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
      // Return fallback scenarios if API fails
      return this.getFallbackScenarios();
    }
  }

  /**
   * Get scenario by ID
   */
  async getScenarioById(id: string | number): Promise<SimpleScenario> {
    try {
      return await getScenarioById(id);
    } catch (error) {
      console.error(`Failed to fetch scenario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Initialize default scenarios
   */
  async initializeDefaultScenarios(): Promise<SimpleScenario[]> {
    try {
      return await initializeDefaultScenarios();
    } catch (error) {
      console.error('Failed to initialize default scenarios:', error);
      throw error;
    }
  }

  /**
   * Update scenario questions for specific level
   */
  async updateScenarioQuestions(
    id: string | number,
    level: 'level1' | 'level2' | 'level3',
    questions: Array<{
      order: number;
      text: string;
      videoUrl: string;
    }>
  ): Promise<SimpleScenario> {
    try {
      return await updateScenarioQuestions(id, level, questions);
    } catch (error) {
      console.error(`Failed to update scenario ${id} questions:`, error);
      throw error;
    }
  }

  /**
   * Fallback scenarios for when API is unavailable
   */
  private getFallbackScenarios(): SimpleScenario[] {
    return [
      {
        _id: 'fallback-1',
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
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'fallback-2',
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
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'fallback-3',
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
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

export default new ScenarioService();
