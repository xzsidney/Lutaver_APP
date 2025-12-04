const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');
const Item = require('../models/Item');
const Effect = require('../models/Effect');
const ActiveEffect = require('../models/ActiveEffect');
const ItemUsageLog = require('../models/ItemUsageLog');
const ItemBonusService = require('../services/ItemBonusService');

const InventoryController = {
    // Show character inventory
    index: async (req, res) => {
        try {
            const { characterId } = req.params;

            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect('/my/characters?error=character_not_found');
            }

            // Get all inventory items
            const inventory = await CharacterItem.findAll({
                where: { character_id: character.id },
                include: [{
                    model: Item,
                    as: 'item',
                    include: [{ model: Effect, as: 'effect' }]
                }],
                order: [['is_equipped', 'DESC'], ['createdAt', 'DESC']]
            });

            // Separate equipped items by slot
            const equippedItems = {
                head: inventory.find(ci => ci.is_equipped && ci.item.slot === 'head'),
                body: inventory.find(ci => ci.is_equipped && ci.item.slot === 'body'),
                feet: inventory.find(ci => ci.is_equipped && ci.item.slot === 'feet'),
                accessory: inventory.find(ci => ci.is_equipped && ci.item.slot === 'accessory')
            };

            // Group inventory by type
            const inventoryByType = {
                consumable: inventory.filter(ci => !ci.is_equipped && ci.item.type === 'consumable'),
                equipment: inventory.filter(ci => !ci.is_equipped && ci.item.type === 'equipment'),
                key: inventory.filter(ci => !ci.is_equipped && ci.item.type === 'key'),
                cosmetic: inventory.filter(ci => !ci.is_equipped && ci.item.type === 'cosmetic')
            };

            res.render('inventory/index', {
                character,
                equippedItems,
                inventoryByType,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error loading inventory:', error);
            res.status(500).send('Erro ao carregar inventário');
        }
    },

    // Use a consumable item
    useItem: async (req, res) => {
        try {
            const { characterId, itemId } = req.params;

            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect(`/inventory/${characterId}?error=no_character`);
            }

            const characterItem = await CharacterItem.findOne({
                where: {
                    character_id: character.id,
                    item_id: itemId,
                    is_equipped: false
                },
                include: [{
                    model: Item,
                    as: 'item',
                    include: [{ model: Effect, as: 'effect' }]
                }]
            });

            if (!characterItem) {
                return res.redirect(`/inventory/${characterId}?error=item_not_found`);
            }

            // Verify item is consumable
            if (characterItem.item.type !== 'consumable') {
                return res.redirect(`/inventory/${characterId}?error=not_consumable`);
            }

            // Apply effect
            if (characterItem.item.effect_id) {
                // Create active effect
                await ActiveEffect.create({
                    character_id: character.id,
                    effect_id: characterItem.item.effect_id,
                    source_power_id: null,
                    remaining_turns: characterItem.item.effect.duration_value || 0,
                    is_expired: false
                });
            }

            // Apply bonus_json (instant effects like healing, stat boosts)
            let bonusResult = null;
            if (characterItem.item.bonus_json) {
                bonusResult = await ItemBonusService.applyBonus(
                    character,
                    characterItem.item.bonus_json
                );

                if (!bonusResult.success) {
                    console.error('Failed to apply bonus:', bonusResult.message);
                }
            }

            // Decrement quantity
            characterItem.quantity -= 1;

            if (characterItem.quantity <= 0) {
                await characterItem.destroy();
            } else {
                await characterItem.save();
            }

            // Log item usage for analytics and auditing
            try {
                await ItemUsageLog.create({
                    character_id: character.id,
                    item_id: characterItem.item.id,
                    item_name: characterItem.item.name,
                    bonus_applied: bonusResult ? bonusResult.applied : null,
                    success: bonusResult ? bonusResult.success : true,
                    error_message: bonusResult && !bonusResult.success ? bonusResult.message : null,
                    used_at: new Date()
                });
            } catch (logError) {
                // Don't fail the main operation if logging fails
                console.error('Failed to log item usage:', logError);
            }

            // Build success message with bonus details
            let successMsg = 'item_used';
            if (bonusResult && bonusResult.applied && bonusResult.applied.length > 0) {
                const bonusDesc = ItemBonusService.describeBonus(characterItem.item.bonus_json);
                successMsg = `item_used&bonus=${encodeURIComponent(bonusDesc)}`;
            }

            res.redirect(`/inventory/${characterId}?success=${successMsg}`);
        } catch (error) {
            console.error('Error using item:', error);
            res.redirect(`/inventory/${req.params.characterId}?error=use_failed`);
        }
    },

    // Equip an equipment item
    equipItem: async (req, res) => {
        try {
            const { characterId, itemId } = req.params;

            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect(`/inventory/${characterId}?error=no_character`);
            }

            const characterItem = await CharacterItem.findOne({
                where: {
                    character_id: character.id,
                    item_id: itemId,
                    is_equipped: false
                },
                include: [{
                    model: Item,
                    as: 'item',
                    include: [{ model: Effect, as: 'effect' }]
                }]
            });

            if (!characterItem) {
                return res.redirect(`/inventory/${characterId}?error=item_not_found`);
            }

            // Verify item is equipment
            if (characterItem.item.type !== 'equipment') {
                return res.redirect(`/inventory/${characterId}?error=not_equipment`);
            }

            const slot = characterItem.item.slot;

            // Find currently equipped item in same slot
            const currentlyEquipped = await CharacterItem.findOne({
                where: {
                    character_id: character.id,
                    is_equipped: true
                },
                include: [{
                    model: Item,
                    as: 'item',
                    where: { slot }
                }]
            });

            // Unequip current item
            if (currentlyEquipped) {
                currentlyEquipped.is_equipped = false;
                await currentlyEquipped.save();

                // Remove effect from currently equipped item
                if (currentlyEquipped.item.effect_id) {
                    await ActiveEffect.destroy({
                        where: {
                            character_id: character.id,
                            effect_id: currentlyEquipped.item.effect_id,
                            source_power_id: null
                        }
                    });
                }
            }

            // Equip new item
            characterItem.is_equipped = true;
            await characterItem.save();

            // Apply effect
            if (characterItem.item.effect_id) {
                await ActiveEffect.create({
                    character_id: character.id,
                    effect_id: characterItem.item.effect_id,
                    source_power_id: null,
                    remaining_turns: null, // Equipment effects are permanent until unequipped
                    is_expired: false
                });
            }

            res.redirect(`/inventory/${characterId}?success=item_equipped`);
        } catch (error) {
            console.error('Error equipping item:', error);
            res.redirect(`/inventory/${req.params.characterId}?error=equip_failed`);
        }
    },

    // Unequip an equipment item
    unequipItem: async (req, res) => {
        try {
            const { characterId, itemId } = req.params;

            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect(`/inventory/${characterId}?error=no_character`);
            }

            const characterItem = await CharacterItem.findOne({
                where: {
                    character_id: character.id,
                    item_id: itemId,
                    is_equipped: true
                },
                include: [{
                    model: Item,
                    as: 'item',
                    include: [{ model: Effect, as: 'effect' }]
                }]
            });

            if (!characterItem) {
                return res.redirect(`/inventory/${characterId}?error=item_not_found`);
            }

            // Unequip
            characterItem.is_equipped = false;
            await characterItem.save();

            // Remove effect
            if (characterItem.item.effect_id) {
                await ActiveEffect.destroy({
                    where: {
                        character_id: character.id,
                        effect_id: characterItem.item.effect_id,
                        source_power_id: null
                    }
                });
            }

            res.redirect(`/inventory/${characterId}?success=item_unequipped`);
        } catch (error) {
            console.error('Error unequipping item:', error);
            res.redirect(`/inventory/${req.params.characterId}?error=unequip_failed`);
        }
    },

    // Discard an item
    discardItem: async (req, res) => {
        try {
            const { characterId, itemId } = req.params;

            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect(`/inventory/${characterId}?error=no_character`);
            }

            const characterItem = await CharacterItem.findOne({
                where: {
                    character_id: character.id,
                    item_id: itemId,
                    is_equipped: false
                },
                include: [{ model: Item, as: 'item' }]
            });

            if (!characterItem) {
                return res.redirect(`/inventory/${characterId}?error=item_not_found`);
            }

            // Prevent discarding key items
            if (characterItem.item.type === 'key') {
                return res.redirect(`/inventory/${characterId}?error=cannot_discard_key`);
            }

            await characterItem.destroy();

            res.redirect(`/inventory/${characterId}?success=item_discarded`);
        } catch (error) {
            console.error('Error discarding item:', error);
            res.redirect(`/inventory/${req.params.characterId}?error=discard_failed`);
        }
    }
};

module.exports = InventoryController;
