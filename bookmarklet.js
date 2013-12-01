/* Poultry, a twitter avatar updater for chat.meatspac.es
 * installed with the following bookmarklet:
 *     javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://poultry.mtos.co/bookmarklet.js';})();
 */
(function (window, $) {
  'use strict';
  var OA = require('./oauth');
  var fingerprint = $('input[name=userid]').val();
  var twitter = undefined;
  var lastAvatar = null;
  var lastText = null;
  var setAvatar = function() {
    console.log('poultry uploading');
    console.dir(twitter);
    console.dir(lastAvatar);
    twitter.post({
      url: '/1.1/account/update_profile_image.json',
      data: lastAvatar
    });
  };
  var sendTweet = function() {
    console.log('poultry sending tweet');
    console.dir(lastAvatar);
    console.log(lastText);
    $.ajax({
      type: 'POST',
      crossDomain: true,
      contentType: 'json',
      url: 'https://poultry.mtos.co/sendTweet',
      data: { text: lastText, image: lastAvatar }
    });
  };
  var doOAuth = function(code) {
    OAuth.initialize('F6-Ns5MMCaG6zp4BkC-Ikfq3o-0');
    OAuth.popup('twitter', { 'state': code }, function(error, response) {
      console.log('popup ran');
      console.dir(response);
      $.ajax({
        url: 'https://poultry.mtos.co/authTwitter',
        type: 'POST',
        dataType: 'json',
        data: {
          code: response.code,
          key: 'F6-Ns5MMCaG6zp4BkC-Ikfq3o-0'
        },
        success: function(state, status, xhr){
          console.log('response from twitter?');
          console.dir(state);
        }
      });
    });
  };
  var authTwitter = function() {
    console.log('poultry authorizing');
    $.ajax({
      url: 'https://poultry.mtos.co/authState',
      type: 'GET',
      dataType: 'json',
      success: function(state, status, xhr){
        console.log('poultry received secret code');
        var code = state.oauthio_state;
        console.log(code);
        doOAuth(code);
      }
    });
    $('#poultry-auth').hide();
    $('.menu').append('<li><a id="poultry-avatar" href="javascript:;">Set Twitter Avatar</a></li>').children().last().click(setAvatar);
    $('.menu').append('<li><a id="poultry-tweet" href="javascript:;">Send Tweet</a></li>').children().last().click(sendTweet);
  };
  var watch = function(addedNodes) {
    $(addedNodes).each(function(i,v) {
      console.log(fingerprint, v.dataset.fingerprint);
      if (fingerprint === v.dataset.fingerprint) {
        lastAvatar = v.children[0].src;
        lastText = 'testing something'; //v.children;
      } else {
        console.log('poultry ignoring');
      }
    });
  };
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
    // mutations fire when <li>s are removed, so guard against that.
    // multiple speakers collide, so just speak the 0th.
    mutation.addedNodes && watch(mutation.addedNodes)
    //.querySelector('p').textContent, {noWorker:true});
    });
  });
  observer.observe(document.querySelector('div.chats ul'), {childList: true});
  $('.menu').append('<li><a id="poultry-auth" href="javascript:;">Authorize Twitter</a></li>').children().last().click(authTwitter);
  console.log('poultry loaded');
}(window, jQuery));
