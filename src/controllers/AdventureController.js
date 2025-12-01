const Adventure = require('../models/Adventure');
const Discipline = require('../models/Discipline');

const AdventureController = {
    /**
     * List all adventures
     */
    list: async (req, res) => {
        try {
            const adventures = await Adventure.findAll({
                include: [{
                    model: Discipline,
                    as: 'discipline'
                }],
                order: [['createdAt', 'DESC']]
            });
            res.render('admin/adventures/index', {
                adventures,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao listar aventuras');
        }
    },

    /**
     * Show adventure details
     */
    show: async (req, res) => {
        try {
            const adventure = await Adventure.findByPk(req.params.id, {
                include: [{
                    model: Discipline,
                    as: 'discipline'
                }]
            });

            if (!adventure) {
                return res.redirect('/admin/adventures');
            }

            // We can also fetch scenes here if we want to show them
            const Scene = require('../models/Scene');
            const scenes = await Scene.findAll({
                where: { adventure_id: adventure.id },
                order: [['order_index', 'ASC']]
            });

            // Note: We might want to keep a separate public view for players later, 
            // but for admin we use the admin structure or a specific admin show view.
            // For now, let's assume we might want a specific admin show view or reuse the form in read-only mode?
            // The user requested a show view for characters, but for adventures the request implies CRUD.
            // Let's redirect to edit for now or render a simple show if needed.
            // Actually, the user asked for "views/admin/adventures/" CRUD.
            // I'll stick to the plan: index and form. The 'show' might be less critical for admin if 'edit' shows everything.
            // However, the previous code had a 'show' method. I'll update it to use an admin template if I create one, 
            // or just redirect to edit for simplicity in this overhaul unless I create 'admin/adventures/show.ejs'.
            // Given the user request "página de LISTAGEM (index) e página de FORM (new/edit)", I will focus on those.
            // I will leave 'show' pointing to the player view OR redirect to edit. 
            // Better yet, let's make 'show' render the form in "read-only" mode or just redirect to edit for admin.
            // But wait, the previous 'show' was for the player? No, it was 'adventures/show'.
            // Let's keep 'show' for the player (public) and 'edit' for admin.
            // BUT, the controller is shared? 
            // If this controller is used by admins, I should update the paths.
            // If it's used by players, I should be careful.
            // The user said "Os CONTROLADORES e MODELOS já existem." and "A área admin é protegida".
            // Usually we separate AdminController from PublicController.
            // Here it seems we are using the same controller.
            // I will assume this controller is primarily for the admin CRUD based on the methods (create, update, delete).
            // Player viewing is handled by PlayController? Yes, PlayController exists.
            // So AdventureController is likely for Admin/Teacher.

            // I'll redirect show to edit for admin convenience or render the form disabled.
            // Or I can create a simple show view. 
            // For now, I'll redirect to edit to save time/space unless requested otherwise.
            res.redirect(`/admin/adventures/${adventure.id}/edit`);

        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao exibir aventura');
        }
    },

    /**
     * Show create form
     */
    createPage: async (req, res) => {
        try {
            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            res.render('admin/adventures/form', {
                disciplines,
                error: null,
                user: req.session.user,
                adventure: null
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao carregar formulário');
        }
    },

    /**
     * Create new adventure
     */
    create: async (req, res) => {
        const { title, discipline_id, school_year, difficulty, description, objectives, reward_xp, reward_item, is_active } = req.body;

        try {
            await Adventure.create({
                title,
                discipline_id,
                school_year,
                difficulty: parseInt(difficulty),
                description,
                objectives,
                reward_xp: parseInt(reward_xp) || 100,
                reward_item,
                is_active: is_active === 'on'
            });

            res.redirect('/admin/adventures');
        } catch (error) {
            console.error(error);
            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            res.render('admin/adventures/form', {
                disciplines,
                error: 'Erro ao criar aventura',
                user: req.session.user,
                adventure: null
            });
        }
    },

    /**
     * Show edit form
     */
    editPage: async (req, res) => {
        try {
            const adventure = await Adventure.findByPk(req.params.id, {
                include: [{
                    model: Discipline,
                    as: 'discipline'
                }]
            });

            if (!adventure) {
                return res.redirect('/admin/adventures');
            }

            const disciplines = await Discipline.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });

            res.render('admin/adventures/form', {
                adventure,
                disciplines,
                error: null,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.redirect('/admin/adventures');
        }
    },

    /**
     * Update adventure
     */
    update: async (req, res) => {
        const { id } = req.params;
        const { title, discipline_id, school_year, difficulty, description, objectives, reward_xp, reward_item, is_active } = req.body;

        try {
            const adventure = await Adventure.findByPk(id);
            if (!adventure) {
                return res.redirect('/admin/adventures');
            }

            adventure.title = title;
            adventure.discipline_id = discipline_id;
            adventure.school_year = school_year;
            adventure.difficulty = parseInt(difficulty);
            adventure.description = description;
            adventure.objectives = objectives;
            adventure.reward_xp = parseInt(reward_xp) || 100;
            adventure.reward_item = reward_item;
            adventure.is_active = is_active === 'on';

            await adventure.save();

            res.redirect('/admin/adventures');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao atualizar aventura');
        }
    },

    /**
     * Delete adventure
     */
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await Adventure.destroy({ where: { id } });
            res.redirect('/admin/adventures');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao excluir aventura');
        }
    }
};

module.exports = AdventureController;
