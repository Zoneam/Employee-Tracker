const whatToDo = [{
    message: "What would you like to do ?",
    name: "whatToDo",
    type: "list",
    choices: [
        "View all employees", //+
        "View all employees by department", //+
        "View all departments",
        "View all roles", //++
        "View all managers", //+
        "Add employee", //+
        "Add role",//++
        "Add department",//-------------
        "Quit" //+
    ]
}];


module.exports = whatToDo;