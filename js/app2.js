(function() {

    'use strict';

    var ENTER_KEY = 13;
    var newItemDom = document.getElementById('new-todo');
    var syncDom = document.getElementById('sync-wrapper');

    var db = new PouchDB('companies');

    // Replace with remote instance, this just replicates to another local instance.
    var remoteCouch = 'companies_remote';

    db.changes({
        since: 'now',
        live: true
    }).on('change', showCompanies);   //???

    // We have to create a new companie document and enter it in the database
    function addComp(text, par, profit) {
        var comp = {
            _id: new Date().toISOString(),
            title: text,
            year_profit: profit,
            parent: par
        };
        db.put(comp, function callback(err, result) {
            if (!err) {
                console.log('Successfully added a company!');
            }
        });
    }
// User pressed the delete button for a Compaty, delete it
    function deleteButtonPressed(comp) {
        db.remove(comp);
    }

}