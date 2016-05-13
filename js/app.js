(function() {

  'use strict';

  var ENTER_KEY = 13;
  var newButton = document.getElementById('addbutton');
  var newOrgNameDom = document.getElementById('new-name');
  var newOrgCashDom = document.getElementById('new-cash');
  var newOrgParentDom = document.getElementById('new-parent');
  var newParentId = 0;
  var syncDom = document.getElementById('sync-wrapper');

  // EDITING STARTS HERE (you dont need to edit anything above this line)

  var db = new PouchDB('todos');

  // Replace with remote instance, this just replicates to another local instance.
  var remoteCouch = 'todos_remote';

  db.changes({
    since: 'now',
    live: true
  }).on('change', showTodos);

  // We have to create a new todo document and enter it in the database
  function addTodo(name, money, parent) {
    var firm = {
      _id: new Date().toISOString(),
      title: name,
      cash: money,
      parent_id: parent,
     // completed: false
    };

    db.put(firm, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a todo!');
      }
    });
  }

  // Show the current list of todos by reading them from the database
  function showTodos() {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      redrawTodosUI(doc.rows);
    });
  }

  function checkboxChanged(firm, event) {
  //  firm.completed = event.target.checked;
    newOrgParentDom.value = firm.title;
    newParentId = firm.id;
   // db.put(firm);
  }

  // User pressed the delete button for a todo, delete it
  function deleteButtonPressed(firm) {
    db.remove(firm);
  }

  // The input box when editing a todo has blurred, we should save
  // the new title or delete the todo if the title is empty
  function todoBlurred(firm, event) {
    var trimmedText = event.target.value.trim();
    if (!trimmedText) {
      db.remove(firm);
    } else {
      firm.title = trimmedText;
      db.put(firm);
    }
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
  function todoDblClicked(firm, par) {
    var div = document.getElementById('li_' + firm._id);
    var inputEditTodo = document.getElementById('input_' + firm._id);
    div.className = 'editing';
    inputEditTodo.focus();
  }

  // If they press enter while editing an entry, blur it to trigger save
  // (or delete)
  function todoKeyPressed(firm, event) {
    if (event.keyCode === ENTER_KEY) {
      var inputEditTodo = document.getElementById('input_' + firm._id);
      inputEditTodo.blur();
    }
  }

  // Given an object representing a todo, this will create a list item
  // to display it.
  function createTodoListItem(firm) {
    var checkbox = document.createElement('input');
    checkbox.className = 'toggle';
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', checkboxChanged.bind(this, firm));

    var lName = document.createElement('label');
    lName.appendChild( document.createTextNode(firm.title));
    lName.addEventListener('dblclick', todoDblClicked.bind(this, firm));

    var lCash = document.createElement('label');
    lCash.appendChild( document.createTextNode(firm.cash));
    lCash.addEventListener('dblclick', todoDblClicked.bind(this, firm));

    var lParent = document.createElement('label');
    lParent.appendChild( document.createTextNode(firm.parent_id));
    lParent.addEventListener('dblclick', todoDblClicked.bind(this, firm));

    var deleteLink = document.createElement('button');
    deleteLink.className = 'destroy';
    deleteLink.addEventListener( 'click', deleteButtonPressed.bind(this, firm));

    var divDisplay = document.createElement('div');
    divDisplay.className = 'view';
    divDisplay.appendChild(checkbox);
    divDisplay.appendChild(lName);
    divDisplay.appendChild(lCash);
    divDisplay.appendChild(lParent);
    divDisplay.appendChild(deleteLink);

    var inputEditTodo = document.createElement('input');
    inputEditTodo.id = 'input_' + firm._id;
    inputEditTodo.className = 'edit';
    inputEditTodo.value = firm.title;
    inputEditTodo.addEventListener('keypress', todoKeyPressed.bind(this, firm));
    inputEditTodo.addEventListener('blur', todoBlurred.bind(this, firm));

    var li = document.createElement('li');
    li.id = 'li_' + firm._id;
    li.appendChild(divDisplay);
    li.appendChild(inputEditTodo);

    if (firm.completed) {
      li.className += 'complete';
      checkbox.checked = true;
    }

    return li;
  }

  function redrawTodosUI(todos) {
    var ul = document.getElementById('todo-list');
    ul.innerHTML = '';
    todos.forEach(function(firm) {
      ul.appendChild(createTodoListItem(firm.doc));
    });
  }

  function newTodoKeyPressHandler() {

      addTodo(newOrgNameDom.value, newOrgCashDom.value, newOrgParentDom.value);
      newOrgNameDom.value = '';
     /* newOrgCashDom.value = '';
*/      newOrgParentDom.value = '';

  }

  function addEventListeners() {
    newButton.addEventListener('click', newTodoKeyPressHandler, false);
  }

  addEventListeners();
  showTodos();

  if (remoteCouch) {
    sync();
  }

})();
