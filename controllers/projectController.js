const db = require('./config/db');

const createProject = async (req, res) => {
    try {
        const { name, description, managerId, regionId, startDate, endDate, budget } = req.body;
        const query = 'INSERT INTO projects SET ?';
        const project = await db.execute(query, { name, description, managerId, regionId, startDate, endDate, budget });
        res.json({ message: 'Project created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating project' });
    }
};

const getProjects = async (req, res) => {
    try {
        const query = 'SELECT * FROM projects';
        const projects = await db.execute(query);
        res.json(projects[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
};

const assignBudget = async (req, res) => {
    try {
        const { projectId, budgetId } = req.body;
        const query = 'UPDATE projects SET budget_id = ? WHERE id = ?';
        await db.execute(query, [budgetId, projectId]);
        res.json({ message: 'Budget assigned to project successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning budget to project' });
    }
};

module.exports = { createProject, getProjects, assignBudget };