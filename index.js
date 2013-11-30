/* Poultry, a twitter avatar updater for chat.meatspac.es
 * installed with the following bookmarklet:
 *     javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://poultry.mtos.co/index.js';})();
 */
(function ($) {
  'use strict';
  document.body.appendChild(document.createElement('script'))
    .src='https://oauth.io/auth/download/latest/oauth.js';
  var fingerprint = $('input[name=userid]').val();
  var twitter = undefined;
  var lastAvatar = null;
  var lastText = null;
  var setAvatar = function() {
    console.log('uploading');
    console.dir(twitter);
    console.dir(lastAvatar);
    twitter.post({
      url: '/1.1/account/update_profile_image.json',
      data: lastAvatar
    });
  };
  var sendTweet = function() {
    console.log('sending tweet');
    console.dir(twitter);
    console.dir(lastAvatar);
    console.log(lastText);
    twitter.post({
      url: '/1.1/status/send_update',
      data: lastAvatar
    });
  };
  var authTwitter = function() {
    console.log('authorizing');
    OAuth.initialize('F6-Ns5MMCaG6zp4BkC-Ikfq3o-0');
    OAuth.popup('twitter', function(error, result){
      twitter = result;
      console.log(result);
      $('#poultry-auth').hide();
      $('.menu').append('<li><a id="poultry-avatar" href="javascript:;">Set Twitter Avatar</a></li>').children().last().click(setAvatar);
      $('.menu').append('<li><a id="poultry-tweet" href="javascript:;">Send Tweet</a></li>').children().last().click(sendTweet);
    });
  };
  var watch = function(addedNodes) {
    $(addedNodes).each(function(i,v) {
      console.log(fingerprint, v.dataset.fingerprint);
      if (fingerprint === v.dataset.fingerprint) {
        lastAvatar = v.children[0].src;
        window.lastText = v.children;
      } else {
        console.log('ignoring');
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
}($));
