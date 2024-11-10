const express = require("express");
const cors = require("cors");
const db = require("./config/db.js");
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT','DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ...

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Query database to authenticate user
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length === 0) {
          res.status(401).json({ message: 'Invalid email or password' });
      } else {
          const user = results[0];
          res.json({ authenticated: true, user });
      }
  });
});


// Budget submission endpoint
app.post('/budgets', (req, res) => {
    const {
        project_name,
        budget_year,
        budget_amount,
        currency,
        purpose,
        submitted_by
    } = req.body;
  
    // Validate request data
    if (!project_name || !budget_year || !budget_amount || !purpose || !submitted_by) {
        res.status(400).json({ success: false, message: 'Invalid request data' });
        return;
    }
  
    const project_id = 1;
    // Here, add your code to insert the data into the database
    const query = 'INSERT INTO budgets (project_id, project_name, budget_year, budget_amount, currency, purpose, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [project_id, project_name, budget_year, budget_amount, currency, purpose, submitted_by];
  
    // Database insertion logic (assuming you use MySQL with a connection object)
   db.query(query, values, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Failed to submit budget' });
        } else {
            res.status(200).json({ success: true, message: 'Budget submitted successfully' });
        }
    });
  });
  
// ...

// Budgets endpoint
// Budgets endpoint
app.get('/fetch-budgets', (req, res) => {
  console.log('Request Headers:', req.headers);
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = authorizationHeader.split(' ')[1];
  console.log('User ID:', userId);

  db.query(
      'SELECT * FROM budgets WHERE submitted_by = ?',
      [userId],
      (err, results) => {
          if (err) {
              console.log('Database query:', `SELECT * FROM budgets WHERE submitted_by = ${userId}`);
              console.error('Database Error:', err);
              return res.status(500).json({ message: 'Internal Server Error' });
          }
          console.log('Database results length:', results.length);
          console.log('Budget Data:', results);
          res.json(results);
      }
  );
});
// Get budget by ID endpoint
app.get('/budgets/:id', (req, res) => {
    const budgetId = req.params.id;

    db.query(
        'SELECT * FROM budgets WHERE id = ?',
        [budgetId],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else if (results.length === 0) {
                res.status(404).json({ message: 'Budget not found' });
            } else {
                res.json(results[0]);
            }
        }
    );
});

// Update budget endpoint
app.put('/budgets/:id', (req, res) => {
    const budgetId = req.params.id;
    const {
        project_name,
        budget_year,
        budget_amount,
        currency,
        purpose
    } = req.body;

    db.query(
        'UPDATE budgets SET project_name = ?, budget_year = ?, budget_amount = ?, currency = ?, purpose = ? WHERE id = ?',
        [project_name, budget_year, budget_amount, currency, purpose, budgetId],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.json({ success: true });
            }
        }
    );
});

function deleteBudget(budgetId) {
    fetch(`http://localhost:3000/delete-budget/${budgetId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${userData ? userData.id : ''}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Remove the deleted row from the table
        const row = document.querySelector(`tr[data-budget-id="${budgetId}"]`);
        if (row) {
            row.remove();
        }
        alert('Budget deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please check console for details.');
    });
}
app.delete('/delete-budget/:id', (req, res) => {
    const budgetId = req.params.id;
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = authorizationHeader.split(' ')[1];

    db.query('DELETE FROM budgets WHERE id = ? AND submitted_by = ?', [budgetId, userId], (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Budget not found or not authorized to delete' });
        }
        res.status(200).json({ message: 'Budget deleted successfully' });
    });
});

// Endpoint to fetch all budget submissions
app.get('/api/budgets', (req, res) => {
    const sql = "SELECT * FROM budgets";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        res.json(results);
    });
});

// Endpoint to approve a budget
// Endpoint to approve a budget
app.patch('/api/budgets/:id/approve', (req, res) => {
    const budgetId = req.params.id;
    const sql = "UPDATE budgets SET status = 'Approved' WHERE id = ?";
    db.query(sql, [budgetId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to approve budget' });
        res.json({ success: true, message: 'Budget approved' });
    });
});

// Endpoint to reject a budget
app.patch('/api/budgets/:id/reject', (req, res) => {
    const budgetId = req.params.id;
    const sql = "UPDATE budgets SET status = 'Rejected' WHERE id = ?";
    db.query(sql, [budgetId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to reject budget' });
        res.json({ success: true, message: 'Budget rejected' });
    });
});

// Endpoint to fetch total budgets and approved budgets count
app.get('/api/budget-summary', (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM budgets) AS total_budget_count,
            (SELECT COUNT(*) FROM budgets WHERE status = 'Approved') AS approved_budget_count
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching budget summary:', err);
            return res.status(500).json({ error: 'Failed to fetch budget summary' });
        }
        
        const { total_budget_count, approved_budget_count } = result[0];
        res.json({
            totalBudget: total_budget_count,
            approvedBudget: approved_budget_count
        });
    });
});

// Endpoint to fetch total budget amount and approved budget amount
app.get('/api/budget-amount-summary', (req, res) => {
    const sql = `
        SELECT
            (SELECT SUM(budget_amount) FROM budgets) AS total_budget_amount,
            (SELECT SUM(budget_amount) FROM budgets WHERE status = 'Approved') AS approved_budget_amount
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching budget amount summary:', err);
            return res.status(500).json({ error: 'Failed to fetch budget amount summary' });
        }
        
        const { total_budget_amount, approved_budget_amount } = result[0];
        res.json({
            totalBudgetAmount: total_budget_amount,
            approvedBudgetAmount: approved_budget_amount
        });
    });
});

// Endpoint to fetch total budget applications submitted by a user
app.get('/api/budgets/total-applications/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // Query the database to count the number of budgets submitted by the user
    const query = 'SELECT COUNT(*) AS totalApplications FROM budgets WHERE submitted_by = ?';
    
    db.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ totalApplications: results[0].totalApplications });
    });
});

// Example of the endpoint to fetch the total accumulated amount for the user's applications
app.get('/api/budgets/total-accumulated-amount/:userId', (req, res) => {
    const userId = req.params.userId;

    // Query the database to get the total accumulated amount for the user's applications
    const query = `
        SELECT SUM(budget_amount) AS totalAccumulatedAmount
        FROM budgets
        WHERE submitted_by = ?
        AND status = 'Approved'
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch accumulated amount' });
        }

        const totalAccumulatedAmount = results[0].totalAccumulatedAmount || 0;
        res.json({ totalAccumulatedAmount });
    });
});


// ...
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});