// BEFORE LEAVING WEB PAGE

window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
});

//BUDGET CONTROLLER

var budgetController = (function () {

    var Expense = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.per = -1;

    };

    Expense.prototype.calcPer = function (totalIncome) { 

        if (totalIncome > 0) {

            this.per = Math.round((this.value / totalIncome) * 100);
            
        } else {

            this.per = -1;
        }
     };

     Expense.prototype.getPer = function () {  
         return this.per;
     }


    var Income = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;

    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(e => {
            sum += e.value;
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
        per: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //CREATE ID data.allItems[type].length > 0)
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //CREATE ITEM

            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            //PUSH IT 

            data.allItems[type].push(newItem);

            return newItem;

        },
        deleteItems : function (type , id) { 



            var ids = data.allItems[type].map(function (e) { 

                return e.id;

             });

             var index = ids.indexOf(id);

             if (index !== -1) {

                 data.allItems[type].splice(index,1)

             }

         },

        calculateBudget: function () {

            calculateTotal('exp');
            calculateTotal('inc');

            //INCOME - EXPENSES

            data.budget = data.totals.inc - data.totals.exp;

            //PERSENTAGE
            if (data.totals.inc > 0) {
                data.per = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.per = -1;
            }


        },
        calculatePer : function () {

            
            data.allItems.exp.forEach(function (e) { 
                e.calcPer(data.totals.inc)
             });
        },
        getPer : function () { 

            var allPer = data.allItems.exp.map(function (e) {  
                return e.getPer()
            });

            return allPer;
         },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                per: data.per
            };
        },
        test: function () {
            console.log(data)
        }

    }

})();



//UI CONTROLLER


var uiController = (function () {

    var domString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incList: '.income__list',
        expList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        perLabel: '.budget__expenses--percentage',
        container: '.container',
        expPerLabel : '.item__percentage',
        dateLabel : '.budget__title--month',
        addBox : '.add'
    }
    var formatNumber = function (num , type) { 

        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        // return (type === 'inc' ? '+' :type === 'exp' ? '-') + ' ' + int + '.' + dec;
        if (type === 'inc') {
            return  '+' + int + '.' + dec
        } else if (type==='exp') {
            return  '-' + int + '.' + dec
        } else {
            return ' ' + int + '.' + dec
        }
     };

     var nodeListForEach = function (list,callback) { 
        for (let i = 0; i < list.length; i++) {
            
            callback(list[i],i)
        }
      };



    return {
        getInput: function () {

            return {
                type: document.querySelector(domString.inputType).value,
                description: document.querySelector(domString.inputDescription).value,
                value: parseFloat(document.querySelector(domString.inputValue).value)
            }
        },


        addListItem: function (obj, type) {
            var html, newHtml, element;
            if (type === 'inc') {
                element = domString.incList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="uil uil-trash-alt"></i></button></div></div></div>'
            } else {
                element = domString.expList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="uil uil-trash-alt"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function (selectorID) { 

         
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

         },
         displayMonth : function () {
             var now , year , month , months ,day ;
             months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
             now = new Date()
             
             year = now.getFullYear()

             month = now.getMonth() ;
             
             day = now.getDate();
             
            //  var hourse = now.getHours();
            //  var min = now.getMinutes();
            //  console.log(hourse + ":" + min);
            

             document.querySelector(domString.dateLabel).textContent = day + ' / '+ months[month] + " " + year ;

        },

         displayPer : function (perstanges) {  

             var perField = document.querySelectorAll(domString.expPerLabel);
             
            
             nodeListForEach(perField ,function (cur,index) { 
                 cur.textContent = perstanges[index] + '%';
              });

         },

        clearFields: function () {
            var fields, fldarr;
            fields = document.querySelectorAll(domString.inputDescription + ',' + domString.inputValue);

            fldarr = Array.prototype.slice.call(fields);

            fldarr.forEach(elm => {
                elm.value = '';

            });

            fldarr[0].focus();

        },
        changeType : function () { 
            var fields = document.querySelectorAll(
                domString.inputType + ',' + domString.inputValue + ',' + domString.inputDescription
            );
            for (let i = 0; i < fields.length; i++) {

                fields[i].classList.toggle('red-focus');
            }

            //OR
            // nodeListForEach(fields,function (e) { 
            //     e.classList.toggle('');
            //  });

            //THIS ONE ONLY ONE ELEMENT
             document.querySelector(domString.inputBtn).classList.toggle('red');
             document.querySelector(domString.addBox).classList.toggle('red-shadow');

         },

        getDomString: function () {
            return domString
        },

        displayBudget: function (obj) {

            var type;
            if (obj.budget > 0) {
                type = 'inc'
                
            } else if(obj.budget < 0){
                type = 'exp'
            } else {
                type = -1;
            }

            document.querySelector(domString.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domString.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domString.expLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.per > 0 && obj.totalInc > obj.totalExp) {
                document.querySelector(domString.perLabel).textContent = obj.per + '%';
            } else {
                document.querySelector(domString.perLabel).textContent = "--";
            }
        },
      
    }


})();




//APP CONTROLLER BUDGET AND UI CONNECTOR


var Controller = (function (budgetctrl, uictrl) {

    var setupEventListeners = function () {
        var DOM = uictrl.getDomString();
        var addBtn = document.querySelector(DOM.inputBtn);
        addBtn.addEventListener('click', addItem);
        document.addEventListener('keypress', function (elm) {
            //WE CAN USE wich OR keyCode
            if (elm.keyCode === 13 || elm.which === 13) {
                addItem();
            }
        })

        document.querySelector(DOM.container).addEventListener('click', deleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uictrl.changeType)

    }

    var updateBudget = function () {

        budgetctrl.calculateBudget();

        var budget = budgetctrl.getBudget();

        uictrl.displayBudget(budget);

    };

    var updatePercentages = function () { 

        budgetctrl.calculatePer();

        var perstanges = budgetctrl.getPer();

        uictrl.displayPer(perstanges);

     };

    var addItem = function () {

        var input = uictrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            var newItem = budgetctrl.addItem(input.type, input.description, input.value)

            uictrl.addListItem(newItem, input.type);

            //CLEARING FIELD
            uictrl.clearFields();

            //CALCULATE AND UPDATE
            updateBudget();
            //UPDATE PERCENTAGES
            updatePercentages();

        } else {
            Swal.fire({
                type: 'error',
                title: 'Ohh..',
                text: "You Didn't Insert Any Data",
            })
        }
    };

    var deleteItem = function (event) {

        var itemId,splitId,type;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            budgetctrl.deleteItems(type,ID);

            uictrl.deleteListItem(itemId);

            updateBudget();

            updateper();

    };




    return {
        //IT'S WHEN OUR APPLICATION IS START TO RUN
        init: function () {
            setupEventListeners();
            uictrl.displayMonth();
            uictrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                per: -1
            });
        }
    };

})(budgetController, uiController)

Controller.init();