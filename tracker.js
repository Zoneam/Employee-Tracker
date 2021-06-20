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
    inquirer.prompt(whatToDoPrompts)
    .then((answers)=>{
        switch (answers.whatToDo) {
            case "View all employees":
                viewAllEmployees();
                return;
            case "View all employees by department":
                viewAllByDepartments();
                return;
            case "View all departments":
                viewAllDepartments();
                return;
            case "View all roles":
                viewAllRoles();
                return;
            case "View all managers":
                viewAllManagers();
                return;
            case "Add employee":
                addEmployee();
                return;
            case "Add role":
                addRole();
                return;
            case "Add department":
                addDepartment();
                return;
            case "Update employee role":
                updateEmloyeeRole();
                return;
            case "Remove department":
                removeDepartment();
                return;
            case "Remove employee":
                removeEmployee();
                return;
            case "Quit":
                console.clear();
                connection.end();
                return;
        }   
    })
}

function removeDepartment(){
    let deparment = [];
    connection.query('SELECT * FROM departments AS `Departments`', (err, res) => {
        if (err) throw err;
        res.forEach((dept)=>{
            deparment.push(dept.name)
        })
        deparment.push("Go Back")
        inquirer.prompt([{
            message: "Which department you want to remove ?",
            name: "department",
            type: "list",
            choices: deparment
        }]).then ((answer)=>{
            if (answer.department === "Go Back") {
                init();
            } else {
            connection.query('DELETE FROM departments WHERE ?',
                {
                    name: answer.department
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`${answer.department} is removed!\n`);
                    init();
                  })
                }
        })
        })
}

function removeEmployee(){
    let employee = [];
        connection.query('SELECT first_name, last_name FROM employees', (err, res) => {
        if (err) throw err;
        res.forEach((emp) => {
            employee.push(emp.first_name + " " + emp.last_name);
        });
        inquirer.prompt([{
            message: "Which employee you want to remove ?",
            name: "employee",
            type: "list",
            choices: employee
        }]).then ((answer)=>{
            connection.query(`DELETE FROM employees WHERE CONCAT(first_name," ",last_name)='${answer.employee}'`,
                (err, res) => {
                    if (err) throw err;
                    console.clear();
                    console.log(`${answer.employee} is removed from employees!`);
                    init();
                  })
        })
        })
}

function updateEmloyeeRole(){
    let employee = [];
    let roles = [];
    let roleId;
    let employeeToBeUpdated
    connection.query('SELECT first_name, last_name FROM employees', (err, res) => {
        if (err) throw err;
        res.forEach((emp) => {
            employee.push(emp.first_name + " " + emp.last_name);
        });
        inquirer.prompt([{
            message: "Which employee you want to update ?",
            name: "employee",
            type: "list",
            choices: employee
        }]).then ((answer)=>{
            employeeToBeUpdated=answer.employee;
            connection.query(`SELECT CONCAT(id,": ",title) AS 'roles' FROM roles`,
            (err, res) => {
                if (err) throw err;
                res.forEach((role) => {
                    roles.push(role.roles);
                });
                inquirer.prompt([{
                    message: "What is new role for this employee?",
                    name: "newRole",
                    type: "list",
                    choices: roles
            }])
            .then((answer)=>{
                roleId = answer.newRole.split(":")
                console.log(roleId);
                connection.query(`UPDATE employees SET role_id=${roleId[0]} WHERE CONCAT(first_name," ",last_name)='${employeeToBeUpdated}'`,
                (err, res) => {
                    if (err) throw err;
                    console.clear();
                    console.log(`${employeeToBeUpdated}'s role has been updated!`);
                    init();
            })
                  })
            })
        })
        })
}

function viewAllDepartments(){
    connection.query('SELECT * FROM departments AS `Departments`', (err, res) => {
        if (err) throw err;
        console.clear();
        console.table(res)
        init();
        });
}

function addDepartment(){
    inquirer.prompt([{
        message: "What department you want to add ?",
        name: "name",
        type: "input",
        validate: function(name) {
            if (/^[a-zA-Z]+$/.test(name)) {
                return true;
            } else {
                console.log("\033[31m  <-- Please enter valid department name")
                return false
            }
        },
        filter: (name) => {
            if (!/^[a-zA-Z]+$/.test(name)) {
                return name = ""
            } else
                return name
        }
    }])
        .then((answers)=>{
                connection.query('INSERT INTO departments SET ?',
                    {
                    name: answers.name
                    },
                    (err, res) => {
                    if (err) throw err;
                    console.clear();
                    console.log(`${answers.name} Department added!\n`);
                    init();
                    })
                        }
            )
}

function addRole(){
    inquirer.prompt([{
            message: "What role you want to add ?",
            name: "role",
            type: "input",
            validate: function(role) {
                if (/^[a-z A-Z]+$/.test(role)) {
                    return true;
                } else {
                    console.log("\033[31m  <-- Please enter role name")
                    return false
                }
            },
            filter: (role) => {
                if (!/^[a-z A-Z]+$/.test(role)) {
                    return role = ""
                } else
                    return role
            }
    },
        {
            message: "What is the salery for this role ?",
            name: "salary",
            type: "input",
            validate: function (salary) {
                if (/^[0-9]+$/.test(salary)) {
                    return true;
                } else {
                    console.log("\033[31m  <-- Please enter valid number")
                    return false;
                }
            },
            filter: (salary) => {
                if (!/^[0-9]+$/.test(salary)) {
                    return salary = ""
                } else
                    return salary
            }
        },
        {
            message: "What is the department id for this role ?",
            name: "deptId",
            type: "input",
            validate: function (deptId) {
                if (/^[0-9]+$/.test(deptId)) {
                    return true;
                } else {
                    console.log("\033[31m  <-- Please enter valid deptartment id")
                    return false;
                }
            },
            filter: (deptId) => {
                if (!/^[0-9]+$/.test(deptId)) {
                    return deptId = ""
                } else
                    return deptId
            }
        }])
            .then((answers)=>{
                    connection.query('INSERT INTO roles SET ?',
                        {
                        title: answers.role,
                        salary: answers.salary,
                        department_id: answers.deptId,
                        },
                        (err, res) => {
                        if (err) throw err;
                        console.clear();
                        console.log(`${answers.role} Role added with $${answers.salary} salery!\n`);
                        init();
                        }
                                )
                            }
                )
}


function viewAllRoles() {
    connection.query('SELECT * FROM employee_db.roles AS `Roles`', (err, res) => {
        console.clear();
        console.table(res)
        init();
    });
}

function viewAllByDepartments(){
    let departments = [];
    let deptId;
    connection.query('SELECT * FROM employee_db.departments', (err, res) => {
        res.forEach((dept)=>{
            departments.push(dept.id + ": " + dept.name)
        })
        inquirer.prompt([{
            message: "Choose Department",
            name: "department",
            type: "list",
            choices: departments
        }])
            .then((answer)=>{
                deptId = answer.department.split(":")
                connection.query(`SELECT CONCAT(first_name," ", last_name) AS '${deptId[1]} Department' FROM employees WHERE role_id = ${deptId[0]}`, (err, res) =>{
                    console.clear();
                    console.table(res)
                    init();
                })
            })
    })
}

function viewAllEmployees(){
    connection.query('SELECT * FROM employees JOIN roles ON employees.role_id = roles.id ORDER BY first_name', (err, res) => {
        if (err) throw err;
        console.clear();
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
                                                    console.clear();
                                                    console.log(`${answers.employeeName} ${answers.employeeLastName} is added!\n`);
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
            connection.query(`SELECT CONCAT(first_name," ", last_name) AS "Managers" FROM employees WHERE id IN (${managerIds})`, (err, res) =>{
                console.clear();
                console.table(res);
                init();
             })  
    })
}

init();