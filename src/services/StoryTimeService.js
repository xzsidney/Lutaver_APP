/**
 * StoryTimeService
 * 
 * Service for managing time in narrative stories
 * Handles the 480-minute time limit (8 hours of school)
 */

class StoryTimeService {
    /**
     * Total time available in minutes (8 hours)
     */
    static TOTAL_TIME = 480;

    /**
     * Initialize time for a new story progress
     * @param {Object} storyProgress - StoryProgress instance
     * @returns {number} Initial time (480 minutes)
     */
    static initializeTime(storyProgress) {
        storyProgress.time_remaining = this.TOTAL_TIME;
        return this.TOTAL_TIME;
    }

    /**
     * Consume time from story progress
     * @param {Object} storyProgress - StoryProgress instance
     * @param {number} minutes - Minutes to consume
     * @returns {number} Remaining time after consumption
     */
    static consumeTime(storyProgress, minutes) {
        if (!storyProgress.time_remaining) {
            storyProgress.time_remaining = this.TOTAL_TIME;
        }

        storyProgress.time_remaining -= minutes;
        return storyProgress.time_remaining;
    }

    /**
     * Check if there is time remaining
     * @param {Object} storyProgress - StoryProgress instance
     * @returns {boolean} True if time remaining > 0
     */
    static hasTimeRemaining(storyProgress) {
        return (storyProgress.time_remaining || 0) > 0;
    }

    /**
     * Format time for display in Portuguese
     * @param {number} minutes - Time in minutes
     * @returns {string} Formatted time (e.g., "7h 30min" or "45 minutos")
     */
    static formatTimeDisplay(minutes) {
        if (minutes <= 0) {
            return "0 minutos";
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}min`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins} minutos`;
        }
    }

    /**
     * Get time status with color indication
     * @param {number} minutes - Time in minutes
     * @returns {Object} Status object with color and text
     */
    static getTimeStatus(minutes) {
        const percentage = (minutes / this.TOTAL_TIME) * 100;

        if (percentage > 50) {
            return { color: 'success', text: 'Tempo adequado' };
        } else if (percentage > 25) {
            return { color: 'warning', text: 'Atenção ao tempo!' };
        } else if (percentage > 0) {
            return { color: 'danger', text: 'Tempo crítico!' };
        } else {
            return { color: 'danger', text: 'Tempo esgotado!' };
        }
    }
}

module.exports = StoryTimeService;
