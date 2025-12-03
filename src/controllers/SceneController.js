const Scene = require('../models/Scene');
const Adventure = require('../models/Adventure');

module.exports = {
    // LISTA – GET /admin/scenes
    async index(req, res) {
        try {
            const scenes = await Scene.findAll({
                include: [
                    { model: Adventure, as: 'adventure' },
                    { model: Scene, as: 'successScene' },
                    { model: Scene, as: 'failureScene' }
                ],
                order: [['id', 'ASC']]
            });

            return res.render('admin/scenes/index', {
                title: 'Cenas - Painel Admin',
                scenes
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar cenas');
        }
    },

    // FORM NOVA – GET /admin/scenes/new
    async create(req, res) {
        try {
            const adventures = await Adventure.findAll({
                order: [['name', 'ASC']]
            });

            // Podemos também listar cenas para escolher success/failure
            const scenes = await Scene.findAll({
                order: [['id', 'ASC']]
            });

            return res.render('admin/scenes/new', {
                title: 'Nova cena',
                adventures,
                scenes
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar formulário de cena');
        }
    },

    // SALVAR – POST /admin/scenes
    async store(req, res) {
        try {
            const {
                name,
                description,
                adventure_id,
                order,
                difficulty,
                success_scene_id,
                failure_scene_id
            } = req.body;

            await Scene.create({
                name,
                description,
                adventure_id,
                order,
                difficulty,
                success_scene_id: success_scene_id || null,
                failure_scene_id: failure_scene_id || null
            });

            return res.redirect('/admin/scenes');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao criar cena');
        }
    },

    // FORM EDITAR – GET /admin/scenes/:id/edit
    async edit(req, res) {
        try {
            const scene = await Scene.findByPk(req.params.id, {
                include: [
                    { model: Adventure, as: 'adventure' },
                    { model: Scene, as: 'successScene' },
                    { model: Scene, as: 'failureScene' }
                ]
            });

            if (!scene) {
                return res.status(404).send('Cena não encontrada');
            }

            const adventures = await Adventure.findAll({
                order: [['name', 'ASC']]
            });

            const scenes = await Scene.findAll({
                order: [['id', 'ASC']]
            });

            return res.render('admin/scenes/edit', {
                title: 'Editar cena',
                scene,
                adventures,
                scenes
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao carregar cena');
        }
    },

    // ATUALIZAR – POST /admin/scenes/:id
    async update(req, res) {
        try {
            const {
                name,
                description,
                adventure_id,
                order,
                difficulty,
                success_scene_id,
                failure_scene_id
            } = req.body;

            await Scene.update(
                {
                    name,
                    description,
                    adventure_id,
                    order,
                    difficulty,
                    success_scene_id: success_scene_id || null,
                    failure_scene_id: failure_scene_id || null
                },
                { where: { id: req.params.id } }
            );

            return res.redirect('/admin/scenes');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao atualizar cena');
        }
    },

    // EXCLUIR – GET /admin/scenes/:id/delete
    async destroy(req, res) {
        try {
            await Scene.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/scenes');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Erro ao excluir cena');
        }
    }
};
