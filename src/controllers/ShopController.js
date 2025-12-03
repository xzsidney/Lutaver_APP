const Item = require('../models/Item');
const Character = require('../models/Character');
const CharacterItem = require('../models/CharacterItem');
const Effect = require('../models/Effect');

const ShopController = {
    // Show shop page with all items for sale
    index: async (req, res) => {
        try {
            const { characterId } = req.params;
            const { type, sort } = req.query;
            const where = {};
            let order = [['rarity', 'DESC'], ['price', 'ASC']];

            // Filter by type
            if (type) where.type = type;

            // Sort options
            if (sort === 'price_asc') order = [['price', 'ASC']];
            if (sort === 'price_desc') order = [['price', 'DESC']];
            if (sort === 'name') order = [['name', 'ASC']];

            const items = await Item.findAll({
                where,
                include: [{ model: Effect, as: 'effect' }],
                order
            });

            // Get character and verify ownership
            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect('/my/characters?error=character_not_found');
            }

            // Get character's inventory to check for unique items
            const inventory = await CharacterItem.findAll({
                where: { character_id: character.id },
                include: [{ model: Item, as: 'item' }]
            });

            const ownedItemIds = inventory.map(ci => ci.item_id);

            res.render('player/shop/index', {
                layout: 'layouts/player',
                title: 'Loja de Itens',
                items,
                character,
                ownedItemIds,
                user: req.session.user,
                filters: { type, sort },
                query: req.query
            });
        } catch (error) {
            console.error('Error loading shop:', error);
            res.status(500).send('Erro ao carregar loja');
        }
    },

    // Buy an item
    buy: async (req, res) => {
        try {
            const { characterId, itemId } = req.params;

            // Find character and verify ownership
            const character = await Character.findOne({
                where: {
                    id: characterId,
                    user_id: req.session.user.id
                }
            });

            if (!character) {
                return res.redirect(`/shop/${characterId}?error=no_character`);
            }

            // Find item
            const item = await Item.findByPk(itemId);
            if (!item) {
                return res.redirect(`/shop/${characterId}?error=item_not_found`);
            }

            // Check if character has enough coins
            if (character.coins < item.price) {
                return res.redirect(`/shop/${characterId}?error=not_enough_coins`);
            }

            // Check if item is unique and already owned
            if (item.is_unique) {
                const existing = await CharacterItem.findOne({
                    where: {
                        character_id: character.id,
                        item_id: item.id
                    }
                });

                if (existing) {
                    return res.redirect(`/shop/${characterId}?error=already_owned`);
                }
            }

            // Deduct coins
            character.coins -= item.price;
            await character.save();

            // Add to inventory
            const existingInventoryItem = await CharacterItem.findOne({
                where: {
                    character_id: character.id,
                    item_id: item.id,
                    is_equipped: false
                }
            });

            if (existingInventoryItem && item.stackable) {
                // Increment quantity if stackable
                existingInventoryItem.quantity += 1;
                await existingInventoryItem.save();
            } else {
                // Create new inventory entry
                await CharacterItem.create({
                    character_id: character.id,
                    item_id: item.id,
                    quantity: 1,
                    is_equipped: false
                });
            }

            res.redirect(`/shop/${characterId}?success=purchased`);
        } catch (error) {
            console.error('Error buying item:', error);
            res.redirect(`/shop/${req.params.characterId}?error=purchase_failed`);
        }
    }
};

module.exports = ShopController;
