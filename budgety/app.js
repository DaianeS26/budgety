// Data module
//Stand alone controller

const budgetController = (function(){
 //function construction to create new objects

    const Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
       } else {
           this.percentage = -1;
       }

    };

    Expense.prototype.getPercentages = function(){
        return this.percentage;
    };

    const Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;

    };

    const calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;

        });

        data.totals[type] = sum;
    };

    //data structure
    const data = {
       allItems: {
           exp: [],
           inc: [],
       },
       totals: {
           exp: 0,
           inc: 0,
       },
       
       budget: 0,
       percentage:-1,
       //doesn't exist when value = -1
    
    };

    //public function that creates new data objects
    return{
        addItem: function(type, des, val){
            let newItem, ID;

            //ID = last ID + 1
            // Create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0
            }
            //create new Item based on type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income (ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);
            //return new element;
            return newItem;

        },

        deleteItem: function(type, id){
            let ids, index;
            //create array with all ids
            //map returns new array

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                //remove elements from array
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){
            // calculate total income and expenses
             calculateTotal('exp');
             calculateTotal('inc');


            // calculate budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp;


            // calculate the percentage of income we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },


        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function(){

            return{

                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,

            };

    
        },

        testing: function(){
            console.log(data);
        }

    };

})();

//UI Module
//Stand alone controller

const UIController = (function(){

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };


      //function to format numbers on the UIpage
    const formatNumber = function(num, type){
        let numSplit, int, dec;
       
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
        }

        dec = numSplit[1];

        

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

      
    //custom for loop
    let nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return{
        getInput: function(){
            return {
            type : document.querySelector(DOMstrings.inputType).value, //income or expense
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
            
        },

        addListItem: function(obj, type){
            let html, newHtml, element;

            // 1. Create html string with placeholder text
            
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }    


            //2. Replace placeholder text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber (obj.value, type));
           
           
            //3. Insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },


        deleteListItem: function(selectorID){

            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },


        clearFields: function(){
            let fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            // Use array prototype to use array method to convert list into an array

            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            let type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
             
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
          
            nodeListForEach(fields, function(current, index){

                if(percentages[index]>0){
                   current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            })
        },

        displayMonth: function(){
            let now, year, month, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();


            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function(){
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
          

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');

        },
      
        getDOMstrings: function(){
            return DOMstrings;
     
        },

    }


})();


//Global controller
//Connect both controllers 
//Independent

const appController = (function(budgetCtrl, UICtrl){
    let DOM = UICtrl.getDOMstrings();

    const setUpEeventListeners = function(){

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
               ctrlAddItem();
            }
        });

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    };

   const updatePercentages = function() {

    //Calculate percentages
    budgetCtrl.calculatePercentages();

    // Read percentages from budget controler
    let percentages = budgetCtrl.getPercentages();
    // console.log(percentages);

    //Update UI with percentages
    UICtrl.displayPercentages(percentages);


    };


    const updateBudget = function(){
      // 1. Calculate the budget
      budgetCtrl.calculateBudget();

      // 2. Return the budget
      let budget = budgetCtrl.getBudget();
    
      // 3. Display the budget on the UI
      UICtrl.displayBudget(budget)



    };


    const ctrlAddItem = function(){
        let input, newItem;

        // 1. Get the file input data
        input = UICtrl.getInput();
  
            if (input.description !== '' && !isNaN(input.value) && input.value > 0){
        
            // 2. Add item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            
            // 3. Add the item to the UI
            UIController.addListItem(newItem, input.type);
            
            //4. Clear the fields

            UIController.clearFields();

            // 5. Calculate and update budget

            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
        
    };
   
    const ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;
        
        //DOM traversing = moving up the dom tree
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Delete Item Data structure
            budgetCtrl.deleteItem(type, ID);


            //Delete Item user interface
            UIController.deleteListItem(itemID);

            //Update budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }



    };

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    return {
        init: function(){
            setUpEeventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({

                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,

            });
        }
    }
   


})(budgetController, UIController);

//Initialize application
appController.init();