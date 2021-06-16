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
    console.clear();
    inquirer.prompt(whatToDoPrompts)
    .then((answers)=>{
        switch (answers.whatToDo) {
            case "View all employees":
                connection.query('SELECT * FROM employees', (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    connection.end();
                  });
                return;
            case "View all employees by department":
               // viewAllByDepartments();
                return;
            case "View all employees by manager":
                viewAllByManager();
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
       // managers.push("None") //////--------------if none -----
        inquirer.prompt([{
            message: "Who is employees manager ?",
            name: "employeeManager",
            type: "list",
            choices: managers
        }])
        .then((answer)=> {
            employee.push(answer)
            //if (answer.employeeManager !== "None") {}
            connection.query(`SELECT id FROM employees WHERE CONCAT(first_name, " ", last_name) = '${answer.employeeManager}'`, (err, res) =>{
                if (err)
                    throw err;
                managerId = res[0].id;


                connection.query(`SELECT title FROM roles`, (err, res) =>{
                    if (err)
                        throw err;
                        res.forEach((role)=> {
                            console.log(role.title)
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
                                                console.log('+++++',res)
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


init();