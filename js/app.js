(function() {

  'use strict';

  var ENTER_KEY = 13;
  var newButton = document.getElementById('addbutton');
  var newOrgNameDom = document.getElementById('new-name');
  var newOrgCashDom = document.getElementById('new-cash');
  var newOrgParentDom = document.getElementById('new-parent');
  var newParentId = document.getElementById('new-pid');
  var syncDom = document.getElementById('sync-wrapper');

  // EDITING STARTS HERE (you dont need to edit anything above this line)

  var db = new PouchDB('todos');

  // Replace with remote instance, this just replicates to another local instance.
  var remoteCouch = 'todos_remote';

  db.changes({
    since: 'now',
    live: true
  }).on('change', showFirms);

  // We have to create a new todo document and enter it in the database
  function addFirm(name, money, parent) {
    var firm = {
      _id: new Date().toISOString(),
      title: name,
      cash: money,
      parent_id: parent,

    };

    db.put(firm, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a firm!');
      }
    });
  }



  // Show the current list of firms by reading them from the database
  function showFirms()
  {

    db.allDocs
    (
        {
          include_docs: true,
          descending: true
        },
          function(err, doc)
        {
          redrawFirmUI(doc.rows);
        }
    );
  }

  function checkboxChanged(firm)
  {
    newOrgParentDom.value = firm.title;
    newParentId.value = firm._id;
  }

  // User pressed the delete button for a todo, delete it
  function deleteButtonPressed(firm) {
    db.remove(firm);
    clear_input();
  }

  // The input box when editing a firm has blurred, we should save
  // the new title
  function firmBlurred(firm, event) {
    var trimmedText = event.target.value.trim();
    if (!trimmedText) {
      firm.title = 'Unnamed';
    } else {
      firm.title = trimmedText;
    }
    db.put(firm);
  }

  function moneyBlurred(firm, event) {
    var trimmedText = event.target.value.trim();
    if (!trimmedText) {
      firm.cash = 0;
    } else {
      firm.cash = trimmedText;
    }
    db.put(firm);
  }

  // Initialise a sync with the remote server
  function sync() {
    syncDom.setAttribute('data-sync-state', 'syncing');
    var opts = {live: true};
    db.replicate.to(remoteCouch, opts, syncError);
    db.replicate.from(remoteCouch, opts, syncError);
  }

  // EDITING STARTS HERE (you dont need to edit anything below this line)

  // There was some form or error syncing
  function syncError() {
    syncDom.setAttribute('data-sync-state', 'error');
  }

  // User has double clicked a todo, display an input so they can edit the title
  function firmDblClicked(firm, par) {
    var div = document.getElementById('li_' + firm._id);
    var inputEditTodo = document.getElementById('input_' + firm._id);
    div.className = 'editing';
    inputEditTodo.focus();
  }

  function cashDblClicked(firm, par) {
    var div = document.getElementById('li_' + firm._id);
    var inputEditTodo = document.getElementById('input_c' + firm._id);
    div.className = 'editing';
    inputEditTodo.focus();
  }

  // If they press enter while editing an entry, blur it to trigger save
  // (or delete)
  function firmKeyPressed(firm, event) {
    if (event.keyCode === ENTER_KEY) {
      var inputEditTodo = document.getElementById('input_' + firm._id);
      inputEditTodo.blur();
    }
  }
  function moneyKeyPressed(firm, event) {
    if (event.keyCode === ENTER_KEY) {
      var inputEditTodo = document.getElementById('input_c' + firm._id);
      inputEditTodo.blur();
    }
  }

  // Given an object representing a firm, this will create a list item
  // to display it.
  function createFirmListItem(firm) {
    var checkbox = document.createElement('input');
    checkbox.className = 'toggle';
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', checkboxChanged.bind(this, firm));

    var lName = document.createElement('label');
    lName.appendChild( document.createTextNode('# ' + firm.title));
    lName.addEventListener('dblclick', firmDblClicked.bind(this, firm));

    var lCash = document.createElement('label');
    lCash.appendChild( document.createTextNode('$ ' + firm.cash));
    lCash.addEventListener('dblclick', cashDblClicked.bind(this, firm));

    var lParent = document.createElement('label');
    lParent.appendChild( document.createTextNode(firm.parent_id));

    var deleteLink = document.createElement('button');
    deleteLink.className = 'destroy';
    deleteLink.addEventListener( 'click', deleteButtonPressed.bind(this, firm));

    var divDisplay = document.createElement('div');
    divDisplay.className = 'view';
    divDisplay.appendChild(checkbox);
    divDisplay.appendChild(lName);
    divDisplay.appendChild(lCash);
    //divDisplay.appendChild(lParent);
    divDisplay.appendChild(deleteLink);

    var inputEditTodo = document.createElement('input');
    inputEditTodo.id = 'input_' + firm._id;
    inputEditTodo.className = 'edit';
    inputEditTodo.value = firm.title;
    inputEditTodo.addEventListener('keypress', firmKeyPressed.bind(this, firm));
    inputEditTodo.addEventListener('blur', firmBlurred.bind(this, firm));

    var inputEditMoney = document.createElement('input');
    inputEditMoney.type = 'number';
    inputEditMoney.id = 'input_c' + firm._id;
    inputEditMoney.className = 'edit';
    inputEditMoney.value = firm.cash;
    inputEditMoney.addEventListener('keypress', moneyKeyPressed.bind(this, firm));
    inputEditMoney.addEventListener('blur', moneyBlurred.bind(this, firm));

    var li = document.createElement('li');
    li.id = 'li_' + firm._id;
    li.appendChild(divDisplay);
    li.appendChild(inputEditTodo);
    li.appendChild(inputEditMoney);

    return li;
  }

  function redrawFirmUI(todos) {
    var ul = document.getElementById('todo-list');
    ul.innerHTML = '';
    todos.forEach(function(firm) {
      
      ul.appendChild(createFirmListItem(firm.doc));
    });
  }

  function clear_input()
  {
    newOrgNameDom.value = '';
    newOrgCashDom.value = '';
    newOrgParentDom.value = '';
    newParentId.value = '';
  }
  
  function newFirmKeyPressHandler() {
    if (newOrgNameDom.value && newOrgCashDom.value){
      if(!newParentId.value) newParentId.value='NULL';
      addFirm(newOrgNameDom.value, newOrgCashDom.value, newParentId.value);
      clear_input();
    } else alert("Please, fill empty fields!");

  }

  function addEventListeners()
  {
    newButton.addEventListener('click', newFirmKeyPressHandler, false);
  }

  addEventListeners();
  showFirms();

  if (remoteCouch) {
    sync();
  }

})();
