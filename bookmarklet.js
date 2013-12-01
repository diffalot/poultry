/* Poultry, a twitter avatar updater for chat.meatspac.es
 * installed with the following bookmarklet:
 *     javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://poultry.mtos.co/bookmarklet.js';})();
 */
(function ($) {
  'use strict';
  //var OAuth = require('oauth').OAuth;
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
  var authTwitter = function() {
    console.log('poultry authorizing');
    $.ajax({
      type: 'GET',
      crossDomain: true,
      contentType: 'json',
      url: 'https://poultry.mtos.co/sendTweet',
      success: function(data, status, xhr) {
        console.dir(data, status, xhr);
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
  $('.menu').append('<li><a id="poultry-auth" href="javascript:;">Authorize Twitter</a></li>').children().last().click(sendTweet);
  console.log('poultry loaded');
}($));
