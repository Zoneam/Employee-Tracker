let express = require('express');
let mysql = require('mysql');
let inquirer =require('inquirer');
const whatToDoPrompts = require('./Assets/initial_prompts')
const addEmployeePrompts = require('./Assets/add_employee');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "root12",
    database: "employee_db"
});

function init(){
   // console.clear();
    inquirer.prompt(whatToDoPrompts)
    .then((answers)=>{
        switch (answers.whatToDo) {
            case "View all employees":
                viewAllEmployees();
                return;
            case "View all employees by department":
                viewAllByDepartments();
                return;
            case "View all managers":
                viewAllManagers();
                return;
            case "Add employee":
                addEmployee();
                return;
            case "Quit":
                connection.end();
                return;
        }   
    })
}

function viewAllByDepartments(){
    let departments = [];
    let deptId;
    connection.query('SELECT * FROM employee_db.departments', (err, res) => {
        res.forEach((dept)=>{
            departments.push(dept.id + ": " + dept.name)
        })
        inquirer.prompt([{
            message: "Chose Department",
            name: "department",
            type: "list",
            choices: departments
        }])
            .then((answer)=>{
                deptId = answer.department.split(":")
                console.log(deptId)
                connection.query(`SELECT CONCAT(first_name," ", last_name) AS '${deptId[1]} Department' FROM employees WHERE role_id = ${deptId[0]}`, (err, res) =>{
                    console.table(res)
                    init();
                })
            })
    })
}

function viewAllEmployees(){
    connection.query('SELECT * FROM employees JOIN roles ON employees.role_id = roles.id ORDER BY first_name', (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
      });
}

function addEmployee(){
    let employee = [];
    let managers = [];
    let roles = [];
    let managerId = null;
    let roleId;
    inquirer.prompt(addEmployeePrompts)
    .then((answers)=>{
       employee.push(answers)
       connection.query('SELECT first_name, last_name FROM employees', (err, res) => {
        if (err)
            throw err;
        res.forEach((emp) => {
            managers.push(emp.first_name + " " + emp.last_name);
        });
        managers.push("None")
        inquirer.prompt([{
            message: "Who is employees manager ?",
            name: "employeeManager",
            type: "list",
            choices: managers
        }])
        .then((answer)=> {
            employee.push(answer)
            connection.query(`SELECT id FROM employees WHERE CONCAT(first_name, " ", last_name) = '${answer.employeeManager}'`, (err, res) =>{
                if (err)
                    throw err;
                if(res == ""){
                    managerId = null;
                } else {
                    managerId = res[0].id;
                }
                connection.query(`SELECT title FROM roles`, (err, res) =>{
                   // console.log(res)
                    if (err)
                        throw err;
                        res.forEach((role)=> {
                            roles.push(role.title)
                        })
                inquirer.prompt([{ message: "What is the employee's role ?",
                                    name: "employeeRoleId",
                                    type: "list",
                                    choices: roles
                                }])
                                    .then((answer)=>{ 
                                        connection.query(`SELECT id FROM roles WHERE title = '${answer.employeeRoleId}'`, (err, res) =>{
                                            if (err)
                                                throw err;
                                                roleId = res[0].id;
                                                connection.query(
                                                    'INSERT INTO employees SET ?',
                                                    {
                                                    first_name: answers.employeeName,
                                                    last_name: answers.employeeLastName,
                                                    role_id: roleId,
                                                    manager_id: managerId
                                                    },
                                                    (err, res) => {
                                                    if (err) throw err;
                                                    console.log(`Employee added!\n`);
                                                    init();
                                                    }
                                                )
                                        })
                    })
                })

            })
        })
    });
    })
}


function viewAllManagers(){
    let managerIds = [];
    connection.query('SELECT manager_id FROM employees Where manager_id IS NOT NULL GROUP BY manager_id', (err, res) => {
        if (err) throw err;
        res.forEach((id)=>{
            managerIds.push(id.manager_id)
        })
            connection.query(`SELECT CONCAT(first_name," ", last_name) AS "managers" FROM employees WHERE id IN (${managerIds})`, (err, res) =>{
                console.table(res);
                init();
             })  
    })
}






init();