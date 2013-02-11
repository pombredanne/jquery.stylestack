/*
 * jQuery StyleStack - Stack Frames for jQuery Styles
 * (c) 2013 Thomas Millar <millar.thomas@gmail.com>
 * MIT Licensed.
 *
 * http://github.com/thmsmlr/jquery.stylestack
 */

(function ($, window, document) {
    "use strict";
    var pluginName = "stylestack"
        , enabled = true
        , baseFunctions = {
            'transition' : $.fn.transition,
            'css' : $.fn.css
        }
        
    /**
    *   Wraps base functions to restore the default $.css functionality for the duration of the call
    */
    var _wrappedBaseFunctions = {}
    $.each( baseFunctions, function( key, value ) {
        if( key != 'css' ) {
            _wrappedBaseFunctions[key] = function() {
                var newCSS = $.fn.css;
                $.fn.css = baseFunctions['css'];
                value.apply(this, arguments);
                $.fn.css = newCSS;
            };
        } else {
            _wrappedBaseFunctions[key] = value
        }
    });
    baseFunctions = _wrappedBaseFunctions;
    
    $[pluginName] = function (option) {
        option === 'disable' && (enabled = false)
        option === 'enable' && (enabled = true)
    };
    
    /**
    * Public Methods
    */
    
    $.fn.popStyle = function(num, callback) {
        return this.each(function() {
            
            var actionStack = [];
            
            typeof num === "function" && (callback = num) && (num = 1);
            typeof num === "undefined" && (num = 1);
            
            var stack = $(this).data(pluginName);
            
            if(stack) {
                for(var _i = 0; _i < num; _i++) {
                    actionStack.push(stack.shift());
                }
                _popStyle.call(this, actionStack, callback);
            }
                  
        });
    }
    
    /**
    * Private Methods
    */
    
    var _popStyle = function(styles, callback) {
        
        var $this = $(this);
        if( styles.length > 0) {
            var style = styles.shift();
            
            style.popFunction.call($this, style.properties, function() {
                _popStyle.call($this, styles, callback);
            });
        } else {
            typeof callback === "function" && callback.call(this);
        }
        
    };
    
    var _pushStyle = function(style, popFunction) {
        var $this = $(this)
            , _this = this
            , oldStyle = { 'popFunction' : popFunction, 'properties' : {} }
            , stack = $this.data(pluginName);
            
        $.each(style, function(key, value) {
            oldStyle.properties[key] = _this.style[key];
        });
    
        stack && stack.unshift(oldStyle);
        !stack && (stack = [oldStyle]);
    
        $this.data(pluginName, stack);
    } ;
    
    
    /**
    * JQuery Function Overrides 
    */
    
    $.fn.transition = function(properties, duration, easing, callback) {
        enabled && this.each(function () {
            _pushStyle.call(this, properties, function(oldStyle, cb) {
                baseFunctions['transition'].call(this, oldStyle, duration, easing, cb);
            });
        });
        return baseFunctions['transition'].call(this, properties, duration, easing, callback);
    }
    
    $.fn.css = function(properties, value) {
       if( typeof value !== "undefined" || 
            ( (properties instanceof Object) && !(properties instanceof Array) ) ) {
         
   
        enabled && this.each(function() {
            if ( typeof properties !== "string" ) {
               var props = properties;  
            } else {
                var props = { };
                props[properties] = 0;
            }
            _pushStyle.call(this, props, function(oldStyle, cb) {
                baseFunctions['css'].call(this, oldStyle);
                cb();
            });
        });   
        
       }
       return baseFunctions['css'].call(this, properties, value)
    }
    

        
    
})(jQuery, window, document);