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


//Start Inquirer Prompts 
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

//View all Departments
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

  //View all Roles
  const viewAllRoles= () => {
      const sql = `SELECT role.*, department.department_name AS department 
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

  //View All Employees
  const viewAllEmployees= () => {
      const sql = `SELECT employee.*,role.title
      AS role FROM employee
      LEFT JOIN role ON employee.role_id = role.id `
      db.query(sql, (err, rows) =>{
        if(err){
            res.status(500).json({ error: err.message});
            return;
        }
        console.table(rows);
        start();
        })
  }

//Add a Department  
  const addDepartment= () => {
    return inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "What is the department name? (Required)",
            validate: (departmentName) => {
              if (departmentName) {
                return true;
              } else {
                console.log("Please enter the deparment name!");
                return false;
              }
            },
          },
        ]).then(department =>{
            const sql = `INSERT INTO department(department_name) VALUES (?)`;
            const params = department.departmentName

            db.query(sql, params, (err, rows)=> {
                if(err){
                    res.status(500).json({ error: err.message});
                    return;
                }
                console.log("Department " + params + " has been added!")
                viewAllDepartments();
                start();
                })
            })
 }

 //Add a role
  const addRole= () => {
    return inquirer.prompt([
        {
            type: "input",
            name: "roleID",
            message: "Enter the role ID?",      
        },
        {
            type: "input",
            name: "roleName",
            message: "Enter the name of the role?",      
        },
        {
            type: "input",
            name: "roleSalary",
            message: "Enter the salary of the role?",      
        },
        {
            type: "input",
            name: "roleDepartment",
            message: "Enter the department of the role?",      
        },
        ]).then(roleChoice =>{
        const sql = `INSERT INTO role (id, title, salary, department_id) VALUES (?, ?, ?, ?)`;
        const params = [roleChoice.roleID, roleChoice.roleName, roleChoice.roleSalary, roleChoice.roleDepartment]

        db.query(sql, params, (err, rows)=> {
            if(err){
                res.status(500).json({ error: err.message});
                return;
            }
            console.log("Role" + roleName + "has been added!")
            viewAllRoles();
            start();
            })
        })
  }


  //Add an employee
  const addEmployee= () => {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?"
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?"
      },
      {
        
          type: 'input',
          name: 'role_id',
          message: "What is the employee's role?"
      },
      {
        type: 'input',
        name: 'manager_id',
        message: "What is the employee's manager ID ?"
      }
    ])
    .then(answers => {
      const sql = `INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)`
      const params = [answers.firstName, answers.lastName, answers.role_id, answers.manager_id]
    
    
    db.query(sql, params, (err, rows)=> {
      if(err){
          res.status(500).json({ error: err.message});
          return;
      }
      console.log("Employee" + answers.firstName + " " + answers.lastName +  " has been added!")
      viewAllEmployees();
      start();
      })
    })
}

  

  const updateEmployeeRole = () => {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: "Enter the employee's ID you want to be updated?",
      },
      {
        type: 'input',
        name: 'role_id',
        message: "What is the role ID of the employee?",
        choices: roles
      }
    ])
    .then(answers => {
      db.query(`UPDATE employee set role_id = ? where id=?`, [answers.role_id, answers.id], (err, rows) => {

        if(err) throw err;
        console.log("Employee role has been updated!")
        viewAllEmployees();
        start();
        })
      })
    }


  
  start();