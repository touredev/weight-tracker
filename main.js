// WEIGHT TRACKER CONTROLLER
var weightTrackerController = (function () {
  //Data structure to insert weights
  var Weight = function (id, value, date) {
    this.id = id;
    this.value = value;
    this.date = date;
    this.type = '';
  };

  Weight.prototype.setType = function (previousTracking) {
    if (previousTracking) {
      this.type = this.value > previousTracking.value ? 'increase' : 'decrease';
    } else {
      this.type = 'increase';
    }
  };

  Weight.prototype.getType = function () {
    return this.type;
  };

  //data structure to save all info inputed
  var data = {
    allItems: [],
    lastTracking: {
      type: '',
      variance: 0
    }

  };

  var getCurrentWeight = function () {
    var {
      allItems
    } = data;
    if (!allItems.length) return null;
    return allItems[allItems.length - 1].value;
  };

  return {
    //making a public method to add item to our data structure
    addItem: function (val, time) {
      var newItem;
      //create a new id
      var dataSize = data.allItems.length;
      if (dataSize > 0) {
        ID = data.allItems[dataSize - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on type
      newItem = new Weight(ID, val, time);
      newItem.setType(data.allItems[dataSize - 1])

      //push into our data scructure
      data.allItems.push(newItem);

      //return the new item for other controllers access it
      return newItem;
    },

    updateItem: function (id, value) {
      var currentItem, index;
      //retrieve item index
      index = data.allItems.findIndex(function (current) {
        return current.id === id;
      });
      // Update item value
      console.log('DATA:', data.allItems);
      currentItem = data.allItems[index];
      console.log('ITEM:', currentItem);
      currentItem.value = value;
      data.allItems[index] = currentItem;
      return currentItem;
    },
    deleteItem: function (id) {
      var index = data.allItems.findIndex(function (current) {
        return current.id === id;
      });

      if (index !== -1) {
        data.allItems.splice(index, 1);
      }
    },

    getItem: function (id) {
      var currentItem = data.allItems.find(function (current) {
        return current.id === id;
      });

      return currentItem;
    },

    actualizeTracking: function () {
      if (data.allItems.length < 2) {
        data.lastTracking = {
          type: '',
          variance: 0
        }
      } else {
        var type, variance, lastItems;

        lastItems = data.allItems.slice(-2);
        lastItems[1].setType(lastItems[0]);
        type = lastItems[1].getType();
        variance = lastItems[1].value - lastItems[0].value;

        data.lastTracking = {
          type,
          variance
        };
      }


    },
    setItemsTypes: function () {
      console.log(data.allItems);
      data.allItems.forEach(function (cur, index) {
        cur.setType(data.allItems[index - 1]);
      });
    },
    getTrackingInfo: function () {
      return {
        lastTracking: data.lastTracking,
        total: data.allItems.length,
        currentWeight: getCurrentWeight()
      };
    },
    // --- Local Storage stuff ---
    storeData: function () {
      localStorage.setItem('weight-tracking', JSON.stringify(data));
    },

    deleteData: function () {
      localStorage.removeItem('weight-tracking');
    },

    getStoredData: function () {
      return JSON.parse(localStorage.getItem('weight-tracking'));
    },

    updateData: function (StoredData) {
      data.allItems = StoredData.allItems;
      data.lastTracking = StoredData.lastTracking;
    },
    testing: function () {
      console.log(data);
    }
  };
})();

// UI CONTROLLER
var UIController = (function () {
  var DOMStrings = {
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    container: '.tracker',
    weightLabel: '.summary__weight',
    trackingLabel: '.summary__tracking',
    weightValue: '.tracker__item__value-number'
  };

  var buildTrackingTag = function (tracking) {
    var {
      type,
      variance
    } = tracking;
    if (type === '' || variance === 0) return '';

    var verb = type === 'increase' ? 'gained' : 'lost';
    var text = `<p>You ${verb} weight since last tracking.</p>
    <p>It has ${type}d by <strong>${Math.abs(variance)}</strong> kg.</p>
    `;

    return text;
  };

  var displayIcon = function (type) {
    if (type === '') return '';
    var iconName = type === 'increase' ? 'fa-arrow-up' : 'fa-arrow-down';

    return `<i class="fa ${iconName} item__value--icon ${type}__icon"></i>`;
  };

  var displayDate = function (dateValue) {
    if (!dateValue) return;
    var time, year, month, months, day, days;
    time = dateValue;
    if (typeof time === 'string') {
      time = new Date(time);
    }

    months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    day = time.getDay();
    month = time.getMonth();
    year = time.getFullYear();
    return `${days[day]} ${months[month]} ${time.getDate()}, ${year}`;
  };

  var buildWeightTag = function (weight) {
    if (!weight) return '';

    return `<p>Your actual weight is <span class="current__weight">${weight}</span> kg.</p>`;
  }

  return {
    getInput: function () {
      var formInput = document.querySelector(DOMStrings.inputValue);
      return {
        inputId: formInput.id,
        value: parseFloat(formInput.value)
      };
    },
    //Add list of weight to the UI
    addListItem: function (item) {
      var newHtml, element;
      //Create HTMl template with item data
      element = DOMStrings.container;
      var {
        id,
        value,
        date
      } = item;
      newHtml =
        `<div class="tracker__item animated fadeIn" id="tracking-${id}">
          <div class="tracker__item__date">
            <div class="tracker__item__date-label">${displayDate(date)}</div>
          </div>
          <div class="tracker__item__value">
            ${displayIcon(item.getType())}
            <div class="tracker__item__value-number">${value}</div>
          </div>
          <button class="remove__item-btn">
              <i class="icon fa fa-times"></i>
          </button>
        </div>`;

      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('afterbegin', newHtml);
    },

    updateListItem: function (item) {
      var newHtml, selectorId;
      var {
        id,
        value,
        date
      } = item;
      selectorId = '#tracking-' + id;
      newHtml =
        `<div class="tracker__item__date">
          <div class="tracker__item__date-label">${displayDate(date)}</div>
        </div>
        <div class="tracker__item__value">
          ${displayIcon(item.getType())}
          <div class="tracker__item__value-number">${value}</div>
        </div>
        <button class="remove__item-btn">
            <i class="icon fa fa-times"></i>
        </button>`;
      document.querySelector(selectorId).innerHTML = newHtml;
    },

    //delete list from DOM
    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    // add item value to input
    addItemToInput: function ({
      id,
      value
    }) {

      var field = document.querySelector(DOMStrings.inputValue);
      field.value = value;
      field.id = 'item-' + id;
      field.focus();
    },

    //clear input field after adding item
    clearField: function () {
      var field = document.querySelector(DOMStrings.inputValue);
      field.value = '';
      field.id = 'value';
      field.focus();
    },
    displayTrackingInfo: function (obj) {
      var {
        currentWeight,
        lastTracking
      } = obj;
      document.querySelector(DOMStrings.weightLabel).innerHTML = buildWeightTag(currentWeight);
      document.querySelector(DOMStrings.trackingLabel).innerHTML = buildTrackingTag(lastTracking);
    },
    //public method to get DOM fields
    getDOMStrings: function () {
      return DOMStrings;
    }
  }
})();

// GLOBAL APP CONTROLLER
var controller = (function (weightTrackerCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', function (event) {
      if (UICtrl.getInput().inputId === 'value') {
        ctrlAddItem();
      } else {
        //ctrlUpdateItem();
      }
    });
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        if (UICtrl.getInput().inputId === 'value') {
          ctrlAddItem();
        } else {
          ctrlUpdateItem();
        }
        event.preventDefault();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    //document.querySelector(DOM.container).addEventListener('click', ctrlSelectItem);
  }

  var parseElId = function (elementId) {
    var splitID = elementId.split('-');
    return parseInt(splitID[1]);
  }

  var loadData = function () {
    var storedData, newItem;

    // 1. load the data from the local storage
    storedData = weightTrackerCtrl.getStoredData();

    if (storedData) {
      // 2. insert the data into the data structure
      weightTrackerCtrl.updateData(storedData);

      // 3. Create the Weight Object
      storedData.allItems.forEach(function (cur) {
        newItem = weightTrackerCtrl.addItem(cur.value, cur.date);
        UICtrl.addListItem(newItem);
      });

      // 5. Display tracking info
      var trackingInfo = weightTrackerCtrl.getTrackingInfo();
      UICtrl.displayTrackingInfo(trackingInfo);
    }
  };

  //update the last tracking
  var updateTracking = function () {
    // 5. Actualize last tracking
    weightTrackerCtrl.actualizeTracking();

    // 6. Return last tracking
    var trackingInfo = weightTrackerCtrl.getTrackingInfo();

    // 7. Display the tracking on the UI
    UICtrl.displayTrackingInfo(trackingInfo);
    console.log(trackingInfo);
  };

  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get the fieLd input 
    input = UICtrl.getInput();
    //check if there is data on fields
    if (!isNaN(input.value) && input.value > 0) {
      // 2. Add the item to weight tracker controller
      newItem = weightTrackerCtrl.addItem(input.value, new Date());

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem);

      // 4. Clear the weight field
      UICtrl.clearField();

      // 5. Actualize tracking info
      updateTracking();

      // 6. save to local storage
      weightTrackerCtrl.storeData();

    }

  };

  var ctrlSelectItem = function (event) {
    if (event.target.className !== 'tracker__item__value-number') return;
    var itemID, item;
    itemID = event.target.parentNode.parentNode.id;
    console.log(itemID);

    if (itemID) {
      item = weightTrackerCtrl.getItem(parseElId(itemID));
      item && UICtrl.addItemToInput(item);
    }
  }

  //delete item
  var ctrlDeleteItem = function (event) {
    if (event.target.className !== 'icon fa fa-times') return;
    var itemID = event.target.parentNode.parentNode.id;
    console.log(itemID);
    if (itemID) {

      // 1. Delete the item from data structure
      weightTrackerCtrl.deleteItem(parseElId(itemID));
      weightTrackerCtrl.setItemsTypes();
      // 2. Delete the item from UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show new tracking info
      updateTracking();

      // 4. save to local storage
      weightTrackerCtrl.storeData();

    }
  };

  //Update item
  var ctrlUpdateItem = function () {
    var input, ID, item;
    // 1. Get the fieLd input 
    input = UICtrl.getInput();
    //check if there is data on fields
    if (!isNaN(input.value) && input.value > 0) {
      // 2. Update item value in data structure
      ID = parseElId(input.inputId);
      item = weightTrackerCtrl.updateItem(ID, input.value);
      //weightTrackerCtrl.setItemsTypes();
      // 3. Update the item value in the UI
      UICtrl.updateListItem(item);

      // 4. Clear the weight field
      UICtrl.clearField();

      // 5. Actualize tracking info
      updateTracking();

      // 6. save to local storage
      weightTrackerCtrl.storeData();
      //loadData();
    };
  }

  return {
    init: function () {
      console.log('Application has started.');
      UICtrl.displayTrackingInfo({
        lastTracking: {
          type: '',
          variance: 0
        },
        total: 0,
        currentWeight: null
      })
      setupEventListeners();
      loadData();
    }
  };

})(weightTrackerController, UIController);

controller.init();