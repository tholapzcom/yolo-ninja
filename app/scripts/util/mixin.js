// lodash Utility extension
_.mixin({
  /**
   *
   * @param string
   * @returns {string}
   */
  capitalize: function (string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }
  /**
   * Get query string param by name
   * window.location.search()
   *
   * @param name - String of param name
   * @return {string} value or empty string if not found
   */
  , getQueryParamByName: function (name) {
    var regexS = '[\\?&]' + name + '=([^&#]*)';
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results === null) {
      return '';
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  }
  /**
   * https://github.com/kvz/phpjs/blob/master/functions/url/urlencode.js
   * @param url
   * @return {string} encoded url
   */
  , urlencode: function (str) {
    str = (str + '').toString();
    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add '.replace(/~/g, '%7E');' to the following.
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
  }

});