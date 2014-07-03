/*global XDomainRequest, ActiveXObject*/
(function ($) {

  /**
   * Backbone does not have a native way to listen for a "Remove Event"
   * when any View is removed. If your View has some kind of Pooling or
   * Timer, it is handy to have a trigger stopping these processes
   * and preventing memory leaks.
   *
   * this plugin will dispatch a custom jQuery event when a DOM is removed
   * which we can listen on in our view
   *
   * i.e.
   *
   * var MainView = Backbone.View.extend({
     *   initialize : function(){
     *     _.bindAll(this);
     *     this.$el.on('destroyed', this.removeHandler);
     *   },
     *   removeHandler : function(){
     *     console.log('View has been destroyed, do we need to stop any Timer?');
     *   }
     * });
   *
   */
  $.event.special.destroyed = {
    remove: function (o) {
      if (o.handler) {
        o.handler();
      }
    }
  };

  /**
   * jQuery plugin
   * Mobile Web - Disable long-touch/taphold text selection
   *
   * code snippet from http://stackoverflow.com/questions/11237936/mobile-web-disable-long-touch-taphold-text-selection
   * http://jsfiddle.net/ebEqu/1/
   * usage $('.notSelectable').disableSelection();
   *
   */
  $.fn.extend({
    disableSelection: function () {
      this.each(function () {
        this.onselectstart = function () {
          return false;
        };
        this.unselectable = 'on';
        $(this).css('-moz-user-select', 'none');
        $(this).css('-webkit-user-select', 'none');
      });
    }
  });

  /**
   * jQuery alterClass plugin
   *
   * Remove element classes with wildcard matching. Optionally add classes:
   *   $( '#foo' ).alterClass( 'foo-* bar-*', 'foobar' )
   *
   * https://gist.github.com/peteboere/1517285
   *
   * Copyright (c) 2011 Pete Boere (the-echoplex.net)
   * Free under terms of the MIT license: http://www.opensource.org/licenses/mit-license.php
   *
   */
  $.fn.alterClass = function (removals, additions) {

    var self = this;

    if (removals.indexOf('*') === -1) {
      // Use native jQuery methods if there is no wildcard matching
      self.removeClass(removals);
      return !additions ? self : self.addClass(additions);
    }

    var patt = new RegExp('\\s' +
        removals.
            replace(/\*/g, '[A-Za-z0-9-_]+').
            split(' ').
            join('\\s|\\s') +
        '\\s', 'g');

    self.each(function (i, it) {
      var cn = ' ' + it.className + ' ';
      while (patt.test(cn)) {
        cn = cn.replace(patt, ' ');
      }
      it.className = $.trim(cn);
    });

    return !additions ? self : self.addClass(additions);
  };

})(jQuery);

//jQuery.XDomainRequest.js
//Author: Jason Moon - @JSONMOON
//IE8+
(function () {
  if (!jQuery.support.cors && window.XDomainRequest) {
    var httpRegEx = /^https?:\/\//i;
    var getOrPostRegEx = /^get|post$/i;
    var sameSchemeRegEx = new RegExp('^' + location.protocol, 'i');
    var xmlRegEx = /\/xml/i;

    // ajaxTransport exists in jQuery 1.5+
    jQuery.ajaxTransport('text html xml json', function (options, userOptions, jqXHR) {
      // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
      if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(userOptions.url) && sameSchemeRegEx.test(userOptions.url)) {
        var xdr = null;
        var userType = (userOptions.dataType || '').toLowerCase();
        return {
          send: function (headers, complete) {
            xdr = new XDomainRequest();
            if (/^\d+$/.test(userOptions.timeout)) {
              xdr.timeout = userOptions.timeout;
            }
            xdr.ontimeout = function () {
              console.log('xdr.ontimeout');
              complete(500, 'timeout');
            };
            xdr.onload = function () {
              console.log('xdr.onload');
              var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
              var status = {
                code: 200,
                message: 'success'
              };
              var responses = {
                text: xdr.responseText
              };
              /*
               if (userType === 'html') {
               responses.html = xdr.responseText;
               } else
               */
              try {
                if (userType === 'json') {
                  try {
                    responses.json = JSON.parse(xdr.responseText);
                  } catch (e) {
                    status.code = 500;
                    status.message = 'parseerror';
                    //throw 'Invalid JSON: ' + xdr.responseText;
                  }
                } else if ((userType === 'xml') || ((userType !== 'text') && xmlRegEx.test(xdr.contentType))) {
                  var doc = new ActiveXObject('Microsoft.XMLDOM');
                  doc.async = false;
                  try {
                    doc.loadXML(xdr.responseText);
                  } catch (e) {
                    doc = undefined;
                  }
                  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                    status.code = 500;
                    status.message = 'parseerror';
                    throw 'Invalid XML: ' + xdr.responseText;
                  }
                  responses.xml = doc;
                }
              } catch (parseMessage) {
                throw parseMessage;
              } finally {
                complete(status.code, status.message, responses, allResponseHeaders);
              }
            };
            xdr.onprogress = function () { /*Some code*/
            };
            xdr.onerror = function () {
              console.log('xdr.onerror', xdr.responseText);
              complete(500, 'error', {
                text: xdr.responseText
              });
            };
            xdr.open(options.type, options.url);
            xdr.send(userOptions.data);
            // xdr.send();
          },
          abort: function () {
            if (xdr) {
              xdr.abort();
            }
          }
        };
      }
    });
  }
})();