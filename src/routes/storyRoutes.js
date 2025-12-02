const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

// List stories
router.get('/', storyController.listStories);

// Start a story
router.get('/:storyId/start/:characterId', storyController.startStory);

// View a scene
router.get('/:storyId/scene/:sceneId/:characterId', storyController.showScene);

// Make a choice
router.post('/:storyId/scene/:sceneId/:characterId/choose', storyController.chooseOption);

// End story
router.get('/:storyId/end/:characterId', storyController.endStory);

module.exports = router;
