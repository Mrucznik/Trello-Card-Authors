/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

const USER_ICON = 'https://cdn.glitch.com/20c599ad-80f2-401b-aaf6-a6f5d8d0df74%2Ficonfinder_user-alt_285645.png?1548766653085';
const APP_KEY = "e99430c4fde72481070758a3617752be";

var global_allActions = null;

function boardRequest(token, context) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.trello.com/1/boards/" + context.board + "/actions?limit=1000&fields=id,type,memberCreator,data&memberCreator_fields=id,fullName&filter=createCard&key=" + APP_KEY + "&token=" + token);
        xhr.onload = function() {
            if (this.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject('Error in actions request.');
            }
        }
        xhr.addEventListener('error', () => reject(xhr.statusText));
        xhr.send();
    });
}


function getCardAuthor(t) {
    var context = t.getContext();
  
    return new Promise((resolve, reject) => {
        t.getRestApi().getToken()
        .then(token => {
            if(global_allActions != null) {
              return global_allActions;
            }
            return global_allActions = boardRequest(token, context);
        }).then(allActions => {
            var result = allActions.filter(item => item.data.card !== undefined && item.data.card.id===context.card && item.type==="createCard");
            
            if(result[0] === undefined) {
                global_allActions = null;
                reject('No results - probably new card.');
            } else {
                resolve(result[0].memberCreator.fullName);
            }
        }).catch(err => {
            reject(err);
        });
    });
}

var t = TrelloPowerUp.initialize({
  'authorization-status': function(t, options) {
      return t.getRestApi().isAuthorized()
      .then(function(authorized) {
          return { authorized: authorized }
      });
  },
  
  'show-authorization': function(t, options){
      return t.popup({
        title: 'Authorize your account',
        url: './authorize.html',
        height: 140,
      });
  },
  
	'card-badges': function(t, options) {
    var context = t.getContext();
    
    return getCardAuthor(t).then(author => {
      return [{
        icon: USER_ICON,
        text: author
      }];
    }).catch(err => {
        return [];
    });;
  },
  
  'card-detail-badges': function(t, options) {
    t.getRestApi().isAuthorized().then(
      authorized => {
        if(!authorized) {
            return t.getRestApi().authorize({ scope: 'read' });
        }
    }).catch({});
    
    return getCardAuthor(t).then(author => {
        return [{
            icon: USER_ICON,
            title: 'Author:',
            text: author
          }]
    }).catch(err => {
        return [];
    });
  }
}, {appKey: APP_KEY, appName: 'Card Author'} );



