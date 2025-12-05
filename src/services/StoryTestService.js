/**
 * StoryTestService
 * 
 * Service for handling attribute tests in narrative stories
 * Implements the 1d10 + attribute >= difficulty mechanic
 */

class StoryTestService {
    /**
     * Roll a d10 (returns number between 1 and 10)
     * @returns {number} Random number from 1 to 10
     */
    static rollDice() {
        return Math.floor(Math.random() * 10) + 1;
    }

    /**
     * Perform an attribute test for a character
     * @param {Object} character - Character instance with attributes
     * @param {string} attribute - Attribute name (strength, dexterity, constitution, intelligence, reasoning, luck)
     * @param {number} difficulty - Difficulty of the test
     * @returns {Object} Test result with success, roll, attributeValue, total, difficulty
     */
    static performAttributeTest(character, attribute, difficulty) {
        // Validate attribute exists
        const validAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'reasoning', 'luck'];
        if (!validAttributes.includes(attribute)) {
            throw new Error(`Invalid attribute: ${attribute}`);
        }

        // Get attribute value from character
        const attributeValue = character[attribute] || 0;

        // Roll 1d10
        const roll = this.rollDice();

        // Calculate total
        const total = roll + attributeValue;

        // Check if passed
        const success = total >= difficulty;

        return {
            success,
            roll,
            attributeValue,
            total,
            difficulty,
            attribute
        };
    }

    /**
     * Get attribute display name in Portuguese
     * @param {string} attribute - Attribute name in English
     * @returns {string} Attribute name in Portuguese
     */
    static getAttributeNamePT(attribute) {
        const names = {
            strength: 'Força',
            dexterity: 'Destreza',
            constitution: 'Constituição',
            intelligence: 'Inteligência',
            reasoning: 'Sabedoria',
            luck: 'Sorte'
        };
        return names[attribute] || attribute;
    }
}

module.exports = StoryTestService;
