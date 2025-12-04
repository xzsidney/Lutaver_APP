/**
 * ItemBonusService
 * 
 * Serviço responsável por aplicar bônus de itens consumíveis aos personagens.
 * Segue o princípio de responsabilidade única e permite fácil extensão de novos tipos de bônus.
 * 
 * Formato do bonus_json suportado:
 * {
 *   // Atributos (bônus permanente)
 *   "strength": 2,
 *   "dexterity": 1,
 *   "constitution": 3,
 *   "intelligence": 2,
 *   "reasoning": 1,
 *   "luck": 1,
 *   
 *   // Recursos
 *   "xp": 100,           // Ganha XP
 *   "coins": 50,         // Ganha moedas
 *   "evolution_points": 5, // Ganha pontos de evolução
 *   
 *   // Multipliers (para bônus percentuais)
 *   "xp_multiplier": 1.5,     // 50% mais XP
 *   "coins_multiplier": 2.0,  // 2x moedas
 *   
 *   // Level up direto (cuidado: pode ser OP)
 *   "levels": 1
 * }
 */

// Lista de atributos válidos do personagem
const STAT_ATTRIBUTES = ['strength', 'dexterity', 'constitution', 'intelligence', 'reasoning', 'luck'];

// Lista de recursos que podem ser adicionados diretamente
const RESOURCE_FIELDS = ['xp', 'coins', 'evolution_points', 'levels'];

/**
 * Aplica o bonus_json de um item ao personagem
 * @param {Object} character - Instância do modelo Character
 * @param {Object} bonusJson - Objeto JSON com os bônus a aplicar
 * @param {Object} options - Opções adicionais (transaction, etc)
 * @returns {Object} Resultado com detalhes do que foi aplicado
 */
async function applyBonus(character, bonusJson, options = {}) {
    if (!bonusJson || typeof bonusJson !== 'object') {
        return { success: false, message: 'Bônus inválido ou vazio', applied: [] };
    }

    const applied = [];
    const oldValues = {};

    try {
        // Salvar valores antigos para log
        STAT_ATTRIBUTES.forEach(attr => {
            oldValues[attr] = character[attr] || 0;
        });
        oldValues.total_xp = character.total_xp || 0;
        oldValues.coins = character.coins || 0;
        oldValues.evolution_points = character.evolution_points || 0;
        oldValues.level = character.level || 1;

        // Aplicar bônus de atributos
        for (const attr of STAT_ATTRIBUTES) {
            if (bonusJson[attr] && typeof bonusJson[attr] === 'number') {
                const bonus = Math.floor(bonusJson[attr]); // Garantir inteiro
                if (bonus !== 0) {
                    character[attr] = (character[attr] || 0) + bonus;
                    applied.push({
                        type: 'attribute',
                        field: attr,
                        value: bonus,
                        oldValue: oldValues[attr],
                        newValue: character[attr]
                    });
                }
            }
        }

        // Aplicar bônus de XP
        if (bonusJson.xp && typeof bonusJson.xp === 'number') {
            const xpBonus = Math.floor(bonusJson.xp);
            character.total_xp = (character.total_xp || 0) + xpBonus;
            applied.push({
                type: 'resource',
                field: 'total_xp',
                value: xpBonus,
                oldValue: oldValues.total_xp,
                newValue: character.total_xp
            });

            // Verificar level up
            const levelsGained = checkAndApplyLevelUp(character);
            if (levelsGained > 0) {
                applied.push({
                    type: 'levelup',
                    field: 'level',
                    value: levelsGained,
                    oldValue: oldValues.level,
                    newValue: character.level
                });
            }
        }

        // Aplicar bônus de moedas
        if (bonusJson.coins && typeof bonusJson.coins === 'number') {
            const coinsBonus = Math.floor(bonusJson.coins);
            character.coins = (character.coins || 0) + coinsBonus;
            applied.push({
                type: 'resource',
                field: 'coins',
                value: coinsBonus,
                oldValue: oldValues.coins,
                newValue: character.coins
            });
        }

        // Aplicar bônus de pontos de evolução
        if (bonusJson.evolution_points && typeof bonusJson.evolution_points === 'number') {
            const epBonus = Math.floor(bonusJson.evolution_points);
            character.evolution_points = (character.evolution_points || 0) + epBonus;
            applied.push({
                type: 'resource',
                field: 'evolution_points',
                value: epBonus,
                oldValue: oldValues.evolution_points,
                newValue: character.evolution_points
            });
        }

        // Aplicar level up direto (cuidado!)
        if (bonusJson.levels && typeof bonusJson.levels === 'number') {
            const levelsToAdd = Math.floor(bonusJson.levels);
            if (levelsToAdd > 0) {
                character.level = (character.level || 1) + levelsToAdd;
                // Dar evolution points por cada nível
                character.evolution_points = (character.evolution_points || 0) + (levelsToAdd * 5);
                applied.push({
                    type: 'levelup',
                    field: 'level',
                    value: levelsToAdd,
                    oldValue: oldValues.level,
                    newValue: character.level,
                    note: 'direct_level_bonus'
                });
            }
        }

        // Salvar personagem
        if (options.transaction) {
            await character.save({ transaction: options.transaction });
        } else {
            await character.save();
        }

        return {
            success: true,
            message: `${applied.length} bônus aplicados com sucesso`,
            applied,
            character: {
                id: character.id,
                name: character.name,
                level: character.level
            }
        };

    } catch (error) {
        console.error('Error applying bonus:', error);
        return {
            success: false,
            message: `Erro ao aplicar bônus: ${error.message}`,
            applied,
            error: error.message
        };
    }
}

/**
 * Verifica e aplica level ups baseado no XP total
 * Fórmula: XP necessário = level * 100
 * @param {Object} character - Instância do Character
 * @returns {number} Quantidade de níveis ganhos
 */
function checkAndApplyLevelUp(character) {
    let levelsGained = 0;

    while (character.total_xp >= character.level * 100) {
        character.level += 1;
        character.evolution_points = (character.evolution_points || 0) + 5;
        levelsGained++;
    }

    return levelsGained;
}

/**
 * Valida se um bonus_json é válido antes de aplicar
 * @param {Object} bonusJson - O objeto de bônus a validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateBonus(bonusJson) {
    const errors = [];

    if (!bonusJson || typeof bonusJson !== 'object') {
        return { valid: false, errors: ['bonus_json deve ser um objeto válido'] };
    }

    const allowedKeys = [...STAT_ATTRIBUTES, ...RESOURCE_FIELDS, 'xp_multiplier', 'coins_multiplier'];

    for (const key of Object.keys(bonusJson)) {
        if (!allowedKeys.includes(key)) {
            errors.push(`Chave desconhecida: ${key}`);
        }

        if (typeof bonusJson[key] !== 'number') {
            errors.push(`${key} deve ser um número`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Gera uma descrição legível dos bônus de um item
 * @param {Object} bonusJson - O objeto de bônus
 * @returns {string} Descrição formatada
 */
function describeBonus(bonusJson) {
    if (!bonusJson || typeof bonusJson !== 'object') {
        return 'Nenhum efeito';
    }

    const descriptions = [];
    const attributeNames = {
        strength: 'Força',
        dexterity: 'Destreza',
        constitution: 'Constituição',
        intelligence: 'Inteligência',
        reasoning: 'Raciocínio',
        luck: 'Sorte',
        xp: 'XP',
        coins: 'Moedas',
        evolution_points: 'Pontos de Evolução',
        levels: 'Níveis'
    };

    for (const [key, value] of Object.entries(bonusJson)) {
        if (typeof value === 'number' && value !== 0) {
            const name = attributeNames[key] || key;
            const sign = value > 0 ? '+' : '';
            descriptions.push(`${sign}${value} ${name}`);
        }
    }

    return descriptions.length > 0 ? descriptions.join(', ') : 'Nenhum efeito';
}

module.exports = {
    applyBonus,
    validateBonus,
    describeBonus,
    checkAndApplyLevelUp,
    STAT_ATTRIBUTES,
    RESOURCE_FIELDS
};
