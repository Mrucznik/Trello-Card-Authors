var t = window.TrelloPowerUp.iframe({appKey: 'e99430c4fde72481070758a3617752be', appName: 'Card Author'});

t.render(function() {
  return t.sizeTo('#content');
})

var authBtn = document.getElementById('authorize');
authBtn.addEventListener('click', function() {
  t.getRestApi().authorize({ scope: 'read' })
  .then(function(token) {
    t.closePopup();
  });
});
