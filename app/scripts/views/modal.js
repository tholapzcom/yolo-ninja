/*global Tholapz, Backbone*/

Tholapz.Views = Tholapz.Views || {};

(function () {
  'use strict';

    Tholapz.Views.Modal = Backbone.View.extend({

    template: Tholapz.Templates['modal']
    , tagName: 'div'
    , className: 'view-modal'
    /**
     *
     */
    , initialize: function (options) {
      _.bindAll(this, 'render');

      try {
        if(_.isUndefined(options.controller)){
          throw Error('The controller is a dependency. Please inject the controller into the view.');
        }
      } catch (e) {
        console.log(e);
      }

      this.controller = options.controller;
    }
    /**
     *
     */
    , render: function () {
      this.$el.html(this.template());
      this.$('.modal-content').append((_.isObject(this.model.view) ? this.model.view.render().$el : this.model.view));
      return this;
    }

  });

})();
