var R = require('ramda');
var css = require('css');

// This should be changed, because this isn't going to help
// anyone in the case of a failure to get filename for prefix.
var DEFAULTS = {
    prefix:      'filename-prefix__',
};

module.exports = function configureUniquePrefixId (opts) {
    var options = R.merge(DEFAULTS, opts || {});
    var cache   = options.cache = {};
    var selectorRegex = /(url\(#)((\w|-)*)(\))/gmi;

    // Find the ID reference in items such as: "url(#a)" and return "a"
    _getMatches = (field, val) => {
        var str = val.toString();
        var matches = selectorRegex.exec(str);
        selectorRegex.lastIndex = 0;
        // clean up and get rid of the quotes
        return opts.prefix + matches[2].replace('\"', "");
    }

    return function createUniquePrefixId (value) {
        var HASHBANG_PROPS = ['xlinkHref', 'href'];
        var URL_PROPS = ['fill', 'mask', 'clipPath', 'filter'];
        var propName, propValue, newValue;

        for (var i = 0; i < HASHBANG_PROPS.length; i++) {
            propName = HASHBANG_PROPS[i];
            propValue = value[propName];

            if (propValue && propValue.toString().startsWith("#")){
                newValue = "#" + opts.prefix + propValue.toString().replace("#", "");
                value[propName] = newValue;
                this.update(value);
            }
        }

        for (var j = 0; j < URL_PROPS.length; j++) {
            propName = URL_PROPS[j];
            propValue = value[propName];

            if (propValue && propValue.toString().startsWith("url")){
                newValue = "url(#" + _getMatches(propName, propValue) + ")";
                value[propName] = newValue;
                this.update(value);
            }
        }

        // Find all IDs and update with filename prefix
        if (value.id){
            newValue = opts.prefix + value.id;
            value.id = newValue;
            this.update(value);
        }
    };
};
