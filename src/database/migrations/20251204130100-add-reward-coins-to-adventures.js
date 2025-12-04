'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('adventures', 'reward_coins', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 50,
            comment: 'Moedas ganhas ao completar'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('adventures', 'reward_coins');
    }
};
