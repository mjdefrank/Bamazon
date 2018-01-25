//import modules
var inquirer = require('inquirer');
var mysql = require('mysql');
var sqlpassword = require('./password.js');
//connect to db
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user	   : 'root',
  password : 'PrtyB0y!',
  database : 'bamazon'
});

//console.log db contents
function displayTable() 
	{
		connection.query('SELECT * FROM products', function(error, results) 
			{
				if (error) throw error;

				console.log('Current Inventory');
				for (var i = 0; i < results.length; i++) 
				{
					console.log('Product name:    ' + results[i].product_name);
					console.log('Department Name: '+results[i].department_name);
					console.log('Price:           $'+results[i].price);
					console.log('Stock Remaining: '+results[i].stock_quantity);
					console.log('');
				}
			}
		)
	};
function reorder() {inquirer.prompt(
							[
								{
									type: 'confirm',
									message: 'Would you like to place another order?',
									name: 'anotherOrder'
								}
							]).then(function (answers){
							if (answers.anotherOrder === true) {order()}
							else {console.log('Thank you! Come again soon!')
								  connection.end();}
								;
						});}
//inquirer for questions goes here
function order()
{
	displayTable();
	inquirer.prompt(
		[
			{
				type: 'list',
				message: 'Select a product, please',
				name: 'chooseProduct',
				choices: ['Samsung Galaxy S8', 'Microsoft xBox One S', 'VitaMix Blender', 'Coleman 4-person Camping Tent', 'Monopoly Board Game','Cleveland Browns Licensed Hoody', 'Step Brothers', 'Tide Laundry Detergent Pods', 'Franklin Barbeque: A Meat-Smoking Manifesto', 'Louisville Slugger Z4000 Softball Bat'],
			},
			{
				type: 'input',
				message: 'How many would you like to purchase?',
				name: 'quantity',
			}
		]).then(function(answers)
			{
				connection.query('Select * FROM products WHERE product_name = ?', [answers.chooseProduct], function(error, results)
				{
					//handle errors
					if (error) console.log(error);
					//	
					if (answers.quantity > results[0].stock_quantity)
					{
						console.log('Sorry, we do not have enough in stock to handle your request!');
						console.log('This order has been canceled. Please try a lower quantity.');
						reorder();
					}
					else
					{
						var price = parseFloat(results[0].price);
						var qty = parseInt(answers.quantity);
						var cartTotal = price * qty;
						console.log('Your current total is $'+ cartTotal);
						//update quantities in table
						connection.query('UPDATE products SET ? WHERE ?', [{stock_quantity: results[0].stock_quantity - answers.quantity},{product_name: answers.chooseProduct}], function (error, results){})
						reorder();
					}
				})
			});
};

order();