'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('characters', 'life', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 10
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('characters', 'life');
    }
};
