/*global Tholapz, Backbone*/
Tholapz.Models = Tholapz.Models || {};
(function () {
  'use strict';
    Tholapz.Models.Cms = Backbone.Model.extend({
    apiUrl: '//secureapi.votenow.tv/widgets/get'
    , defaults: {
      /**
       * The widget ID to retrieve.
       * Should be found in the URL Query String Parameter or hardcoded in 'initialize()'
       */
      wid: 'data/data.json', // default template widget
      /**
       * The snapshot ID (if necessary).
       * Should be found in the URL Query String Parameter
       */
      sid: null,
      useSID: null,
      /**
       *  Timestamp of widget
       */
      ts: null,
      /**
       * Window Status, abstracted from the widget 'settings' key
       */
      windowStatus: null,
      /**
       * Widget Text
       */
      text: {},
      /**
       * Widget Settings
       */
      settings: {},
      /**
       * Widget CSS
       */
      css: {},
      /**
       * Widget Data: Vote Options, Poll and Trivia Questions, Mood Buttons
       */
      data: [],
      /**
       * Social Configuration: Facebook and Twitter app and share info
       */
      social: {},
      /**
       * All data from CMS API
       */
      raw: {},
      /**
       * enable polling?
       */
      poll: true,
      /**
       * The number of seconds to wait before updating again.
       */
      updateFrequency: 30,
      /**
       *
       */
      failureCount: 0,
      /**
       *
       */
      failureLimit: 10,
      /**
       *
       */
      pollTimer: null,
      /**
       *
       */
      initialized: false
    }
    /**
     *
     */
    , initialize: function (attrs, options) {
      var wid = (_.getQueryParamByName('wid').length === 0 ? undefined : _.getQueryParamByName('wid')) || attrs.wid || this.defaults.wid
          , sid = (_.getQueryParamByName('sid').length === 0 ? undefined : _.getQueryParamByName('sid')) || attrs.sid || this.defaults.sid
          , useSID = (!_.isNull(sid)) ? sid : null // Force the Cms to use a specific Snapshot ID from Connect's CMS
          ;

      console.log('CmsModel initialize', wid, sid, useSID);

      this.set({
        wid: wid, useSID: useSID
      });
    }
    /**
     * Builds the URL to fetch data from the Connect API
     */
    , prepareApiUrl: function () {

      var url = (
          this.get('wid').search(/\//) === -1 ?
            // If there is a numeric wid provided, then use the base
            // url and query for that particular id.
              window.location.protocol + this.apiUrl + '?wid=' + this.get('wid') + (!_.isNull(this.get('useSID')) ? '&sid=' + this.get('useSID') : '')
            // Otherwise, get the file specified by the wid field, i.e. '/test/cms/widget_data.php'
              : this.get('wid') + '?' + Math.random()
          );
      return url;

    }
    /**
     *
     */
    , requestData: function () {

      var url = this.prepareApiUrl();

      this.xhr = $.ajax( {
              url: url
            , type: 'GET'
            , dataType: 'json'
            , crossDomain: true
            , success: _.bind(this.requestSuccess, this)
            , error: _.bind(this.requestError, this)
      } );

    }
    /**
     *
     */
    , requestSuccess: function (data, textStatus, jqXHR) {

      console.log('CmsModel requestSuccess', data, textStatus, jqXHR);

      if (!(_.isObject(data) && _.size(data) > 0)) {
        this.requestError();
        return;
      }

      // Condition met on first callback or if the sid has change,
      // If met, pass all the retrieved keys to be mapped onto the Model
      var parsedData = (data.sid && this.get('sid') !== data.sid || !this.get('initialized')) ? data : {};

      // extending some of the nested data as top level attributes for easy listening
      this.set(_.extend(parsedData, {
        initialized: true, raw: data // Update full CMS output
        , ts: data.ts, metadata: data.metadata
      }));

      console.log('model data', this.toJSON());

      if (this.get('poll')) {
        this.pollData();
      }

    }
    /**
     *
     */
    , requestError: function (xhr, textStatus, textError) {

      console.log('CmsModel requestError', xhr, textStatus, textError);

      if (textStatus !== 'abort') { // only handle errors, not intentionally terminated requests
        this.set({
          failureCount: (parseInt(this.get('failureCount'), 10) + 1)
        });
        if (this.get('poll')) {
          this.pollData();
        }
      }

    }
    /**
     * sets our polling timer
     */
    , pollData: function () {

      if (this.get('failureCount') >= this.get('failureLimit')) {
        return;
      }

      this.set({
        pollTimer: setTimeout(_.bind(this.requestData, this), parseInt(this.get('updateFrequency'), 10) * 1000)
      });

    }
  });
})();
