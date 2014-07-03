/*global Tholapz, Backbone*/

Tholapz.Routers = Tholapz.Routers || {};

(function () {
  'use strict';

    Tholapz.Routers.Router = Backbone.Router.extend({
    controller: null
    , currentView: null
    , currentModal: null
    , history: []
    , routes: {
        ''              : 'home'
      , 'home'          : 'home'
      , 'error/:name'   : 'error'
      , 'loading/:name' : 'loading'
    }
    /**
     *
     */
    , initialize: function (options) {
      if (_.isUndefined(options)) {
        return;
      }

      this.controller = options.controller;

      this.listenTo(Backbone.history, 'route', _.bind(this.saveHistory, this));

      this.$body = $(document.body);
      this.$app = $('<div class="tholapz"/>');
      this.$modal = $('<div />');
      $(document.body).append(this.$modal, this.$app);

      this.$body.addClass((top === self ? 'frame-false' : 'frame-true'));

      this.$modal.attr({
        'class': 'modal fade clearfix'
        , 'tabindex': '-1'
        , 'role': 'dialog'
        , 'aria-labelledby': 'modalLabel'
        , 'aria-hidden': 'true'
        , 'data-backdrop': 'static'
      }).on('hidden.bs.modal', _.bind(this.closedCurrentModal, this));


    }
    /**
     *
     */
    , setCurrentView: function (view) {
      this.closeCurrentModal();
      this.$app.html(view.render().$el);

      var bodyContext = 'body-' + view.className;
      this.$body.alterClass('body-*', bodyContext);

      // remove old view
      if (this.currentView !== null) {
        this.currentView.remove();
        this.currentView = null;
      }
      // store current view
      this.currentView = view;
    }
    /**
     *
     */
    , setCurrentModal: function (view) {
      var modalContext = 'modal-has-' + view.className;
      var modal = new Tholapz.Views.Modal({
        model: {view: view}, controller: this.controller
      });
      this.$body.alterClass('modal-has-*', modalContext);
      this.$modal.html(modal.render().$el);

        this.$modal.modal({
        show: true
        , keyboard: false
        , backdrop: 'static'
      });

      // remove old modal
      if (this.currentModal !== null) {
        if (_.isObject(this.currentModal.model.view)) {
          this.currentModal.model.view.remove();
        }
        this.currentModal.remove();
        this.currentModal = this.controller.Views.Modal = null;
      }
      // store current modal
      this.currentModal = this.controller.Views.Modal = modal;
    }
    /**
     *
     */
    , closedCurrentModal: function () {
      console.log('MODAL HIDDEN!!');
      if (this.currentModal !== null) {
        if (_.isObject(this.currentModal.model.view)) {
          this.currentModal.model.view.remove();
        }
        this.currentModal.remove();
        this.currentModal = this.controller.Views.Modal = null;
        this.$body.alterClass('modal-has-*', '');
      }
    }
    /**
     *
     */
    , closeCurrentModal: function () {
      console.log('CLOSE CURRENT MODAL');

      this.$modal.modal('hide');

    }
    /**
     *
     */
    , home: function () {
      var view = new Tholapz.Views.Home({
        model: this.controller.Models.Cms.get('text')['view_home']
        , controller: this.controller
      });
      this.setCurrentView(view);
    }
    /**
     *
     */
    , error: function (name) {
      var data = this.controller.Models.Cms.get('text')['views_error'][name];
      data = (_.isObject(data) ? data : this.controller.Models.Cms.get('text')['views_error']['generic']);
      var view = new Tholapz.Views.Error({
        model: data
        , controller: this.controller
      });
      this.setCurrentModal(view);
    }
    /**
     *
     */
    , loading: function (name) {
      var data = this.controller.Models.Cms.get('text')['views_loading'][name];
      data = (_.isObject(data) ? data : this.controller.Models.Cms.get('text')['views_loading']['generic']);
      var view = new Tholapz.Views.Loading({
        model: data
        , controller: this.controller
      });
      this.setCurrentModal(view);
    }
    /**
     *
     */
    , saveHistory: function (router, route, params) {
      this.history.push({
        name: route
        , args: params
        , fragment: Backbone.history.fragment
      });
      console.log('saveHistory', Backbone.history.fragment, route);
    }
  });

})();