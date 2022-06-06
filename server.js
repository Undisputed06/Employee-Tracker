const express = require('express');
const res = require('express/lib/response');
const inquirer = require('inquirer');
const mysql = require('mysql2')
const db = require('./db/connection');


const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Default response for any other request (Not Found)
app.use((req, res) => { 
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});



const start = () => {
    return inquirer.prompt([
        {
          type: "list",
          name: "option",
          message:
            "What would you like to do? ",
          choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role","Exit"],
        },
    ]).then(choice =>{
        console.log(choice)
        if (choice.option === "View all departments"){
            viewAllDepartments();
        }
        if(choice.option === "View all roles"){
            viewAllRoles();
        }
        if(choice.option === "View all employees"){
           viewAllEmployees()
        }
        if(choice.option === "Add a department"){
           addDepartment()
        }
        if(choice.option === "Add a role"){
            addRole()
        }
        if(choice.option === "Add an employee"){
            addEmployee()
        }
        if(choice.option === "Update an employee role"){
            updateEmployeeRole()
        }
        if(choice.option === "Exit"){
            return;
        }
    });
  };

  const viewAllDepartments = () => {
      const sql = `SELECT * FROM department`;
      db.query(sql, (err, rows) =>{
        if(err){
            res.status(500).json({ error: err.message});
            return;
        }
        console.table(rows);
        start();
        })
  }

  const viewAllRoles= () => {
      const sql = `SELECT role.title, role.salary, department.department_name AS department 
      FROM role LEFT JOIN department ON role.department_id = department.id`;
      db.query(sql, (err, rows) =>{
        if(err){
            res.status(500).json({ error: err.message});
            return;
        }
        console.table(rows);
        start();
        })
  }

  const viewAllEmployees= () => 
  {}

  const addDepartment= () => 
  {}

  const addRole= () => 
  {}

  const addEmployee= () => 
  {}

  const updateEmployeeRole = () => 
  {}


  
  start();