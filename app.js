
// Budget Controller

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percetage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome>0){
        this.percetage = Math.round((this.value/totalIncome) * 100);
        }else {
        this.percetage = -1;
    }
    };

    Expense.prototype.getPercentage = function() {
        return this.percetage
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum+= cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percetage: -1
    };

    return {
        addItem: function (type, des, val) {
           var newItem, ID;


           //Create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

           //Create new item
           if (type === 'exp'){
               newItem = new Expense(ID, des, val);
           } else if (type === 'inc'){
               newItem = new Income(ID, des, val);
           }

           //Push it into data
           data.allItems[type].push(newItem);

           //Return new el
           return newItem;
        },
        calculateBudget: function() {

            // calculate total income and expenses

            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percetage of income that we spent
            if(data.totals.inc > 0) {
                data.percetage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percetage = -1;
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percetage: data.percetage
            }
        },
        deleteItem: function(type, id) {
            var ids,index;
            // id = 3

            ids = data.allItems[type].map(function(cur){
                return cur.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        testing: function() {
            console.log(data);
        }
    };


})();

// UI Controller

var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percetageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length-3,3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int+ '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for(var i=0; i<list.length; i++) {
            callback(list[i], i)
        }
    };

    return {
      getInput: function () {
          return {
              type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
          }
      },
        getDOMstrings: function () {
            return DOMstrings;
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;

          if (type === 'inc') {
              element = DOMstrings.incomeContainer;
              html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          } else if(type = 'exp'){
              element = DOMstrings.expensesContainer;
              html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
          }

        newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = [].slice.call(fields);


            fieldsArr.forEach(function(current, index, arr){
                current.value = '';
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percetage > 0) {
                document.querySelector(DOMstrings.percetageLabel).textContent = obj.percetage + '%';
            } else {
                document.querySelector(DOMstrings.percetageLabel).textContent = '---';
            }

        },
        deleteListIten: function(sID) {
            var el = document.getElementById(sID);
            el.parentNode.removeChild(el);

        },
        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(cur, index){
                if(percentages[index]>0){
                cur.textContent = percentages[index] + '%';}else{
                    cur.textContent = '---';
                }
            });

        },
        displayMonth: function() {
            var now, year, month;
            now = new Date();
            month = now.getMonth();
            months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
                
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function() {

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };

})();


//Global App Controller

var controller = (function (budgetCTRL, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    }

    var updateBudget = function() {
        //Calculate budget
        budgetCTRL.calculateBudget();
        //Return the budget
        var budget = budgetCTRL.getBudget();
        //Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //Calculate percentages
        budgetCTRL.calculatePercentages();
        //Read from budget controller
        var percentages = budgetCTRL.getPercentages();
        //Update the UI with
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function () {
        var input, newItem;
        //Get the field input data
        input = UICtrl.getInput();

        if(input.description && !isNaN(input.value) && input.value > 0) {
            //Add the item to the budget controller
            newItem = budgetCTRL.addItem(input.type, input.description, input.value);
            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //Clear fields
            UICtrl.clearFields();
            //Calculate and update budget
            updateBudget();

            //Calculate and update percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(e) {
        var itemID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from the data structure
            budgetCTRL.deleteItem(type, ID);
            //delete item from the UI
            UICtrl.deleteListIten(itemID);
            //Update and show new budget
            updateBudget();
            //Calculate and update percentages
            updatePercentages();
        }

    };

    return {
        init: function () {
            console.log('App started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percetage: -1
            });
            UICtrl.displayMonth();
            setupEventListeners();

        }
    }

})(budgetController,UIController);

controller.init();