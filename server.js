const express = require('express');
const res = require('express/lib/response');
const inquirer = require('inquirer');
const mysql = require('mysql2');
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
      const sql = `SELECT roles.*, department.department_name AS department 
      FROM roles LEFT JOIN department ON roles.department_id=department.id`;
      db.query(sql, (err, rows) =>{
        if(err){
          console.log("error = "+ err)
          res.status(500).json({ error: err.message});
          return;
      }
        console.table(rows);
        start();
        })
  }

  //View All Employees
  const viewAllEmployees= () => {
      const sql = `SELECT employee.*,roles.title, roles.salary, department.department_name 
      AS department
      FROM employee
      LEFT JOIN roles 
      ON employee.role_id = roles.id
      LEFT JOIN department
      ON roles.department_id = department.id `
      db.query(sql, (err, rows) =>{
        if(err){
          console.log("error = "+ err)
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
          let dept;
          switch(roleChoice.roleDepartment){
            case "Sales":
              dept = 1;
              break;
            case "Engineering":
              dept = 2; 
              break;
            case "Finance":
              dept =3;
              break;
            case "Legal":
              dept = 4;
               break;
          
          }
        const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;
        const params = [roleChoice.roleName, roleChoice.roleSalary, dept]

        db.query(sql, params, (err, rows)=> {
          if(err){
            // console.log("error = "+ err)
            res.status(500).json({ error: err.message});
            return;
        }
            console.log("Role " + roleChoice.roleName + " has been added!")
            viewAllRoles();
            start();
            })
        })
  }


  //Add an employee
  const addEmployee = () => {
    const sql = "SELECT id, title FROM roles";
    db.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      const roleArray = results.map((role) => role.title);
      const roleList = results;
      const sql = "SELECT * FROM employee"


      db.query(sql,(error, results) => {
        if (error) {
          throw error;
        }
        const managerArray = results.map(
          (manager) => manager.first_name + " " + manager.last_name
        );
        const managerList = results;
        
        const employeeQuestions = [
          {
            type: "input",
            name: "firstName",
            message: "What is the first name of the new employee?",
          },
          {
            type: "input",
            name: "lastName",
            message: "What is the last name of the new employee?",
          },
          {
            type: "list",
            name: "role",
            message: "Which role will this new employee fill?",
            choices: roleArray
          },
          {
            type: "list",
            name: "employeeManager",
            message: "Who is the manager of the new employee?",
            choices: managerArray
          },
        ];
        inquirer.prompt(employeeQuestions).then((answer) => {
          const role = roleList.find((roles) => roles.title === answer.role);
          const manager = managerList.find((employeeManager) => {
            const fullName = employeeManager.first_name + " " + employeeManager.last_name;
            return fullName === answer.employeeManager;
          });
          console.log(roleList, role);
          const sql =
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
          db.query(
            sql,
            [answer.firstName, answer.lastName, role.id, manager.id],
            (error, results) => {
              if (error) {
                throw error;
              }
              viewAllEmployees();
              start();
            }
          );
        });
      });
    });
  }
  
  //update employee role 
  const updateEmployeeRole = () => {
    const sql= "SELECT * FROM employee";
    db.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      const employeeList = results;
      const employeeArray = results.map(
        (employee) => employee.first_name + " " + employee.last_name
      );
      db.query("SELECT * FROM roles", (error, results) => {
        if (error) {
          throw error;
        }
        const roleArray = results.map((role) => role.title);
        const roleList = results;
        const changeQuestions = [
          {
            type: "list",
            name: "employee",
            message: "Which employee would you like to update?",
            choices: employeeArray,
          },
          {
            type: "list",
            name: "role",
            message: "Which role would you like this employee to have?",
            choices: roleArray,
          },
        ];
        inquirer.prompt(changeQuestions).then((answer) => {
          const employeeMatch = employeeList.find((employee) => {
            const fullName = employee.first_name + " " + employee.last_name;
            return fullName === answer.employee;
          });
          const role = roleList.find((role) => role.title === answer.role);
          db.query(
            `UPDATE employee SET role_id=${role.id} WHERE id =${employeeMatch.id}`,
            function (error, results) {
              if (error) {
                throw error;
              }
              viewAllEmployees();
              start();
            }
          );
        });
      });
    });
  }

  
  start();