const db = require('./config/db');

const createBudget = async (req, res) => {
    try {
        const { projectId, budgetYear, budgetAmount, purpose } = req.body;
        const query = 'INSERT INTO budgets SET ?';
        const budget = await db.execute(query, { projectId, budgetYear, budgetAmount, purpose });
        res.json({ message: 'Budget created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating budget' });
    }
};

const getBudgets = async (req, res) => {
    try {
        const query = 'SELECT * FROM budgets';
        const budgets = await db.execute(query);
        res.json(budgets[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets' });
    }
};

const approveBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const query = 'UPDATE budgets SET status = ? WHERE id = ?';
        await db.execute(query, ['Approved', budgetId]);
        res.json({ message: 'Budget approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving budget' });
    }
};

const rejectBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const query = 'UPDATE budgets SET status = ? WHERE id = ?';
        await db.execute(query, ['Rejected', budgetId]);
        res.json({ message: 'Budget rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting budget' });
    }
};

module.exports = { createBudget, getBudgets, approveBudget, rejectBudget };